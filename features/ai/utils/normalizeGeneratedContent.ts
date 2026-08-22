import type {
  AIFormData,
  AIObjectiveTaxonomy,
  GeneratedAIContent,
} from "@/features/ai/types/ai";
import {
  getRequestedTechniqueRules,
  TOPIC_TECHNIQUE_RULES,
} from "@/features/ai/utils/topicTechniques";

const MALFORMED_FRAGMENT_SEPARATOR =
  /\s*"\s*,\s*"\s*(?=(?:-\s*)?(?:Procedimiento|Rol\s+docente|Rol\s+de(?:l| los)\s+estudiantes|Rol\s+estudiantes|DUA|NEE|Rotación\s+y\s+gestión)\s*:)/gi;

const STATION_FRAGMENT_SEPARATOR =
  /(?=[-•]\s*Estaci[oó]n\s+\d+\b)/gi;

const EDITORIAL_NOTE_PATTERNS = [
  /\s*\]\s*\(\s*errores?\s+de\s+formato[^)]*\)/gi,
  /\s*\(\s*errores?\s+de\s+formato[^)]*\)/gi,
  /\s*\(\s*corregido(?:s|as)?\s+en\s+las?\s+siguientes?\s+líneas?\s*\)/gi,
];

const INTERNAL_METADATA_GROUP_PATTERN =
  /\s*\(\s*(?:(?:studentCount|groupCount|stations|groupsPerStation|simultaneousParticipants|waitingParticipants|fixedTargetsAvailable|fixedTargetsRequired)\s*=\s*(?:\d+|null|true|false)\s*;?\s*)+\)/gi;

const INTERNAL_METADATA_PATTERN =
  /\b(?:studentCount|groupCount|stations|groupsPerStation|simultaneousParticipants|waitingParticipants|fixedTargetsAvailable|fixedTargetsRequired)\s*=\s*(?:\d+|null|true|false)\b\s*;?/gi;

const INTERNAL_REFERENCE_PATTERNS = [
  /\s*\(\s*(?:ver|véase)\s+[^)]*\b(?:durationPlan|logisticsPlan)\b[^)]*\)/gi,
  /\b(?:durationPlan|logisticsPlan)\b/gi,
];

const DUA_PREFIX_PATTERN =
  /^(?:[-•]\s*)?(?:DUA(?:\s*\([^)]*\))?\s*:\s*)?(REPRESENTACIÓN|ACCIÓN Y EXPRESIÓN|COMPROMISO\s*\/\s*MOTIVACIÓN)\b/i;

const DUA_COLOR_PATTERN =
  /\s*[—–-]\s*\(?(MORADO|AZUL|VERDE)\)?\s*(?::|[—–-])\s*/gi;

const DUA_PARENTHETICAL_COLOR_PATTERN =
  /^((?:[-•]\s*)?(?:REPRESENTACIÓN|ACCIÓN Y EXPRESIÓN|COMPROMISO\s*\/\s*MOTIVACIÓN))\s*\((?:MORADO|AZUL|VERDE)\)\s*(?::|[—–-])\s*/i;

function normalizeRequestedTechniques(
  value: string,
  formData?: Pick<AIFormData, "topic" | "additionalInstructions">,
): string {
  if (!formData) {
    return value;
  }

  const requestedText = [
    formData.topic,
    formData.additionalInstructions,
  ]
    .filter(Boolean)
    .join(" ");
  const requestedRules = getRequestedTechniqueRules(requestedText);

  if (requestedRules.length === 0) {
    return value;
  }

  const requestedLabels = new Set(
    requestedRules.map((rule) => rule.label),
  );
  const replacementTechnique = requestedRules[0].label;

  return TOPIC_TECHNIQUE_RULES.reduce(
    (normalizedValue, rule) => {
      return requestedLabels.has(rule.label)
        ? normalizedValue
        : normalizedValue.replace(
            rule.replacementPattern,
            replacementTechnique,
          );
    },
    value,
  );
}

