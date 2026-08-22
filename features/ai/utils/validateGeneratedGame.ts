import type {
  AIFormData,
  GeneratedAIContent,
} from "@/features/ai/types/ai";

export interface GameValidationResult {
  valid: boolean;
  message?: string;
}

interface RequiredSectionRule {
  display: string;
  pattern: RegExp;
}

const REQUIRED_SECTIONS: RequiredSectionRule[] = [
  {
    display: "Nombre y propósito del juego",
    pattern:
      /^nombre y proposito del juego$/,
  },
  {
    display:
      "Organización del espacio, grupos y materiales",
    pattern:
      /^organizacion del espacio,? grupos y materiales$/,
  },
  {
    display: "Desarrollo paso a paso",
    pattern:
      /^desarrollo\b.*$/,
  },
  {
    display: "Reglas",
    pattern: /^reglas$/,
  },
  {
    display: "Variantes y progresiones",
    pattern:
      /^variantes y progresiones$/,
  },
  {
    display:
      "Evaluación o evidencias de aprendizaje",
    pattern:
      /^evaluacion (?:o|y) evidencias de aprendizaje$/,
  },
  {
    display: "Medidas de seguridad",
    pattern:
      /^medidas de seguridad$/,
  },
];

function normalizeText(
  value: string,
): string {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/\s+/g, " ")
    .trim();
}

function normalizeSectionTitle(
  value: string,
): string {
  return normalizeText(value)
    .replace(
      /^(?:seccion\s+)?\d+(?:\.\d+)*\s*[.):\-–—]?\s*/,
      "",
    )
    .replace(/[.:;]+$/g, "")
    .trim();
}

function invalid(
  message: string,
): GameValidationResult {
  return {
    valid: false,
    message,
  };
}

function getVisibleText(
  content: GeneratedAIContent,
): string {
  return normalizeText(
    [
      content.title,
      content.introduction,
      ...content.sections.flatMap(
        (section) => [
          section.title,
          ...section.content,
        ],
      ),
    ].join(" "),
  );
}

function findRequiredSections(
  content: GeneratedAIContent,
):
  | GeneratedAIContent["sections"]
  | GameValidationResult {
  const selectedSections:
    GeneratedAIContent["sections"] = [];

  let previousIndex = -1;

  for (
    const rule of
      REQUIRED_SECTIONS
  ) {
    const currentIndex =
      content.sections.findIndex(
        (section, index) =>
          index > previousIndex &&
          rule.pattern.test(
            normalizeSectionTitle(
              section.title,
            ),
          ),
      );

    if (currentIndex === -1) {
      return invalid(
        `El juego debe incluir la sección "${rule.display}" y conservar el orden solicitado.`,
      );
    }

    selectedSections.push(
      content.sections[currentIndex],
    );

    previousIndex = currentIndex;
  }

  return selectedSections;
}

function validateLifecycle(
  developmentSection:
    GeneratedAIContent["sections"][number],
): GameValidationResult {
  const developmentText =
    normalizeText(
      developmentSection.content.join(
        " ",
      ),
    );

  const hasBeginning =
    /\b(?:comienza|comenzar|inicia|iniciar|inicio|al inicio)\b/.test(
      developmentText,
    );

  const hasContinuation =
    /\b(?:continua|continuar|durante|ronda|rondas|ciclo|ciclos|despues)\b/.test(
      developmentText,
    );

  const hasEnding =
    /\b(?:termina|terminar|finaliza|finalizar|cierre|al final)\b/.test(
      developmentText,
    );

  if (
    !hasBeginning ||
    !hasContinuation ||
    !hasEnding
  ) {
    return invalid(
      "El desarrollo paso a paso debe explicar expresamente cómo comienza, cómo continúa y cómo termina el juego.",
    );
  }

  return {
    valid: true,
  };
}

