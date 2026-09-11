"use server";

import { revalidatePath } from "next/cache";

import { createClient } from "@/lib/supabase/server";

import type {
  AttendanceRecord,
  AttendanceSession,
  NotebookActionResult,
  SaveAttendanceInput,
} from "../types";
import {
  attendanceDateSchema,
  attendanceReportSchema,
  saveAttendanceSchema,
} from "../attendanceValidation";
import { courseIdSchema } from "../validation";

type AttendanceSessionRow = {
  id: string;
  teacher_id: string;
  course_id: string;
  attendance_date: string;
  class_note: string | null;
  created_at: string;
  updated_at: string;
};

type AttendanceRecordRow = {
  id: string;
  teacher_id: string;
  attendance_session_id: string;
  course_id: string;
  student_id: string;
  status: AttendanceRecord["status"];
  observation: string | null;
  created_at: string;
  updated_at: string;
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

async function ownsCourse(
  supabase: NonNullable<
    Awaited<ReturnType<typeof createClient>>
  >,
  userId: string,
  courseId: string,
): Promise<boolean> {
  const { data, error } = await supabase
    .from("physical_education_courses")
    .select("id")
    .eq("id", courseId)
    .eq("teacher_id", userId)
    .maybeSingle();

  return !error && Boolean(data);
}

function mapRecord(
  row: AttendanceRecordRow,
): AttendanceRecord {
  return {
    id: row.id,
    teacherId: row.teacher_id,
    attendanceSessionId:
      row.attendance_session_id,
    courseId: row.course_id,
    studentId: row.student_id,
    status: row.status,
    observation: row.observation,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

function mapSession(
  row: AttendanceSessionRow,
  records: AttendanceRecord[],
): AttendanceSession {
  return {
    id: row.id,
    teacherId: row.teacher_id,
    courseId: row.course_id,
    attendanceDate: row.attendance_date,
    classNote: row.class_note,
    records,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

function saveErrorMessage(
  code: string | undefined,
): string {
  if (code === "42501") {
    return (
      "El curso o alguno de sus estudiantes "
      + "no está disponible para tu cuenta."
    );
  }

  if (code === "22023") {
    return "Revisa los datos de la asistencia.";
  }

  if (code === "23503") {
    return (
      "El curso o alguno de sus estudiantes "
      + "ya no existe."
    );
  }

  return "No pudimos guardar la asistencia.";
}

export async function getAttendanceByDateAction(
  courseId: string,
  attendanceDate: string,
): Promise<
  NotebookActionResult<AttendanceSession | null>
> {
  const parsedCourseId =
    courseIdSchema.safeParse(courseId);

  const parsedDate =
    attendanceDateSchema.safeParse(attendanceDate);

  if (
    !parsedCourseId.success
    || !parsedDate.success
  ) {
    return {
      success: false,
      message: "La consulta de asistencia no es válida.",
      data: null,
    };
  }

  const { supabase, userId } =
    await getAuthenticatedContext();

  if (!supabase || !userId) {
    return {
      success: false,
      message: "Debes iniciar sesión.",
      data: null,
    };
  }

  if (
    !(await ownsCourse(
      supabase,
      userId,
      parsedCourseId.data,
    ))
  ) {
    return {
      success: false,
      message:
        "El curso no existe o no tienes acceso.",
      data: null,
    };
  }

  const {
    data: sessionData,
    error: sessionError,
  } = await supabase
    .from("physical_education_attendance_sessions")
    .select(
      "id, teacher_id, course_id, attendance_date, class_note, created_at, updated_at",
    )
    .eq("teacher_id", userId)
    .eq("course_id", parsedCourseId.data)
    .eq("attendance_date", parsedDate.data)
    .maybeSingle();

  if (sessionError) {
    console.error(
      "No se pudo consultar la jornada:",
      sessionError,
    );

    return {
      success: false,
      message: "No pudimos cargar la asistencia.",
      data: null,
    };
  }

  if (!sessionData) {
    return {
      success: true,
      message:
        "Todavía no existe asistencia para esta fecha.",
      data: null,
    };
  }

  const sessionRow =
    sessionData as AttendanceSessionRow;

  const {
    data: recordData,
    error: recordError,
  } = await supabase
    .from("physical_education_attendance_records")
    .select(
      "id, teacher_id, attendance_session_id, course_id, student_id, status, observation, created_at, updated_at",
    )
    .eq("teacher_id", userId)
    .eq("course_id", parsedCourseId.data)
    .eq("attendance_session_id", sessionRow.id)
    .order("created_at", { ascending: true });

  if (recordError) {
    console.error(
      "No se pudieron consultar los registros:",
      recordError,
    );

    return {
      success: false,
      message: "No pudimos cargar la asistencia.",
      data: null,
    };
  }

  const records = (
    (recordData ?? []) as AttendanceRecordRow[]
  ).map(mapRecord);

  return {
    success: true,
    message: "Asistencia cargada correctamente.",
    data: mapSession(sessionRow, records),
  };
}

export async function saveAttendanceAction(
  input: SaveAttendanceInput,
): Promise<
  NotebookActionResult<{ sessionId: string }>
> {
  const parsed = saveAttendanceSchema.safeParse(input);

  if (!parsed.success) {
    return {
      success: false,
      message: "Revisa los datos de la asistencia.",
    };
  }

  const { supabase, userId } =
    await getAuthenticatedContext();

  if (!supabase || !userId) {
    return {
      success: false,
      message: "Debes iniciar sesión.",
    };
  }

  const values = parsed.data;

  if (
    !(await ownsCourse(
      supabase,
      userId,
      values.courseId,
    ))
  ) {
    return {
      success: false,
      message:
        "El curso no existe o no tienes acceso.",
    };
  }

  const entries = values.entries.map((entry) => ({
    student_id: entry.studentId,
    status: entry.status,
    observation: entry.observation,
  }));

  const { data, error } = await supabase.rpc(
    "save_physical_education_attendance",
    {
      p_course_id: values.courseId,
      p_attendance_date: values.attendanceDate,
      p_class_note: values.classNote,
      p_entries: entries,
    },
  );

  if (error || typeof data !== "string") {
    console.error(
      "No se pudo guardar la asistencia:",
      error,
    );

    return {
      success: false,
      message: saveErrorMessage(error?.code),
    };
  }

  revalidatePath(
    `/cuaderno-digital/cursos/${values.courseId}`,
  );

  return {
    success: true,
    message: "Asistencia guardada correctamente.",
    data: {
      sessionId: data,
    },
  };
}
export async function getAttendanceReportAction(
  courseId: string,
  startDate: string,
  endDate: string,
): Promise<
  NotebookActionResult<AttendanceSession[]>
> {
  const parsed = attendanceReportSchema.safeParse({
    courseId,
    startDate,
    endDate,
  });

  if (!parsed.success) {
    return {
      success: false,
      message:
        "El período seleccionado no es válido.",
      data: [],
    };
  }

  const { supabase, userId } =
    await getAuthenticatedContext();

  if (!supabase || !userId) {
    return {
      success: false,
      message: "Debes iniciar sesión.",
      data: [],
    };
  }

  const values = parsed.data;

  if (
    !(await ownsCourse(
      supabase,
      userId,
      values.courseId,
    ))
  ) {
    return {
      success: false,
      message:
        "El curso no existe o no tienes acceso.",
      data: [],
    };
  }

  const {
    data: sessionData,
    error: sessionError,
  } = await supabase
    .from("physical_education_attendance_sessions")
    .select(
      "id, teacher_id, course_id, attendance_date, class_note, created_at, updated_at",
    )
    .eq("teacher_id", userId)
    .eq("course_id", values.courseId)
    .gte("attendance_date", values.startDate)
    .lte("attendance_date", values.endDate)
    .order("attendance_date", {
      ascending: true,
    });

  if (sessionError) {
    console.error(
      "No se pudieron consultar las jornadas:",
      sessionError,
    );

    return {
      success: false,
      message:
        "No pudimos cargar el reporte de asistencia.",
      data: [],
    };
  }

  const sessions =
    (sessionData ?? []) as AttendanceSessionRow[];

  if (!sessions.length) {
    return {
      success: true,
      message:
        "No hay asistencias registradas en este período.",
      data: [],
    };
  }

  const sessionIds = sessions.map(
    (session) => session.id,
  );

  const recordRows: AttendanceRecordRow[] = [];
  const pageSize = 1000;
  let offset = 0;

  while (true) {
    const {
      data: pageData,
      error: pageError,
    } = await supabase
      .from("physical_education_attendance_records")
      .select(
        "id, teacher_id, attendance_session_id, course_id, student_id, status, observation, created_at, updated_at",
      )
      .eq("teacher_id", userId)
      .eq("course_id", values.courseId)
      .in("attendance_session_id", sessionIds)
      .order("attendance_session_id", {
        ascending: true,
      })
      .order("created_at", {
        ascending: true,
      })
      .range(
        offset,
        offset + pageSize - 1,
      );

    if (pageError) {
      console.error(
        "No se pudieron consultar los registros del período:",
        pageError,
      );

      return {
        success: false,
        message:
          "No pudimos cargar el reporte de asistencia.",
        data: [],
      };
    }

    const currentPage =
      (pageData ?? []) as AttendanceRecordRow[];

    recordRows.push(...currentPage);

    if (currentPage.length < pageSize) {
      break;
    }

    offset += pageSize;
  }

  const recordsBySession = new Map<
    string,
    AttendanceRecord[]
  >();

  recordRows.forEach((row) => {
    const record = mapRecord(row);

    const current =
      recordsBySession.get(
        record.attendanceSessionId,
      ) ?? [];

    current.push(record);

    recordsBySession.set(
      record.attendanceSessionId,
      current,
    );
  });

  return {
    success: true,
    message:
      "Reporte de asistencia cargado correctamente.",
    data: sessions.map((session) =>
      mapSession(
        session,
        recordsBySession.get(session.id) ?? [],
      ),
    ),
  };
}
