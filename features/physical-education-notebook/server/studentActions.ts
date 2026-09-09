"use server";

import { revalidatePath } from "next/cache";

import { createClient } from "@/lib/supabase/server";

import type {
  CreateStudentInput,
  NotebookActionResult,
  StudentStatus,
  UpdateStudentInput,
} from "../types";
import {
  courseIdSchema,
  createStudentSchema,
  getFieldErrors,
  studentIdSchema,
  updateStudentSchema,
} from "../validation";

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

function databaseErrorMessage(
  code: string | undefined,
): string {
  if (code === "23505") {
    return (
      "El código o el número de lista "
      + "ya está registrado en este curso."
    );
  }

  if (code === "23503") {
    return (
      "El curso no existe o no tienes acceso."
    );
  }

  return "No pudimos guardar el estudiante.";
}

function refreshNotebook(courseId?: string) {
  revalidatePath("/cuaderno-digital");

  if (courseId) {
    revalidatePath(
      `/cuaderno-digital/cursos/${courseId}`,
    );
  }
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

export async function createStudentAction(
  input: CreateStudentInput,
): Promise<NotebookActionResult<{ id: string }>> {
  const parsed = createStudentSchema.safeParse(input);

  if (!parsed.success) {
    return {
      success: false,
      message:
        "Revisa los datos del estudiante.",
      fieldErrors: getFieldErrors(parsed.error),
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

  const { data, error } = await supabase
    .from("physical_education_students")
    .insert({
      teacher_id: userId,
      course_id: values.courseId,
      first_names: values.firstNames,
      last_names: values.lastNames,
      student_code: values.studentCode,
      list_number: values.listNumber,
    })
    .select("id")
    .single();

  if (error || !data) {
    console.error(
      "No se pudo crear el estudiante:",
      error,
    );

    return {
      success: false,
      message: databaseErrorMessage(error?.code),
    };
  }

  refreshNotebook(values.courseId);

  return {
    success: true,
    message:
      "Estudiante registrado correctamente.",
    data: {
      id: String(data.id),
    },
  };
}

export async function updateStudentAction(
  input: UpdateStudentInput,
): Promise<NotebookActionResult> {
  const parsed = updateStudentSchema.safeParse(input);

  if (!parsed.success) {
    return {
      success: false,
      message:
        "Revisa los datos del estudiante.",
      fieldErrors: getFieldErrors(parsed.error),
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

  const { data, error } = await supabase
    .from("physical_education_students")
    .update({
      course_id: values.courseId,
      first_names: values.firstNames,
      last_names: values.lastNames,
      student_code: values.studentCode,
      list_number: values.listNumber,
      status: values.status,
    })
    .eq("id", values.id)
    .eq("teacher_id", userId)
    .select("id")
    .maybeSingle();

  if (error) {
    console.error(
      "No se pudo actualizar el estudiante:",
      error,
    );

    return {
      success: false,
      message: databaseErrorMessage(error.code),
    };
  }

  if (!data) {
    return {
      success: false,
      message:
        "El estudiante no existe "
        + "o no tienes acceso.",
    };
  }

  refreshNotebook(values.courseId);

  return {
    success: true,
    message:
      "Estudiante actualizado correctamente.",
  };
}

export async function setStudentStatusAction(
  studentId: string,
  courseId: string,
  status: StudentStatus,
): Promise<NotebookActionResult> {
  const parsedStudentId =
    studentIdSchema.safeParse(studentId);

  const parsedCourseId =
    courseIdSchema.safeParse(courseId);

  const validStatus =
    status === "active"
    || status === "inactive"
    || status === "withdrawn";

  if (
    !parsedStudentId.success
    || !parsedCourseId.success
    || !validStatus
  ) {
    return {
      success: false,
      message: "La solicitud no es válida.",
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

  const { data, error } = await supabase
    .from("physical_education_students")
    .update({ status })
    .eq("id", parsedStudentId.data)
    .eq("course_id", parsedCourseId.data)
    .eq("teacher_id", userId)
    .select("id")
    .maybeSingle();

  if (error) {
    console.error(
      "No se pudo cambiar el estado:",
      error,
    );

    return {
      success: false,
      message:
        "No pudimos cambiar el estado "
        + "del estudiante.",
    };
  }

  if (!data) {
    return {
      success: false,
      message:
        "El estudiante no existe "
        + "o no tienes acceso.",
    };
  }

  refreshNotebook(parsedCourseId.data);

  const statusMessage: Record<
    StudentStatus,
    string
  > = {
    active: "Estudiante activado correctamente.",
    inactive: "Estudiante desactivado correctamente.",
    withdrawn:
      "Estudiante marcado como retirado.",
  };

  return {
    success: true,
    message: statusMessage[status],
  };
}

export async function deleteStudentAction(
  studentId: string,
  courseId: string,
): Promise<NotebookActionResult> {
  const parsedStudentId =
    studentIdSchema.safeParse(studentId);

  const parsedCourseId =
    courseIdSchema.safeParse(courseId);

  if (
    !parsedStudentId.success
    || !parsedCourseId.success
  ) {
    return {
      success: false,
      message: "La solicitud no es válida.",
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

  const { data, error } = await supabase
    .from("physical_education_students")
    .delete()
    .eq("id", parsedStudentId.data)
    .eq("course_id", parsedCourseId.data)
    .eq("teacher_id", userId)
    .select("id")
    .maybeSingle();

  if (error) {
    console.error(
      "No se pudo eliminar el estudiante:",
      error,
    );

    return {
      success: false,
      message:
        "No pudimos eliminar el estudiante.",
    };
  }

  if (!data) {
    return {
      success: false,
      message:
        "El estudiante ya no existe "
        + "o no tienes acceso.",
    };
  }

  refreshNotebook(parsedCourseId.data);

  return {
    success: true,
    message:
      "Estudiante eliminado correctamente.",
  };
}