function validateVariants(
  variantsSection:
    GeneratedAIContent["sections"][number],
): GameValidationResult {
  const variantsText = normalizeText(
    variantsSection.content.join(" "),
  );

  const hasSimplerVariant =
    /\b(?:variante\s+(?:mas\s+)?sencilla|version\s+(?:mas\s+)?sencilla|nivel inicial|simplificar|facilitar|menor dificultad)\b/.test(
      variantsText,
    );

  const hasChallengeVariant =
    /\b(?:variante\s+(?:de\s+)?(?:mayor\s+desafio|desafiante|avanzada)|version\s+(?:mas\s+)?(?:dificil|avanzada|exigente)|mayor\s+(?:desafio|dificultad|complejidad)|nivel\s+avanzado|aumentar\s+la\s+dificultad|incrementar\s+la\s+dificultad|mas\s+(?:exigente|dificil|compleja)|progresion\s+(?:avanzada|de\s+desafio)|desafio\s+adicional|reto\s+avanzado)\b/.test(
      variantsText,
    );

  if (!hasSimplerVariant) {
    return invalid(
      "Variantes y progresiones debe incluir una variante claramente identificada como más sencilla.",
    );
  }

  if (!hasChallengeVariant) {
    return invalid(
      "Variantes y progresiones debe incluir una variante claramente identificada como de mayor desafío.",
    );
  }

  return {
    valid: true,
  };
}

function validateEvaluation(
  evaluationSection:
    GeneratedAIContent["sections"][number],
): GameValidationResult {
  const evaluationText = normalizeText(
    evaluationSection.content.join(" "),
  );

  if (
    evaluationText.length < 60 ||
    !/\b(?:observa|observacion|observable|evidencia|criterio|indicador|retroalimentacion)\b/.test(
      evaluationText,
    )
  ) {
    return invalid(
      "La evaluación debe indicar evidencias observables o criterios concretos para verificar el aprendizaje durante el juego.",
    );
  }

  return {
    valid: true,
  };
}

function validateSafety(
  safetySection:
    GeneratedAIContent["sections"][number],
): GameValidationResult {
  const safetyText = normalizeText(
    safetySection.content.join(" "),
  );

  const safetyEvidence = [
    /\b(?:delimitar|limites?|zonas?|espacio)\b/,
    /\b(?:distancia|colision|choque|cruce|separacion)\b/,
    /\b(?:senal|silbato|detener|parar)\b/,
    /\b(?:superficie|suelo|calzado|materiales)\b/,
    /\b(?:rostro|contacto|empujar|golpear)\b/,
  ].filter(
    (pattern) =>
      pattern.test(safetyText),
  ).length;

  if (safetyEvidence < 2) {
    return invalid(
      "Las medidas de seguridad deben incluir al menos dos controles concretos sobre espacio, distancias, señal de detención, superficie, materiales o contacto entre participantes.",
    );
  }

  return {
    valid: true,
  };
}

function validateNoPermanentElimination(
  visibleText: string,
): GameValidationResult {
  const textWithoutProhibitions =
    visibleText
      .replace(
        /\b(?:sin|evitar|evita|no\s+hay|no\s+se\s+permite)\s+(?:la\s+)?eliminacion(?:es)?(?:\s+permanente)?\b/g,
        "",
      )
      .replace(
        /\bningun\s+(?:estudiante|jugador|participante)\s+queda\s+eliminado\b/g,
        "",
      );

  if (
    /\b(?:queda|quedan|es|son)\s+eliminad[oa]s?\b/.test(
      textWithoutProhibitions,
    ) ||
    /\bsale(?:n)?\s+del\s+juego\s+(?:definitivamente|permanentemente)\b/.test(
      textWithoutProhibitions,
    )
  ) {
    return invalid(
      "El juego no puede eliminar permanentemente a estudiantes. Toda penalización debe conservar una participación o reincorporación inmediata y activa.",
    );
  }

  return {
    valid: true,
  };
}

