import type { AIFormData, GeneratedAIContent } from "@/features/ai/types/ai";

export interface RubricValidationResult {
  valid: boolean;
  message?: string;
}

const MINIMUM_CRITERIA = 4;
const MAXIMUM_CRITERIA = 6;

const RUBRIC_LEVEL_FIELDS = [
  "excellent",
  "good",
  "regular",
  "acceptable",
  "improvable",
] as const;

const REQUIRED_RUBRIC_SECTION_TITLES = [
  "proposito de la rubrica",
  "instrucciones de aplicacion",
  "forma de calcular o interpretar el resultado",
] as const;

function normalizeText(value: string): string {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim()
    .toLowerCase()
    .replace(/\s+/g, " ");
}

function createInvalidResult(message: string): RubricValidationResult {
  return {
    valid: false,
    message,
  };
}

function normalizeSectionTitle(value: string): string {
  return normalizeText(value)
    .replace(/[.:;]+$/g, "")
    .trim();
}

function validateRubricStructure(
  content: GeneratedAIContent,
): RubricValidationResult {
  if (!content.rubric) {
    return createInvalidResult(
      "La herramienta Crear rúbrica debe generar una rúbrica estructurada.",
    );
  }

  if (content.durationPlan != null || content.logisticsPlan != null) {
    return createInvalidResult(
      'Para Crear rúbrica, los campos "durationPlan" y "logisticsPlan" deben ser null.',
    );
  }

  if (content.exam != null) {
    return createInvalidResult(
      'Para Crear rúbrica, el campo "exam" debe ser null.',
    );
  }

  if (content.sections.length !== REQUIRED_RUBRIC_SECTION_TITLES.length) {
    return createInvalidResult(
      "La rúbrica debe incluir exactamente tres secciones visibles: Propósito de la rúbrica, Instrucciones de aplicación y Forma de calcular o interpretar el resultado.",
    );
  }

  for (
    let index = 0;
    index < REQUIRED_RUBRIC_SECTION_TITLES.length;
    index += 1
  ) {
    const section = content.sections[index];
    const actualTitle = normalizeSectionTitle(section.title);
    const expectedTitle = REQUIRED_RUBRIC_SECTION_TITLES[index];

    if (actualTitle !== expectedTitle) {
      return createInvalidResult(
        `La sección ${index + 1} debe titularse "${expectedTitle}" y conservar el orden solicitado.`,
      );
    }

    if (
      section.content.length === 0 ||
      section.content.every((item) => !item.trim())
    ) {
      return createInvalidResult(
        `La sección "${section.title}" no puede estar vacía.`,
      );
    }
  }

  const calculationText = normalizeText(content.sections[2].content.join(" "));
  const criterionCount = content.rubric.criteria.length;
  const maximumScore = criterionCount * 10;
  const explicitlyUsesRuleOfThree = calculationText.includes("regla de tres");
  const declaresMaximumScore = calculationText.includes(
    `puntaje maximo: ${maximumScore} puntos`,
  );
  const includesConversionFormula =
    /puntaje obtenido[^.!?]{0,80}(?:x|×|\*)\s*10/.test(calculationText) &&
    new RegExp(`(?:÷|/)\\s*${maximumScore}\\b`).test(calculationText);
  const includesResolvedExample =
    calculationText.includes("ejemplo:") &&
    /(?:=|equivale a)\s*\d+(?:[.,]\d+)?\s*\/\s*10\b/.test(
      calculationText,
    );

  if (
    !explicitlyUsesRuleOfThree ||
    !declaresMaximumScore ||
    !includesConversionFormula ||
    !includesResolvedExample
  ) {
    return createInvalidResult(
      `La forma de calcular el resultado debe incluir el puntaje máximo de ${maximumScore} puntos, la regla de tres (puntaje obtenido x 10) ÷ ${maximumScore} y un ejemplo numérico resuelto sobre 10.`,
    );
  }

  return {
    valid: true,
  };
}

function getVisibleContentText(content: GeneratedAIContent): string {
  const rubricText = content.rubric
    ? [
        content.rubric.title,
        ...content.rubric.criteria.flatMap((criterion) => [
          criterion.criterion,
          criterion.excellent,
          criterion.good,
          criterion.regular,
          criterion.acceptable,
          criterion.improvable,
        ]),
      ]
    : [];

  return normalizeText(
    [
      content.title,
      content.introduction,
      ...content.sections.flatMap((section) => [
        section.title,
        ...section.content,
      ]),
      ...rubricText,
    ].join(" "),
  );
}

