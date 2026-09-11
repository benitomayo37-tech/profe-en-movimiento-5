"use server";

import { revalidatePath } from "next/cache";

import { createClient } from "@/lib/supabase/server";

import type {
  CreateGradingActivityInput,
  GradingActivity,
  NotebookActionResult,
  UpdateGradingActivityInput,
} from "../types";
import {
  createGradingActivitySchema,
  updateGradingActivitySchema,
} from "../gradingValidation";
import { courseIdSchema } from "../validation";

type GradingActivityRow = {
  id: string;
  teacher_id: string;
  course_id: string;
  grading_period_id: string;
  name: string;
  activity_date: string | null;
  component: GradingActivity["component"];
  dimension: GradingActivity["dimension"];
  modality: GradingActivity["modality"];
  instrument: string | null;
  max_score: number | string;
  display_order: number;
  notes: string | null;
  active: boolean;
  created_at: string;
  updated_at: string;
};

type ActivityReferenceRow = {
  id: string;
  grading_period_id: string;
};

async function getAuthenticatedContext() {
  const supabase = await createClient();

  if (!supabase) {
    return {
      supabase: null,
      userId: null,
    };
  }

  const { data, error } =
    await supabase.auth.getClaims();

  const userId =
    typeof data?.claims?.sub === "string"
      ? data.claims.sub
      : null;

  if (error || !userId) {
    return {
      supabase: null,
      userId: null,
    };
  }

  return {
    supabase,
    userId,
  };
}

