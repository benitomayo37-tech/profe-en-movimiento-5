export type DUAPrinciple =
  | "representation"
  | "action-expression"
  | "engagement";

export interface DUAVisual {
  principle: DUAPrinciple;
  label: string;
  emoji: string;
  textClassName: string;
  backgroundClassName: string;
  borderClassName: string;
  wordColor: string;
}

export const DUA_VISUALS: Record<
  DUAPrinciple,
  DUAVisual
> = {
  representation: {
    principle: "representation",
    label: "Representación",
    emoji: "🟣",
    textClassName: "text-violet-700",
    backgroundClassName: "bg-violet-50",
    borderClassName: "border-violet-200",
    wordColor: "7C3AED",
  },

  "action-expression": {
    principle: "action-expression",
    label: "Acción y Expresión",
    emoji: "🔵",
    textClassName: "text-blue-700",
    backgroundClassName: "bg-blue-50",
    borderClassName: "border-blue-200",
    wordColor: "2563EB",
  },

  engagement: {
    principle: "engagement",
    label: "Compromiso / Motivación",
    emoji: "🟢",
    textClassName: "text-emerald-700",
    backgroundClassName: "bg-emerald-50",
    borderClassName: "border-emerald-200",
    wordColor: "059669",
  },
};

function normalizeText(
  value: string,
): string {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();
}

export function detectDUAPrinciple(
  value: string,
): DUAPrinciple | null {
  const normalized =
    normalizeText(value);

  if (
    normalized.includes(
      "representacion",
    )
  ) {
    return "representation";
  }

  if (
    normalized.includes(
      "accion y expresion",
    ) ||
    normalized.includes(
      "accion/expresion",
    )
  ) {
    return "action-expression";
  }

  if (
    normalized.includes(
      "compromiso",
    ) ||
    normalized.includes(
      "motivacion",
    ) ||
    normalized.includes(
      "implicacion",
    )
  ) {
    return "engagement";
  }

  return null;
}

export function getDUAVisual(
  value: string,
): DUAVisual | null {
  const principle =
    detectDUAPrinciple(value);

  if (!principle) {
    return null;
  }

  return DUA_VISUALS[principle];
}