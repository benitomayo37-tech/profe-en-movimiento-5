import type {
  AIFormData,
  AIToolId,
  GeneratedAIContent,
} from "@/features/ai/types/ai";

const DURATION_AWARE_TOOLS =
  new Set<AIToolId>([
    "lesson-plan",
    "checklist",
    "game",
    "assessment",
    "physical-circuit",
  ]);

export interface DurationValidationResult {
  valid: boolean;
  expectedMinutes: number | null;
  plannedMinutes: number | null;
  message: string;
}

export function requiresDurationPlan(
  toolId: AIToolId,
): boolean {
  return DURATION_AWARE_TOOLS.has(
    toolId,
  );
}

function normalizeText(
  value: string,
): string {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();
}

export function extractDurationMinutes(
  duration: string,
): number | null {
  const normalized = duration
    .trim()
    .toLowerCase()
    .replace(",", ".");

  if (!normalized) {
    return null;
  }

  const hoursMatch = normalized.match(
    /(\d+(?:\.\d+)?)\s*(?:h|hora|horas)\b/,
  );

  const minutesMatch =
    normalized.match(
      /(\d+(?:\.\d+)?)\s*(?:min|mins|minuto|minutos)\b/,
    );

  let totalMinutes = 0;
  let foundDuration = false;

  if (hoursMatch) {
    totalMinutes +=
      Number(hoursMatch[1]) * 60;

    foundDuration = true;
  }

  if (minutesMatch) {
    totalMinutes +=
      Number(minutesMatch[1]);

    foundDuration = true;
  }

  if (!foundDuration) {
    const numericDuration =
      Number(normalized);

    if (
      Number.isFinite(
        numericDuration,
      ) &&
      numericDuration > 0
    ) {
      totalMinutes =
        numericDuration;

      foundDuration = true;
    }
  }

  if (
    !foundDuration ||
    !Number.isFinite(totalMinutes) ||
    totalMinutes <= 0
  ) {
    return null;
  }

  return Math.round(totalMinutes);
}

function hasDedicatedEvaluationBlock(
  content: GeneratedAIContent,
): boolean {
  const durationPlan =
    content.durationPlan;

  if (!durationPlan) {
    return false;
  }

  return durationPlan.blocks.some(
    (block) =>
      normalizeText(
        block.label,
      ).includes("evaluacion"),
  );
}

function getEvaluationSectionText(
  content: GeneratedAIContent,
): string {
  const evaluationSections =
    content.sections.filter(
      (section) =>
        normalizeText(
          section.title,
        ).includes("evaluacion"),
    );

  return normalizeText(
    evaluationSections
      .flatMap((section) => [
        section.title,
        ...section.content,
      ])
      .join(" "),
  );
}

function hasTimedEvaluationOverlap(
  content: GeneratedAIContent,
): boolean {
  if (
    !hasDedicatedEvaluationBlock(
      content,
    )
  ) {
    return false;
  }

  const evaluationText =
    getEvaluationSectionText(
      content,
    );

  if (!evaluationText) {
    return false;
  }

  /*
   * Detecta expresiones como:
   * "1 minuto de observación durante el desarrollo"
   * o "dentro del cierre se realizan 2 minutos".
   */
  const timedOverlapPatterns = [
    /\b\d+(?:[.,]\d+)?\s*(?:min|minuto|minutos)\b[^.!?]{0,180}\b(?:durante|dentro\s+de|incluid[oa]\s+en|integrado?\s+en)\s+(?:el\s+)?(?:inicio|desarrollo|cierre)\b/,
    /\b(?:durante|dentro\s+de|incluid[oa]\s+en|integrado?\s+en)\s+(?:el\s+)?(?:inicio|desarrollo|cierre)\b[^.!?]{0,180}\b\d+(?:[.,]\d+)?\s*(?:min|minuto|minutos)\b/,
  ];

  return timedOverlapPatterns.some(
    (pattern) =>
      pattern.test(
        evaluationText,
      ),
  );
}

export function validateGeneratedDuration(
  formData: AIFormData,
  content: GeneratedAIContent,
): DurationValidationResult {
  const expectedMinutes =
    extractDurationMinutes(
      formData.duration,
    );

  const durationIsRequired =
    requiresDurationPlan(
      formData.toolId,
    ) &&
    expectedMinutes !== null;

  if (!durationIsRequired) {
    if (
      content.durationPlan !== null &&
      content.durationPlan !==
        undefined
    ) {
      return {
        valid: false,
        expectedMinutes,
        plannedMinutes:
          content.durationPlan
            .totalMinutes,
        message:
          "Esta herramienta no requiere un plan temporal estructurado.",
      };
    }

    return {
      valid: true,
      expectedMinutes,
      plannedMinutes: null,
      message:
        "No se requiere validación temporal.",
    };
  }

  const durationPlan =
    content.durationPlan;

  if (!durationPlan) {
    return {
      valid: false,
      expectedMinutes,
      plannedMinutes: null,
      message:
        "La respuesta no incluyó el plan temporal requerido.",
    };
  }

  const blocksTotal =
    durationPlan.blocks.reduce(
      (total, block) =>
        total + block.minutes,
      0,
    );

  if (
    durationPlan.requestedMinutes !==
    expectedMinutes
  ) {
    return {
      valid: false,
      expectedMinutes,
      plannedMinutes: blocksTotal,
      message:
        `La duración solicitada es ${expectedMinutes} minutos, ` +
        `pero el plan declaró ${durationPlan.requestedMinutes}.`,
    };
  }

  if (
    durationPlan.totalMinutes !==
    blocksTotal
  ) {
    return {
      valid: false,
      expectedMinutes,
      plannedMinutes: blocksTotal,
      message:
        `El total declarado es ${durationPlan.totalMinutes} minutos, ` +
        `pero los bloques suman ${blocksTotal}.`,
    };
  }

    if (
    blocksTotal !== expectedMinutes
  ) {
    return {
      valid: false,
      expectedMinutes,
      plannedMinutes: blocksTotal,
      message:
        `Los bloques suman ${blocksTotal} minutos ` +
        `y deben sumar exactamente ${expectedMinutes}.`,
    };
  }

  if (
  formData.toolId ===
    "lesson-plan" &&
  hasTimedEvaluationOverlap(
    content,
  )
) {
    return {
      valid: false,
      expectedMinutes,
      plannedMinutes: blocksTotal,
      message:
        "El bloque de evaluación contabiliza minutos dentro del inicio, desarrollo o cierre. Cada minuto debe pertenecer exclusivamente a un solo bloque temporal.",
    };
  }

  return {
    valid: true,
    expectedMinutes,
    plannedMinutes: blocksTotal,
    message:
      "La distribución temporal es correcta y no presenta solapamientos.",
  };
}