function getApplicationInstructions(content: GeneratedAIContent): string {
  const applicationSection = content.sections.find((section) => {
    const normalizedTitle = normalizeText(section.title);

    return (
      normalizedTitle.includes("instrucciones de aplicacion") ||
      normalizedTitle.includes("aplicacion de la rubrica")
    );
  });

  if (!applicationSection) {
    return "";
  }

  return normalizeText(applicationSection.content.join(" "));
}

function countRequestedPassTypes(formData: AIFormData): number {
  const requestText = normalizeText(
    [formData.topic, formData.additionalInstructions].join(" "),
  );

  const hasPassContext = /\bpases?\b/.test(requestText);

  if (!hasPassContext) {
    return 0;
  }

  const passTypes = [/\bpecho\b/, /\bpique\b/, /\bsobre\s+la\s+cabeza\b/];

  return passTypes.reduce(
    (total, pattern) => total + (pattern.test(requestText) ? 1 : 0),
    0,
  );
}

function extractMinimumExecutions(instructions: string): number | null {
  const rangeMatch = instructions.match(
    /\b(\d+)\s*[—–-]\s*(\d+)\s+(?:observaciones?|ejecuciones?|intentos?)\b/,
  );

  if (rangeMatch) {
    return Number.parseInt(rangeMatch[1], 10);
  }

  const patterns = [
    /\bal\s+menos\s+(\d+)\s+(?:observaciones?|ejecuciones?|intentos?)\b/,
    /\bminimo\s+(?:de\s+)?(\d+)\s+(?:observaciones?|ejecuciones?|intentos?)\b/,
    /\bregistrar\s+(\d+)\s+(?:observaciones?|ejecuciones?|intentos?)\b/,
    /\bobservar(?:a|á)?\s+(\d+)\s+(?:observaciones?|ejecuciones?|intentos?)\b/,
  ];

  for (const pattern of patterns) {
    const match = instructions.match(pattern);

    if (match) {
      return Number.parseInt(match[1], 10);
    }
  }

  return null;
}

function extractExpectedStudentCount(formData: AIFormData): number | null {
  const match = formData.students.match(/\d+/);

  if (!match) {
    return null;
  }

  const studentCount = Number.parseInt(match[0], 10);

  return studentCount > 0 ? studentCount : null;
}

function extractObservedStudentMaximum(instructions: string): number | null {
  const rangeMatch = instructions.match(
    /\b(\d+)\s*[—–-]\s*(\d+)\s+estudiantes?\s+representativos?\b/,
  );

  if (rangeMatch) {
    return Number.parseInt(rangeMatch[2], 10);
  }

  const singleMatch = instructions.match(
    /\b(\d+)\s+estudiantes?\s+representativos?\b/,
  );

  if (singleMatch) {
    return Number.parseInt(singleMatch[1], 10);
  }

  return null;
}