function normalizeActiveParticipation(value: string): string {
  return value
    .replace(
      /\blas\s+parejas\s+que\s+esperan\s+(?:el\s+bal[oó]n\s+)?realizan\b/gi,
      "las parejas que temporalmente no utilizan el balón realizan",
    )
    .replace(
      /\bparejas\s+que\s+esperan\s+el\s+bal[oó]n\b/gi,
      "parejas que temporalmente no utilizan el balón",
    )
    .replace(
      /\bpara\s+quienes\s+esperan\b/gi,
      "para quienes temporalmente no utilizan el material asignado",
    )
    .replace(
      /\bquienes\s+esperan\b/gi,
      "quienes mantienen una función motriz activa durante la alternancia",
    )
    .replace(
      /\b(?:esperan?|aguardan?)\s+(?:su\s+)?turno\b/gi,
      "realizan desplazamientos activos hasta intercambiar funciones",
    )
    .replace(
      /\b(?:grupo|equipo)\s+([a-z]|\d+)\s+espera\b/gi,
      "grupo $1 realiza una tarea motriz activa",
    )
    .replace(
      /\bdurante\s+su\s+turno\s+sin\s+permanecer\s+inactiv[oa]\b/gi,
      "durante la alternancia, manteniendo continuamente la función asignada",
    )
    .replace(
      /\bdurante\s+la\s+mayor[ií]a\s+del\s+turno\b/gi,
      "durante la mayoría de las observaciones realizadas",
    );
}

function normalizeChecklistCalculation(
  sections: GeneratedAIContent["sections"],
): GeneratedAIContent["sections"] {
  const indicatorsSection = sections.find((section) =>
    normalizeForComparison(section.title).includes(
      "indicadores observables",
    ),
  );
  const interpretationSectionIndex = sections.findIndex((section) =>
    normalizeForComparison(section.title).includes(
      "interpretacion y retroalimentacion",
    ),
  );

  if (!indicatorsSection || interpretationSectionIndex < 0) {
    return sections;
  }

  const indicatorCount = indicatorsSection.content.filter((item) =>
    /\[\s*\]\s*s[ií]\s*\|\s*\[\s*\]\s*en\s+proceso\s*\|\s*\[\s*\]\s*no\b/i.test(
      item,
    ),
  ).length;

  if (indicatorCount <= 0) {
    return sections;
  }

  const yesCount = Math.max(indicatorCount - 3, 1);
  const inProcessCount = Math.min(2, indicatorCount - yesCount);
  const noCount = indicatorCount - yesCount - inProcessCount;
  const examplePoints = yesCount + inProcessCount * 0.5;
  const exampleGrade = (examplePoints * 10) / indicatorCount;
  const formatNumber = (value: number) =>
    Number.isInteger(value)
      ? String(value)
      : value.toFixed(1).replace(".", ",");

  return sections.map((section, index) =>
    index !== interpretationSectionIndex
      ? section
      : {
          ...section,
          content: [
            "Asigna el valor correspondiente a cada indicador: Sí = 1 punto, En proceso = 0,5 puntos y No = 0 puntos.",
            `Puntaje máximo: ${indicatorCount} puntos (${indicatorCount} indicadores x 1 punto).`,
            `Regla de tres: calificación final = (puntaje obtenido x 10) ÷ ${indicatorCount}.`,
            `Ejemplo: ${yesCount} Sí, ${inProcessCount} En proceso y ${noCount} No equivalen a ${formatNumber(examplePoints)} puntos; (${formatNumber(examplePoints)} x 10) ÷ ${indicatorCount} = ${formatNumber(exampleGrade)}/10.`,
            "Interpreta el resultado junto con las observaciones registradas, reconoce uno o dos aciertos concretos y propone un ajuste técnico breve y practicable para la siguiente alternancia.",
          ],
        },
  );
}