function validateSpanishTerminology(
  visibleText: string,
): GameValidationResult {
  const forbiddenTerms = [
    {
      pattern: /\btouches?\b/,
      replacement: '"contacto" o "contactos"',
    },
    {
      pattern: /\bpressing\b/,
      replacement: '"presión"',
    },
    {
      pattern: /\bfeedback\b/,
      replacement: '"retroalimentación"',
    },
    {
      pattern: /\bcoach(?:es)?\b/,
      replacement: '"observador técnico" u "orientador"',
    },
  ];

  for (const term of forbiddenTerms) {
    if (term.pattern.test(visibleText)) {
      return invalid(
        `El juego utiliza un anglicismo innecesario. Escribe ${term.replacement} y utiliza únicamente terminología pedagógica en español.`,
      );
    }
  }

  if (/\bpase de paso\b/.test(visibleText)) {
    return invalid(
      'La expresión "pase de paso" no identifica una técnica estándar. Utiliza el nombre técnico correcto del pase solicitado o describe la acción sin inventar otra técnica.',
    );
  }

  if (/\bpase(?:s)?\s+(?:seguro\s+)?al\s+pie\b/.test(visibleText)) {
    return invalid(
      'En baloncesto no debe proponerse un "pase al pie" como opción técnica. Dirige el pase a las manos, al pecho o al espacio de recepción adecuado.',
    );
  }

  return {
    valid: true,
  };
}

function validateVariantTiming(
  variantsSection:
    GeneratedAIContent["sections"][number],
): GameValidationResult {
  const variantsText = normalizeText(
    variantsSection.content.join(" "),
  );

  const changesBlockDuration =
    /\b(?:aumentar|ampliar|reducir|disminuir|modificar|cambiar)\b[^.!?]{0,60}\b(?:tiempo|duracion)\b[^.!?]{0,45}\b(?:ciclo|ronda|estacion|bloque)\b/.test(
      variantsText,
    ) ||
    /\b(?:ciclo|ronda|estacion|bloque)\b[^.!?]{0,45}\b(?:a|hasta)\s+\d+(?:[.,]\d+)?\s*minutos?\b/.test(
      variantsText,
    );

  if (changesBlockDuration) {
    return invalid(
      "Las variantes no deben cambiar los minutos de ciclos, rondas, estaciones o bloques. Deben conservar exactamente la distribución temporal aprobada.",
    );
  }

  return {
    valid: true,
  };
}

function validateFeedbackFeasibility(
  developmentSection:
    GeneratedAIContent["sections"][number],
  content: GeneratedAIContent,
): GameValidationResult {
  const logisticsPlan = content.logisticsPlan;

  if (!logisticsPlan) {
    return {
      valid: true,
    };
  }

  const developmentText = normalizeText(
    developmentSection.content.join(" "),
  );

  const evaluationDurationMatch =
    developmentText.match(
      /\bevaluacion(?:\s+y\s+retroalimentacion)?\b[^.!?]{0,120}\(\s*(\d+(?:[.,]\d+)?)\s*min(?:uto)?s?\s*\)/,
    );

  const secondsPerGroupMatch =
    developmentText.match(
      /\b(\d+(?:[.,]\d+)?)\s*(?:[-–—]\s*(\d+(?:[.,]\d+)?)\s*)?(?:s|seg|segundo|segundos)\s+por\s+grupo\b/,
    );

  if (
    !evaluationDurationMatch ||
    !secondsPerGroupMatch
  ) {
    return {
      valid: true,
    };
  }

  const evaluationMinutes = Number(
    evaluationDurationMatch[1].replace(",", "."),
  );

  const minimumSecondsPerGroup = Number(
    secondsPerGroupMatch[1].replace(",", "."),
  );

  const requiredSeconds =
    logisticsPlan.groupCount *
    minimumSecondsPerGroup;

  const availableSeconds =
    evaluationMinutes * 60;

  if (requiredSeconds > availableSeconds) {
    return invalid(
      `La retroalimentación concede al menos ${minimumSecondsPerGroup} segundos a cada uno de los ${logisticsPlan.groupCount} grupos, por lo que requiere ${requiredSeconds} segundos. El bloque dispone solamente de ${availableSeconds} segundos. Ajusta la dinámica sin modificar la duración total.`,
    );
  }

  return {
    valid: true,
  };
}

