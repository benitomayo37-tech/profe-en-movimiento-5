import type {
  AIFormData,
  AIObjectiveTaxonomy,
  GeneratedAIContent,
} from "@/features/ai/types/ai";
import {
  getRequestedTechniqueRules,
  TOPIC_TECHNIQUE_RULES,
} from "@/features/ai/utils/topicTechniques";

export interface ObjectiveValidationResult {
  valid: boolean;
  message?: string;
}

const BLOOM_VERB_PATTERN =
  /\b(?:identific(?:ar|ando)|describ(?:ir|iendo)|explic(?:ar|ando)|aplic(?:ar|ando)|diferenci(?:ar|ando)|analiz(?:ar|ando)|compar(?:ar|ando)|clasific(?:ar|ando)|evalu(?:ar|ando)|justific(?:ar|ando)|disen(?:ar|ando)|cre(?:ar|ando)|resolv(?:er|iendo)|seleccion(?:ar|ando)|decid(?:ir|iendo)|tomar\s+decisiones|tomando\s+decisiones)\b/;

const HARROW_VERB_PATTERN =
  /\b(?:ejecut(?:ar|ando)|coordin(?:ar|ando)|control(?:ar|ando)|ajust(?:ar|ando)|combin(?:ar|ando)|desplazarse|desplazandose|lanz(?:ar|ando)|recib(?:ir|iendo)|equilibr(?:ar|ando)|demostr(?:ar|ando)|adapt(?:ar|ando)|realiz(?:ar|ando))\b/;

const BLOOM_LEVEL_PATTERN =
  /\b(?:recordar|comprender|aplicar|analizar|evaluar|crear)\b/;

const HARROW_LEVEL_PATTERN =
  /\b(?:movimientos?\s+(?:basicos?|fundamentales?|especializados?)|habilidades?\s+perceptivas?|capacidades?\s+fisicas?|habilidades?\s+motrices?|comunicacion\s+corporal\s+no\s+discursiva)\b/;

const VAGUE_INITIAL_VERB_PATTERN =
  /^(?:conocer|saber|aprender|entender|interiorizar|familiarizarse)\b/;

  const PERCENTAGE_CRITERION_PATTERN =
  /\b(\d{1,3}(?:[.,]\d+)?)\s*%/g;

const COUNT_TOTAL_CRITERION_PATTERN =
  /\b(\d+)\s+(?:(?:pases?|aciertos?|ejecuciones?|repeticiones?)\s+(?:(?:efectiv|correct|exitos|recibid|lograd)[oa]s?\s*)?)?(?:de|sobre)\s+(\d+)\s+(?:intentos?|pases?|ejecuciones?|repeticiones?|oportunidades?)\b/g;

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

function invalid(
  message: string,
): ObjectiveValidationResult {
  return {
    valid: false,
    message,
  };
}

function findObjectiveSection(
  content: GeneratedAIContent,
) {
  return content.sections.find(
    (section) => {
      const normalizedTitle =
        normalizeText(
          section.title,
        );

      return (
        normalizedTitle.includes(
          "objetivo de aprendizaje",
        ) ||
        normalizedTitle ===
          "objetivo" ||
        normalizedTitle.startsWith(
          "objetivo ",
        )
      );
    },
  );
}

function extractObjectiveText(
  sectionContent: string[],
): string | null {
  for (
    const item of
      sectionContent
  ) {
    const normalizedItem =
      normalizeText(item);

    const objectiveMatch =
      normalizedItem.match(
        /(?:^|\s)objetivo\s*:\s*(.+)$/,
      );

    if (
      objectiveMatch?.[1]
    ) {
      return objectiveMatch[1]
        .trim();
    }
  }

  return null;
}

function extractTaxonomicLevelText(
  sectionContent: string[],
): string | null {
  for (const item of sectionContent) {
    const normalizedItem =
      normalizeText(item);

    const match =
      normalizedItem.match(
        /(?:^|\s)nivel taxonomico\s*:\s*(.+)$/,
      );

    if (match?.[1]) {
      return match[1].trim();
    }
  }

  return null;
}