function normalizeChecklistLanguage(
  sections: GeneratedAIContent["sections"],
): GeneratedAIContent["sections"] {
  return sections.map((section) => ({
    ...section,
    content: section.content.map((item) =>
      item
        .replace(
          /\b2\s+observaci[oó]n\s+t[eé]cnica\s+m[oó]vil\s*,\s*2\s+postura\s+de\s+recepci[oó]n\s*,\s*2\s+desplazamientos\s+de\s+apoyo\s+y\s+2\s+simulaci[oó]n\s+del\s+gesto\b/gi,
          "2 participantes en observación técnica móvil, 2 en postura de recepción, 2 en desplazamientos de apoyo y 2 en simulación del gesto",
        )
        .replace(
          /\bpor\s+un\s+compa(?:ñ|Ã±)ero\s*\(\s*uno\s+a\s+uno\s*\)/gi,
          "por un compañero asignado",
        )
        .replace(
          /\btiempos\s*\(\s*coherentes?\s+con\s+el\s*\)\s*:/gi,
          "Distribución del tiempo:",
        ),
    ),
  }));
}

function normalizeAssessmentLanguage(
  sections: GeneratedAIContent["sections"],
  materials = "",
): GeneratedAIContent["sections"] {
  const hasWritingMaterials =
    /\b(?:papel|hojas?|fichas?|cuadernos?|l[aá]pices?|bol[ií]grafos?|pizarras?)\b/i.test(
      materials,
    );

  return sections.map((section) => ({
    ...section,
    content: section.content.map((item) =>
      item
        .replace(/^-\s*(?=\S)/, "- ")
        .replace(
          /\bpor\s+cada\s+elemento\s+correcto\s+se\s+evaluar[aá]\s+la\s+escala\s+completa\b/gi,
          "se aplicará la siguiente escala de puntuación",
        )
        .replace(
          /\bfichas\s+verbales\s+breves\b/gi,
          "retroalimentaciones verbales breves",
        )
        .replace(
          /\bparejas\s+fijas\s+de\s+recepci[oó]n\s*\/\s*retorno\b/gi,
          "parejas asignadas con funciones rotativas de pase y recepción",
        )
        .replace(
          /\b(?:el\s+)?docente\s+o\s+un\s+ayudante\s+verbaliza\s+la\s+rotaci[oó]n\b/gi,
          "el docente anuncia verbalmente la rotación",
        )
        .replace(
          /\butilice\s+(?:un\s+)?cron[oó]metro\s+para\s+(?:los\s+)?microturnos\b/gi,
          "el docente controla el tiempo de los microturnos",
        )
        .replace(
          /\s*o\s*,\s*si\s+prefieren\s*,\s*concentrarlos\s+en\s+uno\s+solo\s*\(\s*6\s+en\s+30\s*s(?:egundos?)?\s*\)/gi,
          "",
        )
        .replace(/\bpuntadas\b/gi, "puntuadas")
        .replace(/\bstability\b/gi, "estabilidad")
        .replace(
          /\bretroalimentaci[oó]n\s+activo\b/gi,
          "retroalimentación activa",
        )
        .replace(
          /\bregistre\s+mentalmente(?:\s+(?:a\s+)?cada\s+(?:pasador|estudiante))?\b/gi,
          "observe directamente los aciertos y la ejecución técnica de cada estudiante y comunique retroalimentación oral breve durante la rotación",
        )
        .replace(
          !hasWritingMaterials
            ? /\b(?:en\s+)?(?:la\s+|las\s+)?(?:ficha|fichas|hoja|hojas)(?:\s+impresas?)?\s+(?:de\s+)?(?:evaluaci[oó]n|cotejo|registro)\b/gi
            : /$^/g,
          "mediante observación directa del docente",
        )
        .replace(
          !hasWritingMaterials
            ? /\bno\s+hay\s+respuestas?\s+por\s+escrito\b/gi
            : /$^/g,
          "todas las respuestas son orales y breves",
        )
        .replace(
          !hasWritingMaterials ? /\bpor\s+escrito\b/gi : /$^/g,
          "de forma oral breve",
        )
        .replace(
          !hasWritingMaterials ? /\banota\b/gi : /$^/g,
          "menciona oralmente",
        )
        .replace(
          !hasWritingMaterials ? /\bentrega\s+final\b/gi : /$^/g,
          "cierre final",
        )
        .replace(
          /\s*\(\s*descrito\s+en\s*\)\s*\.?/gi,
          ".",
        )
        .replace(/\bla\s+tercera\s+microturno\b/gi, "el tercer microturno")
        .replace(/\buna\s+microturno\b/gi, "un microturno")
        .replace(/\buno\s+pase\b/gi, "un pase")
        .replace(/\blas\s+microturnos\b/gi, "los microturnos")
        .replace(/\blas\s+tres\s+microturnos\b/gi, "los tres microturnos")
        .replace(
          /\blos\s+primeros\s+dos\s+intentos\b/gi,
          "los dos primeros microturnos",
        )
        .replace(
          /\bprimeros\s+dos\s+intentos\b/gi,
          "dos primeros microturnos",
        )
        .replace(/\bintentos\s+previos\b/gi, "microturnos anteriores")
        .replace(
          /\bn[uú]mero\s+de\s+intentos\b/gi,
          "número de microturnos",
        )
        .replace(/\bvocalmente\b/gi, "verbalmente")
        .replace(
          /\bfollow[-\s]?through\b/gi,
          "acompañamiento final de manos y muñecas",
        )
        .replace(/\bemerger\s+las\s+manos\b/gi, "mantener las manos")
        .replace(
          /\bel\s+pase\s+de\s+pique\s+debe\s+botar\s+una\s+vez\s+antes\s+de\s+ser\s+recepcionado\s+aproximadamente\s+a\s+la\s+altura\s+de\s+la\s+l[ií]nea\s+de\s+recepci[oó]n\b/gi,
          "el pase de pique debe realizar un solo bote controlado aproximadamente a dos tercios de la distancia entre el pasador y el receptor y llegar a una zona recepcionable",
        )
        .replace(
          /\b(?:bal[oó]n|pase)\s+dirigido\s+por\s+encima\s+de\s+la\s+cabeza\s+del\s+receptor\b/gi,
          "balón liberado desde encima de la cabeza del pasador y dirigido a una zona recepcionable del compañero",
        )
        .replace(
          /\bretroalimentaci[oó]n\s+inmediato\s+y\s+positivo\b/gi,
          "retroalimentación inmediata y positiva",
        )
        .replace(
          /\bcon\s+mejora\s+t[eé]cnica\s+o\s+mantenimiento\s+del\s+criterio\b/gi,
          "cumpliendo nuevamente el criterio técnico observable",
        )
        .replace(
          /\b(?:observar|confirmar)\s+t[eé]cnica\s+mejorada\s+o\s+consistente\b/gi,
          "confirmar el cumplimiento del criterio técnico observable",
        )
        .replace(
          /\busar\s+la\s+primera\s+o\s+la\s+segunda\s+oportunidad\s+de\s+pasador\b/gi,
          "elegir el orden de los dos primeros microturnos; el docente determina el pase que se repite en el tercero",
        )
        .replace(
          /\belegir\s+en\s+cu[aá]l\s+de\s+sus\s+(?:tres\s+)?oportunidades\s+realizar[aá]\s+cada\s+tipo\s+de\s+pase\b/gi,
          "elegir el orden de los dos primeros microturnos; el docente determina el pase que se repite en el tercero",
        )
        .replace(
          /(\([^()]*(?:una\s+o\s+ninguna|ninguna)\s+respuesta\s+correcta\s*=\s*0\s+puntos?)\.(?=\s*$)/gi,
          "$1).",
        ),
    ),
  }));
}

function normalizeRubricCalculation(
  sections: GeneratedAIContent["sections"],
  criterionCount: number,
): GeneratedAIContent["sections"] {
  if (criterionCount <= 0) {
    return sections;
  }

  const calculationSectionIndex = sections.findIndex((section) =>
    normalizeForComparison(section.title).includes(
      "forma de calcular o interpretar el resultado",
    ),
  );

  if (calculationSectionIndex < 0) {
    return sections;
  }

  const maximumScore = criterionCount * 10;
  const exampleScore = criterionCount === 5 ? 42 : criterionCount * 8;
  const exampleGrade = ((exampleScore * 10) / maximumScore)
    .toFixed(1)
    .replace(".", ",");

  return sections.map((section, index) =>
    index !== calculationSectionIndex
      ? section
      : {
          ...section,
          content: [
            "Registra para cada criterio la puntuación correspondiente (10, 9, 8, 7 o 5) y suma los valores obtenidos.",
            `Puntaje máximo: ${maximumScore} puntos (${criterionCount} criterios x 10 puntos).`,
            `Regla de tres: calificación final = (puntaje obtenido x 10) ÷ ${maximumScore}.`,
            `Ejemplo: si el estudiante obtiene ${exampleScore} puntos, (${exampleScore} x 10) ÷ ${maximumScore} = ${exampleGrade}/10.`,
            "La calificación final se expresa sobre 10 y se utiliza para orientar la retroalimentación formativa.",
          ],
        },
  );
}

const INVALID_HARROW_ACTION_LEVEL_PATTERN =
  /(\bHarrow\s*[—–-]\s*)(?:Ejecutar|Coordinar|Controlar|Ajustar|Combinar|Aplicar|Demostrar|Adaptar|Realizar)(?=\s*(?:[.;]|$))/gi;

const HARROW_SPECIALIZED_LEVEL =
  "Movimientos especializados o habilidades motrices";

const BLOOM_DECLARED_LEVEL_PATTERN =
  /(\bBloom\s*[—–-]\s*)([A-Za-zÁÉÍÓÚÜÑáéíóúüñ]+)/gi;

const BLOOM_VALID_LEVEL_PATTERN =
  /\b(?:Recordar|Comprender|Aplicar|Analizar|Evaluar|Crear)\b/i;

const HARROW_VALID_LEVEL_PATTERN =
  /\b(?:movimientos?\s+(?:básicos?|fundamentales?|especializados?)|habilidades?\s+perceptivas?|capacidades?\s+físicas?|habilidades?\s+motrices?|comunicación\s+corporal\s+no\s+discursiva)\b/i;

const EVALUATION_TIMING_AFTER_MINUTES_PATTERN =
  /(\b\d+(?:[.,]\d+)?\s*(?:min|minuto|minutos)\b)([^.!?]{0,180}?)\b(?:durante|dentro\s+de|incluid[oa]\s+en|integrado?\s+en)\s+(?:el\s+)?(?:inicio|desarrollo|cierre)\b/gi;

const EVALUATION_TIMING_BEFORE_MINUTES_PATTERN =
  /\b(?:durante|dentro\s+de|incluid[oa]\s+en|integrado?\s+en)\s+(?:el\s+)?(?:inicio|desarrollo|cierre)\b([^.!?]{0,180}?)(\b\d+(?:[.,]\d+)?\s*(?:min|minuto|minutos)\b)/gi;

const BLOOM_ACTION_LEVELS: Record<string, string> = {
  identificar: "Recordar",
  reconocer: "Recordar",
  recordar: "Recordar",
  describir: "Comprender",
  explicar: "Comprender",
  comprender: "Comprender",
  comprension: "Comprender",
  aplicar: "Aplicar",
  aplicacion: "Aplicar",
  ejecutar: "Aplicar",
  ejecucion: "Aplicar",
  demostrar: "Aplicar",
  realizar: "Aplicar",
  analizar: "Analizar",
  analisis: "Analizar",
  comparar: "Analizar",
  diferenciar: "Analizar",
  evaluar: "Evaluar",
  evaluacion: "Evaluar",
  justificar: "Evaluar",
  crear: "Crear",
  creacion: "Crear",
  disenar: "Crear",
  diseno: "Crear",
};

function normalizeForComparison(value: string): string {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();
}

function normalizeLessonPlanSectionOrder(
  sections: GeneratedAIContent["sections"],
): GeneratedAIContent["sections"] {
  const organizationSectionIndex = sections.findIndex((section) => {
    const normalizedTitle = normalizeForComparison(section.title);

    return (
      normalizedTitle.includes("organizacion") &&
      /\b(?:grupo|espacio|material)/.test(normalizedTitle)
    );
  });
  const methodologySectionIndex = sections.findIndex((section) =>
    normalizeForComparison(section.title).includes("metodolog"),
  );
  const startSectionIndex = sections.findIndex((section) => {
    const normalizedTitle = normalizeForComparison(section.title).trim();

    return (
      normalizedTitle === "inicio" ||
      /^\d+[.)]\s*inicio\b/.test(normalizedTitle)
    );
  });

  if (
    organizationSectionIndex < 0 ||
    methodologySectionIndex < 0 ||
    startSectionIndex < 0
  ) {
    return sections;
  }

  const organizationSection = sections[organizationSectionIndex];
  const methodologySection = {
    ...sections[methodologySectionIndex],
    title: "Metodología aplicada",
  };
  const remainingSections = sections.filter(
    (_, index) =>
      index !== organizationSectionIndex &&
      index !== methodologySectionIndex,
  );
  const startIndex = remainingSections.findIndex((section) => {
    const normalizedTitle = normalizeForComparison(section.title).trim();

    return (
      normalizedTitle === "inicio" ||
      /^\d+[.)]\s*inicio\b/.test(normalizedTitle)
    );
  });

  if (startIndex < 0) {
    return sections;
  }

  return [
    ...remainingSections.slice(0, startIndex),
    organizationSection,
    methodologySection,
    ...remainingSections.slice(startIndex),
  ];
}