function validateScarceBallParticipation(
  formData: AIFormData,
  content: GeneratedAIContent,
  visibleText: string,
): GameValidationResult {
  const logisticsPlan = content.logisticsPlan;

  if (
    !logisticsPlan ||
    logisticsPlan.stations < 1
  ) {
    return {
      valid: true,
    };
  }

  const requestedBallMatch =
    normalizeText(
      formData.materials,
    ).match(
      /\b(\d+)\s+balon(?:es)?\b/,
    );

  const ballResource =
    logisticsPlan.resources.find(
      (resource) =>
        /\bbalon(?:es)?\b/.test(
          normalizeText(resource.name),
        ),
    );

  const requestedBalls =
    requestedBallMatch
      ? Number.parseInt(
          requestedBallMatch[1],
          10,
        )
      : null;

  const totalBalls =
    requestedBalls ??
    ballResource?.required ??
    null;

  if (!totalBalls) {
    return {
      valid: true,
    };
  }

  const participantsPerStation =
    Math.ceil(
      logisticsPlan.studentCount /
        logisticsPlan.stations,
    );

  const ballsPerStation =
    totalBalls /
    logisticsPlan.stations;

  if (
    participantsPerStation <=
    Math.max(4, ballsPerStation * 4)
  ) {
    return {
      valid: true,
    };
  }

  const stationSection =
    content.sections.find(
      (section) =>
        normalizeSectionTitle(
          section.title,
        ).replace(/:/g, "") ===
        "estaciones tareas y organizacion",
    );

  const stationItems =
    stationSection?.content.filter(
      (item) =>
        /^(?:[-•]\s*)?(?:\d+[.)]\s*)?estacion\s+\d+\b/.test(
          normalizeText(item),
        ),
    ) ?? [];

  const hasFrequentInternalRotation =
    /\b(?:microturnos?|alternancia activa|rotacion interna|cambio de roles?)\b[^.!?]{0,100}\b(?:cada\s+\d+\s*(?:s|segundos?|minutos?)|durante\s+la\s+estacion|dentro\s+de\s+cada\s+estacion)\b/.test(
      visibleText,
    ) ||
    /\bcada\s+\d+\s*(?:s|segundos?)\b[^.!?]{0,100}\b(?:alternan|cambian|rotan)\b/.test(
      visibleText,
    );

  const hasActiveNoBallFunctions =
    /\b(?:sin\s+balon|mientras\s+no\s+(?:usa|utiliza|tiene)\s+el\s+balon)\b[^.!?]{0,140}\b(?:desplazamiento|apoyo|observacion|seguridad|recepcion|comunicacion|marcaje|defensa)\b/.test(
      visibleText,
    );

  for (const stationItem of stationItems) {
    const normalizedStation =
      normalizeText(stationItem);

    const stationNumber =
      normalizedStation.match(
        /\bestacion\s+(\d+)\b/,
      )?.[1] ?? "correspondiente";

    const stationHasTimedMicroturns =
      /\b(?:microturnos?|turnos? activos?|rotacion interna|cambio de roles?|cambio de funciones?)\b[^.!?]{0,100}\b\d+\s*(?:s|segundos?|minutos?)\b/.test(
        normalizedStation,
      ) ||
      /\bcada\s+\d+\s*(?:s|segundos?)\b[^.!?]{0,100}\b(?:alternan|cambian|rotan)\b/.test(
        normalizedStation,
      );

    const stationHasNoBallFunctions =
      /\b(?:sin\s+balon|mientras\s+no\s+(?:usa|utiliza|tiene)\s+el\s+balon)\b[^.!?]{0,160}\b(?:desplazamiento|apoyo|observacion|seguridad|recepcion|comunicacion|marcaje|defensa)\b/.test(
        normalizedStation,
      );

    if (
      !stationHasTimedMicroturns ||
      !stationHasNoBallFunctions
    ) {
      return invalid(
        `La Estación ${stationNumber} reúne aproximadamente ${participantsPerStation} estudiantes con ${ballsPerStation} balón. Debe indicar dentro de su propia descripción microturnos cronometrados y las funciones motrices de quienes están momentáneamente sin balón.`,
      );
    }
  }

  if (
    !hasFrequentInternalRotation ||
    !hasActiveNoBallFunctions
  ) {
    return invalid(
      `Cada estación reúne aproximadamente ${participantsPerStation} estudiantes y dispone de ${ballsPerStation} balón por estación. Describe microturnos o rotación interna frecuente e indica las funciones motrices activas de quienes están momentáneamente sin balón.`,
    );
  }

  return {
    valid: true,
  };
}

