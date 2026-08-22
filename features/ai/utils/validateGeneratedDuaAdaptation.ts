import type {
  AIFormData,
  GeneratedAIContent,
} from "@/features/ai/types/ai";

export interface DuaAdaptationValidationResult {
  valid: boolean;
  message?: string;
}

const EXPECTED_SECTION_TITLES = [
  "actividad y proposito que se adapta",
  "barreras previsibles",
  "estrategias de representacion",
  "estrategias de accion y expresion",
  "estrategias de compromiso y motivacion",
  "aplicacion practica y evaluacion inclusiva",
] as const;

interface StrategySectionRule {
  title: string;
  expectedPrefix: RegExp;
  displayPrefix: string;
}

const STRATEGY_SECTION_RULES: StrategySectionRule[] = [
  {
    title:
      "estrategias de representacion",
    expectedPrefix:
      /^representacion\b/,
    displayPrefix:
      "REPRESENTACIÓN —",
  },
  {
    title:
      "estrategias de accion y expresion",
    expectedPrefix:
      /^accion\s+y\s+expresion\b/,
    displayPrefix:
      "ACCIÓN Y EXPRESIÓN —",
  },
  {
    title:
      "estrategias de compromiso y motivacion",
    expectedPrefix:
      /^compromiso\s*(?:\/|y)?\s*motivacion\b/,
    displayPrefix:
      "COMPROMISO / MOTIVACIÓN —",
  },
];