function detectDeclaredTaxonomy(
  sectionText: string,
): {
  includesBloom: boolean;
  includesHarrow: boolean;
} {
  return {
    includesBloom:
      /\bbloom\b/.test(
        sectionText,
      ),
    includesHarrow:
      /\bharrow\b/.test(
        sectionText,
      ),
  };
}

function validateSelectedTaxonomy(
  selectedTaxonomy:
    AIObjectiveTaxonomy,
  includesBloom: boolean,
  includesHarrow: boolean,
): ObjectiveValidationResult {
  if (
    selectedTaxonomy ===
      "bloom" &&
    (
      !includesBloom ||
      includesHarrow
    )
  ) {
    return invalid(
      "La planificación debe identificar únicamente la Taxonomía de Bloom para formular el objetivo.",
    );
  }

  if (
    selectedTaxonomy ===
      "harrow" &&
    (
      !includesHarrow ||
      includesBloom
    )
  ) {
    return invalid(
      "La planificación debe identificar únicamente la Taxonomía de Harrow para formular el objetivo.",
    );
  }

  if (
    selectedTaxonomy ===
      "combined" &&
    (
      !includesBloom ||
      !includesHarrow
    )
  ) {
    return invalid(
      "La planificación debe identificar la combinación Bloom + Harrow en el objetivo.",
    );
  }

  if (
    selectedTaxonomy ===
      "automatic" &&
    !includesBloom &&
    !includesHarrow
  ) {
    return invalid(
      "La selección automática debe identificar claramente Bloom, Harrow o Bloom + Harrow.",
    );
  }

  return {
    valid: true,
  };
}

function validateObjectiveVerbs(
  selectedTaxonomy:
    AIObjectiveTaxonomy,
  objectiveText: string,
  includesBloom: boolean,
  includesHarrow: boolean,
): ObjectiveValidationResult {
  const startsWithVagueVerb =
    VAGUE_INITIAL_VERB_PATTERN.test(
      objectiveText,
    );

  if (startsWithVagueVerb) {
    return invalid(
      "El objetivo comienza con un verbo impreciso. Utiliza verbos observables y evaluables.",
    );
  }

  const hasBloomVerb =
    BLOOM_VERB_PATTERN.test(
      objectiveText,
    );

  const hasHarrowVerb =
    HARROW_VERB_PATTERN.test(
      objectiveText,
    );

  const requiresBloomVerb =
    selectedTaxonomy === "bloom" ||
    selectedTaxonomy ===
      "combined" ||
    (
      selectedTaxonomy ===
        "automatic" &&
      includesBloom
    );

  const requiresHarrowVerb =
    selectedTaxonomy === "harrow" ||
    selectedTaxonomy ===
      "combined" ||
    (
      selectedTaxonomy ===
        "automatic" &&
      includesHarrow
    );

  if (
    requiresBloomVerb &&
    !hasBloomVerb
  ) {
    return invalid(
      `El objetivo "${objectiveText.slice(
        0,
        180,
      )}" no utiliza una evidencia cognitiva observable correspondiente a la Taxonomía de Bloom.`,
    );
  }

  if (
    requiresHarrowVerb &&
    !hasHarrowVerb
  ) {
    return invalid(
      `El objetivo "${objectiveText.slice(
        0,
        180,
      )}" no utiliza una evidencia motriz observable correspondiente a la Taxonomía de Harrow.`,
    );
  }

  return {
    valid: true,
  };
}