function normalizeBloomDeclaredLevel(value: string): string {
  return value.replace(
    BLOOM_DECLARED_LEVEL_PATTERN,
    (match, prefix: string, rawLevel: string) => {
      if (BLOOM_VALID_LEVEL_PATTERN.test(rawLevel)) {
        return match;
      }

      const normalizedLevel = normalizeForComparison(rawLevel);
      const correctedLevel = BLOOM_ACTION_LEVELS[normalizedLevel];

      return correctedLevel ? `${prefix}${correctedLevel}` : match;
    },
  );
}

function inferBloomLevel(sectionText: string): string {
  const normalizedText = normalizeForComparison(sectionText);

  if (/\b(?:crear|disenar|elaborar)\b/.test(normalizedText)) return "Crear";
  if (/\b(?:evaluar|justificar|valorar)\b/.test(normalizedText)) return "Evaluar";
  if (/\b(?:analizar|comparar|diferenciar)\b/.test(normalizedText)) return "Analizar";
  if (/\b(?:aplicar|ejecutar|demostrar|realizar)\b/.test(normalizedText)) return "Aplicar";
  if (/\b(?:explicar|describir|comprender)\b/.test(normalizedText)) return "Comprender";

  return "Recordar";
}

function normalizeObjectiveTaxonomyLevels(
  sectionContent: string[],
  objectiveTaxonomy: AIObjectiveTaxonomy | undefined,
): string[] {
  const sectionText = sectionContent.join(" ");
  const normalizedSectionText = normalizeForComparison(sectionText);
  const includesBloom = /\bbloom\b/.test(normalizedSectionText);
  const includesHarrow = /\bharrow\b/.test(normalizedSectionText);
  const requiresBloom =
    objectiveTaxonomy === "bloom" ||
    objectiveTaxonomy === "combined" ||
    (objectiveTaxonomy === "automatic" && includesBloom);
  const requiresHarrow =
    objectiveTaxonomy === "harrow" ||
    objectiveTaxonomy === "combined" ||
    (objectiveTaxonomy === "automatic" && includesHarrow);

  return sectionContent.map((item) => {
    if (!normalizeForComparison(item).includes("nivel taxonomico")) {
      return item;
    }

    let normalizedItem = normalizeBloomDeclaredLevel(item).replace(
      INVALID_HARROW_ACTION_LEVEL_PATTERN,
      `$1${HARROW_SPECIALIZED_LEVEL}`,
    );

    const hasValidBloomLevel = BLOOM_VALID_LEVEL_PATTERN.test(normalizedItem);
    const hasValidHarrowLevel = HARROW_VALID_LEVEL_PATTERN.test(normalizedItem);

    if (
      (!requiresBloom || hasValidBloomLevel) &&
      (!requiresHarrow || hasValidHarrowLevel)
    ) {
      return normalizedItem;
    }

    const bloomLevel = hasValidBloomLevel
      ? normalizedItem.match(BLOOM_VALID_LEVEL_PATTERN)?.[0] ?? "Aplicar"
      : inferBloomLevel(sectionText);
    const harrowLevel = hasValidHarrowLevel
      ? normalizedItem.match(HARROW_VALID_LEVEL_PATTERN)?.[0] ?? HARROW_SPECIALIZED_LEVEL
      : HARROW_SPECIALIZED_LEVEL;
    const canonicalLevel = requiresBloom && requiresHarrow
      ? `Bloom — ${bloomLevel}; Harrow — ${harrowLevel}`
      : requiresBloom
        ? `Bloom — ${bloomLevel}`
        : `Harrow — ${harrowLevel}`;

    normalizedItem = normalizedItem.replace(
      /(Nivel\s+taxon[oó]mico\s*:\s*).*/i,
      `$1${canonicalLevel}`,
    );

    return normalizedItem;
  });
}