function validateGameFormat(
  content: GeneratedAIContent,
  visibleText: string,
): GameValidationResult {
  const logisticsPlan =
    content.logisticsPlan;

  if (!logisticsPlan) {
    return invalid(
      "El juego debe incluir un plan logístico estructurado.",
    );
  }

  const formatText = visibleText
    .replace(
      /\bno\s+(?:es|sera)\s+(?:un\s+)?juego\s+continuo\b/g,
      "",
    )
    .replace(
      /\bno\s+(?:es|sera)\s+(?:un\s+)?circuito\s+por\s+estaciones\b/g,
      "",
    );

  const stationSections =
    content.sections.filter(
      (section) =>
        normalizeSectionTitle(
          section.title,
        ).replace(/:/g, "") ===
        "estaciones tareas y organizacion",
    );

  const stationItems =
    stationSections.flatMap(
      (section) =>
        section.content.filter(
          (item) =>
            /^(?:[-•]\s*)?(?:\d+[.)]\s*)?estacion\s+\d+\b/.test(
              normalizeText(item),
            ),
        ),
    );

  const hasStationLabels =
    /\bestacion\s+\d+\b/.test(
      formatText,
    );

  const declaresContinuous =
    /\b(?:juego continuo|modalidad continua|una unica zona general)\b/.test(
      formatText,
    );

  const declaresCircuit =
    /\b(?:circuito por estaciones|rotacion de estaciones|ruta de estaciones)\b/.test(
      formatText,
    ) ||
    stationSections.length > 0 ||
    hasStationLabels;

  if (
    declaresContinuous ===
    declaresCircuit
  ) {
    return invalid(
      'La propuesta debe definir claramente un solo formato: "juego continuo" o "circuito por estaciones".',
    );
  }

  if (declaresContinuous) {
    if (
      logisticsPlan.stations !== 1 ||
      stationSections.length > 0 ||
      hasStationLabels
    ) {
      return invalid(
        "El juego continuo debe utilizar una única zona general, declarar una sola estación logística y no presentar estaciones numeradas.",
      );
    }

    return {
      valid: true,
    };
  }

  if (logisticsPlan.stations < 2) {
    return invalid(
      "El circuito por estaciones debe declarar al menos dos estaciones reales en el plan logístico.",
    );
  }

  if (stationSections.length !== 1) {
    return invalid(
      'El circuito debe incluir exactamente una sección titulada "Estaciones: tareas y organización".',
    );
  }

  if (
    stationItems.length !==
    logisticsPlan.stations
  ) {
    return invalid(
      `El circuito declara ${logisticsPlan.stations} estaciones, pero la sección "Estaciones: tareas y organización" desarrolla ${stationItems.length}. Cada estación debe aparecer exactamente una vez.`,
    );
  }

  const stationNumbers =
    stationItems.map((item) => {
      const match = normalizeText(
        item,
      ).match(
        /estacion\s+(\d+)\b/,
      );

      return match
        ? Number.parseInt(
            match[1],
            10,
          )
        : 0;
    });

  const uniqueStationNumbers =
    new Set(stationNumbers);

  for (
    let stationNumber = 1;
    stationNumber <=
      logisticsPlan.stations;
    stationNumber += 1
  ) {
    if (
      !uniqueStationNumbers.has(
        stationNumber,
      )
    ) {
      return invalid(
        `Falta desarrollar la Estación ${stationNumber} dentro de la sección única de estaciones.`,
      );
    }
  }

  const hasWrittenStationRotation =
    /\b(?:rotacion de estaciones|ruta|recorrido)\b/.test(
      formatText,
    ) &&
    /\b(?:pasan|avanzan|cambian|rotan|se desplazan)\b/.test(
      formatText,
    );

  const hasArrowStationRoute =
    /\b(?:e|estacion)\s*\d+\s*(?:→|->|⇒|a)\s*(?:e|estacion)\s*\d+\b/.test(
      formatText,
    );

  const hasStationRotation =
    hasWrittenStationRotation ||
    hasArrowStationRoute;

  if (!hasStationRotation) {
    return invalid(
      "El circuito debe describir una ruta explícita de rotación para que todos los grupos cambien de estación simultáneamente.",
    );
  }

  if (
    logisticsPlan.stations === 4 &&
    !/\b(?:4|cuatro)\s+ciclos\b/.test(
      formatText,
    )
  ) {
    return invalid(
      "Un circuito de cuatro estaciones debe organizar exactamente cuatro ciclos iguales para que todos los grupos recorran las cuatro estaciones.",
    );
  }

  return {
    valid: true,
  };
}