function validateTaxonomicLevels(
  selectedTaxonomy:
    AIFormData["objectiveTaxonomy"],
  levelText: string,
  includesBloom: boolean,
  includesHarrow: boolean,
): ObjectiveValidationResult {
  const requiresBloom =
    selectedTaxonomy === "bloom" ||
    selectedTaxonomy === "combined" ||
    (
      selectedTaxonomy === "automatic" &&
      includesBloom
    );

  const requiresHarrow =
    selectedTaxonomy === "harrow" ||
    selectedTaxonomy === "combined" ||
    (
      selectedTaxonomy === "automatic" &&
      includesHarrow
    );

  if (
    requiresBloom &&
    !BLOOM_LEVEL_PATTERN.test(levelText)
  ) {
    return invalid(
      "El nivel de Bloom debe ser Recordar, Comprender, Aplicar, Analizar, Evaluar o Crear.",
    );
  }

  if (
    requiresHarrow &&
    !HARROW_LEVEL_PATTERN.test(levelText)
  ) {
    return invalid(
      'El nivel de Harrow debe indicar una categoría psicomotora válida. No utilices verbos como "Ejecutar" como nombre del nivel.',
    );
  }

  return {
    valid: true,
  };
}

function getRequestedTopicText(
  formData: AIFormData,
): string {
  return normalizeText(
    [
      formData.topic,
      formData.additionalInstructions,
    ].join(" "),
  );
}