function normalizeEvaluationTiming(value: string): string {
  return value
    .replace(
      EVALUATION_TIMING_AFTER_MINUTES_PATTERN,
      "$1$2 en el bloque de evaluación",
    )
    .replace(
      EVALUATION_TIMING_BEFORE_MINUTES_PATTERN,
      "en el bloque de evaluación$1$2",
    );
}

function removeOuterQuotes(
  value: string,
): string {
  return value
    .replace(/^["“”]\s*/, "")
    .replace(/\s*["“”]\s*$/, "");
}

function removeEditorialNotes(
  value: string,
): string {
  return EDITORIAL_NOTE_PATTERNS.reduce(
    (normalizedValue, pattern) =>
      normalizedValue.replace(pattern, ""),
    value,
  );
}

function removeInternalMetadata(
  value: string,
): string {
  const withoutMetadata = value
    .replace(
      INTERNAL_METADATA_GROUP_PATTERN,
      "",
    )
    .replace(
      INTERNAL_METADATA_PATTERN,
      "",
    );

  return INTERNAL_REFERENCE_PATTERNS.reduce(
    (normalizedValue, pattern) =>
      normalizedValue.replace(pattern, ""),
    withoutMetadata,
  );
}

function normalizeDuaPrefix(
  value: string,
): string {
  if (!DUA_PREFIX_PATTERN.test(value)) {
    return value;
  }

  return value
    .replace(
      DUA_PARENTHETICAL_COLOR_PATTERN,
      "$1 — ",
    )
    .replace(
      DUA_COLOR_PATTERN,
      " — ",
    );
}

function cleanContentFragment(
  value: string,
): string {
  return normalizeDuaPrefix(
    removeInternalMetadata(
      removeEditorialNotes(
        removeOuterQuotes(value.trim()),
      ),
    ),
  )
    .replace(
      /compañ(?:er)?(?:@|\[[^\]]*protected[^\]]*\])/gi,
      "compañero o compañera",
    )
  
    .replace(/\(\s*\)/g, "")
    .replace(/\.\s*\)\s*$/, ").")
    .replace(
      /\bmini[-\s]?feedback\s+oral\b/gi,
      "retroalimentación oral breve",
    )
    .replace(
      /\bmini[-\s]?feedback\b/gi,
      "retroalimentación breve",
    )
       .replace(
      /\bfeedback\b/gi,
      "retroalimentación",
    )
    .replace(
      /\bswap\s+de\s+roles\b/gi,
      "intercambio de roles",
    )
    .replace(
      /\bswap\b/gi,
      "intercambio",
    )
    .replace(
      /\be\s+ejecutar\b/gi,
      "y ejecutar",
    )
    .replace(
      INVALID_HARROW_ACTION_LEVEL_PATTERN,
      `$1${HARROW_SPECIALIZED_LEVEL}`,
    )
    .replace(/\s+/g, " ")
    .replace(/\s+([,.;:])/g, "$1")
    .replace(/\s+([)])/, "$1")
    .trim();
}

