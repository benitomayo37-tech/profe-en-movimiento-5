import type {
  TrainingFocus,
  TrainingIntensity,
} from "@/features/trainer/types/trainer";

export const MESOCYCLE_FOCUS_LABELS: Record<TrainingFocus, string> = {
  technical: "Técnico",
  tactical: "Táctico",
  physical: "Físico",
  coordination: "Coordinativo",
  recovery: "Recuperación",
  combined: "Combinado",
};

export const MESOCYCLE_INTENSITY_LABELS: Record<TrainingIntensity, string> = {
  low: "Baja",
  moderate: "Moderada",
  "high-controlled": "Alta controlada",
};
