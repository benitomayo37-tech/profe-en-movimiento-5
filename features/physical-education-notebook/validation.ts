import { z } from "zod";

const trimmedText = (
  minimum: number,
  maximum: number,
  requiredMessage: string,
) =>
  z
    .string()
    .trim()
    .min(minimum, requiredMessage)
    .max(
      maximum,
      `Debe contener como máximo ${maximum} caracteres.`,
    );

const optionalTrimmedText = (maximum: number) =>
  z.preprocess(
    (value) => {
      if (typeof value !== "string") return value ?? null;

      const normalized = value.trim();
      return normalized.length ? normalized : null;
    },
    z
      .string()
      .max(
        maximum,
        `Debe contener como máximo ${maximum} caracteres.`,
      )
      .nullable(),
  );

const optionalListNumber = z.preprocess(
  (value) => {
    if (
      value === null
      || value === undefined
      || value === ""
    ) {
      return null;
    }

    if (typeof value === "string") {
      const normalized = value.trim();
      if (!normalized) return null;

      return Number(normalized);
    }

    return value;
  },
  z
    .number({
      error: "El número de lista debe ser numérico.",
    })
    .int("El número de lista debe ser un entero.")
    .min(1, "El número de lista debe ser mayor que cero.")
    .max(999, "El número de lista no puede superar 999.")
    .nullable(),
);

export const courseIdSchema = z
  .string()
  .uuid("El identificador del curso no es válido.");

export const studentIdSchema = z
  .string()
  .uuid("El identificador del estudiante no es válido.");

export const createCourseSchema = z.object({
  name: trimmedText(
    2,
    120,
    "Escribe un nombre para el curso.",
  ),
  educationLevel: trimmedText(
    2,
    80,
    "Selecciona el nivel educativo.",
  ),
  grade: trimmedText(
    1,
    80,
    "Escribe o selecciona el grado o curso.",
  ),
  parallel: trimmedText(
    1,
    20,
    "Escribe el paralelo.",
  ),
  schoolYear: trimmedText(
    4,
    20,
    "Escribe el año lectivo.",
  ),
  shift: optionalTrimmedText(40),
});

export const updateCourseSchema =
  createCourseSchema.extend({
    id: courseIdSchema,
    active: z.boolean(),
  });

export const createStudentSchema = z.object({
  courseId: courseIdSchema,
  firstNames: trimmedText(
    1,
    100,
    "Escribe los nombres del estudiante.",
  ),
  lastNames: trimmedText(
    1,
    100,
    "Escribe los apellidos del estudiante.",
  ),
  studentCode: optionalTrimmedText(50),
  listNumber: optionalListNumber,
});

export const updateStudentSchema =
  createStudentSchema.extend({
    id: studentIdSchema,
    status: z.enum([
      "active",
      "inactive",
      "withdrawn",
    ]),
  });

export const studentCsvRowSchema = z.object({
  rowNumber: z.number().int().min(2),
  firstNames: trimmedText(
    1,
    100,
    "Faltan los nombres.",
  ),
  lastNames: trimmedText(
    1,
    100,
    "Faltan los apellidos.",
  ),
  studentCode: optionalTrimmedText(50),
  listNumber: optionalListNumber,
});

export type CreateCourseValues =
  z.infer<typeof createCourseSchema>;

export type UpdateCourseValues =
  z.infer<typeof updateCourseSchema>;

export type CreateStudentValues =
  z.infer<typeof createStudentSchema>;

export type UpdateStudentValues =
  z.infer<typeof updateStudentSchema>;

export type StudentCsvRowValues =
  z.infer<typeof studentCsvRowSchema>;

export function getFieldErrors(
  error: z.ZodError,
): Record<string, string> {
  const fieldErrors: Record<string, string> = {};

  for (const issue of error.issues) {
    const field = issue.path[0];

    if (
      typeof field === "string"
      && !fieldErrors[field]
    ) {
      fieldErrors[field] = issue.message;
    }
  }

  return fieldErrors;
}
