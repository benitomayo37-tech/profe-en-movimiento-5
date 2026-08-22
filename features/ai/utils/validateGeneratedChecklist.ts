import type {
  AIFormData,
  GeneratedAIContent,
} from "@/features/ai/types/ai";

export interface ChecklistValidationResult {
  valid: boolean;
  message?: string;
}

const MINIMUM_INDICATORS = 6;
const MAXIMUM_INDICATORS = 12;

const REQUIRED_SECTIONS = [
  {
    normalized: "proposito e instrucciones de aplicacion",
    display: "Propósito e instrucciones de aplicación",
  },
  {
    normalized: "indicadores observables",
    display: "Indicadores observables",
  },
  {
    normalized: "escala o forma de registro",
    display: "Escala o forma de registro",
  },
  {
    normalized: "interpretacion y retroalimentacion",
    display: "Interpretación y retroalimentación",
  },
] as const;

function normalizeText(value: string): string {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/\s+/g, " ")
    .trim();
}

function normalizeSectionTitle(value: string): string {
  return normalizeText(
    removeOptionalSectionNumber(value),
  )
    .replace(/[.:;]+$/g, "")
    .trim();
}

function removeOptionalSectionNumber(
  value: string,
): string {
  return value
    .trim()
    .replace(
      /^(?:secci[oó]n\s+)?\d+\s*[.):\-–—]\s*/i,
      "",
    )
    .trim();
}

function getVisibleSectionTitle(
  value: string,
): string {
  return removeOptionalSectionNumber(
    value,
  )
    .replace(/[.:;]+$/g, "")
    .trim();
}

function invalid(message: string): ChecklistValidationResult {
  return {
    valid: false,
    message,
  };
}

function getIndicatorLabel(item: string): string {
  const normalizedItem = normalizeText(item);
  const selectionStart = normalizedItem.search(
    /\[\s*\]\s*si\b/,
  );
  const label =
    selectionStart >= 0
      ? normalizedItem.slice(0, selectionStart)
      : normalizedItem;

  return label
    .replace(/[\u2014\u2013-]\s*$/, "")
    .trim();
}

function isIdentificationItem(
  item: string,
): boolean {
  const normalizedItem =
    normalizeText(item);

  return (
    /^nombre(?:\s+del)?\s+(?:estudiante|alumno)\b/.test(
      normalizedItem,
    ) ||
    normalizedItem.startsWith(
      "identificacion del registro",
    ) ||
    normalizedItem.startsWith(
      "espacios para identificacion",
    ) ||
    (
      /\bnombre(?:\s+del)?\s+(?:estudiante|alumno)\b/.test(
        normalizedItem,
      ) &&
      /\b(?:curso|grado)\b/.test(
        normalizedItem,
      ) &&
      /\bfecha\b/.test(
        normalizedItem,
      )
    )
  );
}

function getVisibleText(content: GeneratedAIContent): string {
  return normalizeText(
    [
      content.title,
      content.introduction,
      ...content.sections.flatMap((section) => [
        section.title,
        ...section.content,
      ]),
    ].join(" "),
  );
}

function validateStructure(
  content: GeneratedAIContent,
): ChecklistValidationResult {
  if (content.rubric != null) {
    return invalid(
      'Para Crear lista de cotejo, el campo "rubric" debe ser null.',
    );
  }

  if (content.exam != null) {
    return invalid(
      'Para Crear lista de cotejo, el campo "exam" debe ser null.',
    );
  }

  if (content.logisticsPlan != null) {
    return invalid(
      'Para Crear lista de cotejo, el campo "logisticsPlan" debe ser null.',
    );
  }

  if (content.sections.length !== REQUIRED_SECTIONS.length) {
    return invalid(
      "La lista de cotejo debe incluir exactamente cuatro secciones visibles: Propósito e instrucciones de aplicación, Indicadores observables, Escala o forma de registro e Interpretación y retroalimentación.",
    );
  }

  for (
    let index = 0;
    index < REQUIRED_SECTIONS.length;
    index += 1
  ) {
    const section = content.sections[index];
    const actualTitle = normalizeSectionTitle(section.title);
    const expectedSection = REQUIRED_SECTIONS[index];

    if (actualTitle !== expectedSection.normalized) {
      return invalid(
        `La sección ${index + 1} debe titularse "${expectedSection.display}" y conservar el orden solicitado.`,
      );
    }

    if (
      getVisibleSectionTitle(
        section.title,
      ) !== expectedSection.display
    ) {
      return invalid(
        `Escribe el encabezado visible "${expectedSection.display}", respetando mayúsculas y tildes. Puede llevar delante únicamente el número de la sección.`,
      );
    }

    if (
      section.content.length === 0 ||
      section.content.every((item) => !item.trim())
    ) {
      return invalid(
        `La sección "${section.title}" no puede estar vacía.`,
      );
    }
  }

  return {
    valid: true,
  };
}