function validateObservationSufficiency(
  formData: AIFormData,
  content: GeneratedAIContent,
): RubricValidationResult {
  const instructions = getApplicationInstructions(content);

  if (!instructions) {
    return createInvalidResult(
      "La rúbrica debe incluir una sección de instrucciones de aplicación.",
    );
  }

  if (/\b(?:lista|hoja|ficha)\s+de\s+(?:cotejo|control)\b/.test(instructions)) {
    return createInvalidResult(
      "Las instrucciones convierten la rúbrica en una lista, hoja o ficha de control. Utiliza la propia tabla de la rúbrica para registrar el nivel alcanzado en cada criterio.",
    );
  }

  const requestedOrganization = normalizeText(
    [formData.topic, formData.additionalInstructions].join(" "),
  );

  const inventsUnrequestedOrganization =
    !/\b(?:estaciones?|sectores?|zonas?|rotaciones?|circuito)\b/.test(
      requestedOrganization,
    ) &&
    /\b(?:dividir|organizar|distribuir)\b[^.!?]{0,100}\b(?:estaciones?|sectores?|zonas?)\b/.test(
      instructions,
    );

  if (inventsUnrequestedOrganization) {
    return createInvalidResult(
      "Las instrucciones inventan estaciones, sectores o zonas que el docente no solicitó. Explica cómo aplicar la rúbrica durante la actividad práctica ya planificada.",
    );
  }

  const claimsImpossibleSimultaneousBallUse =
    /\bparejas?\b[^.!?]{0,100}\b(?:realizan|ejecutan|practican)\b[^.!?]{0,80}\bpases?\b[^.!?]{0,40}\b(?:continuos?|simultaneos?)\b/.test(
      instructions,
    ) &&
    /\b(?:un|1)\s+balon\b/.test(instructions) &&
    /\b(?:[2-9]|\d{2,})\s+parejas?\b/.test(instructions);

  if (claimsImpossibleSimultaneousBallUse) {
    return createInvalidResult(
      "Las instrucciones presentan varias parejas realizando pases continuos con un solo balón. Deben explicar una alternancia breve y una función motriz activa para quienes no utilizan el balón.",
    );
  }

  const createsPassiveQueue =
    /\b(?:hacen|forman|organizan|integran)\s+(?:una\s+)?fila\b/.test(
      instructions,
    ) ||
    /\bal\s+final\s+de\s+la\s+fila\b/.test(instructions) ||
    /\b(?:esperan|aguardan)\s+(?:su\s+)?turno\b/.test(instructions) ||
    /\bdurante\s+(?:su|el)\s+turno\b/.test(instructions) ||
    /\b(?:solo|solamente|unicamente)\s+(?:la\s+)?(?:pareja|estudiante|alumno|participante)\b[^.!?]{0,100}\b(?:usa|utiliza|ejecuta|practica|participa|trabaja)\b/.test(
      instructions,
    );

  if (createsPassiveQueue) {
    return createInvalidResult(
      "La aplicación de la rúbrica organiza filas o turnos con participación pasiva. Todos los estudiantes deben mantener una función activa mientras el docente observa la práctica.",
    );
  }

  const addsSeparateFinalExecution =
    /\b(?:ejecucion|demostracion|prueba)\s+final\b[^.!?]{0,120}\bindividual\b/.test(
      instructions,
    ) ||
    /\bindividual\b[^.!?]{0,120}\b(?:ejecucion|demostracion|prueba)\s+final\b/.test(
      instructions,
    );

  if (addsSeparateFinalExecution) {
    return createInvalidResult(
      "La aplicación agrega una ejecución final individual separada. La observación debe integrarse durante la práctica activa para evitar filas y tiempos de espera.",
    );
  }

  const requestedPassTypes = countRequestedPassTypes(formData);

  const minimumExecutions = extractMinimumExecutions(instructions);

  if (
    requestedPassTypes > 1 &&
    minimumExecutions !== null &&
    minimumExecutions < requestedPassTypes
  ) {
    return createInvalidResult(
      `La rúbrica evalúa ${requestedPassTypes} tipos de pase, pero las instrucciones permiten solamente ${minimumExecutions} ejecuciones mínimas por estudiante. Cada estudiante debe realizar como mínimo una ejecución observable de cada tipo de pase evaluado.`,
    );
  }

  const expectedStudents = extractExpectedStudentCount(formData);

  const observedStudentMaximum = extractObservedStudentMaximum(instructions);

  if (
    expectedStudents !== null &&
    observedStudentMaximum !== null &&
    observedStudentMaximum < expectedStudents
  ) {
    return createInvalidResult(
      `La rúbrica está destinada a ${expectedStudents} estudiantes, pero las instrucciones proponen evaluar solamente hasta ${observedStudentMaximum} estudiantes representativos. Todos los estudiantes deben recibir observaciones suficientes para asignar su calificación individual.`,
    );
  }

  if (/\bestudiantes?\s+representativos?\b/.test(instructions)) {
    return createInvalidResult(
      "La rúbrica no debe calificar solamente una muestra de estudiantes representativos. Debe indicar cómo observar y evaluar a todos los estudiantes del grupo.",
    );
  }

  return {
    valid: true,
  };
}

function validateRubricDescriptors(
  content: GeneratedAIContent,
): RubricValidationResult {
  const rubric = content.rubric;

  if (!rubric) {
    return createInvalidResult(
      "La herramienta Crear rúbrica debe generar una rúbrica estructurada.",
    );
  }

  if (
    rubric.criteria.length < MINIMUM_CRITERIA ||
    rubric.criteria.length > MAXIMUM_CRITERIA
  ) {
    return createInvalidResult(
      `La rúbrica contiene ${rubric.criteria.length} criterios. Debe incluir entre ${MINIMUM_CRITERIA} y ${MAXIMUM_CRITERIA}.`,
    );
  }

  const criterionNames = new Set<string>();

  for (let index = 0; index < rubric.criteria.length; index += 1) {
    const criterion = rubric.criteria[index];

    const criterionName = normalizeText(criterion.criterion);

    if (!criterionName) {
      return createInvalidResult(`El criterio ${index + 1} no tiene nombre.`);
    }

    if (criterionNames.has(criterionName)) {
      return createInvalidResult(
        `La rúbrica repite el criterio "${criterion.criterion}".`,
      );
    }

    criterionNames.add(criterionName);

    const normalizedDescriptors = new Set<string>();

    for (const field of RUBRIC_LEVEL_FIELDS) {
      const descriptor = normalizeText(criterion[field]);

      if (!descriptor) {
        return createInvalidResult(
          `El criterio "${criterion.criterion}" tiene un nivel de desempeño vacío.`,
        );
      }

      if (normalizedDescriptors.has(descriptor)) {
        return createInvalidResult(
          `El criterio "${criterion.criterion}" repite exactamente el mismo descriptor en dos niveles.`,
        );
      }

      normalizedDescriptors.add(descriptor);
    }
  }

  return {
    valid: true,
  };
}

