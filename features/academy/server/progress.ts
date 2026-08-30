import "server-only";

import { createClient } from "@/lib/supabase/server";
import { academyCourse } from "@/features/academy/data/courses";
import { emptyAcademyProgress, type AcademyProgress } from "@/features/academy/types";

export async function getAcademyProgress(userId: string | null): Promise<AcademyProgress> {
  if (!userId) return emptyAcademyProgress;
  const supabase = await createClient();
  if (!supabase) return emptyAcademyProgress;

  const { data, error } = await supabase
    .from("academy_progress")
    .select("completed_lessons, quiz_score, certificate_earned_at, updated_at")
    .eq("user_id", userId)
    .eq("course_slug", academyCourse.slug)
    .maybeSingle();

  if (error || !data) return emptyAcademyProgress;
  return {
    completedLessons: Array.isArray(data.completed_lessons) ? data.completed_lessons.filter((value): value is string => typeof value === "string") : [],
    quizScore: typeof data.quiz_score === "number" ? data.quiz_score : null,
    certificateEarnedAt: typeof data.certificate_earned_at === "string" ? data.certificate_earned_at : null,
    updatedAt: typeof data.updated_at === "string" ? data.updated_at : null,
  };
}
