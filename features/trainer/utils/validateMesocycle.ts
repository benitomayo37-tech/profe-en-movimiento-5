import type {
  GeneratedMesocycle,
  MesocycleFormData,
} from "@/features/trainer/types/trainer";

export interface MesocycleValidationResult {
  valid: boolean;
  message?: string;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function isNonEmptyString(value: unknown): value is string {
  return typeof value === "string" && value.trim().length > 0;
}

function isStringArray(value: unknown): value is string[] {
  return Array.isArray(value) && value.every(isNonEmptyString);
}

function normalize(value: string): string {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();
}

function countWords(value: string): number {
  return value.trim().split(/\s+/).filter(Boolean).length;
}

function extractAvailableBalls(materials: string): number | null {
  const match = normalize(materials).match(
    /\b(\d{1,3})\s+(?:balon|balones|pelota|pelotas)\b/,
  );

  return match ? Number(match[1]) : null;
}

function validateLength(
  label: string,
  value: string,
  maximum: number,
): MesocycleValidationResult {
  const words = countWords(value);

  return words <= maximum
    ? { valid: true }
    : {
        valid: false,
        message: `${label} contiene ${words} palabras y debe resumirse a un máximo de ${maximum}.`,
      };
}

export function isValidMesocycleFormData(
  value: unknown,
): value is MesocycleFormData {
  if (!isRecord(value)) return false;

  return (
    isNonEmptyString(value.sport) &&
    isNonEmptyString(value.category) &&
    ["initiation", "intermediate", "advanced"].includes(String(value.level)) &&
    [
      "general-preparation",
      "specific-preparation",
      "pre-competition",
      "competition",
      "recovery",
    ].includes(String(value.phase)) &&
    isNonEmptyString(value.mainObjective) &&
    typeof value.weekCount === "number" &&
    Number.isInteger(value.weekCount) &&
    value.weekCount >= 3 &&
    value.weekCount <= 8 &&
    typeof value.sessionsPerWeek === "number" &&
    Number.isInteger(value.sessionsPerWeek) &&
    value.sessionsPerWeek >= 2 &&
    value.sessionsPerWeek <= 7 &&
    typeof value.sessionDurationMinutes === "number" &&
    Number.isInteger(value.sessionDurationMinutes) &&
    value.sessionDurationMinutes >= 30 &&
    value.sessionDurationMinutes <= 180 &&
    typeof value.athleteCount === "number" &&
    Number.isInteger(value.athleteCount) &&
    value.athleteCount >= 1 &&
    value.athleteCount <= 100 &&
    (value.competitionWeek === null ||
      (typeof value.competitionWeek === "number" &&
        Number.isInteger(value.competitionWeek) &&
        value.competitionWeek >= 1 &&
        value.competitionWeek <= value.weekCount)) &&
    isNonEmptyString(value.materials) &&
    isNonEmptyString(value.space) &&
    typeof value.additionalInstructions === "string"
  );
}

export function isGeneratedMesocycle(
  value: unknown,
): value is GeneratedMesocycle {
  if (!isRecord(value) || !Array.isArray(value.weeks)) return false;

  const weeksAreValid = value.weeks.every((week) =>
    isRecord(week) &&
    typeof week.weekNumber === "number" &&
    Number.isInteger(week.weekNumber) &&
    isNonEmptyString(week.title) &&
    isNonEmptyString(week.objective) &&
    [
      "technical",
      "tactical",
      "physical",
      "coordination",
      "recovery",
      "combined",
    ].includes(String(week.focus)) &&
    ["low", "moderate", "high-controlled"].includes(String(week.intensity)) &&
    typeof week.loadLevel === "number" &&
    Number.isInteger(week.loadLevel) &&
    week.loadLevel >= 1 &&
    week.loadLevel <= 5 &&
    typeof week.sessionCount === "number" &&
    Number.isInteger(week.sessionCount) &&
    typeof week.sessionDurationMinutes === "number" &&
    Number.isInteger(week.sessionDurationMinutes) &&
    typeof week.totalMinutes === "number" &&
    Number.isInteger(week.totalMinutes) &&
    isNonEmptyString(week.organization) &&
    isStringArray(week.keyContents) &&
    week.keyContents.length >= 3 &&
    week.keyContents.length <= 5 &&
    isNonEmptyString(week.loadGuidance) &&
    isNonEmptyString(week.recovery) &&
    isNonEmptyString(week.monitoring) &&
    isNonEmptyString(week.safety)
  );

  return (
    isNonEmptyString(value.title) &&
    isNonEmptyString(value.summary) &&
    isNonEmptyString(value.mainObjective) &&
    isNonEmptyString(value.phaseGuidance) &&
    typeof value.totalWeeks === "number" &&
    Number.isInteger(value.totalWeeks) &&
    typeof value.totalSessions === "number" &&
    Number.isInteger(value.totalSessions) &&
    typeof value.totalMinutes === "number" &&
    Number.isInteger(value.totalMinutes) &&
    value.weeks.length >= 3 &&
    value.weeks.length <= 8 &&
    weeksAreValid &&
    isNonEmptyString(value.overallLoadSummary) &&
    isStringArray(value.evaluationCriteria) &&
    isStringArray(value.safetyMeasures) &&
    isStringArray(value.adaptationNotes)
  );
}

function getVisibleText(mesocycle: GeneratedMesocycle): string {
  return normalize(
    [
      mesocycle.title,
      mesocycle.summary,
      mesocycle.mainObjective,
      mesocycle.phaseGuidance,
      mesocycle.overallLoadSummary,
      ...mesocycle.evaluationCriteria,
      ...mesocycle.safetyMeasures,
      ...mesocycle.adaptationNotes,
      ...mesocycle.weeks.flatMap((week) => [
        week.title,
        week.objective,
        week.organization,
        week.loadGuidance,
        week.recovery,
        week.monitoring,
        week.safety,
        ...week.keyContents,
      ]),
    ].join(" "),
  );
}

export function validateMesocycle(
  formData: MesocycleFormData,
  mesocycle: GeneratedMesocycle,
): MesocycleValidationResult {
  const expectedWeeks = formData.weekCount;
  const expectedWeeklyMinutes =
    formData.sessionsPerWeek * formData.sessionDurationMinutes;
  const expectedSessions = expectedWeeks * formData.sessionsPerWeek;
  const expectedTotalMinutes =
    expectedSessions * formData.sessionDurationMinutes;

  if (
    mesocycle.totalWeeks !== expectedWeeks ||
    mesocycle.weeks.length !== expectedWeeks
  ) {
    return {
      valid: false,
      message: `El mesociclo debe incluir exactamente ${expectedWeeks} semanas.`,
    };
  }

  if (
    mesocycle.totalSessions !== expectedSessions ||
    mesocycle.totalMinutes !== expectedTotalMinutes
  ) {
    return {
      valid: false,
      message: `El mesociclo debe contabilizar ${expectedSessions} sesiones y ${expectedTotalMinutes} minutos.`,
    };
  }

  const globalLengths = [
    validateLength("El título", mesocycle.title, 12),
    validateLength("El resumen", mesocycle.summary, 75),
  ];
  const failedGlobalLength = globalLengths.find((result) => !result.valid);
  if (failedGlobalLength) return failedGlobalLength;

  const availableBalls = extractAvailableBalls(formData.materials);

  for (let index = 0; index < mesocycle.weeks.length; index += 1) {
    const week = mesocycle.weeks[index];
    const expectedWeekNumber = index + 1;

    if (week.weekNumber !== expectedWeekNumber) {
      return {
        valid: false,
        message: `La semana ${expectedWeekNumber} debe conservar su numeración consecutiva.`,
      };
    }

    if (
      week.sessionCount !== formData.sessionsPerWeek ||
      week.sessionDurationMinutes !== formData.sessionDurationMinutes ||
      week.totalMinutes !== expectedWeeklyMinutes
    ) {
      return {
        valid: false,
        message: `La semana ${expectedWeekNumber} debe incluir ${formData.sessionsPerWeek} sesiones de ${formData.sessionDurationMinutes} minutos y sumar ${expectedWeeklyMinutes} minutos.`,
      };
    }

    const expectedLoad =
      week.intensity === "low"
        ? [1, 2]
        : week.intensity === "moderate"
          ? [2, 3, 4]
          : [4, 5];

    if (!expectedLoad.includes(week.loadLevel)) {
      return {
        valid: false,
        message: `La carga de la semana ${expectedWeekNumber} no coincide con su intensidad.`,
      };
    }

    const lengths = [
      validateLength(`El título de la semana ${expectedWeekNumber}`, week.title, 12),
      validateLength(`La organización de la semana ${expectedWeekNumber}`, week.organization, 75),
      validateLength(`La orientación de carga de la semana ${expectedWeekNumber}`, week.loadGuidance, 45),
      validateLength(`La recuperación de la semana ${expectedWeekNumber}`, week.recovery, 45),
      validateLength(`El control de la semana ${expectedWeekNumber}`, week.monitoring, 45),
      validateLength(`La seguridad de la semana ${expectedWeekNumber}`, week.safety, 45),
      ...week.keyContents.map((content) =>
        validateLength(
          `Un contenido de la semana ${expectedWeekNumber}`,
          content,
          30,
        ),
      ),
    ];
    const failedLength = lengths.find((result) => !result.valid);
    if (failedLength) return failedLength;

    const organization = normalize(week.organization);
    const requiredOrganizationStart = new RegExp(
      `^los\\s+${formData.athleteCount}\\s+deportistas\\s+participan\\s+simultaneamente\\s+distribuidos\\s+en\\b`,
    );
    const hasRequiredOrganizationStart =
      requiredOrganizationStart.test(organization);

    if (!hasRequiredOrganizationStart) {
      return {
        valid: false,
        message: `La organización de la semana ${expectedWeekNumber} debe comenzar exactamente con: "Los ${formData.athleteCount} deportistas participan simultáneamente distribuidos en". Después debe completar una distribución pedagógica viable.`,
      };
    }

    const hasGroupDistribution =
      formData.athleteCount === 1
        ? /\b(?:trabajo individual|1 grupo de 1|una zona individual)\b/.test(
            organization,
          )
        : /\b\d{1,3}\s+(?:grupos?|equipos?|parejas?|trios?)\b/.test(
            organization,
          );
    const organizationWordCount = countWords(week.organization);

    if (
      !hasGroupDistribution ||
      organizationWordCount < 15
    ) {
      return {
        valid: false,
        message: `La organización de la semana ${expectedWeekNumber} debe indicar una distribución concreta en grupos o parejas y desarrollarse en una oración pedagógica completa de al menos 15 palabras.`,
      };
    }

    const uniformGroups = organization.match(
      /\b(\d{1,3})\s+(?:grupos?|equipos?)\s+de\s+(\d{1,3})(?:\s+deportistas?)?\b/,
    );

    if (
      uniformGroups &&
      Number(uniformGroups[1]) * Number(uniformGroups[2]) !==
        formData.athleteCount
    ) {
      return {
        valid: false,
        message: `La distribución de la semana ${expectedWeekNumber} no contabiliza exactamente a los ${formData.athleteCount} deportistas. Corrige la cantidad o el tamaño de los grupos.`,
      };
    }

    if (availableBalls !== null) {
      const groupMatch = organization.match(
        /\b(\d{1,3})\s+(?:grupos?|equipos?|parejas?|trios?)\b/,
      );
      const ballMentions = Array.from(
        organization.matchAll(/\b(\d{1,3})\s+balon(?:es)?\b/g),
        (match) => Number(match[1]),
      );
      const ballsPerGroupMatch = organization.match(
        /\bcada\s+(?:grupo|equipo|pareja|trio)\b[^.!?;]{0,100}\b(?:utiliza|usa|recibe|dispone de|trabaja con)\s+(\d{1,3})\s+balon(?:es)?\b/,
      );

      if (ballMentions.length === 0) {
        return {
          valid: false,
          message: `La organización de la semana ${expectedWeekNumber} debe indicar cómo distribuye los ${availableBalls} balones disponibles.`,
        };
      }

      const groupCount = groupMatch ? Number(groupMatch[1]) : null;
      const ballsPerGroup = ballsPerGroupMatch
        ? Number(ballsPerGroupMatch[1])
        : null;
      const allocatedBalls =
        groupCount !== null && ballsPerGroup !== null
          ? groupCount * ballsPerGroup
          : null;
      const declaredTotal = ballMentions.includes(availableBalls)
        ? availableBalls
        : Math.max(...ballMentions);
      const effectiveRequiredBalls = allocatedBalls ?? declaredTotal;

      if (effectiveRequiredBalls > availableBalls) {
        return {
          valid: false,
          message: `La semana ${expectedWeekNumber} distribuye ${effectiveRequiredBalls} balones, pero solo existen ${availableBalls}.`,
        };
      }

      if (
        groupCount !== null &&
        groupCount > availableBalls &&
        !/\b(?:comparten|alternancia activa|distribucion rotativa)\b/.test(organization)
      ) {
        return {
          valid: false,
          message: `La semana ${expectedWeekNumber} tiene más grupos que balones. Debe explicar la alternancia activa y las funciones motrices de quienes comparten material.`,
        };
      }
    }
  }

  for (let index = 1; index < mesocycle.weeks.length; index += 1) {
    const previous = mesocycle.weeks[index - 1];
    const current = mesocycle.weeks[index];

    if (
      (previous.loadLevel === 5 && current.loadLevel === 5) ||
      (previous.intensity === "high-controlled" &&
        current.intensity === "high-controlled")
    ) {
      return {
        valid: false,
        message: `Las semanas ${previous.weekNumber} y ${current.weekNumber} no pueden tener ambas la mayor carga o intensidad alta controlada.`,
      };
    }
  }

  if (formData.competitionWeek !== null) {
    const competition = mesocycle.weeks[formData.competitionWeek - 1];
    const previous = mesocycle.weeks[formData.competitionWeek - 2];

    if (
      competition.loadLevel > 3 ||
      competition.intensity === "high-controlled"
    ) {
      return {
        valid: false,
        message: `La semana ${formData.competitionWeek} es competitiva y debe tener carga máxima 3 e intensidad baja o moderada.`,
      };
    }

    if (previous && previous.loadLevel > 3) {
      return {
        valid: false,
        message: `La semana previa a la competencia debe reducir la carga a un máximo de 3.`,
      };
    }
  }

  const visibleText = getVisibleText(mesocycle);
  const forbiddenTerms: Array<{ pattern: RegExp; term: string }> = [
    { pattern: /\bfeedback\b/, term: "feedback" },
    { pattern: /\bsprints?\b/, term: "sprint" },
    { pattern: /\bdrills?\b/, term: "drill" },
    { pattern: /\btiming\b/, term: "timing" },
    { pattern: /\bcoach\b/, term: "coach" },
    { pattern: /\bcircuits?\b/, term: "circuit" },
    { pattern: /\bintermediate\b/, term: "intermediate" },
    { pattern: /\binitiation\b/, term: "initiation" },
    { pattern: /\badvanced\b/, term: "advanced" },
    { pattern: /\b(?:intensidad maxima|carga maxima|maxima exigencia)\b/, term: "intensidad máxima" },
    { pattern: /\b(?:fila|filas|espera|turno|turnos|uno por uno)\b/, term: "expresión de inactividad" },
    { pattern: /\b(?:weeks|weeknumber|loadlevel|sessioncount|totalminutes)\b/, term: "propiedad técnica interna" },
    { pattern: /\bhigiene de saltos\b/, term: "higiene de saltos" },
  ];
  const forbidden = forbiddenTerms.find(({ pattern }) => pattern.test(visibleText));

  if (forbidden) {
    return {
      valid: false,
      message: `El contenido visible incluye "${forbidden.term}". Utiliza únicamente español deportivo natural.`,
    };
  }

  if (
    !/\b(?:progresion|progresiva|ascendente)\b/.test(visibleText) ||
    !/\b(?:descarga|recuperacion|reduccion de carga|consolidacion)\b/.test(
      normalize(mesocycle.overallLoadSummary),
    )
  ) {
    return {
      valid: false,
      message:
        "La distribución general debe explicar progresión y una fase de descarga, recuperación o consolidación.",
    };
  }

  const movementIsEssential = /\b(?:movimiento|desplazamiento|carrera)\b/.test(
    normalize([formData.mainObjective, mesocycle.mainObjective].join(" ")),
  );
  const removesMovement = mesocycle.adaptationNotes.some((note) =>
    /\b(?:posicion estatica|ejecucion estatica|sin desplazamiento|sin movimiento)\b/.test(
      normalize(note),
    ),
  );

  if (movementIsEssential && removesMovement) {
    return {
      valid: false,
      message:
        "El movimiento pertenece al objetivo esencial. Las adaptaciones deben conservar algún desplazamiento y reducir recorrido, ritmo u oposición.",
    };
  }

  const observableActionPattern =
    /\b(?:realiza|ejecuta|aplica|mantiene|coordina|identifica|demuestra|controla|completa|alcanza|registra|respeta|resuelve|selecciona|recibe|pasa|lanza|se desplaza|logra|conserva|muestra|adopta|decide|utiliza)\b/;
  const observableIndicatorPattern =
    /\b(?:acierto|aciertos|porcentaje|frecuencia|tiempo|precision|calidad tecnica|ejecucion correcta|cantidad|numero|conteo|cumplimiento|resultado|intentos|repeticiones|decisiones correctas|observacion|correctamente|adecuada|adecuado|segura|seguro|controlada|controlado|estabilidad|continuidad)\b/;

  const observableCriteria = mesocycle.evaluationCriteria.every(
    (criterion) => {
      const normalizedCriterion = normalize(criterion);
      const hasAction = observableActionPattern.test(normalizedCriterion);
      const hasIndicator = observableIndicatorPattern.test(normalizedCriterion);
      const hasNumericEvidence =
        /\b\d+(?:[.,]\d+)?\s*(?:%|por ciento|de\s+\d+|intentos?|repeticiones?|veces?|segundos?|minutos?)\b/.test(
          normalizedCriterion,
        );

      return hasAction && (hasIndicator || hasNumericEvidence);
    },
  );

  if (!observableCriteria) {
    return {
      valid: false,
      message:
        "Cada criterio debe incluir una acción observable y un indicador verificable, por ejemplo aciertos, porcentaje, frecuencia, tiempo, precisión, ejecución correcta o calidad técnica.",
    };
  }

  return { valid: true };
}
