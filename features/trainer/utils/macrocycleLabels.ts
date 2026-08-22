import type {
  MacrocyclePeriodType,
  TrainingFocus,
  TrainingIntensity,
} from "@/features/trainer/types/trainer";

export const MACROCYCLE_PERIOD_LABELS: Record<MacrocyclePeriodType, string> = {
  preparatory: "Preparatorio",
  competitive: "Competitivo",
  transition: "Transición",
};

export const MACROCYCLE_FOCUS_LABELS: Record<TrainingFocus, string> = {
  technical: "Técnico",
  tactical: "Táctico",
  physical: "Físico",
  coordination: "Coordinativo",
  recovery: "Recuperación",
  combined: "Combinado",
};

export const MACROCYCLE_INTENSITY_LABELS: Record<TrainingIntensity, string> = {
  low: "Baja",
  moderate: "Moderada",
  "high-controlled": "Alta controlada",
};

export function formatMacrocycleWeekRange(
  weekStart: number,
  weekEnd: number,
): string {
  return weekStart === weekEnd
    ? `${weekStart}`
    : `${weekStart}-${weekEnd}`;
}

export function formatMacrocycleWeekLabel(
  weekStart: number,
  weekEnd: number,
): string {
  const label = weekStart === weekEnd ? "Semana" : "Semanas";
  return `${label} ${formatMacrocycleWeekRange(weekStart, weekEnd)}`;
}
