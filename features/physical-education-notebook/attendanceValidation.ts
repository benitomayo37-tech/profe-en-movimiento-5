import { z } from "zod";

import {
  courseIdSchema,
  studentIdSchema,
} from "./validation";

const optionalAttendanceText = (maximum: number) =>
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
        `Debe contener como máximo ${maximum} caracteres.`,
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

export const attendanceStatusSchema = z.enum([
  "present",
  "absent",
  "late",
  "excused",
]);

export const attendanceDateSchema = z
  .string()
  .refine(
    isValidDate,
    "La fecha de asistencia no es válida.",
  )
  .refine(
    (value) =>
      value >= "2000-01-01"
      && value <= "2100-12-31",
    "La fecha debe estar entre 2000 y 2100.",
  );

export const attendanceEntrySchema = z.object({
  studentId: studentIdSchema,
  status: attendanceStatusSchema,
  observation: optionalAttendanceText(500),
});

export const saveAttendanceSchema = z
  .object({
    courseId: courseIdSchema,
    attendanceDate: attendanceDateSchema,
    classNote: optionalAttendanceText(500),
    entries: z
      .array(attendanceEntrySchema)
      .min(
        1,
        "El curso debe tener estudiantes activos.",
      )
      .max(
        500,
        "Solo se permiten 500 estudiantes por asistencia.",
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
            "El estudiante está repetido en la asistencia.",
        });
      }

      studentIds.add(entry.studentId);
    });
  });

export type AttendanceStatusValue =
  z.infer<typeof attendanceStatusSchema>;

export type AttendanceEntryValues =
  z.infer<typeof attendanceEntrySchema>;

export type SaveAttendanceValues =
  z.infer<typeof saveAttendanceSchema>;
export const attendanceReportSchema = z
  .object({
    courseId: courseIdSchema,
    startDate: attendanceDateSchema,
    endDate: attendanceDateSchema,
  })
  .superRefine((values, context) => {
    if (values.startDate > values.endDate) {
      context.addIssue({
        code: "custom",
        path: ["endDate"],
        message:
          "La fecha final debe ser igual o posterior a la inicial.",
      });

      return;
    }

    const start = new Date(
      `${values.startDate}T00:00:00Z`,
    );

    const end = new Date(
      `${values.endDate}T00:00:00Z`,
    );

    const days =
      Math.floor(
        (end.getTime() - start.getTime())
          / 86_400_000,
      ) + 1;

    if (days > 120) {
      context.addIssue({
        code: "custom",
        path: ["endDate"],
        message:
          "El período no puede superar 120 días.",
      });
    }
  });

export type AttendanceReportValues =
  z.infer<typeof attendanceReportSchema>;
