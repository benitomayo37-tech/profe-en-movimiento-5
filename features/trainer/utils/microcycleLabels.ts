import type {
  TrainingDay,
  TrainingFocus,
  TrainingIntensity,
} from "@/features/trainer/types/trainer";

export const DAY_LABELS: Record<TrainingDay, string> = {
  monday: "Lunes",
  tuesday: "Martes",
  wednesday: "Miércoles",
  thursday: "Jueves",
  friday: "Viernes",
  saturday: "Sábado",
  sunday: "Domingo",
};

export const FOCUS_LABELS: Record<TrainingFocus, string> = {
  technical: "Técnico",
  tactical: "Táctico",
  physical: "Físico",
  coordination: "Coordinativo",
  recovery: "Recuperación",
  combined: "Combinado",
};

export const INTENSITY_LABELS: Record<TrainingIntensity, string> = {
  low: "Baja",
  moderate: "Moderada",
  "high-controlled": "Alta controlada",
};
