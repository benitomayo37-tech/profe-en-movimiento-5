import "server-only";

import { getAuthAccess } from "@/features/auth/server/access";
import { createClient } from "@/lib/supabase/server";

export type ActivityType =
  | "profe-ai"
  | "training-session"
  | "microcycle"
  | "mesocycle"
  | "macrocycle"
  | "student-exam";

export interface RecentActivityEntry {
  id: string;
  type: ActivityType;
  title: string;
  description: string;
  href: string;
  createdAt: string;
}

interface RecordActivityInput {
  type: Exclude<ActivityType, "student-exam">;
  title: string;
  description: string;
  href: string;
}

function trimText(value: string, maxLength: number) {
  return value.trim().replace(/\s+/g, " ").slice(0, maxLength);
}

export async function recordCurrentUserActivity(input: RecordActivityInput) {
  const access = await getAuthAccess();
  if (!access.authenticated || !access.userId) return;

  const supabase = await createClient();
  if (!supabase) return;

  const { error } = await supabase.from("user_activity").insert({
    user_id: access.userId,
    activity_type: input.type,
    title: trimText(input.title, 180) || "Contenido generado",
    description: trimText(input.description, 300),
    href: trimText(input.href, 300),
  });

  if (error) {
    console.warn("[Dashboard] No se pudo registrar la actividad:", error.message);
  }
}

export async function getRecentActivity(
  userId: string | null,
  limit = 6,
): Promise<RecentActivityEntry[]> {
  if (!userId) return [];

  const supabase = await createClient();
  if (!supabase) return [];

  const [activityResult, examsResult] = await Promise.all([
    supabase
      .from("user_activity")
      .select("id, activity_type, title, description, href, created_at")
      .eq("user_id", userId)
      .order("created_at", { ascending: false })
      .limit(limit),
    supabase
      .from("student_exams")
      .select("id, title, grade_course, access_code, created_at")
      .eq("teacher_id", userId)
      .order("created_at", { ascending: false })
      .limit(limit),
  ]);

  if (activityResult.error && activityResult.error.code !== "42P01") {
    console.warn("[Dashboard] No se pudo consultar la actividad:", activityResult.error.message);
  }

  if (examsResult.error && examsResult.error.code !== "42P01") {
    console.warn("[Dashboard] No se pudieron consultar los exámenes:", examsResult.error.message);
  }

  const generated = (activityResult.data ?? []).map((item) => ({
    id: `activity-${item.id}`,
    type: item.activity_type as Exclude<ActivityType, "student-exam">,
    title: item.title,
    description: item.description,
    href: item.href,
    createdAt: item.created_at,
  }));

  const exams = (examsResult.data ?? []).map((exam) => ({
    id: `exam-${exam.id}`,
    type: "student-exam" as const,
    title: exam.title,
    description: `${exam.grade_course} · Código ${exam.access_code}`,
    href: "/examenes/resultados",
    createdAt: exam.created_at,
  }));

  return [...generated, ...exams]
    .sort((first, second) => Date.parse(second.createdAt) - Date.parse(first.createdAt))
    .slice(0, limit);
}