export function validateGeneratedGame(
  formData: AIFormData,
  content: GeneratedAIContent,
): GameValidationResult {
  if (formData.toolId !== "game") {
    return {
      valid: true,
    };
  }

  if (content.rubric != null) {
    return invalid(
      'Para Inventar un juego, el campo "rubric" debe ser null.',
    );
  }

  if (content.exam != null) {
    return invalid(
      'Para Inventar un juego, el campo "exam" debe ser null.',
    );
  }

  const requiredSections =
    findRequiredSections(content);

  if (!Array.isArray(requiredSections)) {
    return requiredSections;
  }

  const visibleText =
    getVisibleText(content);

  const forbiddenInternalTerms =
    /\b(?:logisticsplan|durationplan|collisionriskcontrolled|fixed\s+target|restriccion de campos|detalles faltantes)\b/;

  if (
    forbiddenInternalTerms.test(
      visibleText,
    )
  ) {
    return invalid(
      "El contenido visible incluye términos internos del esquema. Expresa la organización únicamente con lenguaje pedagógico natural.",
    );
  }

  const lifecycleValidation =
    validateLifecycle(
      requiredSections[2],
    );

  if (!lifecycleValidation.valid) {
    return lifecycleValidation;
  }

  const variantsValidation =
    validateVariants(
      requiredSections[4],
    );

  if (!variantsValidation.valid) {
    return variantsValidation;
  }

  const variantTimingValidation =
    validateVariantTiming(
      requiredSections[4],
    );

  if (!variantTimingValidation.valid) {
    return variantTimingValidation;
  }

  const feedbackValidation =
    validateFeedbackFeasibility(
      requiredSections[2],
      content,
    );

  if (!feedbackValidation.valid) {
    return feedbackValidation;
  }

  const evaluationValidation =
    validateEvaluation(
      requiredSections[5],
    );

  if (!evaluationValidation.valid) {
    return evaluationValidation;
  }

  const safetyValidation =
    validateSafety(
      requiredSections[6],
    );

  if (!safetyValidation.valid) {
    return safetyValidation;
  }

  const eliminationValidation =
    validateNoPermanentElimination(
      visibleText,
    );

  if (!eliminationValidation.valid) {
    return eliminationValidation;
  }

  const terminologyValidation =
    validateSpanishTerminology(
      visibleText,
    );

  if (!terminologyValidation.valid) {
    return terminologyValidation;
  }

  const participationValidation =
    validateScarceBallParticipation(
      formData,
      content,
      visibleText,
    );

  if (!participationValidation.valid) {
    return participationValidation;
  }

  return validateGameFormat(
    content,
    visibleText,
  );
}