function normalizeText(
  value: string,
): string {
  return value
    .normalize("NFD")
    .replace(
      /[\u0300-\u036f]/g,
      "",
    )
    .toLowerCase()
    .replace(/[“”«»"'`]/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

function normalizeSectionTitle(
  value: string,
): string {
  const normalizedTitle =
    normalizeText(value)
      .replace(
        /^\s*\d+\s*[.)\-:]\s*/,
        "",
      )
      .trim();

  const isEngagementTitle =
    /^estrategias\s+de\s+compromiso\s+(?:y|o)\s+motivacion$/.test(
      normalizedTitle,
    ) ||
    /^estrategias\s+de\s+compromiso\s*\/\s*motivacion$/.test(
      normalizedTitle,
    );

  if (isEngagementTitle) {
    return "estrategias de compromiso y motivacion";
  }

  return normalizedTitle;
}

function invalid(
  message: string,
): DuaAdaptationValidationResult {
  return {
    valid: false,
    message,
  };
}

function getVisibleContentText(
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

function findSectionByNormalizedTitle(
  content: GeneratedAIContent,
  normalizedTitle: string,
) {
  return content.sections.find(
    (section) =>
      normalizeSectionTitle(
        section.title,
      ) === normalizedTitle,
  );
}

function validateSectionStructure(
  content: GeneratedAIContent,
): DuaAdaptationValidationResult {
  if (
    content.sections.length !==
    EXPECTED_SECTION_TITLES.length
  ) {
    return invalid(
      `La adaptación DUA debe incluir exactamente ${EXPECTED_SECTION_TITLES.length} secciones. Se generaron ${content.sections.length}.`,
    );
  }

  for (
    let index = 0;
    index <
    EXPECTED_SECTION_TITLES.length;
    index += 1
  ) {
    const expectedTitle =
      EXPECTED_SECTION_TITLES[index];

    const generatedSection =
      content.sections[index];

    if (!generatedSection) {
      return invalid(
        `Falta la sección ${index + 1}: "${expectedTitle}".`,
      );
    }

    const generatedTitle =
      normalizeSectionTitle(
        generatedSection.title,
      );

    if (
      generatedTitle !==
      expectedTitle
    ) {
      return invalid(
        `La sección ${index + 1} debe titularse "${expectedTitle}" y conservar el orden solicitado.`,
      );
    }

    if (
      generatedSection.content.length ===
      0
    ) {
      return invalid(
        `La sección "${generatedSection.title}" no puede estar vacía.`,
      );
    }
  }

  return {
    valid: true,
  };
}

function extractIndependentBarriers(
  sectionContent: string[],
): string[] {
  if (
    sectionContent.length >= 3 &&
    sectionContent.length <= 5
  ) {
    return sectionContent;
  }

  const combinedText =
    sectionContent
      .join(" ")
      .trim();

  if (!combinedText) {
    return [];
  }

  const markerPattern =
    /(?:^|\s)(?:barrera\s*)?\d+\s*[.)\-:]\s*/gi;

  const markers = Array.from(
    combinedText.matchAll(
      markerPattern,
    ),
  );

  if (
    markers.length >= 3 &&
    markers.length <= 5
  ) {
    return markers
      .map(
        (
          marker,
          index,
        ) => {
          const markerIndex =
            marker.index ?? 0;

          const start =
            markerIndex +
            marker[0].length;

          const nextMarker =
            markers[index + 1];

          const end =
            nextMarker?.index ??
            combinedText.length;

          return combinedText
            .slice(start, end)
            .trim();
        },
      )
      .filter(Boolean);
  }

  const semicolonItems =
    combinedText
      .split(/\s*;\s*/)
      .map((item) =>
        item.trim(),
      )
      .filter(Boolean);

  if (
    semicolonItems.length >= 3 &&
    semicolonItems.length <= 5
  ) {
    return semicolonItems;
  }

  return sectionContent;
}

function validateBarrierSection(
  content: GeneratedAIContent,
): DuaAdaptationValidationResult {
  const barrierSection =
    findSectionByNormalizedTitle(
      content,
      "barreras previsibles",
    );

  if (!barrierSection) {
    return invalid(
      'La adaptación DUA debe incluir la sección "Barreras previsibles".',
    );
  }

  const independentBarriers =
    extractIndependentBarriers(
      barrierSection.content,
    );

  const barrierCount =
    independentBarriers.length;

  if (
    barrierCount < 3 ||
    barrierCount > 5
  ) {
    return invalid(
      `La sección "Barreras previsibles" debe incluir entre 3 y 5 barreras independientes. Se identificaron ${barrierCount}.`,
    );
  }

  const diagnosticPattern =
    /\b(?:diagnostico|diagnosticado|trastorno|enfermedad|discapacidad)\b/;

  for (
    const barrier of
      independentBarriers
  ) {
    const normalizedBarrier =
      normalizeText(barrier);

    if (
      diagnosticPattern.test(
        normalizedBarrier,
      )
    ) {
      return invalid(
        `La barrera "${barrier.slice(
          0,
          160,
        )}" atribuye una condición o diagnóstico no proporcionado. Describe la barrera desde la actividad o el entorno.`,
      );
    }

    if (
      normalizedBarrier.length < 25
    ) {
      return invalid(
        `La barrera "${barrier}" es demasiado breve. Debe explicar concretamente qué aspecto de la actividad puede dificultar el acceso, la participación o la demostración del aprendizaje.`,
      );
    }
  }

  return {
    valid: true,
  };
}

function validateStrategyCompleteness(
  strategy: string,
): DuaAdaptationValidationResult {
  const normalizedStrategy =
    normalizeText(strategy);
  if (strategy.length > 850) {
    return invalid(
      `La estrategia "${strategy.slice(
        0,
        140,
      )}" es demasiado extensa. Debe presentar barrera, acción docente, opción, momento y evidencia de forma compacta.`,
    );
  }
  const mentionsBarrier =
    /\b(?:barrera|atiende|dificultad|obstaculo)\b/.test(
      normalizedStrategy,
    );

  const mentionsTeacher =
    /\b(?:docente|profesor|profesora|orientador)\b/.test(
      normalizedStrategy,
    );

  const mentionsStudentOption =
    /\b(?:estudiante|estudiantado|participante|alumno|alumna)\b/.test(
      normalizedStrategy,
    ) &&
    /\b(?:opcion|elegir|escoger|podra|puede|alternativa)\b/.test(
      normalizedStrategy,
    );

  const mentionsMoment =
    /\b(?:antes|inicio|al comenzar|durante|desarrollo|en cada|al finalizar|cierre|momento)\b/.test(
      normalizedStrategy,
    );

  const mentionsEvidence =
    /\b(?:evidencia|observable|se observa|comprobar|verificar|demuestra)\b/.test(
      normalizedStrategy,
    );

  if (!mentionsBarrier) {
    return invalid(
      `La estrategia "${strategy.slice(
        0,
        160,
      )}" no identifica claramente la barrera que atiende.`,
    );
  }

  if (!mentionsTeacher) {
    return invalid(
      `La estrategia "${strategy.slice(
        0,
        160,
      )}" no explica qué hará el docente.`,
    );
  }

  if (!mentionsStudentOption) {
    return invalid(
      `La estrategia "${strategy.slice(
        0,
        160,
      )}" no ofrece una opción concreta al estudiante.`,
    );
  }

  if (!mentionsMoment) {
    return invalid(
      `La estrategia "${strategy.slice(
        0,
        160,
      )}" no indica en qué momento se aplicará.`,
    );
  }

  if (!mentionsEvidence) {
    return invalid(
      `La estrategia "${strategy.slice(
        0,
        160,
      )}" no incluye una evidencia observable para comprobar su utilidad.`,
    );
  }

  return {
    valid: true,
  };
}

function validateStrategySections(
  content: GeneratedAIContent,
): DuaAdaptationValidationResult {
  for (
    const rule of
      STRATEGY_SECTION_RULES
  ) {
    const strategySection =
      findSectionByNormalizedTitle(
        content,
        rule.title,
      );

    if (!strategySection) {
      return invalid(
        `Falta la sección "${rule.title}".`,
      );
    }

    if (
      strategySection.content.length !==
      2
    ) {
      return invalid(
        `La sección "${strategySection.title}" debe incluir exactamente 2 estrategias. Se generaron ${strategySection.content.length}.`,
      );
    }

    for (
      const strategy of
        strategySection.content
    ) {
      const normalizedStrategy =
        normalizeText(strategy);

      if (
        !rule.expectedPrefix.test(
          normalizedStrategy,
        )
      ) {
        return invalid(
          `Cada estrategia de "${strategySection.title}" debe comenzar exactamente con "${rule.displayPrefix}".`,
        );
      }

      const completenessValidation =
        validateStrategyCompleteness(
          strategy,
        );

      if (
        !completenessValidation.valid
      ) {
        return completenessValidation;
      }
    }
  }

  return {
    valid: true,
  };
}

function validateApplicationSection(
  content: GeneratedAIContent,
): DuaAdaptationValidationResult {
  const applicationSection =
    findSectionByNormalizedTitle(
      content,
      "aplicacion practica y evaluacion inclusiva",
    );

  if (!applicationSection) {
    return invalid(
      'Falta la sección "Aplicación práctica y evaluación inclusiva".',
    );
  }

    if (
    applicationSection.content.length !==
    5
  ) {
    return invalid(
      `La sección "Aplicación práctica y evaluación inclusiva" debe contener exactamente 5 elementos breves. Se generaron ${applicationSection.content.length}.`,
    );
  }

  const applicationItemPrefixes = [
    /^integracion\b/,
    /^organizacion activa\b/,
    /^evidencias observables\b/,
    /^retroalimentacion\b/,
    /^seguridad\b/,
  ];

  for (
    let index = 0;
    index <
    applicationItemPrefixes.length;
    index += 1
  ) {
    const item =
      applicationSection.content[index];

    if (!item) {
      return invalid(
        "Falta uno de los cinco elementos de aplicación práctica.",
      );
    }

    const normalizedItem =
      normalizeText(item);

    if (
      !applicationItemPrefixes[
        index
      ].test(normalizedItem)
    ) {
      return invalid(
        `El elemento ${index + 1} de la aplicación práctica no utiliza el encabezado obligatorio.`,
      );
    }

    if (item.length > 650) {
      return invalid(
        `El elemento "${item.slice(
          0,
          120,
        )}" es demasiado extenso y debe resumirse.`,
      );
    }
  }

  const applicationText =
    normalizeText(
      applicationSection.content.join(
        " ",
      ),
    );

 const evidenceItem =
  normalizeText(
    applicationSection.content[2] ?? "",
  );

const evidenceDescription =
  evidenceItem
    .replace(
      /^evidencias observables\s*[:—-]?\s*/,
      "",
    )
    .trim();

const hasObservableEvidence =
  evidenceDescription.length >= 25 &&
  /\b(?:ejecucion|tecnica|control|precision|coordinacion|decision|participacion|cooperacion|seguridad|desempeno|progreso|logro|criterios?|evidencias?|observables?|demuestra|ejecuta|realiza|mantiene|aplica|identifica|selecciona|ajusta)\b/.test(
    evidenceDescription,
  );

if (!hasObservableEvidence) {
  return invalid(
    'El elemento "Evidencias observables" debe describir al menos una conducta, ejecución o criterio concreto que pueda observarse durante la actividad.',
  );
}

  if (
    !/\bretroalimentacion\b/.test(
      applicationText,
    )
  ) {
    return invalid(
      "La aplicación práctica debe explicar cómo se ofrecerá retroalimentación durante la actividad.",
    );
  }

  if (
    !/\b(?:seguridad|seguro|riesgo|colision|distancia)\b/.test(
      applicationText,
    )
  ) {
    return invalid(
      "La aplicación práctica debe incluir medidas concretas de seguridad.",
    );
  }

   const textWithoutNegatedWaiting =
    applicationText
      .replace(
        /\b(?:sin|evitar|evita|evitando)\s+(?:la\s+)?espera(?:s)?\s+pasiva(?:s)?\b/g,
        "",
      )
      .replace(
        /\bno\s+(?:hay|existe(?:n)?)\s+(?:la\s+|ninguna\s+)?espera(?:s)?\s+pasiva(?:s)?\b/g,
        "",
      )
      .replace(
        /\b(?:sin|evitar|evita|evitando)\s+(?:las?\s+)?filas?\b/g,
        "",
      )
      .replace(
        /\bno\s+se\s+(?:forman|organizan|utilizan)\s+(?:las?\s+)?filas?\b/g,
        "",
      )
      .replace(
        /\bningun[oa]?\s+(?:estudiante|alumno|participante)\s+inactiv[oa]\b/g,
        "",
      )
      .replace(
        /\bnadie\s+(?:queda|permanece|esta)\s+inactiv[oa]\b/g,
        "",
      )
      .replace(
        /\b(?:todos?|todas?)\s+(?:los\s+|las\s+)?(?:estudiantes?|alumnos?|participantes?)\s+(?:mantienen|permanecen|participan)\s+(?:con\s+)?(?:una\s+)?(?:funcion\s+)?activ[oa]s?\b/g,
        "",
      );

  const passiveWaitingPatterns = [
    /\b(?:otros?|otras?)\s+(?:estudiantes?|alumnos?|participantes?)?\s*esperan\b/,
    /\b(?:estudiantes?|alumnos?|participantes?)\s+(?:esperan?|aguardan?)\s+(?:su\s+)?turno\b/,
    /\b(?:grupo|equipo)\s+(?:[a-z]|\d+)\s+espera\b/,
    /\ben\s+espera\b/,
    /\b(?:forman?|permanecen?|se\s+organizan)\s+en\s+filas?\b/,
    /\b(?:estudiantes?|alumnos?|participantes?)\s+(?:quedan?|permanecen?|estan?)\s+(?:sin actividad|inactiv[oa]s?)\b/,
  ];

  const hasRealPassiveWaiting =
    passiveWaitingPatterns.some(
      (pattern) =>
        pattern.test(
          textWithoutNegatedWaiting,
        ),
    );

  if (hasRealPassiveWaiting) {
    return invalid(
      "La aplicación DUA deja estudiantes esperando, en filas o sin una función activa.",
    );
  }

  return {
    valid: true,
  };
}

function validateForbiddenContent(
  content: GeneratedAIContent,
): DuaAdaptationValidationResult {
  const visibleText =
    getVisibleContentText(content);

  const visibleColorPattern =
    /(?:\brepresentacion\b[^.!?]{0,50}\bmorado\b|\bmorado\b[^.!?]{0,50}\brepresentacion\b|\baccion\s+y\s+expresion\b[^.!?]{0,50}\bazul\b|\bazul\b[^.!?]{0,50}\baccion\s+y\s+expresion\b|\bcompromiso(?:\s*\/\s*|\s+y\s+)motivacion\b[^.!?]{0,50}\bverde\b|\bverde\b[^.!?]{0,50}\bcompromiso(?:\s*\/\s*|\s+y\s+)motivacion\b)/;

  if (
    visibleColorPattern.test(
      visibleText,
    )
  ) {
    return invalid(
      "El contenido visible no debe escribir los nombres de colores asociados con los principios DUA. La interfaz aplicará la identificación visual.",
    );
  }

  const manualGuidancePattern =
    /\b(?:guia|asistencia|ayuda)\s+manual\b|\b(?:sujetar|manipular|mover)\b[^.!?]{0,70}\b(?:brazos?|piernas?|cuerpo)\b/;

  if (
    manualGuidancePattern.test(
      visibleText,
    )
  ) {
    return invalid(
      "La adaptación DUA no debe proponer guía manual, manipulación corporal ni sujeción de brazos o piernas.",
    );
  }

  const replacesMotorEvidencePattern =
    /\b(?:sustituir|reemplazar|en lugar de)\b[^.!?]{0,120}\b(?:ejecucion|evidencia motriz|actividad practica)\b[^.!?]{0,120}\b(?:explicacion|dibujo|observacion|respuesta verbal)\b/;

  if (
    replacesMotorEvidencePattern.test(
      visibleText,
    )
  ) {
    return invalid(
      "La adaptación puede ofrecer diferentes formas de acceso y ejecución, pero no sustituir completamente una evidencia motriz esencial por una explicación, dibujo u observación.",
    );
  }

  const incompletePlaceholderPattern =
  /\b(?:x|xx|xxx)\s+(?:pases?|repeticiones?|intentos?|rondas?|minutos?|metros?)\b|\b(?:cantidad|numero)\s+por\s+definir\b/;

if (
  incompletePlaceholderPattern.test(
    visibleText,
  )
) {
  return invalid(
    "La adaptación DUA contiene una cantidad pendiente o un marcador sin completar. Todas las metas deben utilizar valores concretos.",
  );
}

const unnecessaryAnglicismPattern =
  /\b(?:coach|feedback)\b/;

if (
  unnecessaryAnglicismPattern.test(
    visibleText,
  )
) {
  return invalid(
    'La adaptación DUA debe utilizar vocabulario pedagógico en español. Escribe "observador orientador" y "retroalimentación".',
  );
}

  return {
    valid: true,
  };
}

export function validateGeneratedDuaAdaptation(
  formData: AIFormData,
  content: GeneratedAIContent,
): DuaAdaptationValidationResult {
  if (
    formData.toolId !==
    "dua-adaptation"
  ) {
    return {
      valid: true,
    };
  }

  const structureValidation =
    validateSectionStructure(
      content,
    );

  if (!structureValidation.valid) {
    return structureValidation;
  }

  const barrierValidation =
    validateBarrierSection(
      content,
    );

  if (!barrierValidation.valid) {
    return barrierValidation;
  }

  const strategyValidation =
    validateStrategySections(
      content,
    );

  if (!strategyValidation.valid) {
    return strategyValidation;
  }

  const applicationValidation =
    validateApplicationSection(
      content,
    );

  if (!applicationValidation.valid) {
    return applicationValidation;
  }

  return validateForbiddenContent(
    content,
  );
}