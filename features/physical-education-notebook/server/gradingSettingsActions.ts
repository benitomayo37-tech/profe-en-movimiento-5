"use server";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import type { NotebookActionResult } from "../types";

interface UpdateWeightsInput { courseId: string; formativeWeight: number; projectWeight: number; examWeight: number; }

export async function updateGradingWeightsAction(input: UpdateWeightsInput): Promise<NotebookActionResult> {
  const supabase = await createClient();
  if (!supabase) return { success: false, message: "No se pudo conectar con la base de datos." };
  const { data: auth } = await supabase.auth.getClaims();
  const userId = typeof auth?.claims?.sub === "string" ? auth.claims.sub : null;
  if (!userId) return { success: false, message: "Debes iniciar sesion." };
  const total = input.formativeWeight + input.projectWeight + input.examWeight;
  if ([input.formativeWeight, input.projectWeight, input.examWeight].some((value) => value < 0 || value > 1) || Math.abs(total - 1) > 0.0001) {
    return { success: false, message: "Los pesos deben sumar exactamente 100 %." };
  }
  const { data, error } = await supabase.from("physical_education_grading_settings").update({ formative_weight: input.formativeWeight, project_weight: input.projectWeight, exam_weight: input.examWeight }).eq("course_id", input.courseId).eq("teacher_id", userId).select("id").maybeSingle();
  if (error || !data) return { success: false, message: "No pudimos guardar los pesos de calificacion." };
  revalidatePath(`/cuaderno-digital/cursos/${input.courseId}/calificaciones`);
  return { success: true, message: "Pesos de calificacion actualizados." };
}
