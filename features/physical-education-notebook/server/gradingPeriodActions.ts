"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import type { GradingPeriod, GradingPeriodStatus, NotebookActionResult } from "../types";

interface UpdatePeriodInput {
  courseId: string;
  id: string;
  name: string;
  startDate: string | null;
  endDate: string | null;
  status: GradingPeriodStatus;
}

export async function updateGradingPeriodAction(input: UpdatePeriodInput): Promise<NotebookActionResult<GradingPeriod>> {
  const supabase = await createClient();
  if (!supabase) return { success: false, message: "No se pudo conectar con la base de datos." };
  const { data: auth } = await supabase.auth.getClaims();
  const userId = typeof auth?.claims?.sub === "string" ? auth.claims.sub : null;
  if (!userId) return { success: false, message: "Debes iniciar sesiÃ³n." };
  if (!input.name.trim() || !["draft", "open", "closed"].includes(input.status)) {
    return { success: false, message: "Revisa los datos del perÃ­odo." };
  }
  const { data, error } = await supabase
    .from("physical_education_grading_periods")
    .update({ name: input.name.trim(), start_date: input.startDate || null, end_date: input.endDate || null, status: input.status })
    .eq("id", input.id)
    .eq("course_id", input.courseId)
    .eq("teacher_id", userId)
    .select("id, teacher_id, course_id, period_number, name, start_date, end_date, status, created_at, updated_at")
    .maybeSingle();
  if (error || !data) return { success: false, message: "No pudimos actualizar el perÃ­odo." };
  revalidatePath(`/cuaderno-digital/cursos/${input.courseId}/calificaciones`);
  return {
    success: true,
    message: "Periodo actualizado correctamente.",
    data: {
      id: data.id, teacherId: data.teacher_id, courseId: data.course_id, periodNumber: data.period_number,
      name: data.name, startDate: data.start_date, endDate: data.end_date, status: data.status,
      createdAt: data.created_at, updatedAt: data.updated_at,
    } as GradingPeriod,
  };
}
