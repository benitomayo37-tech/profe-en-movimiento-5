import type {
  GeneratedMacrocycle,
  MacrocycleFormData,
  MacrocyclePeriodType,
} from "@/features/trainer/types/trainer";

export interface MacrocycleValidationResult {
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

function invalid(message: string): MacrocycleValidationResult {
  return { valid: false, message };
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
): MacrocycleValidationResult {
  const words = countWords(value);
  return words <= maximum
    ? { valid: true }
    : invalid(
        `${label} contiene ${words} palabras y debe resumirse a un máximo de ${maximum}.`,
      );
}

export function isValidMacrocycleFormData(
  value: unknown,
): value is MacrocycleFormData {
  if (!isRecord(value)) return false;

  const preparatoryWeeks = Number(value.preparatoryWeeks);
  const competitiveWeeks = Number(value.competitiveWeeks);
  const transitionWeeks = Number(value.transitionWeeks);
  const totalWeeks = preparatoryWeeks + competitiveWeeks + transitionWeeks;
  const competitionStart = preparatoryWeeks + 1;
  const competitionEnd = preparatoryWeeks + competitiveWeeks;

  return (
    isNonEmptyString(value.sport) &&
    isNonEmptyString(value.category) &&
    ["initiation", "intermediate", "advanced"].includes(String(value.level)) &&
    isNonEmptyString(value.seasonObjective) &&
    Number.isInteger(preparatoryWeeks) &&
    preparatoryWeeks >= 4 &&
    preparatoryWeeks <= 40 &&
    Number.isInteger(competitiveWeeks) &&
    competitiveWeeks >= 2 &&
    competitiveWeeks <= 30 &&
    Number.isInteger(transitionWeeks) &&
    transitionWeeks >= 1 &&
    transitionWeeks <= 8 &&
    totalWeeks >= 8 &&
    totalWeeks <= 52 &&
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
    (value.mainCompetitionWeek === null ||
      (typeof value.mainCompetitionWeek === "number" &&
        Number.isInteger(value.mainCompetitionWeek) &&
        value.mainCompetitionWeek >= competitionStart &&
        value.mainCompetitionWeek <= competitionEnd)) &&
    isNonEmptyString(value.materials) &&
    isNonEmptyString(value.space) &&
    typeof value.additionalInstructions === "string"
  );
}

export function isGeneratedMacrocycle(
  value: unknown,
): value is GeneratedMacrocycle {
  if (!isRecord(value) || !Array.isArray(value.periods)) return false;

  const periodsAreValid = value.periods.every(
    (period) =>
      isRecord(period) &&
      typeof period.periodNumber === "number" &&
      Number.isInteger(period.periodNumber) &&
      ["preparatory", "competitive", "transition"].includes(
        String(period.type),
      ) &&
      isNonEmptyString(period.title) &&
      typeof period.weekStart === "number" &&
      Number.isInteger(period.weekStart) &&
      typeof period.weekEnd === "number" &&
      Number.isInteger(period.weekEnd) &&
      isNonEmptyString(period.objective) &&
      [
        "technical",
        "tactical",
        "physical",
        "coordination",
        "recovery",
        "combined",
      ].includes(String(period.focus)) &&
      ["low", "moderate", "high-controlled"].includes(
        String(period.intensity),
      ) &&
      typeof period.loadLevel === "number" &&
      Number.isInteger(period.loadLevel) &&
      period.loadLevel >= 1 &&
      period.loadLevel <= 5 &&
      typeof period.sessionCount === "number" &&
      Number.isInteger(period.sessionCount) &&
      typeof period.totalMinutes === "number" &&
      Number.isInteger(period.totalMinutes) &&
      isNonEmptyString(period.organization) &&
      isStringArray(period.keyContents) &&
      period.keyContents.length >= 3 &&
      period.keyContents.length <= 5 &&
      isNonEmptyString(period.progression) &&
      isNonEmptyString(period.recovery) &&
      isNonEmptyString(period.monitoring) &&
      isNonEmptyString(period.safety),
  );

  return (
    isNonEmptyString(value.title) &&
    isNonEmptyString(value.summary) &&
    isNonEmptyString(value.seasonObjective) &&
    isNonEmptyString(value.periodizationRationale) &&
    typeof value.totalWeeks === "number" &&
    Number.isInteger(value.totalWeeks) &&
    typeof value.totalSessions === "number" &&
    Number.isInteger(value.totalSessions) &&
    typeof value.totalMinutes === "number" &&
    Number.isInteger(value.totalMinutes) &&
    value.periods.length === 3 &&
    periodsAreValid &&
    isNonEmptyString(value.annualLoadSummary) &&
    isNonEmptyString(value.mainCompetitionGuidance) &&
    isStringArray(value.evaluationCriteria) &&
    isStringArray(value.safetyMeasures) &&
    isStringArray(value.adaptationNotes)
  );
}

function getVisibleText(macrocycle: GeneratedMacrocycle): string {
  return normalize(
    [
      macrocycle.title,
      macrocycle.summary,
      macrocycle.seasonObjective,
      macrocycle.periodizationRationale,
      macrocycle.annualLoadSummary,
      macrocycle.mainCompetitionGuidance,
      ...macrocycle.evaluationCriteria,
      ...macrocycle.safetyMeasures,
      ...macrocycle.adaptationNotes,
      ...macrocycle.periods.flatMap((period) => [
        period.title,
        period.objective,
        period.organization,
        period.progression,
        period.recovery,
        period.monitoring,
        period.safety,
        ...period.keyContents,
      ]),
    ].join(" "),
  );
}

function validateObservableCriteria(
  criteria: string[],
): MacrocycleValidationResult {
  if (criteria.length !== 4) {
    return invalid("El macrociclo debe incluir exactamente 4 criterios observables.");
  }

  const actionPattern =
    /\b(?:realiza|ejecuta|aplica|mantiene|coordina|identifica|demuestra|controla|completa|alcanza|registra|respeta|resuelve|selecciona|recibe|pasa|lanza|se desplaza|logra|conserva|muestra|adopta|decide|utiliza|mejora|reduce|incrementa)\b/;
  const indicatorPattern =
    /\b(?:aciertos?|porcentaje|frecuencia|tiempo|precision|calidad tecnica|ejecucion correcta|cantidad|cumplimiento|resultado|intentos?|repeticiones?|decisiones correctas|observacion|correctamente|adecuad[oa]s?|segur[oa]s?|controlad[oa]s?|estabilidad|continuidad|progreso)\b/;
  const numericPattern =
    /\b\d+(?:[.,]\d+)?\s*(?:%|por ciento|aciertos?|intentos?|repeticiones?|veces|segundos?|minutos?|sesiones?|semanas?)\b|\b\d+\s+de\s+\d+\b/;

  const invalidCriterion = criteria.find((criterion) => {
    const normalized = normalize(criterion);
    const hasAction = actionPattern.test(normalized);
    const hasIndicator = indicatorPattern.test(normalized);
    const hasNumericEvidence = numericPattern.test(normalized);
    const isOnlyVague =
      /\b(?:comprende|conoce|valora|reflexiona|aprende|reconoce la importancia)\b/.test(
        normalized,
      ) &&
      !hasIndicator &&
      !hasNumericEvidence;

    return (
      isOnlyVague ||
      !hasAction ||
      (!hasIndicator && !hasNumericEvidence)
    );
  });

  return invalidCriterion
    ? invalid(
        "Todos los criterios deben expresar una acción observable y un indicador verificable, como aciertos, porcentaje, frecuencia, tiempo, precisión, calidad técnica o cumplimiento.",
      )
    : { valid: true };
}

function findUnsafePractice(value: string): string | null {
  const unsafePracticePattern =
    /\b(?:al fallo|carga maxima|cargas maximas|sin descanso|castigo fisico|dolor como meta|hasta vomitar)\b/;
  const preventiveMentionPattern =
    /\b(?:evita|evitar|se evitan|no propone|no propongas|no incluye|no utiliza|no realizar|no realiza|nunca realiza|nunca utilizar|sin recurrir a|se descarta|queda prohibido)\b[^.!?;]{0,90}\b(?:al fallo|carga maxima|cargas maximas|sin descanso|castigo fisico|dolor como meta|hasta vomitar)\b/g;
  const textWithoutPreventiveMentions = value.replace(
    preventiveMentionPattern,
    "",
  );
  const match = textWithoutPreventiveMentions.match(unsafePracticePattern);

  return match?.[0] ?? null;
}

export function validateMacrocycle(
  formData: MacrocycleFormData,
  macrocycle: GeneratedMacrocycle,
): MacrocycleValidationResult {
  const periodSpecs: Array<{
    type: MacrocyclePeriodType;
    weeks: number;
    start: number;
    end: number;
  }> = [
    {
      type: "preparatory",
      weeks: formData.preparatoryWeeks,
      start: 1,
      end: formData.preparatoryWeeks,
    },
    {
      type: "competitive",
      weeks: formData.competitiveWeeks,
      start: formData.preparatoryWeeks + 1,
      end: formData.preparatoryWeeks + formData.competitiveWeeks,
    },
    {
      type: "transition",
      weeks: formData.transitionWeeks,
      start: formData.preparatoryWeeks + formData.competitiveWeeks + 1,
      end:
        formData.preparatoryWeeks +
        formData.competitiveWeeks +
        formData.transitionWeeks,
    },
  ];
  const expectedWeeks = periodSpecs[2].end;
  const expectedSessions = expectedWeeks * formData.sessionsPerWeek;
  const expectedMinutes = expectedSessions * formData.sessionDurationMinutes;

  if (
    macrocycle.totalWeeks !== expectedWeeks ||
    macrocycle.totalSessions !== expectedSessions ||
    macrocycle.totalMinutes !== expectedMinutes
  ) {
    return invalid(
      `El macrociclo debe contabilizar ${expectedWeeks} semanas, ${expectedSessions} sesiones y ${expectedMinutes} minutos.`,
    );
  }

  if (macrocycle.periods.length !== 3) {
    return invalid(
      "El macrociclo debe contener exactamente tres periodos: preparatorio, competitivo y transición.",
    );
  }

  const globalLengths = [
    validateLength("El título", macrocycle.title, 14),
    validateLength("El resumen", macrocycle.summary, 75),
    validateLength(
      "La justificación de la periodización",
      macrocycle.periodizationRationale,
      90,
    ),
    validateLength(
      "El resumen anual de carga",
      macrocycle.annualLoadSummary,
      80,
    ),
    validateLength(
      "La orientación de la competencia principal",
      macrocycle.mainCompetitionGuidance,
      60,
    ),
  ];
  const failedGlobalLength = globalLengths.find((result) => !result.valid);
  if (failedGlobalLength) return failedGlobalLength;

  const availableBalls = extractAvailableBalls(formData.materials);

  for (let index = 0; index < periodSpecs.length; index += 1) {
    const period = macrocycle.periods[index];
    const spec = periodSpecs[index];
    const expectedPeriodSessions = spec.weeks * formData.sessionsPerWeek;
    const expectedPeriodMinutes =
      expectedPeriodSessions * formData.sessionDurationMinutes;

    if (
      period.periodNumber !== index + 1 ||
      period.type !== spec.type ||
      period.weekStart !== spec.start ||
      period.weekEnd !== spec.end
    ) {
      return invalid(
        `El periodo ${index + 1} debe ser ${spec.type}, abarcar las semanas ${spec.start} a ${spec.end} y conservar el orden solicitado.`,
      );
    }

    if (
      period.sessionCount !== expectedPeriodSessions ||
      period.totalMinutes !== expectedPeriodMinutes
    ) {
      return invalid(
        `El periodo ${index + 1} debe contabilizar ${expectedPeriodSessions} sesiones y ${expectedPeriodMinutes} minutos.`,
      );
    }

    const validLoads =
      period.intensity === "low"
        ? [1, 2]
        : period.intensity === "moderate"
          ? [2, 3, 4]
          : [4, 5];
    if (!validLoads.includes(period.loadLevel)) {
      return invalid(
        `La carga del periodo ${index + 1} no coincide con su intensidad.`,
      );
    }

    if (
      period.type === "transition" &&
      (period.intensity !== "low" || period.loadLevel > 2)
    ) {
      return invalid(
        "El periodo de transición debe tener intensidad baja y carga máxima 2.",
      );
    }

    const lengthChecks = [
      validateLength(`El título del periodo ${index + 1}`, period.title, 12),
      validateLength(
        `La organización del periodo ${index + 1}`,
        period.organization,
        115,
      ),
      validateLength(
        `La progresión del periodo ${index + 1}`,
        period.progression,
        55,
      ),
      validateLength(
        `La recuperación del periodo ${index + 1}`,
        period.recovery,
        45,
      ),
      validateLength(
        `El control del periodo ${index + 1}`,
        period.monitoring,
        45,
      ),
      validateLength(
        `La seguridad del periodo ${index + 1}`,
        period.safety,
        45,
      ),
      ...period.keyContents.map((content) =>
        validateLength(`Un contenido del periodo ${index + 1}`, content, 30),
      ),
    ];
    const failedLength = lengthChecks.find((result) => !result.valid);
    if (failedLength) return failedLength;

    const organization = normalize(period.organization);
    const mentionsAthletes = new RegExp(
      `\\b${formData.athleteCount}\\s+deportistas\\b`,
    ).test(organization);
    const hasGroupDistribution =
      formData.athleteCount === 1
        ? /\b(?:trabajo individual|una zona individual|1 grupo de 1)\b/.test(
            organization,
          )
        : /\b\d{1,3}\s+(?:grupos?|equipos?|parejas?|trios?)\b/.test(
            organization,
          );
    if (
      !mentionsAthletes ||
      !hasGroupDistribution ||
      countWords(period.organization) < 15
    ) {
      return invalid(
        `La organización del periodo ${index + 1} debe mencionar a los ${formData.athleteCount} deportistas, indicar una distribución concreta en grupos o parejas y desarrollarse en una explicación pedagógica completa.`,
      );
    }

    const organizationWithoutNegatedWaiting = organization
      .replace(
        /\b(?:sin|evitar|evita|eliminar|elimina|no hay|no existen|se evitan)\b[^.!?;]{0,100}\b(?:filas?|espera(?:s)?(?: pasiva(?:s)?)?)\b/g,
        "",
      );
    if (
      /\b(?:esperan?|aguardan?)\s+(?:su\s+)?turno\b|\bespera pasiva\b|\ben\s+(?:una\s+|\d+\s+)?filas?\b|\buno por uno\b/.test(
        organizationWithoutNegatedWaiting,
      )
    ) {
      return invalid(
        `La organización del periodo ${index + 1} genera filas o espera. Todos los deportistas deben conservar una función activa simultánea.`,
      );
    }

    const uniformGroups = organization.match(
      /\b(\d{1,3})\s+(?:grupos?|equipos?)\s+de\s+(\d{1,3})(?:\s+deportistas?)?\b/,
    );
    if (
      uniformGroups &&
      Number(uniformGroups[1]) * Number(uniformGroups[2]) !==
        formData.athleteCount
    ) {
      return invalid(
        `La distribución del periodo ${index + 1} no contabiliza exactamente a los ${formData.athleteCount} deportistas.`,
      );
    }

    const periodMaterialText = normalize(
      [period.organization, ...period.keyContents].join(" "),
    );
    const periodUsesBalls =
      /\b(?:balon|balones|pelota|pelotas|pase|pases|bote|drible|tiro|tiros|lanzamiento|lanzamientos)\b/.test(
        periodMaterialText,
      );

    if (availableBalls !== null && periodUsesBalls) {
      const groupMatch = organization.match(
        /\b(\d{1,3})\s+(?:grupos?|equipos?|parejas?|trios?)\b/,
      );
      const groupCount = groupMatch ? Number(groupMatch[1]) : null;
      const ballMentions = Array.from(
        organization.matchAll(/\b(\d{1,3})\s+balon(?:es)?\b/g),
        (match) => Number(match[1]),
      );
      const ballsPerGroupMatch = organization.match(
        /\bcada\s+(?:grupo|equipo|pareja|trio)\b[^.!?;]{0,100}\b(?:utiliza|usa|recibe|dispone de|trabaja con|tiene)\s+(\d{1,3})\s+balon(?:es)?\b/,
      );

      if (ballMentions.length === 0) {
        return invalid(
          `La organización del periodo ${index + 1} debe explicar cómo distribuye los ${availableBalls} balones disponibles.`,
        );
      }

      const ballsPerGroup = ballsPerGroupMatch
        ? Number(ballsPerGroupMatch[1])
        : null;
      const allocated =
        groupCount !== null && ballsPerGroup !== null
          ? groupCount * ballsPerGroup
          : Math.max(...ballMentions);
      if (allocated > availableBalls) {
        return invalid(
          `El periodo ${index + 1} distribuye ${allocated} balones, pero solo existen ${availableBalls}.`,
        );
      }

      if (
        groupCount !== null &&
        groupCount > availableBalls &&
        !/\b(?:comparten|alternancia activa|distribucion rotativa|rotan el balon)\b/.test(
          organization,
        )
      ) {
        return invalid(
          `El periodo ${index + 1} tiene más grupos que balones y debe explicar una alternancia activa.`,
        );
      }
    }
  }

  const periodSessions = macrocycle.periods.reduce(
    (total, period) => total + period.sessionCount,
    0,
  );
  const periodMinutes = macrocycle.periods.reduce(
    (total, period) => total + period.totalMinutes,
    0,
  );
  if (
    periodSessions !== macrocycle.totalSessions ||
    periodMinutes !== macrocycle.totalMinutes
  ) {
    return invalid(
      "La suma de sesiones o minutos de los periodos no coincide con el total del macrociclo.",
    );
  }

  if (formData.mainCompetitionWeek !== null) {
    const competitionText = normalize(macrocycle.mainCompetitionGuidance);
    if (
      !new RegExp(`\\bsemana\\s+${formData.mainCompetitionWeek}\\b`).test(
        competitionText,
      ) ||
      !/\b(?:descarga|reduccion|ajuste|recuperacion|puesta a punto)\b/.test(
        competitionText,
      )
    ) {
      return invalid(
        `La orientación competitiva debe mencionar la semana ${formData.mainCompetitionWeek} y explicar la reducción o ajuste previo de la carga.`,
      );
    }
  }

  const criteriaValidation = validateObservableCriteria(
    macrocycle.evaluationCriteria,
  );
  if (!criteriaValidation.valid) return criteriaValidation;

  if (
    macrocycle.safetyMeasures.length < 3 ||
    macrocycle.safetyMeasures.length > 5 ||
    macrocycle.adaptationNotes.length < 3 ||
    macrocycle.adaptationNotes.length > 5
  ) {
    return invalid(
      "El macrociclo debe incluir entre 3 y 5 medidas de seguridad y entre 3 y 5 opciones de adaptación.",
    );
  }

  const visibleText = getVisibleText(macrocycle);
  const forbiddenTerms = [
    { pattern: /\bfeedback\b/, term: "feedback" },
    { pattern: /\bcoach\b/, term: "coach" },
    { pattern: /\bdrills?\b/, term: "drill" },
    { pattern: /\bsprints?\b/, term: "sprint" },
    { pattern: /\bfitness\b/, term: "fitness" },
    { pattern: /\bstretching\b/, term: "stretching" },
    { pattern: /\b(?:periodnumber|weekstart|weekend|loadlevel|sessioncount|totalminutes)\b/, term: "propiedad técnica interna" },
  ];
  const forbidden = forbiddenTerms.find(({ pattern }) =>
    pattern.test(visibleText),
  );
  if (forbidden) {
    return invalid(
      `El contenido visible incluye "${forbidden.term}". Utiliza únicamente lenguaje pedagógico natural y completamente en español.`,
    );
  }

  const unsafePractice = findUnsafePractice(visibleText);
  if (unsafePractice) {
    return invalid(
      `El macrociclo contiene la expresión de riesgo "${unsafePractice}". Sustitúyela por una indicación positiva de progresión controlada, pausas, recuperación o técnica segura.`,
    );
  }

  if (
    !/\b(?:hidratacion|pausas?|recuperacion)\b/.test(visibleText) ||
    !/\b(?:tecnica|distancia segura|espacio seguro|superficie|fatiga)\b/.test(
      visibleText,
    )
  ) {
    return invalid(
      "Las medidas de seguridad deben incluir recuperación o hidratación y control técnico o espacial.",
    );
  }

  return { valid: true };
}