function splitAndCleanContentItem(
  value: string,
): string[] {
  return value
    .split(MALFORMED_FRAGMENT_SEPARATOR)
    .flatMap((fragment) =>
      fragment.split(
        STATION_FRAGMENT_SEPARATOR,
      ),
    )
    .map(cleanContentFragment)
    .filter(Boolean);
}

export function normalizeGeneratedContent(
  content: GeneratedAIContent,
  objectiveTaxonomy?: AIObjectiveTaxonomy,
  formData?: Pick<
    AIFormData,
    "toolId" | "topic" | "materials" | "additionalInstructions"
  >,
): GeneratedAIContent {
  const hasDedicatedEvaluationBlock = Boolean(
    content.durationPlan?.blocks.some((block) =>
      normalizeForComparison(block.label).includes("evaluacion"),
    ),
  );
  const normalizedSections = content.sections.map((section) => ({
    ...section,
    title: section.title.trim(),
    content: section.content
      .flatMap(splitAndCleanContentItem)
      .map(normalizeActiveParticipation)
      .map((item) => normalizeRequestedTechniques(item, formData)),
  }));
  const processedSections = normalizedSections.map((section) => {
    const normalizedTitle = normalizeForComparison(section.title);
    const isObjectiveSection = normalizedTitle.includes("objetivo");
    const isEvaluationSection = normalizedTitle.includes("evaluacion");
    let normalizedContent = section.content;

    if (isObjectiveSection) {
      normalizedContent = normalizeObjectiveTaxonomyLevels(
        normalizedContent,
        objectiveTaxonomy,
      );
    }

    if (hasDedicatedEvaluationBlock && isEvaluationSection) {
      normalizedContent = normalizedContent.map(normalizeEvaluationTiming);
    }

    return {
      ...section,
      content: normalizedContent,
    };
  });
  const orderedSections = normalizeLessonPlanSectionOrder(processedSections);
  const finalSections = content.rubric
    ? normalizeRubricCalculation(
        orderedSections,
        content.rubric.criteria.length,
      )
    : formData?.toolId === "assessment"
      ? normalizeAssessmentLanguage(orderedSections, formData.materials)
      : formData?.toolId === "checklist"
      ? normalizeChecklistCalculation(
          normalizeChecklistLanguage(orderedSections),
        )
      : orderedSections;

  return {
    ...content,
    title: normalizeRequestedTechniques(
      normalizeActiveParticipation(content.title.trim()),
      formData,
    ),
    introduction: normalizeRequestedTechniques(
      normalizeActiveParticipation(content.introduction.trim()),
      formData,
    ),
    sections: finalSections,
  };
}
