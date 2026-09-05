import type {
  GeneratedPhysicalPlan,
  PhysicalPlannerFormData,
} from "@/features/physical-planner/types/physicalPlanner";

export interface PhysicalPlanValidationResult {
  valid: boolean;
  message?: string;
}

const validContexts = new Set([
  "physical_education",
  "sport",
]);

const validCapacities = new Set([
  "strength",
  "endurance",
  "speed",
  "mobility",
  "coordination",
  "agility",
  "balance",
  "combined",
]);

const validLevels = new Set([
  "initiation",
  "intermediate",
  "advanced",
]);

const validIntensities = new Set([
  "low",
  "moderate",
  "high-controlled",
]);

function isSafeString(
  value: unknown,
  maximum: number,
  allowEmpty = false,
): value is string {
  return (
    typeof value === "string" &&
    value.length <= maximum &&
    (allowEmpty || value.trim().length > 0)
  );
}

function isStringArray(
  value: unknown,
  minimum: number,
  maximum: number,
): value is string[] {
  return (
    Array.isArray(value) &&
    value.length >= minimum &&
    value.length <= maximum &&
    value.every((item) => isSafeString(item, 700))
  );
}

export function isValidPhysicalPlannerFormData(
  value: unknown,
): value is PhysicalPlannerFormData {
  if (typeof value !== "object" || value === null) {
    return false;
  }

  const data = value as Record<string, unknown>;

  return (
    typeof data.context === "string" &&
    validContexts.has(data.context) &&
    isSafeString(data.activityOrSport, 120) &&
    isSafeString(data.group, 120) &&
    typeof data.level === "string" &&
    validLevels.has(data.level) &&
    typeof data.capacity === "string" &&
    validCapacities.has(data.capacity) &&
    isSafeString(data.objective, 800) &&
    Number.isInteger(data.durationMinutes) &&
    Number(data.durationMinutes) >= 15 &&
    Number(data.durationMinutes) <= 180 &&
    Number.isInteger(data.participantCount) &&
    Number(data.participantCount) >= 1 &&
    Number(data.participantCount) <= 200 &&
    typeof data.intensity === "string" &&
    validIntensities.has(data.intensity) &&
    isSafeString(data.experience, 500) &&
    isSafeString(data.materials, 500) &&
    isSafeString(data.space, 400) &&
    isSafeString(data.inclusionNeeds, 800, true) &&
    isSafeString(data.safetyNotes, 800, true) &&
    isSafeString(data.additionalInstructions, 1200, true)
  );
}

export function isGeneratedPhysicalPlan(
  value: unknown,
): value is GeneratedPhysicalPlan {
  if (typeof value !== "object" || value === null) {
    return false;
  }

  const plan = value as Record<string, unknown>;
  const dua =
    typeof plan.dua === "object" && plan.dua !== null
      ? (plan.dua as Record<string, unknown>)
      : null;

  if (
    !isSafeString(plan.title, 180) ||
    !isSafeString(plan.summary, 1000) ||
    !isSafeString(plan.objective, 800) ||
    !Number.isInteger(plan.totalMinutes) ||
    !Number.isInteger(plan.sessionRpe) ||
    Number(plan.sessionRpe) < 1 ||
    Number(plan.sessionRpe) > 10 ||
    !Number.isInteger(plan.estimatedLoad) ||
    !isSafeString(plan.loadGuidance, 1200) ||
    !isSafeString(plan.organizationSummary, 1200) ||
    !Array.isArray(plan.blocks) ||
    plan.blocks.length < 3 ||
    plan.blocks.length > 5 ||
    !isSafeString(plan.hydrationGuidance, 700) ||
    !isStringArray(plan.safetyMeasures, 3, 8) ||
    !isStringArray(plan.observableIndicators, 2, 6) ||
    !dua ||
    !isStringArray(dua.commitment, 0, 5) ||
    !isStringArray(dua.representation, 0, 5) ||
    !isStringArray(dua.actionExpression, 0, 5) ||
    !isStringArray(plan.adaptationNotes, 2, 6) ||
    !isStringArray(plan.teacherReview, 2, 6)
  ) {
    return false;
  }

  return plan.blocks.every((block) => {
    if (typeof block !== "object" || block === null) {
      return false;
    }

    const typedBlock = block as Record<string, unknown>;

    return (
      isSafeString(typedBlock.name, 160) &&
      isSafeString(typedBlock.objective, 600) &&
      Number.isInteger(typedBlock.minutes) &&
      Number(typedBlock.minutes) > 0 &&
      Array.isArray(typedBlock.activities) &&
      typedBlock.activities.length >= 1 &&
      typedBlock.activities.length <= 8 &&
      typedBlock.activities.every((activity) => {
        if (
          typeof activity !== "object" ||
          activity === null
        ) {
          return false;
        }

        const item = activity as Record<string, unknown>;

        return (
          isSafeString(item.name, 180) &&
          isSafeString(item.description, 1200) &&
          Number.isInteger(item.series) &&
          Number(item.series) >= 1 &&
          Number.isInteger(item.rounds) &&
          Number(item.rounds) >= 1 &&
          Number.isInteger(item.workSeconds) &&
          Number(item.workSeconds) >= 1 &&
          Number.isInteger(item.recoverySeconds) &&
          Number(item.recoverySeconds) >= 0 &&
          Number.isInteger(item.transitionSeconds) &&
          Number(item.transitionSeconds) >= 0 &&
          Number.isInteger(item.totalSeconds) &&
          Number(item.totalSeconds) >= 1 &&
          isSafeString(item.repetitions, 200) &&
          isSafeString(item.organization, 1200) &&
          isSafeString(item.intensity, 400) &&
          isStringArray(item.coachingPoints, 1, 5) &&
          isSafeString(item.safety, 700)
        );
      })
    );
  });
}