function validateIndicators(
  content: GeneratedAIContent,
): ChecklistValidationResult {
  const indicators = content.sections[1].content.filter(
    (item) =>
      item.trim().length > 0 &&
      !isIdentificationItem(item),
  );

  if (
    indicators.length < MINIMUM_INDICATORS ||
    indicators.length > MAXIMUM_INDICATORS
  ) {
    return invalid(
      `La lista de cotejo debe contener entre ${MINIMUM_INDICATORS} y ${MAXIMUM_INDICATORS} indicadores observables; se generaron ${indicators.length}.`,
    );
  }

  const selectionPattern =
    /\[\s*\]\s*si\s*\|\s*\[\s*\]\s*en\s+proceso\s*\|\s*\[\s*\]\s*no\b/g;

  const labels = new Set<string>();

  for (const indicator of indicators) {
    const normalizedIndicator = normalizeText(indicator);
    const selectionMatches = [
      ...normalizedIndicator.matchAll(selectionPattern),
    ];

    if (selectionMatches.length !== 1) {
      return invalid(
        `El indicador "${indicator.slice(0, 160)}" debe incluir exactamente una escala con el formato [ ] Sí | [ ] En proceso | [ ] No.`,
      );
    }

    const label = getIndicatorLabel(indicator);

    if (!label || label.length < 12) {
      return invalid(
        `El elemento "${indicator.slice(
          0,
          160,
        )}" no presenta una conducta observable concreta antes de la escala. Escribe, por ejemplo: "Mantiene el balón frente al pecho al iniciar el pase — [ ] Sí | [ ] En proceso | [ ] No".`,
      );
    }

    if (labels.has(label)) {
      return invalid(
        `El indicador "${label}" está repetido. Cada conducta debe aparecer una sola vez.`,
      );
    }

    labels.add(label);

    if (
      /\b(?:lo hace bien|comprende|conoce|sabe|participa adecuadamente)\b/.test(
        label,
      )
    ) {
      return invalid(
        `El indicador "${label}" utiliza una expresión ambigua. Debe describir una conducta visible y verificable.`,
      );
    }
  }

  return {
    valid: true,
  };
}

function validateScaleSection(
  content: GeneratedAIContent,
): ChecklistValidationResult {
  const scaleItems = content.sections[2].content.filter(
    (item) => item.trim().length > 0,
  );
  const scaleText = normalizeText(scaleItems.join(" "));

  if (scaleItems.length > 3) {
    return invalid(
      "La sección Escala o forma de registro debe contener como máximo tres elementos breves.",
    );
  }

  if (
    !/\bsi\b/.test(scaleText) ||
    !/\ben proceso\b/.test(scaleText) ||
    !/\bno\b/.test(scaleText)
  ) {
    return invalid(
      "La escala debe explicar claramente el significado de Sí, En proceso y No.",
    );
  }

  const indicatorLabels =
    content.sections[1].content
      .filter(
        (item) =>
          !isIdentificationItem(
            item,
          ),
      )
      .map(getIndicatorLabel);

  for (const label of indicatorLabels) {
    if (label.length >= 12 && scaleText.includes(label)) {
      return invalid(
        `La sección de escala repite el indicador "${label}". Los indicadores deben aparecer exclusivamente en Indicadores observables.`,
      );
    }
  }

  return {
    valid: true,
  };
}

