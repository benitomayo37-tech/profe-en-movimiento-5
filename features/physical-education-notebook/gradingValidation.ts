import { z } from "zod";

import {
  courseIdSchema,
  studentIdSchema,
} from "./validation";

const gradingPeriodIdSchema = z
  .string()
  .uuid("El perÃ­odo de evaluaciÃ³n no es vÃ¡lido.");

const gradingActivityIdSchema = z
  .string()
  .uuid("La actividad de evaluaciÃ³n no es vÃ¡lida.");

const requiredGradingText = (
  label: string,
  maximum: number,
) =>
  z
    .string()
    .trim()
    .min(1, `${label} es obligatorio.`)
    .max(
      maximum,
      `${label} debe contener como mÃ¡ximo ${maximum} caracteres.`,
    );

const optionalGradingText = (maximum: number) =>
  z.preprocess(
    (value) => {
      if (typeof value !== "string") {
        return value ?? null;
      }

      const normalized = value.trim();
      return normalized.length ? normalized : null;
    },
    z
      .string()
      .max(
        maximum,
        `Debe contener como mÃ¡ximo ${maximum} caracteres.`,
      )
      .nullable(),
  );

function isValidDate(value: string): boolean {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    return false;
  }

  const date = new Date(`${value}T00:00:00Z`);

  return (
    !Number.isNaN(date.getTime())
    && date.toISOString().slice(0, 10) === value
  );
}

const optionalGradingDate = z.preprocess(
  (value) => {
    if (typeof value !== "string") {
      return value ?? null;
    }

    const normalized = value.trim();
    return normalized.length ? normalized : null;
  },
  z
    .string()
    .refine(
      isValidDate,
      "La fecha de la actividad no es vÃ¡lida.",
    )
    .refine(
      (value) =>
        value >= "2000-01-01"
        && value <= "2100-12-31",
      "La fecha debe estar entre 2000 y 2100.",
    )
    .nullable(),
);

const nullableScoreSchema = z.preprocess(
  (value) => {
    if (
      value === null
      || value === undefined
      || value === ""
    ) {
      return null;
    }

    if (typeof value === "string") {
      return Number(value.trim().replace(",", "."));
    }

    return value;
  },
  z
    .number({
      error: "La calificaciÃ³n debe ser numÃ©rica.",
    })
    .min(1, "La calificaciÃ³n mÃ­nima es 1,00.")
    .max(10, "La calificaciÃ³n mÃ¡xima es 10,00.")
    .nullable(),
);

export const gradingComponentSchema = z.enum([
  "formative",
  "interdisciplinary_project",
  "exam",
]);

export const formativeDimensionSchema = z.enum([
  "cognitive",
  "affective_social",
  "motor",
]);

export const gradingActivityModalitySchema = z.enum([
  "individual",
  "group",
  "mixed",
]);

export const gradingPeriodStatusSchema = z.enum([
  "draft",
  "open",
  "closed",
]);

export const gradeStatusSchema = z.enum([
  "graded",
  "pending",
  "not_evaluated",
  "excused",
]);

export const gradingWeightsSchema = z
  .object({
    formativeWeight: z.number().min(0).max(1),
    projectWeight: z.number().min(0).max(1),
    examWeight: z.number().min(0).max(1),
    cognitiveWeight: z.number().min(0).max(1),
    affectiveSocialWeight: z.number().min(0).max(1),
    motorWeight: z.number().min(0).max(1),
  })
  .superRefine((values, context) => {
    const finalWeight =
      values.formativeWeight
      + values.projectWeight
      + values.examWeight;

    if (Math.abs(finalWeight - 1) > 0.0001) {
      context.addIssue({
        code: "custom",
        path: ["formativeWeight"],
        message:
          "Formativa, proyecto y examen deben sumar 100%.",
      });
    }

    const formativeWeight =
      values.cognitiveWeight
      + values.affectiveSocialWeight
      + values.motorWeight;

    if (Math.abs(formativeWeight - 1) > 0.0001) {
      context.addIssue({
        code: "custom",
        path: ["cognitiveWeight"],
        message:
          "Las tres dimensiones formativas deben sumar 100%.",
      });
    }
  });