function mapActivity(
  row: GradingActivityRow,
): GradingActivity {
  return {
    id: row.id,
    teacherId: row.teacher_id,
    courseId: row.course_id,
    gradingPeriodId: row.grading_period_id,
    name: row.name,
    activityDate: row.activity_date,
    component: row.component,
    dimension: row.dimension,
    modality: row.modality,
    instrument: row.instrument,
    maxScore: Number(row.max_score),
    displayOrder: row.display_order,
    notes: row.notes,
    active: row.active,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

function activityErrorMessage(
  code: string | undefined,
): string {
  if (code === "23505") {
    return (
      "Este trimestre ya tiene una actividad activa "
      + "para ese componente sumativo."
    );
  }

  if (code === "23503" || code === "42501") {
    return (
      "El curso o el perÃ­odo no estÃ¡ disponible "
      + "para tu cuenta."
    );
  }

  if (code === "23514" || code === "22023") {
    return "Revisa los datos de la actividad.";
  }

  return "No pudimos guardar la actividad.";
}

async function isEditablePeriod(
  supabase: NonNullable<
    Awaited<ReturnType<typeof createClient>>
  >,
  userId: string,
  courseId: string,
  gradingPeriodId: string,
): Promise<boolean> {
  const { data, error } = await supabase
    .from("physical_education_grading_periods")
    .select("id, status")
    .eq("id", gradingPeriodId)
    .eq("course_id", courseId)
    .eq("teacher_id", userId)
    .maybeSingle();

  return !error && data !== null && data.status !== "closed";
}

function revalidateGradingPaths(courseId: string) {
  revalidatePath("/cuaderno-digital");
  revalidatePath(`/cuaderno-digital/cursos/${courseId}`);
  revalidatePath(
    `/cuaderno-digital/cursos/${courseId}/calificaciones`,
  );
}

export async function createGradingActivityAction(
  input: CreateGradingActivityInput,
): Promise<NotebookActionResult<GradingActivity>> {
  const parsed =
    createGradingActivitySchema.safeParse(input);

  if (!parsed.success) {
    return {
      success: false,
      message: "Revisa los datos de la actividad.",
    };
  }

  const { supabase, userId } =
    await getAuthenticatedContext();

  if (!supabase || !userId) {
    return {
      success: false,
      message: "Debes iniciar sesiÃ³n.",
    };
  }

  const canEdit = await isEditablePeriod(
    supabase,
    userId,
    parsed.data.courseId,
    parsed.data.gradingPeriodId,
  );

  if (!canEdit) {
    return {
      success: false,
      message:
        "El perÃ­odo no existe, no te pertenece o estÃ¡ cerrado.",
    };
  }

  const { data, error } = await supabase
    .from("physical_education_grading_activities")
    .insert({
      teacher_id: userId,
      course_id: parsed.data.courseId,
      grading_period_id:
        parsed.data.gradingPeriodId,
      name: parsed.data.name,
      activity_date: parsed.data.activityDate,
      component: parsed.data.component,
      dimension: parsed.data.dimension,
      modality: parsed.data.modality,
      instrument: parsed.data.instrument,
      max_score: parsed.data.maxScore,
      display_order: parsed.data.displayOrder,
      notes: parsed.data.notes,
    })
    .select(
      "id, teacher_id, course_id, grading_period_id, name, activity_date, component, dimension, modality, instrument, max_score, display_order, notes, active, created_at, updated_at",
    )
    .single();

  if (error || !data) {
    console.error(
      "No se pudo crear la actividad de evaluaciÃ³n:",
      error,
    );

    return {
      success: false,
      message: activityErrorMessage(error?.code),
    };
  }

  revalidateGradingPaths(parsed.data.courseId);

  return {
    success: true,
    message: "Actividad creada correctamente.",
    data: mapActivity(data as GradingActivityRow),
  };
}

export async function updateGradingActivityAction(
  input: UpdateGradingActivityInput,
): Promise<NotebookActionResult<GradingActivity>> {
  const parsed =
    updateGradingActivitySchema.safeParse(input);

  if (!parsed.success) {
    return {
      success: false,
      message: "Revisa los datos de la actividad.",
    };
  }

  const { supabase, userId } =
    await getAuthenticatedContext();

  if (!supabase || !userId) {
    return {
      success: false,
      message: "Debes iniciar sesiÃ³n.",
    };
  }

  const { data: activity, error: activityError } =
    await supabase
      .from("physical_education_grading_activities")
      .select("id, grading_period_id")
      .eq("id", parsed.data.id)
      .eq("course_id", parsed.data.courseId)
      .eq("teacher_id", userId)
      .maybeSingle();

  if (activityError || !activity) {
    return {
      success: false,
      message:
        "La actividad no existe o no tienes acceso.",
    };
  }

  const reference = activity as ActivityReferenceRow;

  if (
    reference.grading_period_id
    !== parsed.data.gradingPeriodId
  ) {
    return {
      success: false,
      message:
        "No se puede mover una actividad a otro perÃ­odo.",
    };
  }

  const canEdit = await isEditablePeriod(
    supabase,
    userId,
    parsed.data.courseId,
    parsed.data.gradingPeriodId,
  );

  if (!canEdit) {
    return {
      success: false,
      message: "El perÃ­odo estÃ¡ cerrado.",
    };
  }

  const { data, error } = await supabase
    .from("physical_education_grading_activities")
    .update({
      name: parsed.data.name,
      activity_date: parsed.data.activityDate,
      component: parsed.data.component,
      dimension: parsed.data.dimension,
      modality: parsed.data.modality,
      instrument: parsed.data.instrument,
      max_score: parsed.data.maxScore,
      display_order: parsed.data.displayOrder,
      notes: parsed.data.notes,
      active: parsed.data.active,
    })
    .eq("id", parsed.data.id)
    .eq("course_id", parsed.data.courseId)
    .eq("teacher_id", userId)
    .select(
      "id, teacher_id, course_id, grading_period_id, name, activity_date, component, dimension, modality, instrument, max_score, display_order, notes, active, created_at, updated_at",
    )
    .single();

  if (error || !data) {
    console.error(
      "No se pudo actualizar la actividad:",
      error,
    );

    return {
      success: false,
      message: activityErrorMessage(error?.code),
    };
  }

  revalidateGradingPaths(parsed.data.courseId);

  return {
    success: true,
    message: "Actividad actualizada correctamente.",
    data: mapActivity(data as GradingActivityRow),
  };
}

export async function archiveGradingActivityAction(
  courseId: string,
  gradingActivityId: string,
): Promise<NotebookActionResult> {
  const parsedCourseId =
    courseIdSchema.safeParse(courseId);
  const parsedActivityId =
    courseIdSchema.safeParse(gradingActivityId);

  if (
    !parsedCourseId.success
    || !parsedActivityId.success
  ) {
    return {
      success: false,
      message: "La actividad no es vÃ¡lida.",
    };
  }

  const { supabase, userId } =
    await getAuthenticatedContext();

  if (!supabase || !userId) {
    return {
      success: false,
      message: "Debes iniciar sesiÃ³n.",
    };
  }

  const { data: activity, error: activityError } =
    await supabase
      .from("physical_education_grading_activities")
      .select("id, grading_period_id")
      .eq("id", parsedActivityId.data)
      .eq("course_id", parsedCourseId.data)
      .eq("teacher_id", userId)
      .maybeSingle();

  if (activityError || !activity) {
    return {
      success: false,
      message:
        "La actividad no existe o no tienes acceso.",
    };
  }

  const reference = activity as ActivityReferenceRow;
  const canEdit = await isEditablePeriod(
    supabase,
    userId,
    parsedCourseId.data,
    reference.grading_period_id,
  );

  if (!canEdit) {
    return {
      success: false,
      message: "El perÃ­odo estÃ¡ cerrado.",
    };
  }

  const { error } = await supabase
    .from("physical_education_grading_activities")
    .update({ active: false })
    .eq("id", parsedActivityId.data)
    .eq("course_id", parsedCourseId.data)
    .eq("teacher_id", userId);

  if (error) {
    console.error(
      "No se pudo archivar la actividad:",
      error,
    );

    return {
      success: false,
      message: "No pudimos archivar la actividad.",
    };
  }

  revalidateGradingPaths(parsedCourseId.data);

  return {
    success: true,
    message: "Actividad archivada correctamente.",
  };
}
