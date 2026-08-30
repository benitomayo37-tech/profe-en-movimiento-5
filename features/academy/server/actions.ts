"use server";

import { academyCourse, academyFinalQuiz, academyLessonIds } from "@/features/academy/data/courses";
import { createClient } from "@/lib/supabase/server";

type ActionResult = { ok: true; score?: number; certificateEarnedAt?: string | null } | { ok: false; message: string };

async function authenticatedUser() {
  const supabase = await createClient();
  if (!supabase) return { supabase: null, userId: null };
  const { data } = await supabase.auth.getClaims();
  const userId = typeof data?.claims?.sub === "string" ? data.claims.sub : null;
  return { supabase, userId };
}

export async function saveCompletedLessons(completedLessons: string[]): Promise<ActionResult> {
  const { supabase, userId } = await authenticatedUser();
  if (!supabase || !userId) return { ok: false, message: "Inicia sesión nuevamente para guardar el progreso." };
  const valid = Array.from(new Set(completedLessons.filter((id) => academyLessonIds.includes(id))));
  const { error } = await supabase.from("academy_progress").upsert({
    user_id: userId,
    course_slug: academyCourse.slug,
    completed_lessons: valid,
    updated_at: new Date().toISOString(),
  }, { onConflict: "user_id,course_slug" });
  return error ? { ok: false, message: "No fue posible guardar el progreso. Comprueba la configuración de Academia." } : { ok: true };
}

export async function submitAcademyQuiz(answers: Record<string, number>): Promise<ActionResult> {
  const { supabase, userId } = await authenticatedUser();
  if (!supabase || !userId) return { ok: false, message: "Inicia sesión nuevamente para enviar la evaluación." };

  const { data: current } = await supabase
    .from("academy_progress")
    .select("completed_lessons, certificate_earned_at")
    .eq("user_id", userId)
    .eq("course_slug", academyCourse.slug)
    .maybeSingle();
  const completed = Array.isArray(current?.completed_lessons) ? current.completed_lessons : [];
  if (!academyLessonIds.every((id) => completed.includes(id))) return { ok: false, message: "Completa las ocho lecciones antes de presentar la evaluación final." };

  const correct = academyFinalQuiz.filter((question) => answers[question.id] === question.correctIndex).length;
  const score = Math.round((correct / academyFinalQuiz.length) * 100);
  const earnedAt = score >= academyCourse.passingScore ? current?.certificate_earned_at || new Date().toISOString() : current?.certificate_earned_at || null;
  const { error } = await supabase.from("academy_progress").upsert({
    user_id: userId,
    course_slug: academyCourse.slug,
    completed_lessons: completed,
    quiz_score: score,
    certificate_earned_at: earnedAt,
    updated_at: new Date().toISOString(),
  }, { onConflict: "user_id,course_slug" });

  if (error) return { ok: false, message: "No fue posible guardar la evaluación final." };
  return { ok: true, score, certificateEarnedAt: earnedAt };
}
