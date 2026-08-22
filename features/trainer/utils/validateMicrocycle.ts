import type {
  GeneratedMicrocycle,
  MicrocycleFormData,
  TrainingDay,
} from "@/features/trainer/types/trainer";

export interface MicrocycleValidationResult {
  valid: boolean;
  message?: string;
}

const TRAINING_DAYS: TrainingDay[] = [
  "monday",
  "tuesday",
  "wednesday",
  "thursday",
  "friday",
  "saturday",
  "sunday",
];

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
  const normalizedMaterials = normalize(materials);
  const match = normalizedMaterials.match(
    /\b(\d{1,3})\s+(?:balon|balones|pelota|pelotas)\b/,
  );

  return match ? Number(match[1]) : null;
}

function hasWritingMaterials(materials: string): boolean {
  return /\b(?:hojas?|fichas?|cuadernos?|planillas?|pizarras?|papel|lapices?|boligrafos?|marcadores?|tabletas?|telefonos?|dispositivos?)\b/.test(
    normalize(materials),
  );
}

function validateTextLength(
  label: string,
  value: string,
  maximum: number,
): MicrocycleValidationResult {
  const words = countWords(value);

  return words <= maximum
    ? { valid: true }
    : {
        valid: false,
        message: `${label} contiene ${words} palabras y debe resumirse a un máximo de ${maximum}.`,
      };
}

export function isValidMicrocycleFormData(
  value: unknown,
): value is MicrocycleFormData {
  if (!isRecord(value)) {
    return false;
  }

  const days = value.trainingDays;

  return (
    isNonEmptyString(value.sport) &&
    isNonEmptyString(value.category) &&
    ["initiation", "intermediate", "advanced"].includes(
      String(value.level),
    ) &&
    [
      "general-preparation",
      "specific-preparation",
      "pre-competition",
      "competition",
      "recovery",
    ].includes(String(value.phase)) &&
    isNonEmptyString(value.weeklyObjective) &&
    Array.isArray(days) &&
    days.length >= 2 &&
    days.length <= 7 &&
    days.every(
      (day) => typeof day === "string" && TRAINING_DAYS.includes(day as TrainingDay),
    ) &&
    new Set(days).size === days.length &&
    typeof value.sessionDurationMinutes === "number" &&
    Number.isInteger(value.sessionDurationMinutes) &&
    value.sessionDurationMinutes >= 30 &&
    value.sessionDurationMinutes <= 180 &&
    typeof value.athleteCount === "number" &&
    Number.isInteger(value.athleteCount) &&
    value.athleteCount >= 1 &&
    value.athleteCount <= 100 &&
    [...TRAINING_DAYS, "none"].includes(
      String(value.competitionDay) as TrainingDay | "none",
    ) &&
    isNonEmptyString(value.materials) &&
    isNonEmptyString(value.space) &&
    typeof value.additionalInstructions === "string"
  );
}