function validateRubricLanguage(
  content: GeneratedAIContent,
): RubricValidationResult {
  const visibleText = getVisibleContentText(content);

  if (/\btiming\b/.test(visibleText)) {
    return createInvalidResult(
      'La rúbrica utiliza el anglicismo "timing". Debe escribir "sincronización", "momento de ejecución" o "elección oportuna".',
    );
  }

  if (/\bfollow[ -]?through\b/.test(visibleText)) {
    return createInvalidResult(
      'La rúbrica utiliza el anglicismo "follow-through". Debe escribir "acompañamiento final de manos y muñecas".',
    );
  }
  const invalidBouncePassPattern =
    /(?:pase\s+(?:de\s+)?pique|pase\s+con\s+bote)[^.]{0,300}\buno\s+o\s+dos\s+botes\b/;

  if (invalidBouncePassPattern.test(visibleText)) {
    return createInvalidResult(
      "La rúbrica permite uno o dos botes en el pase de pique. La ejecución técnica correcta debe utilizar un solo bote controlado antes de llegar al receptor.",
    );
  }

  return {
    valid: true,
  };
}

function userRequestedQuantification(formData: AIFormData): boolean {
  const requestText = normalizeText(
    [formData.topic, formData.additionalInstructions].join(" "),
  );

  return (
    requestText.includes("%") ||
    /\bporcentaje\b/.test(requestText) ||
    /\b\d+\s+(?:intentos?|ejecuciones?|repeticiones?)\b/.test(requestText)
  );
}

function validateUnrequestedQuantification(
  formData: AIFormData,
  content: GeneratedAIContent,
): RubricValidationResult {
  if (userRequestedQuantification(formData)) {
    return {
      valid: true,
    };
  }

  const rubric = content.rubric;

  if (!rubric) {
    return {
      valid: true,
    };
  }

  const descriptors = normalizeText(
    rubric.criteria
      .flatMap((criterion) => [
        criterion.excellent,
        criterion.good,
        criterion.regular,
        criterion.acceptable,
        criterion.improvable,
      ])
      .join(" "),
  );

  const hasPercentage =
    descriptors.includes("%") || /\b\d+\s*por\s*ciento\b/.test(descriptors);

  const hasFixedAttempts =
    /\b\d+\s+de\s+\d+\s+(?:intentos?|ejecuciones?|repeticiones?)\b/.test(
      descriptors,
    );

  if (hasPercentage || hasFixedAttempts) {
    return createInvalidResult(
      "Los descriptores incluyen porcentajes o cantidades de intentos que el docente no solicitó. Utiliza una progresión cualitativa y observable.",
    );
  }

  return {
    valid: true,
  };
}

export function validateGeneratedRubric(
  formData: AIFormData,
  content: GeneratedAIContent,
): RubricValidationResult {
  if (formData.toolId !== "rubric") {
    return {
      valid: true,
    };
  }

  const structureValidation = validateRubricStructure(content);

  if (!structureValidation.valid) {
    return structureValidation;
  }

  const descriptorValidation = validateRubricDescriptors(content);

  if (!descriptorValidation.valid) {
    return descriptorValidation;
  }

  const languageValidation = validateRubricLanguage(content);

  if (!languageValidation.valid) {
    return languageValidation;
  }

  const quantificationValidation = validateUnrequestedQuantification(
    formData,
    content,
  );

  if (!quantificationValidation.valid) {
    return quantificationValidation;
  }

  const observationValidation = validateObservationSufficiency(
    formData,
    content,
  );

  if (!observationValidation.valid) {
    return observationValidation;
  }

  return {
    valid: true,
  };
}
