"use server";

import { revalidatePath } from "next/cache";

import { createClient } from "@/lib/supabase/server";

import type {
  NotebookActionResult,
  StudentCsvRow,
  StudentCsvRowError,
  StudentImportResult,
} from "../types";
import {
  courseIdSchema,
  studentCsvRowSchema,
} from "../validation";

const MAX_IMPORT_ROWS = 500;

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

function normalizeCode(
  value: string | null,
): string | null {
  const normalized = value
    ?.trim()
    .toLocaleLowerCase("es");

  return normalized || null;
}

function buildResult(
  imported: number,
  rejected: number,
  errors: StudentCsvRowError[],
): StudentImportResult {
  return {
    imported,
    rejected,
    errors,
  };
}

export async function importStudentsAction(
  courseId: string,
  rows: StudentCsvRow[],
): Promise<NotebookActionResult<StudentImportResult>> {
  const parsedCourseId =
    courseIdSchema.safeParse(courseId);

  if (!parsedCourseId.success) {
    return {
      success: false,
      message: "El curso no es válido.",
      data: buildResult(0, rows?.length ?? 0, []),
    };
  }

  if (!Array.isArray(rows) || rows.length === 0) {
    return {
      success: false,
      message:
        "No hay estudiantes válidos para importar.",
      data: buildResult(0, 0, []),
    };
  }

  if (rows.length > MAX_IMPORT_ROWS) {
    return {
      success: false,
      message:
        "Solo se permiten 500 estudiantes "
        + "por importación.",
      data: buildResult(0, rows.length, [
        {
          rowNumber: 1,
          message:
            "La importación supera el límite "
            + "de 500 estudiantes.",
        },
      ]),
    };
  }

  const { supabase, userId } =
    await getAuthenticatedContext();

  if (!supabase || !userId) {
    return {
      success: false,
      message: "Debes iniciar sesión.",
      data: buildResult(0, rows.length, []),
    };
  }

  const { data: course, error: courseError } =
    await supabase
      .from("physical_education_courses")
      .select("id")
      .eq("id", parsedCourseId.data)
      .eq("teacher_id", userId)
      .maybeSingle();

  if (courseError || !course) {
    return {
      success: false,
      message:
        "El curso no existe o no tienes acceso.",
      data: buildResult(0, rows.length, []),
    };
  }

  const {
    data: existingStudents,
    error: existingError,
  } = await supabase
    .from("physical_education_students")
    .select("student_code, list_number")
    .eq("course_id", parsedCourseId.data)
    .eq("teacher_id", userId);

  if (existingError) {
    console.error(
      "No se pudieron comprobar duplicados:",
      existingError,
    );

    return {
      success: false,
      message:
        "No pudimos comprobar los estudiantes "
        + "existentes.",
      data: buildResult(0, rows.length, []),
    };
  }

  const existingCodes = new Set<string>();
  const existingListNumbers = new Set<number>();

  for (const student of existingStudents ?? []) {
    const code = normalizeCode(
      typeof student.student_code === "string"
        ? student.student_code
        : null,
    );

    if (code) existingCodes.add(code);

    if (
      typeof student.list_number === "number"
    ) {
      existingListNumbers.add(
        student.list_number,
      );
    }
  }

  const batchCodes = new Set<string>();
  const batchListNumbers = new Set<number>();
  const acceptedRows: StudentCsvRow[] = [];
  const errors: StudentCsvRowError[] = [];

  for (const row of rows) {
    const parsed =
      studentCsvRowSchema.safeParse(row);

    if (!parsed.success) {
      errors.push({
        rowNumber:
          typeof row?.rowNumber === "number"
            ? row.rowNumber
            : 1,
        message: parsed.error.issues
          .map((issue) => issue.message)
          .join(" "),
      });

      continue;
    }

    const candidate = parsed.data;
    const code = normalizeCode(
      candidate.studentCode,
    );

    if (
      code
      && (
        existingCodes.has(code)
        || batchCodes.has(code)
      )
    ) {
      errors.push({
        rowNumber: candidate.rowNumber,
        message:
          "El código del estudiante "
          + "ya está registrado en el curso.",
      });

      continue;
    }

    if (
      candidate.listNumber !== null
      && (
        existingListNumbers.has(
          candidate.listNumber,
        )
        || batchListNumbers.has(
          candidate.listNumber,
        )
      )
    ) {
      errors.push({
        rowNumber: candidate.rowNumber,
        message:
          "El número de lista "
          + "ya está registrado en el curso.",
      });

      continue;
    }

    if (code) batchCodes.add(code);

    if (candidate.listNumber !== null) {
      batchListNumbers.add(
        candidate.listNumber,
      );
    }

    acceptedRows.push(candidate);
  }

  if (acceptedRows.length === 0) {
    return {
      success: false,
      message:
        "Ninguna fila pudo ser importada.",
      data: buildResult(
        0,
        errors.length,
        errors,
      ),
    };
  }

  const { error: insertError } = await supabase
    .from("physical_education_students")
    .insert(
      acceptedRows.map((row) => ({
        teacher_id: userId,
        course_id: parsedCourseId.data,
        first_names: row.firstNames,
        last_names: row.lastNames,
        student_code: row.studentCode,
        list_number: row.listNumber,
      })),
    );

  if (insertError) {
    console.error(
      "No se pudo completar la importación:",
      insertError,
    );

    const message =
      insertError.code === "23505"
        ? (
          "Se detectó un código o número "
          + "de lista duplicado."
        )
        : "No pudimos guardar la importación.";

    return {
      success: false,
      message,
      data: buildResult(
        0,
        rows.length,
        [
          ...errors,
          {
            rowNumber: 1,
            message,
          },
        ],
      ),
    };
  }

  revalidatePath("/cuaderno-digital");
  revalidatePath(
    `/cuaderno-digital/cursos/${parsedCourseId.data}`,
  );

  const imported = acceptedRows.length;
  const rejected = errors.length;

  return {
    success: true,
    message:
      rejected > 0
        ? (
          `Se importaron ${imported} estudiantes. `
          + `${rejected} filas fueron rechazadas.`
        )
        : (
          `Se importaron ${imported} estudiantes `
          + "correctamente."
        ),
    data: buildResult(
      imported,
      rejected,
      errors,
    ),
  };
}