export function isGeneratedMicrocycle(
  value: unknown,
): value is GeneratedMicrocycle {
  if (!isRecord(value) || !Array.isArray(value.days)) {
    return false;
  }

  const validDays = value.days.every((day) => {
    if (!isRecord(day) || !Array.isArray(day.segments)) {
      return false;
    }

    const validSegments = day.segments.every(
      (segment) =>
        isRecord(segment) &&
        isNonEmptyString(segment.name) &&
        typeof segment.minutes === "number" &&
        Number.isInteger(segment.minutes) &&
        segment.minutes > 0 &&
        isNonEmptyString(segment.objective) &&
        isNonEmptyString(segment.content),
    );

    return (
      TRAINING_DAYS.includes(day.day as TrainingDay) &&
      typeof day.sessionNumber === "number" &&
      Number.isInteger(day.sessionNumber) &&
      isNonEmptyString(day.title) &&
      isNonEmptyString(day.objective) &&
      [
        "technical",
        "tactical",
        "physical",
        "coordination",
        "recovery",
        "combined",
      ].includes(String(day.focus)) &&
      ["low", "moderate", "high-controlled"].includes(
        String(day.intensity),
      ) &&
      typeof day.minutes === "number" &&
      Number.isInteger(day.minutes) &&
      typeof day.loadLevel === "number" &&
      Number.isInteger(day.loadLevel) &&
      day.loadLevel >= 1 &&
      day.loadLevel <= 5 &&
      isNonEmptyString(day.organization) &&
      day.segments.length >= 3 &&
      day.segments.length <= 5 &&
      validSegments &&
      isStringArray(day.coachingPoints) &&
      isNonEmptyString(day.recovery) &&
      isNonEmptyString(day.monitoring) &&
      isNonEmptyString(day.safety)
    );
  });

  return (
    isNonEmptyString(value.title) &&
    isNonEmptyString(value.summary) &&
    isNonEmptyString(value.weeklyObjective) &&
    isNonEmptyString(value.phaseGuidance) &&
    typeof value.totalSessions === "number" &&
    Number.isInteger(value.totalSessions) &&
    typeof value.totalMinutes === "number" &&
    Number.isInteger(value.totalMinutes) &&
    value.days.length >= 2 &&
    value.days.length <= 7 &&
    validDays &&
    isNonEmptyString(value.weeklyLoadSummary) &&
    isStringArray(value.evaluationCriteria) &&
    isStringArray(value.safetyMeasures) &&
    isStringArray(value.adaptationNotes)
  );
}

function getVisibleText(microcycle: GeneratedMicrocycle): string {
  return normalize(
    [
      microcycle.title,
      microcycle.summary,
      microcycle.weeklyObjective,
      microcycle.phaseGuidance,
      microcycle.weeklyLoadSummary,
      ...microcycle.evaluationCriteria,
      ...microcycle.safetyMeasures,
      ...microcycle.adaptationNotes,
      ...microcycle.days.flatMap((day) => [
        day.title,
        day.objective,
        day.organization,
        day.recovery,
        day.monitoring,
        day.safety,
        ...day.coachingPoints,
        ...day.segments.flatMap((segment) => [
          segment.name,
          segment.objective,
          segment.content,
        ]),
      ]),
    ].join(" "),
  );
}