function getVisiblePlanningText(
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

function validateRequestedTopicScope(
  formData: AIFormData,
  content: GeneratedAIContent,
): ObjectiveValidationResult {
  const requestedText =
    getRequestedTopicText(formData);

  const requestedTechniques =
    getRequestedTechniqueRules(
      requestedText,
    );

  /*
   * Si el docente escribió un tema general,
   * la planificación puede seleccionar las
   * técnicas pedagógicamente necesarias.
   */
  if (
    requestedTechniques.length === 0
  ) {
    return {
      valid: true,
    };
  }

  const requestedTechniqueLabels =
    new Set(
      requestedTechniques.map(
        (rule) => rule.label,
      ),
    );

  const visiblePlanningText =
    getVisiblePlanningText(content);

  const unrequestedTechniques =
    TOPIC_TECHNIQUE_RULES.filter(
      (rule) =>
        rule.visiblePattern.test(
          visiblePlanningText,
        ) &&
        !requestedTechniqueLabels.has(
          rule.label,
        ),
    ).map((rule) => rule.label);

  if (
    unrequestedTechniques.length > 0
  ) {
    return invalid(
      `La planificación amplía el tema con técnicas no solicitadas: ${unrequestedTechniques.join(
        ", ",
      )}. El objetivo, las actividades y la evaluación deben limitarse estrictamente a las técnicas indicadas por el docente.`,
    );
  }

  return {
    valid: true,
  };
}

function parseCriterionNumber(
  value: string,
): number {
  return Number(
    value.replace(",", "."),
  );
}

function validateQuantitativeCriterion(
  objectiveText: string,
): ObjectiveValidationResult {
  const percentageMatches =
    Array.from(
      objectiveText.matchAll(
        PERCENTAGE_CRITERION_PATTERN,
      ),
    );

  const countTotalMatches =
    Array.from(
      objectiveText.matchAll(
        COUNT_TOTAL_CRITERION_PATTERN,
      ),
    );

  const usesConsecutiveCriterion =
    /\bconsecutiv[oa]s?\b/.test(
      objectiveText,
    );

  if (
    percentageMatches.length > 0 &&
    usesConsecutiveCriterion
  ) {
    return invalid(
      'El objetivo combina una cantidad consecutiva con un porcentaje. Utiliza una secuencia consecutiva o una relación de aciertos sobre intentos, pero no ambos criterios a la vez.',
    );
  }

  if (
    percentageMatches.length > 0 &&
    countTotalMatches.length === 0
  ) {
    return invalid(
      'El porcentaje del objetivo debe indicar también una relación verificable, por ejemplo: "8 pases efectivos de 10 intentos, equivalente al 80%".',
    );
  }

  const quantitativeRelations =
    countTotalMatches.map(
      (match) => ({
        successfulAttempts:
          Number(match[1]),
        totalAttempts:
          Number(match[2]),
      }),
    );

  for (
    const relation of
      quantitativeRelations
  ) {
    if (
      relation.totalAttempts <= 0 ||
      relation.successfulAttempts >
        relation.totalAttempts
    ) {
      return invalid(
        `El criterio cuantitativo declara ${relation.successfulAttempts} aciertos de ${relation.totalAttempts} intentos. La cantidad de aciertos no puede superar el total de intentos.`,
      );
    }
  }

  for (
    const percentageMatch of
      percentageMatches
  ) {
    const declaredPercentage =
      parseCriterionNumber(
        percentageMatch[1],
      );

    if (
      declaredPercentage <= 0 ||
      declaredPercentage > 100
    ) {
      return invalid(
        "El porcentaje del criterio de logro debe ser mayor que 0 y no puede superar el 100%.",
      );
    }

    const hasMatchingRelation =
      quantitativeRelations.some(
        (relation) => {
          const calculatedPercentage =
            (
              relation.successfulAttempts /
              relation.totalAttempts
            ) * 100;

          return (
            Math.abs(
              calculatedPercentage -
                declaredPercentage,
            ) <= 0.5
          );
        },
      );

    if (!hasMatchingRelation) {
      const firstRelation =
        quantitativeRelations[0];

      const relationDescription =
        firstRelation
          ? `${firstRelation.successfulAttempts} de ${firstRelation.totalAttempts}`
          : "la cantidad declarada";

      return invalid(
        `El porcentaje de ${declaredPercentage}% no coincide matemáticamente con ${relationDescription}. Ajusta los aciertos, los intentos o el porcentaje.`,
      );
    }
  }

  return {
    valid: true,
  };
}

export function validateGeneratedObjective(
  formData: AIFormData,
  content: GeneratedAIContent,
): ObjectiveValidationResult {
  if (
    formData.toolId !==
    "lesson-plan"
  ) {
    return {
      valid: true,
    };
  }

  const objectiveSection =
    findObjectiveSection(content);

  if (!objectiveSection) {
    return invalid(
      'La planificación debe incluir una sección titulada "Objetivo de aprendizaje".',
    );
  }

  const sectionText =
    normalizeText(
      [
        objectiveSection.title,
        ...objectiveSection.content,
      ].join(" "),
    );

  if (
    !sectionText.includes(
      "taxonomia aplicada",
    )
  ) {
    return invalid(
      'La sección del objetivo debe indicar "Taxonomía aplicada".',
    );
  }

  if (
    !sectionText.includes(
      "nivel taxonomico",
    )
  ) {
    return invalid(
      'La sección del objetivo debe indicar "Nivel taxonómico".',
    );
  }

    const taxonomicLevelText =
    extractTaxonomicLevelText(
      objectiveSection.content,
    );

  if (!taxonomicLevelText) {
    return invalid(
      'La sección debe incluir "Nivel taxonómico:" seguido del nivel seleccionado.',
    );
  }

  const objectiveText =
    extractObjectiveText(
      objectiveSection.content,
    );

  if (!objectiveText) {
    return invalid(
      'La sección debe presentar el objetivo mediante el formato "Objetivo: ...".',
    );
  }

  if (
    objectiveText.length < 40
  ) {
    return invalid(
      "El objetivo es demasiado breve para expresar la conducta, el contenido, la condición y el criterio de logro.",
    );
  }

  const {
    includesBloom,
    includesHarrow,
  } = detectDeclaredTaxonomy(
    sectionText,
  );

    const levelValidation =
    validateTaxonomicLevels(
      formData.objectiveTaxonomy,
      taxonomicLevelText,
      includesBloom,
      includesHarrow,
    );

  if (!levelValidation.valid) {
    return levelValidation;
  }

  const taxonomyValidation =
    validateSelectedTaxonomy(
      formData.objectiveTaxonomy,
      includesBloom,
      includesHarrow,
    );

  if (!taxonomyValidation.valid) {
    return taxonomyValidation;
  }

   const verbValidation =
    validateObjectiveVerbs(
      formData.objectiveTaxonomy,
      objectiveText,
      includesBloom,
      includesHarrow,
    );

  if (!verbValidation.valid) {
    return verbValidation;
  }

  const quantitativeValidation =
    validateQuantitativeCriterion(
      objectiveText,
    );

  if (!quantitativeValidation.valid) {
    return quantitativeValidation;
  }

  return validateRequestedTopicScope(
    formData,
    content,
  );
}