function validateInterpretationSection(
  content: GeneratedAIContent,
): ChecklistValidationResult {
  const indicatorCount = content.sections[1].content.filter(
    (item) =>
      /\[\s*\]\s*s[ií]\s*\|\s*\[\s*\]\s*en\s+proceso\s*\|\s*\[\s*\]\s*no\b/i.test(
        item,
      ),
  ).length;
  const interpretationText = normalizeText(
    content.sections[3].content.join(" "),
  );

  if (
    !/\bsi\s*=\s*1\s+punto\b/.test(interpretationText) ||
    !/\ben proceso\s*=\s*0[,.]5\s+puntos\b/.test(
      interpretationText,
    ) ||
    !/\bno\s*=\s*0\s+puntos\b/.test(interpretationText)
  ) {
    return invalid(
      "La interpretación debe asignar Sí = 1 punto, En proceso = 0,5 puntos y No = 0 puntos.",
    );
  }

  if (
    !interpretationText.includes(
      `puntaje maximo: ${indicatorCount} puntos`,
    )
  ) {
    return invalid(
      `La interpretación debe indicar un puntaje máximo de ${indicatorCount} puntos, igual a la cantidad de indicadores.`,
    );
  }

  if (
    !interpretationText.includes("regla de tres") ||
    !interpretationText.includes("puntaje obtenido x 10") ||
    !new RegExp(`(?:÷|/)\\s*${indicatorCount}\\b`).test(
      interpretationText,
    )
  ) {
    return invalid(
      `Incluye la regla de tres completa: calificación final = (puntaje obtenido x 10) ÷ ${indicatorCount}.`,
    );
  }

  if (
    !/\bejemplo\b/.test(interpretationText) ||
    !/\bsi\b/.test(interpretationText) ||
    !/\ben proceso\b/.test(interpretationText) ||
    !/\bno\b/.test(interpretationText) ||
    !/\/10\b/.test(interpretationText)
  ) {
    return invalid(
      "La interpretación debe incluir un ejemplo resuelto con cantidades de Sí, En proceso y No y una calificación final sobre 10.",
    );
  }

  return {
    valid: true,
  };
}