export function validateMicrocycle(
  formData: MicrocycleFormData,
  microcycle: GeneratedMicrocycle,
): MicrocycleValidationResult {
  const expectedSessions = formData.trainingDays.length;
  const expectedTotalMinutes =
    expectedSessions * formData.sessionDurationMinutes;

  if (
    microcycle.totalSessions !== expectedSessions ||
    microcycle.days.length !== expectedSessions
  ) {
    return {
      valid: false,
      message: `El microciclo debe incluir exactamente ${expectedSessions} sesiones.`,
    };
  }

  if (microcycle.totalMinutes !== expectedTotalMinutes) {
    return {
      valid: false,
      message: `La duración total debe ser exactamente ${expectedTotalMinutes} minutos.`,
    };
  }

  const globalLengthChecks = [
    validateTextLength("El título del microciclo", microcycle.title, 12),
    validateTextLength("El resumen del microciclo", microcycle.summary, 70),
  ];

  const failedGlobalLength = globalLengthChecks.find(
    (validation) => !validation.valid,
  );

  if (failedGlobalLength) {
    return failedGlobalLength;
  }

  const availableBalls = extractAvailableBalls(formData.materials);
  const writingMaterialsAvailable = hasWritingMaterials(formData.materials);

  for (let index = 0; index < microcycle.days.length; index += 1) {
    const day = microcycle.days[index];
    const expectedDay = formData.trainingDays[index];

    if (day.day !== expectedDay || day.sessionNumber !== index + 1) {
      return {
        valid: false,
        message: `La sesión ${index + 1} debe corresponder a ${expectedDay} y conservar el orden solicitado.`,
      };
    }

    if (day.minutes !== formData.sessionDurationMinutes) {
      return {
        valid: false,
        message: `La sesión de ${expectedDay} debe durar exactamente ${formData.sessionDurationMinutes} minutos.`,
      };
    }

    const segmentMinutes = day.segments.reduce(
      (total, segment) => total + segment.minutes,
      0,
    );

    if (segmentMinutes !== day.minutes) {
      return {
        valid: false,
        message: `Los segmentos de ${expectedDay} suman ${segmentMinutes} minutos y deben sumar ${day.minutes}.`,
      };
    }

    const dayLengthChecks = [
      validateTextLength(`El título de ${expectedDay}`, day.title, 12),
      validateTextLength(`La organización de ${expectedDay}`, day.organization, 80),
      validateTextLength(`La recuperación de ${expectedDay}`, day.recovery, 45),
      validateTextLength(`El control de ${expectedDay}`, day.monitoring, 45),
      validateTextLength(`La seguridad de ${expectedDay}`, day.safety, 45),
      ...day.segments.map((segment) =>
        validateTextLength(
          `El contenido de "${segment.name}" en ${expectedDay}`,
          segment.content,
          65,
        ),
      ),
    ];

    const failedDayLength = dayLengthChecks.find(
      (validation) => !validation.valid,
    );

    if (failedDayLength) {
      return failedDayLength;
    }

    const normalizedOrganization = normalize(day.organization);
    const mentionsExactAthleteCount = new RegExp(
      `\\b${formData.athleteCount}\\s+deportistas?\\b`,
    ).test(normalizedOrganization);
    const statesSimultaneousParticipation =
      /\b(?:simultaneamente|en paralelo|todos activos|participacion simultanea)\b/.test(
        normalizedOrganization,
      );

    if (!mentionsExactAthleteCount || !statesSimultaneousParticipation) {
      return {
        valid: false,
        message: `La organización de ${expectedDay} debe mencionar expresamente a los ${formData.athleteCount} deportistas y confirmar su participación simultánea o en paralelo.`,
      };
    }

    const dayActivityText = normalize(
      day.segments.map((segment) => segment.content).join(" "),
    );
    const abbreviatedGameNotation = [
      normalizedOrganization,
      dayActivityText,
    ]
      .join(" ")
      .match(/\b\d{1,2}\s*v\s*\d{1,2}\b/);

    if (abbreviatedGameNotation) {
      return {
        valid: false,
        message: `La sesión de ${expectedDay} utiliza "${abbreviatedGameNotation[0]}". Escribe la organización en español natural, por ejemplo "4 contra 4".`,
      };
    }

    const parallelGameDistribution = normalizedOrganization.match(
      /\b(\d{1,2})\s+juegos?\s+(?:simultaneos?|paralelos?)\s+de\s+(\d{1,2})\s*(?:contra|x|c|v)\s*(\d{1,2})\b/,
    );
    const smallSidedGame = dayActivityText.match(
      /\b(\d{1,2})\s*(?:contra|x|c|v)\s*(\d{1,2})\b/,
    );

    if (smallSidedGame && !parallelGameDistribution) {
      const athletesInOneGame =
        Number(smallSidedGame[1]) + Number(smallSidedGame[2]);
      const explainsParallelGames =
        /\b(?:juegos?|partidos?|cancha|zonas?|areas?)\b[^.!?;]{0,100}\b(?:simultaneamente|en paralelo)\b|\b(?:simultaneamente|en paralelo)\b[^.!?;]{0,100}\b(?:juegos?|partidos?|cancha|zonas?|areas?)\b/.test(
          normalizedOrganization,
        );
      const explainsActiveSupport =
        /\b(?:apoyos?|pasadores?|rebotadores?|defensores?|receptores?|desplazamiento|movilidad|funciones? activas?)\b/.test(
          normalizedOrganization,
        );

      if (
        athletesInOneGame < formData.athleteCount &&
        (!explainsParallelGames || !explainsActiveSupport)
      ) {
        return {
          valid: false,
          message: `La sesión de ${expectedDay} propone ${smallSidedGame[0]}, pero debe indicar cuántos juegos se realizan en paralelo y las funciones motrices activas que completan la participación de los ${formData.athleteCount} deportistas.`,
        };
      }
    }

    if (parallelGameDistribution) {
      const gameCount = Number(parallelGameDistribution[1]);
      const athletesPerGame =
        Number(parallelGameDistribution[2]) +
        Number(parallelGameDistribution[3]);
      const distributedAthletes = gameCount * athletesPerGame;

      if (distributedAthletes !== formData.athleteCount) {
        return {
          valid: false,
          message: `La organización de ${expectedDay} distribuye ${distributedAthletes} deportistas mediante juegos paralelos, pero el grupo tiene ${formData.athleteCount}. Corrige la cantidad de juegos o participantes.`,
        };
      }

      if (
        distributedAthletes === formData.athleteCount &&
        /\b(?:otros?|restantes?)\s+grupos?\b/.test(normalizedOrganization)
      ) {
        return {
          valid: false,
          message: `Los juegos paralelos de ${expectedDay} ya contabilizan a los ${formData.athleteCount} deportistas. No menciones otros grupos o grupos restantes inexistentes.`,
        };
      }
    }

    const usesBallActivities =
      /\b(?:balon|balones|pase|pases|tiro|tiros|lanzamiento|lanzamientos|bote|recepcion|rebote)\b/.test(
        dayActivityText,
      );
    const explainsBallAllocation =
      /\b(?:grupos?|estaciones?|zonas?|areas?|parejas?)\b/.test(
        normalizedOrganization,
      ) &&
      /\b(?:balon|balones|material|materiales|pase|recepcion|rebote|desplazamiento|defensa)\b/.test(
        normalizedOrganization,
      );

    if (
      availableBalls !== null &&
      availableBalls < formData.athleteCount &&
      usesBallActivities &&
      !explainsBallAllocation
    ) {
      return {
        valid: false,
        message: `La organización de ${expectedDay} debe distribuir los ${availableBalls} balones entre grupos o zonas e indicar las funciones activas de quienes comparten el material.`,
      };
    }

    if (
      !writingMaterialsAvailable &&
      /\b(?:registrar|anotar|registro escrito|planilla|ficha|tabla)\b/.test(
        normalize(day.monitoring),
      ) &&
      !/\b(?:oral|verbal|observacion|conteo hablado)\b/.test(
        normalize(day.monitoring),
      )
    ) {
      return {
        valid: false,
        message: `El seguimiento de ${expectedDay} propone un registro sin materiales para escribir. Utiliza observación del entrenador, conteo oral o retroalimentación verbal.`,
      };
    }

    const expectedLoad =
      day.intensity === "low"
        ? [1, 2]
        : day.intensity === "moderate"
          ? [2, 3, 4]
          : [4, 5];

    if (!expectedLoad.includes(day.loadLevel)) {
      return {
        valid: false,
        message: `La carga de ${expectedDay} no es coherente con la intensidad declarada.`,
      };
    }
  }

  for (let index = 1; index < microcycle.days.length; index += 1) {
    const previous = microcycle.days[index - 1];
    const current = microcycle.days[index];
    const consecutiveCalendarDays =
      TRAINING_DAYS.indexOf(current.day) -
        TRAINING_DAYS.indexOf(previous.day) ===
      1;

    if (
      consecutiveCalendarDays &&
      previous.intensity === "high-controlled" &&
      current.intensity === "high-controlled"
    ) {
      return {
        valid: false,
        message: `Las sesiones de ${previous.day} y ${current.day} no pueden tener ambas intensidad alta controlada.`,
      };
    }
  }

  if (formData.competitionDay !== "none") {
    const competitionIndex = TRAINING_DAYS.indexOf(formData.competitionDay);
    const previousDay = TRAINING_DAYS[competitionIndex - 1];
    const preCompetitionSession = microcycle.days.find(
      (day) => day.day === previousDay,
    );

    if (
      preCompetitionSession &&
      (preCompetitionSession.intensity === "high-controlled" ||
        preCompetitionSession.loadLevel > 3)
    ) {
      return {
        valid: false,
        message: `La sesión previa a la competencia debe reducir la carga y no puede ser de intensidad alta controlada.`,
      };
    }
  }

  const visibleText = getVisibleText(microcycle);
  const forbiddenTerms: Array<{ pattern: RegExp; term: string }> = [
    { pattern: /\bfeedback\b/, term: "feedback" },
    { pattern: /\bsprints?\b/, term: "sprint" },
    { pattern: /\bdrills?\b/, term: "drill" },
    { pattern: /\btiming\b/, term: "timing" },
    { pattern: /\bintermediate\b/, term: "intermediate" },
    { pattern: /\binitiation\b/, term: "initiation" },
    { pattern: /\badvanced\b/, term: "advanced" },
    { pattern: /\bcoach\b/, term: "coach" },
    { pattern: /\bcircuits?\b/, term: "circuits" },
    { pattern: /\blay[ -]?up\b/, term: "lay-up" },
    { pattern: /\bcatch and shoot\b/, term: "catch and shoot" },
    { pattern: /\bdrive and kick\b/, term: "drive and kick" },
    { pattern: /\bwaitingparticipants\b/, term: "waitingParticipants" },
    { pattern: /\blogisticsplan\b/, term: "logisticsPlan" },
    { pattern: /\bdurationplan\b/, term: "durationPlan" },
    { pattern: /\bloadlevel\b/, term: "loadLevel" },
    { pattern: /\b\d{1,2}\s*v\s*\d{1,2}\b/, term: "notación abreviada de juego" },
    { pattern: /\b(?:intensidad maxima|carga maxima|maxima exigencia)\b/, term: "intensidad máxima" },
    { pattern: /\b(?:fila|filas|espera|turno|turnos|uno por uno)\b/, term: "expresión de inactividad" },
  ];
  const forbiddenLanguage = forbiddenTerms.find(({ pattern }) =>
    pattern.test(visibleText),
  );

  if (forbiddenLanguage) {
    return {
      valid: false,
      message: `El contenido visible incluye "${forbiddenLanguage.term}". Utiliza lenguaje deportivo natural en español y describe participación simultánea sin expresiones técnicas internas o de inactividad.`,
    };
  }

  const contradictoryAdaptation = microcycle.adaptationNotes.find((note) => {
    const normalizedNote = normalize(note);

    return (
      /\b(?:simplificar|simplifica|mas sencillo|menor complejidad)\b/.test(
        normalizedNote,
      ) &&
      /\b(?:anadir|anadiendo|agregar|agregando|aumentar|aumentando|mas pases|mas reglas|mas decisiones|mas acciones)\b/.test(
        normalizedNote,
      )
    );
  });

  if (contradictoryAdaptation) {
    return {
      valid: false,
      message:
        "Una adaptación presentada como más sencilla añade acciones o decisiones. Debe reducir distancia, velocidad, oposición, acciones o complejidad sin cambiar el objetivo esencial.",
    };
  }

  const movementIsEssential =
    /\b(?:movimiento|desplazamiento|carrera)\b/.test(
      normalize(
        [microcycle.weeklyObjective, formData.weeklyObjective].join(" "),
      ),
    );
  const removesEssentialMovement = microcycle.adaptationNotes.some((note) =>
    /\b(?:posicion estatica|desde posicion estatica|ejecucion estatica|sin desplazamiento|sin movimiento)\b/.test(
      normalize(note),
    ),
  );

  if (movementIsEssential && removesEssentialMovement) {
    return {
      valid: false,
      message:
        "El movimiento forma parte del objetivo esencial. Las adaptaciones pueden reducir recorrido, ritmo u oposición, pero deben conservar el desplazamiento.",
    };
  }

  const hasAccessibleAdaptation = microcycle.adaptationNotes.some((note) =>
    /\b(?:reducir|acortar|disminuir|menor|ritmo|distancia|velocidad|oposicion|complejidad|apoyo verbal)\b/.test(
      normalize(note),
    ),
  );

  if (!hasAccessibleAdaptation) {
    return {
      valid: false,
      message:
        "Las adaptaciones deben incluir al menos un ajuste concreto de ritmo, distancia, velocidad, oposición, complejidad o apoyo verbal.",
    };
  }

  return { valid: true };
}