export function sanitizePhysicalPlanTerminology<T>(
  value: T,
): T {
  if (typeof value === "string") {
    return value
      .replace(
        /\bworkseconds\b/gi,
        "tiempo de trabajo",
      )
      .replace(
        /\btrabajoseconds\b/gi,
        "tiempo de trabajo",
      )
      .replace(
        /\brecoveryseconds\b/gi,
        "tiempo de recuperación",
      )
      .replace(
        /\brecuperaci[oó]nseconds\b/gi,
        "tiempo de recuperación",
      )
      .replace(
        /\btransitionseconds\b/gi,
        "tiempo de transición",
      )
      .replace(
        /\btransici[oó]nseconds\b/gi,
        "tiempo de transición",
      )
      .replace(
        /\btotalseconds\b/gi,
        "tiempo total",
      )
      .replace(
        /\bsessionrpe\b/gi,
        "RPE de la sesión",
      )
      .replace(
        /\bestimatedload\b/gi,
        "carga estimada",
      )
      .replace(
        /\bfeedback\b/gi,
        "retroalimentación",
      )
      .replace(
        /\ball[- ]out\b/gi,
        "a máxima intensidad",
      ) as T;
  }

  if (Array.isArray(value)) {
    return value.map(
      (item) =>
        sanitizePhysicalPlanTerminology(item),
    ) as T;
  }

  if (
    typeof value === "object" &&
    value !== null
  ) {
    return Object.fromEntries(
      Object.entries(
        value as Record<string, unknown>,
      ).map(([key, item]) => [
        key,
        sanitizePhysicalPlanTerminology(item),
      ]),
    ) as T;
  }

  return value;
}
export function validatePhysicalPlan(
  formData: PhysicalPlannerFormData,
  plan: GeneratedPhysicalPlan,
): PhysicalPlanValidationResult {
  if (plan.totalMinutes !== formData.durationMinutes) {
    return {
      valid: false,
      message:
        `La duraciÃ³n debe ser exactamente ${formData.durationMinutes} minutos.`,
    };
  }

  const blockMinutes = plan.blocks.reduce(
    (total, block) => total + block.minutes,
    0,
  );

  if (blockMinutes !== formData.durationMinutes) {
    return {
      valid: false,
      message:
        `Los bloques suman ${blockMinutes} minutos y deben sumar ${formData.durationMinutes}.`,
    };
  }

  for (const block of plan.blocks) {
    let blockSeconds = 0;

    for (const activity of block.activities) {
      const calculatedSeconds =
        activity.rounds *
          (activity.workSeconds + activity.recoverySeconds) +
        activity.transitionSeconds;

      if (activity.totalSeconds !== calculatedSeconds) {
        return {
          valid: false,
          message:
            `La actividad "${activity.name}" declara ${activity.totalSeconds} segundos, pero su fÃ³rmula suma ${calculatedSeconds}.`,
        };
      }

      blockSeconds += activity.totalSeconds;
    }

    const expectedBlockSeconds = block.minutes * 60;

    if (blockSeconds !== expectedBlockSeconds) {
      return {
        valid: false,
        message:
          `Las actividades del bloque "${block.name}" suman ${blockSeconds} segundos y deben sumar ${expectedBlockSeconds}.`,
      };
    }
  }

  const expectedLoad =
    formData.durationMinutes * plan.sessionRpe;

  if (plan.estimatedLoad !== expectedLoad) {
    return {
      valid: false,
      message:
        `La carga estimada debe ser ${formData.durationMinutes} Ã— ${plan.sessionRpe} = ${expectedLoad}.`,
    };
  }

  if (
    formData.context === "physical_education" &&
    (
      plan.dua.commitment.length < 1 ||
      plan.dua.representation.length < 1 ||
      plan.dua.actionExpression.length < 1
    )
  ) {
    return {
      valid: false,
      message:
        "EducaciÃ³n FÃ­sica requiere acciones concretas en los tres principios DUA.",
    };
  }

  const explicitDuaRequest =
    /\bdua\b|diseño universal/i.test(
      `${formData.inclusionNeeds} ${formData.additionalInstructions}`,
    );

  if (
    formData.context === "sport" &&
    !explicitDuaRequest &&
    (
      plan.dua.commitment.length > 0 ||
      plan.dua.representation.length > 0 ||
      plan.dua.actionExpression.length > 0
    )
  ) {
    return {
      valid: false,
      message:
        "La preparaciÃ³n deportiva no debe aÃ±adir DUA salvo solicitud expresa.",
    };
  }

  const normalizeText = (text: string) =>
    text
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .toLowerCase();

  function collectVisibleStrings(
    value: unknown,
  ): string[] {
    if (typeof value === "string") {
      return [value];
    }

    if (Array.isArray(value)) {
      return value.flatMap(
        collectVisibleStrings,
      );
    }

    if (
      typeof value === "object" &&
      value !== null
    ) {
      return Object.values(
        value as Record<string, unknown>,
      ).flatMap(collectVisibleStrings);
    }

    return [];
  }

  const visibleContent = normalizeText(
    collectVisibleStrings(plan).join(" "),
  );

  const normalizedMaterials = normalizeText(
    formData.materials,
  );

  const forbiddenInternalProperties = [
    "workseconds",
    "recoveryseconds",
    "transitionseconds",
    "totalseconds",
    "sessionrpe",
    "estimatedload",
  ];

  for (const property of forbiddenInternalProperties) {
    if (visibleContent.includes(property)) {
      return {
        valid: false,
        message:
          `El contenido visible incluye la propiedad interna "${property}". Debe utilizar terminología profesional en español.`,
      };
    }
  }

  const controlledMaterials = [
    { token: "cono", label: "conos" },
    { token: "colchoneta", label: "colchonetas" },
    { token: "banda", label: "bandas" },
    { token: "pesa", label: "pesas" },
    { token: "mancuerna", label: "mancuernas" },
    { token: "aro", label: "aros" },
    { token: "cuerda", label: "cuerdas" },
    { token: "escalera", label: "escaleras" },
    { token: "cajon", label: "cajones" },
    { token: "valla", label: "vallas" },
    { token: "silbato", label: "silbato" },
    { token: "cronometro", label: "cronómetro" },
    { token: "poster", label: "póster" },
    { token: "cartel", label: "cartel" },
    { token: "cartulina", label: "cartulina" },
    { token: "banco", label: "banco" },
    { token: "ficha", label: "fichas" },
    { token: "pictograma", label: "pictogramas" },
    { token: "pantalla", label: "pantalla" },
    { token: "video", label: "video" },
  ];

  for (const material of controlledMaterials) {
    const materialPattern = new RegExp(
      `\\b${material.token}\\w*\\b`,
    );

    if (
      materialPattern.test(visibleContent) &&
      !materialPattern.test(normalizedMaterials)
    ) {
      return {
        valid: false,
        message:
          `La propuesta menciona ${material.label}, pero ese material no fue declarado por el usuario.`,
      };
    }
  }
  return { valid: true };
}