function validateApplication(
  formData: AIFormData,
  content: GeneratedAIContent,
): ChecklistValidationResult {
  const visibleText = getVisibleText(content);
  const applicationText = normalizeText(
    content.sections[0].content.join(" "),
  );

  const identificationItems =
    content.sections
      .flatMap(
        (section) =>
          section.content,
      )
      .filter(isIdentificationItem);

  const identificationHasScale =
    identificationItems.some(
      (item) =>
        /\[\s*\]\s*si\s*\|\s*\[\s*\]\s*en\s+proceso\s*\|\s*\[\s*\]\s*no\b/.test(
          normalizeText(item),
        ),
    );

  if (identificationHasScale) {
    return invalid(
      "Los espacios de identificación para nombre, curso y fecha no deben llevar la escala Sí / En proceso / No. Esa escala pertenece exclusivamente a cada indicador observable.",
    );
  }

  if (
    /\brotaciones?\s+y\s+tiempos?\s+operativos?\s*:\s*(?:ver|vease)\b/.test(
      applicationText,
    )
  ) {
    return invalid(
      'La instrucción "Rotaciones y tiempos operativos" está incompleta. Debe indicar de manera concreta cuánto dura cada turno, cómo se alternan las parejas y qué función activa cumple cada estudiante.',
    );
  }

  if (
    !/\bnombre\b/.test(visibleText) ||
    !/\b(?:curso|grado)\b/.test(visibleText) ||
    !/\bfecha\b/.test(visibleText)
  ) {
    return invalid(
      "La lista de cotejo debe incluir espacios de identificación para nombre del estudiante, curso o grado y fecha.",
    );
  }

  if (
    /\b(?:representante|portavoz)\b[^.!?]{0,140}\b(?:califica|evalua|valora|asigna)\b/.test(
      applicationText,
    )
  ) {
    return invalid(
      "La lista de cotejo no puede utilizar un representante para asignar una valoración general al grupo.",
    );
  }

  const createsPassiveWaiting =
    /\b(?:fila|cola|espera pasiva|sin actividad|inactivos?|inactivas?)\b/.test(
      applicationText,
    ) ||
    /\b(?:esperan|aguardan)\s+(?:su\s+)?turno\b/.test(applicationText);

  if (createsPassiveWaiting) {
    return invalid(
      "La aplicación de la lista de cotejo deja estudiantes esperando, en filas o sin una función activa.",
    );
  }

  if (
    /\bdurante\s+(?:su|el|la\s+mayoria\s+del)\s+turno\b/.test(
      visibleText,
    ) ||
    /\bsin\s+permanecer\s+inactiv[oa]\b/.test(visibleText) ||
    /\bquienes\s+esperan\b/.test(visibleText)
  ) {
    return invalid(
      "Describe la participación con lenguaje positivo y observable, sin expresiones como durante su turno, sin permanecer inactivo o quienes esperan.",
    );
  }

  const hasTenStudentsAndOneBallPerZone =
    /\b(?:cada\s+zona\s+(?:agrupa|reune|tiene)|por\s+zona)\b[^.!?]{0,80}\b10\s+estudiantes\b/.test(
      applicationText,
    ) &&
    /\b1\s+balon\s+por\s+zona\b/.test(applicationText);

  if (
    hasTenStudentsAndOneBallPerZone &&
    (
      !/\b1\s+pasador\b/.test(applicationText) ||
      !/\b1\s+receptor\b/.test(applicationText) ||
      !/\b8\s+participantes\s+sin\s+balon\b/.test(applicationText) ||
      !/\b30\s+segundos\b/.test(applicationText)
    )
  ) {
    return invalid(
      "Con 10 estudiantes y 1 balón por zona, declara microturnos de 30 segundos y una distribución exacta de 1 pasador, 1 receptor y 8 participantes sin balón con funciones motrices concretas.",
    );
  }

  if (
    /\b2\s+observacion\s+tecnica\s+movil\s*,\s*2\s+postura\s+de\s+recepcion\b/.test(
      applicationText,
    )
  ) {
    return invalid(
      'Redacta las funciones con concordancia completa: "2 participantes en observación técnica móvil, 2 en postura de recepción...".',
    );
  }

  if (/\buno\s+a\s+uno\b/.test(applicationText)) {
    return invalid(
      'En coevaluación escribe "por un compañero asignado" y no utilices la expresión "uno a uno".',
    );
  }

  if (/\btiempos\s*\(\s*coherentes?\s+con\s+el\s*\)/.test(applicationText)) {
    return invalid(
      'Presenta los bloques temporales con el encabezado "Distribución del tiempo:".',
    );
  }

  if (
    hasTenStudentsAndOneBallPerZone &&
    /\b4\s+minutos?\s+de\s+practica\s+activa\s+por\s+pareja\b/.test(
      applicationText,
    )
  ) {
    return invalid(
      "Cinco parejas con un solo balón no pueden recibir cuatro minutos de uso individual dentro del mismo ciclo. Utiliza microturnos breves y rotación continua de funciones.",
    );
  }

  const concentratesFinalEvaluation =
    /\b(?:demostracion|ejecucion|evaluacion|prueba)\s+final\b[^.!?]{0,160}\b(?:individual|uno\s+por\s+uno|cada\s+estudiante)\b/.test(
      applicationText,
    ) ||
    /\b(?:individual|uno\s+por\s+uno|cada\s+estudiante)\b[^.!?]{0,160}\b(?:demostracion|ejecucion|evaluacion|prueba)\s+final\b/.test(
      applicationText,
    );

  if (concentratesFinalEvaluation) {
    return invalid(
      "La observación debe integrarse durante la práctica y no concentrarse en una demostración final individual.",
    );
  }

  if (/\bfeedback\b/.test(visibleText)) {
    return invalid(
      'La lista de cotejo debe utilizar "retroalimentación" y no el anglicismo "feedback".',
    );
  }

  if (
    formData.includeDua === false &&
    /\b(?:estrategias?\s+dua|principios?\s+dua|accion\s+y\s+expresion|compromiso\s*\/\s*motivacion)\b/.test(
      visibleText,
    )
  ) {
    return invalid(
      "No se solicitó DUA; la lista de cotejo no debe incluir estrategias ni principios DUA.",
    );
  }

  return {
    valid: true,
  };
}

export function validateGeneratedChecklist(
  formData: AIFormData,
  content: GeneratedAIContent,
): ChecklistValidationResult {
  if (formData.toolId !== "checklist") {
    return {
      valid: true,
    };
  }

  const structureValidation = validateStructure(content);

  if (!structureValidation.valid) {
    return structureValidation;
  }

  const indicatorValidation = validateIndicators(content);

  if (!indicatorValidation.valid) {
    return indicatorValidation;
  }

  const scaleValidation = validateScaleSection(content);

  if (!scaleValidation.valid) {
    return scaleValidation;
  }

  const interpretationValidation =
    validateInterpretationSection(content);

  if (!interpretationValidation.valid) {
    return interpretationValidation;
  }

  return validateApplication(formData, content);
}
