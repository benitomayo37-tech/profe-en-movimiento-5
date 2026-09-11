import "server-only";

import { createClient } from "@/lib/supabase/server";

import type {
  GradingActivity,
  GradingPeriod,
  GradingSettings,
  NotebookActionResult,
  StudentGrade,
} from "../types";
import { courseIdSchema } from "../validation";

type GradingSettingsRow = {
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

type GradingPeriodRow = {
  id: string;
  teacher_id: string;
  course_id: string;
  period_number: number;
  name: string;
  start_date: string | null;
  end_date: string | null;
  status: GradingPeriod["status"];
  created_at: string;
  updated_at: string;
};

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

type StudentGradeRow = {
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

const uuidSchema = courseIdSchema;

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

function mapSettings(
  row: GradingSettingsRow,
): GradingSettings {
  return {
    id: row.id,
    teacherId: row.teacher_id,
    courseId: row.course_id,
    formativeWeight: Number(row.formative_weight),
    projectWeight: Number(row.project_weight),
    examWeight: Number(row.exam_weight),
    cognitiveWeight: Number(row.cognitive_weight),
    affectiveSocialWeight: Number(
      row.affective_social_weight,
    ),
    motorWeight: Number(row.motor_weight),
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

function mapPeriod(
  row: GradingPeriodRow,
): GradingPeriod {
  return {
    id: row.id,
    teacherId: row.teacher_id,
    courseId: row.course_id,
    periodNumber: row.period_number,
    name: row.name,
    startDate: row.start_date,
    endDate: row.end_date,
    status: row.status,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
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

function mapGrade(
  row: StudentGradeRow,
): StudentGrade {
  return {
    id: row.id,
    teacherId: row.teacher_id,
    courseId: row.course_id,
    gradingActivityId: row.grading_activity_id,
    studentId: row.student_id,
    score:
      row.score === null ? null : Number(row.score),
    status: row.status,
    observation: row.observation,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export async function getGradingSettings(
  courseId: string,
): Promise<
  NotebookActionResult<GradingSettings | null>
> {
  const parsedCourseId =
    courseIdSchema.safeParse(courseId);

  if (!parsedCourseId.success) {
    return {
      success: false,
      message: "El curso no es vÃ¡lido.",
      data: null,
    };
  }

  const { supabase, userId } =
    await getAuthenticatedContext();

  if (!supabase || !userId) {
    return {
      success: false,
      message: "Debes iniciar sesiÃ³n.",
      data: null,
    };
  }

  const { data, error } = await supabase
    .from("physical_education_grading_settings")
    .select(
      "id, teacher_id, course_id, formative_weight, project_weight, exam_weight, cognitive_weight, affective_social_weight, motor_weight, created_at, updated_at",
    )
    .eq("teacher_id", userId)
    .eq("course_id", parsedCourseId.data)
    .maybeSingle();

  if (error) {
    console.error(
      "No se pudo consultar la configuraciÃ³n de calificaciones:",
      error,
    );

    return {
      success: false,
      message:
        "No pudimos cargar la configuraciÃ³n de calificaciones.",
      data: null,
    };
  }

  return {
    success: true,
    message: "ConfiguraciÃ³n cargada correctamente.",
    data: data
      ? mapSettings(data as GradingSettingsRow)
      : null,
  };
}

export async function getGradingPeriods(
  courseId: string,
): Promise<NotebookActionResult<GradingPeriod[]>> {
  const parsedCourseId =
    courseIdSchema.safeParse(courseId);

  if (!parsedCourseId.success) {
    return {
      success: false,
      message: "El curso no es vÃ¡lido.",
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

  const { data, error } = await supabase
    .from("physical_education_grading_periods")
    .select(
      "id, teacher_id, course_id, period_number, name, start_date, end_date, status, created_at, updated_at",
    )
    .eq("teacher_id", userId)
    .eq("course_id", parsedCourseId.data)
    .order("period_number", { ascending: true });

  if (error) {
    console.error(
      "No se pudieron consultar los perÃ­odos:",
      error,
    );

    return {
      success: false,
      message:
        "No pudimos cargar los perÃ­odos de evaluaciÃ³n.",
      data: [],
    };
  }

  return {
    success: true,
    message: "PerÃ­odos cargados correctamente.",
    data: ((data ?? []) as GradingPeriodRow[]).map(
      mapPeriod,
    ),
  };
}

export async function getGradingActivities(
  courseId: string,
  gradingPeriodId: string,
): Promise<NotebookActionResult<GradingActivity[]>> {
  const parsedCourseId =
    courseIdSchema.safeParse(courseId);
  const parsedPeriodId =
    uuidSchema.safeParse(gradingPeriodId);

  if (
    !parsedCourseId.success
    || !parsedPeriodId.success
  ) {
    return {
      success: false,
      message:
        "El curso o el perÃ­odo no es vÃ¡lido.",
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

  const { data, error } = await supabase
    .from("physical_education_grading_activities")
    .select(
      "id, teacher_id, course_id, grading_period_id, name, activity_date, component, dimension, modality, instrument, max_score, display_order, notes, active, created_at, updated_at",
    )
    .eq("teacher_id", userId)
    .eq("course_id", parsedCourseId.data)
    .eq("grading_period_id", parsedPeriodId.data)
    .order("active", { ascending: false })
    .order("display_order", { ascending: true })
    .order("activity_date", {
      ascending: true,
      nullsFirst: false,
    })
    .order("created_at", { ascending: true });

  if (error) {
    console.error(
      "No se pudieron consultar las actividades:",
      error,
    );

    return {
      success: false,
      message:
        "No pudimos cargar las actividades de evaluaciÃ³n.",
      data: [],
    };
  }

  return {
    success: true,
    message: "Actividades cargadas correctamente.",
    data: ((data ?? []) as GradingActivityRow[]).map(
      mapActivity,
    ),
  };
}

export async function getGradesByActivity(
  courseId: string,
  gradingActivityId: string,
): Promise<NotebookActionResult<StudentGrade[]>> {
  const parsedCourseId =
    courseIdSchema.safeParse(courseId);
  const parsedActivityId =
    uuidSchema.safeParse(gradingActivityId);

  if (
    !parsedCourseId.success
    || !parsedActivityId.success
  ) {
    return {
      success: false,
      message:
        "El curso o la actividad no es vÃ¡lida.",
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

  const { data, error } = await supabase
    .from("physical_education_grades")
    .select(
      "id, teacher_id, course_id, grading_activity_id, student_id, score, status, observation, created_at, updated_at",
    )
    .eq("teacher_id", userId)
    .eq("course_id", parsedCourseId.data)
    .eq(
      "grading_activity_id",
      parsedActivityId.data,
    );

  if (error) {
    console.error(
      "No se pudieron consultar las calificaciones:",
      error,
    );

    return {
      success: false,
      message: "No pudimos cargar las calificaciones.",
      data: [],
    };
  }

  return {
    success: true,
    message: "Calificaciones cargadas correctamente.",
    data: ((data ?? []) as StudentGradeRow[]).map(
      mapGrade,
    ),
  };
}
