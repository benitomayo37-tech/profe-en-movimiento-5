"use server";

import { revalidatePath } from "next/cache";

import { createClient } from "@/lib/supabase/server";

import type {
  CreateCourseInput,
  NotebookActionResult,
  UpdateCourseInput,
} from "../types";
import {
  courseIdSchema,
  createCourseSchema,
  getFieldErrors,
  updateCourseSchema,
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
      "Ya existe un curso con ese nivel, "
      + "grado, paralelo y año lectivo."
    );
  }

  if (code === "23503") {
    return "No se pudo relacionar el curso.";
  }

  return "No pudimos guardar el curso.";
}

function refreshNotebook() {
  revalidatePath("/cuaderno-digital");
}

export async function createCourseAction(
  input: CreateCourseInput,
): Promise<NotebookActionResult<{ id: string }>> {
  const parsed = createCourseSchema.safeParse(input);

  if (!parsed.success) {
    return {
      success: false,
      message: "Revisa los datos del curso.",
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

  const { data, error } = await supabase
    .from("physical_education_courses")
    .insert({
      teacher_id: userId,
      name: values.name,
      education_level: values.educationLevel,
      grade: values.grade,
      parallel: values.parallel,
      school_year: values.schoolYear,
      shift: values.shift,
    })
    .select("id")
    .single();

  if (error || !data) {
    console.error(
      "No se pudo crear el curso:",
      error,
    );

    return {
      success: false,
      message: databaseErrorMessage(error?.code),
    };
  }

  refreshNotebook();

  return {
    success: true,
    message: "Curso creado correctamente.",
    data: {
      id: String(data.id),
    },
  };
}

export async function updateCourseAction(
  input: UpdateCourseInput,
): Promise<NotebookActionResult> {
  const parsed = updateCourseSchema.safeParse(input);

  if (!parsed.success) {
    return {
      success: false,
      message: "Revisa los datos del curso.",
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

  const { data, error } = await supabase
    .from("physical_education_courses")
    .update({
      name: values.name,
      education_level: values.educationLevel,
      grade: values.grade,
      parallel: values.parallel,
      school_year: values.schoolYear,
      shift: values.shift,
      active: values.active,
    })
    .eq("id", values.id)
    .eq("teacher_id", userId)
    .select("id")
    .maybeSingle();

  if (error) {
    console.error(
      "No se pudo actualizar el curso:",
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
        "El curso no existe o no tienes acceso.",
    };
  }

  refreshNotebook();

  return {
    success: true,
    message: "Curso actualizado correctamente.",
  };
}

export async function setCourseActiveAction(
  courseId: string,
  active: boolean,
): Promise<NotebookActionResult> {
  const parsedId = courseIdSchema.safeParse(courseId);

  if (!parsedId.success || typeof active !== "boolean") {
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
    .from("physical_education_courses")
    .update({ active })
    .eq("id", parsedId.data)
    .eq("teacher_id", userId)
    .select("id")
    .maybeSingle();

  if (error) {
    console.error(
      "No se pudo cambiar el estado del curso:",
      error,
    );

    return {
      success: false,
      message:
        "No pudimos cambiar el estado del curso.",
    };
  }

  if (!data) {
    return {
      success: false,
      message:
        "El curso no existe o no tienes acceso.",
    };
  }

  refreshNotebook();

  return {
    success: true,
    message: active
      ? "Curso reactivado correctamente."
      : "Curso archivado correctamente.",
  };
}

export async function deleteCourseAction(
  courseId: string,
  confirmationName: string,
): Promise<NotebookActionResult> {
  const parsedId = courseIdSchema.safeParse(courseId);

  if (
    !parsedId.success
    || typeof confirmationName !== "string"
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

  const { data: course, error: courseError } =
    await supabase
      .from("physical_education_courses")
      .select("id, name")
      .eq("id", parsedId.data)
      .eq("teacher_id", userId)
      .maybeSingle();

  if (courseError || !course) {
    return {
      success: false,
      message:
        "El curso no existe o no tienes acceso.",
    };
  }

  const expectedName = String(course.name)
    .trim()
    .toLocaleLowerCase("es");

  const receivedName = confirmationName
    .trim()
    .toLocaleLowerCase("es");

  if (
    !receivedName
    || receivedName !== expectedName
  ) {
    return {
      success: false,
      message:
        "Escribe exactamente el nombre del curso "
        + "para confirmar su eliminación.",
    };
  }

  const { data, error } = await supabase
    .from("physical_education_courses")
    .delete()
    .eq("id", parsedId.data)
    .eq("teacher_id", userId)
    .select("id")
    .maybeSingle();

  if (error) {
    console.error(
      "No se pudo eliminar el curso:",
      error,
    );

    return {
      success: false,
      message: "No pudimos eliminar el curso.",
    };
  }

  if (!data) {
    return {
      success: false,
      message:
        "El curso ya no existe o no tienes acceso.",
    };
  }

  refreshNotebook();

  return {
    success: true,
    message:
      "Curso y estudiantes eliminados correctamente.",
  };
}