const gradingActivityFields = {
  courseId: courseIdSchema,
  gradingPeriodId: gradingPeriodIdSchema,
  name: requiredGradingText("El nombre", 120),
  activityDate: optionalGradingDate,
  component: gradingComponentSchema,
  dimension: formativeDimensionSchema.nullable(),
  modality: gradingActivityModalitySchema.nullable(),
  instrument: optionalGradingText(120),
  maxScore: z.number().min(1).max(10),
  displayOrder: z.number().int().min(0).max(999),
  notes: optionalGradingText(500),
};

type ActivityRefinementValues = {
  component: z.infer<typeof gradingComponentSchema>;
  dimension: z.infer<typeof formativeDimensionSchema> | null;
  modality:
    | z.infer<typeof gradingActivityModalitySchema>
    | null;
};

function validateActivityComponent(
  values: ActivityRefinementValues,
  context: z.RefinementCtx,
) {
  if (
    values.component === "formative"
    && values.dimension === null
  ) {
    context.addIssue({
      code: "custom",
      path: ["dimension"],
      message:
        "Selecciona la dimensiÃ³n de la actividad formativa.",
    });
  }

  if (
    values.component === "formative"
    && values.modality === null
  ) {
    context.addIssue({
      code: "custom",
      path: ["modality"],
      message:
        "Selecciona la modalidad de la actividad formativa.",
    });
  }

  if (
    values.component !== "formative"
    && values.dimension !== null
  ) {
    context.addIssue({
      code: "custom",
      path: ["dimension"],
      message:
        "Proyecto y examen no utilizan dimensiÃ³n formativa.",
    });
  }
}

export const createGradingActivitySchema = z
  .object(gradingActivityFields)
  .superRefine(validateActivityComponent);

export const updateGradingActivitySchema = z
  .object({
    ...gradingActivityFields,
    id: gradingActivityIdSchema,
    active: z.boolean(),
  })
  .superRefine(validateActivityComponent);

export const gradeEntrySchema = z
  .object({
    studentId: studentIdSchema,
    score: nullableScoreSchema,
    status: gradeStatusSchema,
    observation: optionalGradingText(500),
  })
  .superRefine((values, context) => {
    if (
      values.status === "graded"
      && values.score === null
    ) {
      context.addIssue({
        code: "custom",
        path: ["score"],
        message:
          "Ingresa la calificaciÃ³n del estudiante.",
      });
    }

    if (
      values.status !== "graded"
      && values.score !== null
    ) {
      context.addIssue({
        code: "custom",
        path: ["score"],
        message:
          "Solo una calificaciÃ³n evaluada puede tener nota.",
      });
    }
  });

export const saveGradesSchema = z
  .object({
    courseId: courseIdSchema,
    gradingActivityId: gradingActivityIdSchema,
    entries: z
      .array(gradeEntrySchema)
      .min(1, "La actividad debe incluir estudiantes activos.")
      .max(
        500,
        "Solo se permiten 500 estudiantes por actividad.",
      ),
  })
  .superRefine((values, context) => {
    const studentIds = new Set<string>();

    values.entries.forEach((entry, index) => {
      if (studentIds.has(entry.studentId)) {
        context.addIssue({
          code: "custom",
          path: ["entries", index, "studentId"],
          message:
            "El estudiante estÃ¡ repetido en la actividad.",
        });
      }

      studentIds.add(entry.studentId);
    });
  });

export type GradingWeightsValues =
  z.infer<typeof gradingWeightsSchema>;

export type CreateGradingActivityValues =
  z.infer<typeof createGradingActivitySchema>;

export type UpdateGradingActivityValues =
  z.infer<typeof updateGradingActivitySchema>;

export type GradeEntryValues =
  z.infer<typeof gradeEntrySchema>;

export type SaveGradesValues =
  z.infer<typeof saveGradesSchema>;
