"use server";

import { revalidatePath } from "next/cache";

import { createClient } from "@/lib/supabase/server";

import { calculateStudentPeriodSummaries } from "../gradingCalculations";
import { saveGradesSchema } from "../gradingValidation";
import type {
  GradingActivity,
  GradingSettings,
  NotebookActionResult,
  SaveGradesInput,
  StudentGrade,
  StudentPeriodGradeSummary,
} from "../types";
import { courseIdSchema } from "../validation";

type ActivityRow = {
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

type SettingsRow = {
  id: string;
  teacher_id: string;
  course_id: string;
  formative_weight: number | string;
  project_weight: number | string;
  exam_weight: number | string;
  cognitive_weight: number | string;
  affective_social_weight: number | string;
  motor_weight: number | string;
  created_at: string;
  updated_at: string;
};

type GradeRow = {
  id: string;
  teacher_id: string;
  course_id: string;
  grading_activity_id: string;
  student_id: string;
  score: number | string | null;
  status: StudentGrade["status"];
  observation: string | null;
  created_at: string;
  updated_at: string;
};

async function getAuthenticatedContext() {
  const supabase = await createClient();

  if (!supabase) {
    return { supabase: null, userId: null };
  }

  const { data, error } =
    await supabase.auth.getClaims();
  const userId =
    typeof data?.claims?.sub === "string"
      ? data.claims.sub
      : null;

  if (error || !userId) {
    return { supabase: null, userId: null };
  }

  return { supabase, userId };
}

function mapActivity(row: ActivityRow): GradingActivity {
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

function mapSettings(row: SettingsRow): GradingSettings {
  return {
    id: row.id,
    teacherId: row.teacher_id,
    courseId: row.course_id,
    formativeWeight: Number(row.formative_weight),
    projectWeight: Number(row.project_weight),
    examWeight: Number(row.exam_weight),
    cognitiveWeight: Number(row.cognitive_weight),
    affectiveSocialWeight: Number(row.affective_social_weight),
    motorWeight: Number(row.motor_weight),
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

function mapGrade(row: GradeRow): StudentGrade {
  return {
    id: row.id,
    teacherId: row.teacher_id,
    courseId: row.course_id,
    gradingActivityId: row.grading_activity_id,
    studentId: row.student_id,
    score: row.score === null ? null : Number(row.score),
    status: row.status,
    observation: row.observation,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

function revalidateGradingPaths(courseId: string) {
  revalidatePath(`/cuaderno-digital/cursos/${courseId}`);
  revalidatePath(
    `/cuaderno-digital/cursos/${courseId}/calificaciones`,
  );
}

export async function saveGradesAction(
  input: SaveGradesInput,
): Promise<NotebookActionResult<{ saved: number }>> {
  const parsed = saveGradesSchema.safeParse(input);

  if (!parsed.success) {
    return {
      success: false,
      message: "Revisa las calificaciones ingresadas.",
    };
  }

  const { supabase, userId } =
    await getAuthenticatedContext();

  if (!supabase || !userId) {
    return { success: false, message: "Debes iniciar sesiÃ³n." };
  }

  const { data: activityData, error: activityError } =
    await supabase
      .from("physical_education_grading_activities")
      .select("id, grading_period_id, max_score, active")
      .eq("id", parsed.data.gradingActivityId)
      .eq("course_id", parsed.data.courseId)
      .eq("teacher_id", userId)
      .maybeSingle();

  if (activityError || !activityData || !activityData.active) {
    return {
      success: false,
      message: "La actividad no existe, estÃ¡ archivada o no tienes acceso.",
    };
  }

  const { data: periodData, error: periodError } =
    await supabase
      .from("physical_education_grading_periods")
      .select("status")
      .eq("id", activityData.grading_period_id)
      .eq("course_id", parsed.data.courseId)
      .eq("teacher_id", userId)
      .maybeSingle();

  if (periodError || !periodData || periodData.status === "closed") {
    return {
      success: false,
      message: "El perÃ­odo no existe o estÃ¡ cerrado.",
    };
  }

  const maximum = Number(activityData.max_score);
  const invalidScore = parsed.data.entries.some(
    (entry) =>
      entry.status === "graded"
      && entry.score !== null
      && entry.score > maximum,
  );

  if (invalidScore) {
    return {
      success: false,
      message: `La nota no puede superar ${maximum.toFixed(2)}.`,
    };
  }

  const { data: studentRows, error: studentError } =
    await supabase
      .from("physical_education_students")
      .select("id")
      .eq("course_id", parsed.data.courseId)
      .eq("teacher_id", userId)
      .eq("status", "active");

  if (studentError) {
    return {
      success: false,
      message: "No pudimos validar la lista de estudiantes.",
    };
  }

  const activeStudentIds = new Set(
    (studentRows ?? []).map((row) => String(row.id)),
  );
  const submittedStudentIds = new Set(
    parsed.data.entries.map((entry) => entry.studentId),
  );

  const completeRoster =
    activeStudentIds.size === submittedStudentIds.size
    && [...activeStudentIds].every((id) =>
      submittedStudentIds.has(id),
    );

  if (!completeRoster) {
    return {
      success: false,
      message: "La lista de estudiantes cambiÃ³. Recarga la pÃ¡gina.",
    };
  }

  const payload = parsed.data.entries.map((entry) => ({
    teacher_id: userId,
    course_id: parsed.data.courseId,
    grading_activity_id: parsed.data.gradingActivityId,
    student_id: entry.studentId,
    score: entry.status === "graded" ? entry.score : null,
    status: entry.status,
    observation: entry.observation,
  }));

  const { error } = await supabase
    .from("physical_education_grades")
    .upsert(payload, {
      onConflict: "grading_activity_id,student_id",
    });

  if (error) {
    console.error("No se pudieron guardar las calificaciones:", error);

    return {
      success: false,
      message: "No pudimos guardar las calificaciones.",
    };
  }

  revalidateGradingPaths(parsed.data.courseId);

  return {
    success: true,
    message: "Calificaciones guardadas correctamente.",
    data: { saved: payload.length },
  };
}

export async function getPeriodGradeSummariesAction(
  courseId: string,
  gradingPeriodId: string,
): Promise<
  NotebookActionResult<StudentPeriodGradeSummary[]>
> {
  const parsedCourseId = courseIdSchema.safeParse(courseId);
  const parsedPeriodId = courseIdSchema.safeParse(gradingPeriodId);

  if (!parsedCourseId.success || !parsedPeriodId.success) {
    return {
      success: false,
      message: "El curso o el perÃ­odo no es vÃ¡lido.",
      data: [],
    };
  }

  const { supabase, userId } =
    await getAuthenticatedContext();

  if (!supabase || !userId) {
    return {
      success: false,
      message: "Debes iniciar sesiÃ³n.",
      data: [],
    };
  }

  const { data: period, error: periodError } = await supabase
    .from("physical_education_grading_periods")
    .select("id")
    .eq("id", parsedPeriodId.data)
    .eq("course_id", parsedCourseId.data)
    .eq("teacher_id", userId)
    .maybeSingle();

  if (periodError || !period) {
    return {
      success: false,
      message: "El perÃ­odo no existe o no tienes acceso.",
      data: [],
    };
  }

  const [settingsResult, studentsResult, activitiesResult] =
    await Promise.all([
      supabase
        .from("physical_education_grading_settings")
        .select("id, teacher_id, course_id, formative_weight, project_weight, exam_weight, cognitive_weight, affective_social_weight, motor_weight, created_at, updated_at")
        .eq("course_id", parsedCourseId.data)
        .eq("teacher_id", userId)
        .maybeSingle(),
      supabase
        .from("physical_education_students")
        .select("id")
        .eq("course_id", parsedCourseId.data)
        .eq("teacher_id", userId)
        .eq("status", "active")
        .order("list_number", { ascending: true, nullsFirst: false })
        .order("last_names", { ascending: true }),
      supabase
        .from("physical_education_grading_activities")
        .select("id, teacher_id, course_id, grading_period_id, name, activity_date, component, dimension, modality, instrument, max_score, display_order, notes, active, created_at, updated_at")
        .eq("grading_period_id", parsedPeriodId.data)
        .eq("course_id", parsedCourseId.data)
        .eq("teacher_id", userId)
        .eq("active", true),
    ]);

  if (
    settingsResult.error
    || !settingsResult.data
    || studentsResult.error
    || activitiesResult.error
  ) {
    return {
      success: false,
      message: "No pudimos preparar el resumen trimestral.",
      data: [],
    };
  }

  const activities = (
    (activitiesResult.data ?? []) as ActivityRow[]
  ).map(mapActivity);
  const activityIds = activities.map((activity) => activity.id);

  let grades: StudentGrade[] = [];

  if (activityIds.length) {
    const { data, error } = await supabase
      .from("physical_education_grades")
      .select("id, teacher_id, course_id, grading_activity_id, student_id, score, status, observation, created_at, updated_at")
      .eq("course_id", parsedCourseId.data)
      .eq("teacher_id", userId)
      .in("grading_activity_id", activityIds);

    if (error) {
      return {
        success: false,
        message: "No pudimos cargar las notas del trimestre.",
        data: [],
      };
    }

    grades = ((data ?? []) as GradeRow[]).map(mapGrade);
  }

  const summaries = calculateStudentPeriodSummaries(
    mapSettings(settingsResult.data as SettingsRow),
    (studentsResult.data ?? []).map((row) => ({
      id: String(row.id),
    })),
    activities,
    grades,
  );

  return {
    success: true,
    message: "Resumen trimestral calculado correctamente.",
    data: summaries,
  };
}
