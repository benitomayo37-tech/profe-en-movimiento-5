import type {
  AIFormData,
  GeneratedAIContent,
} from "@/features/ai/types/ai";

export interface AssessmentValidationResult {
  valid: boolean;
  message?: string;
}

const TOTAL_SCORE_PATTERN =
  /\b(?:puntaje|puntuacion|calificacion)\s+total(?:\s+posible)?\s*(?::|es|de)?\s*(\d+(?:[.,]\d+)?)/g;

const POINT_VALUE_PATTERN =
  /\b(\d+(?:[.,]\d+)?)\s*(?:puntos?|pts?)\b/g;

const QUESTION_SCORE_PATTERN =
  /\b(?:p|pregunta|actividad|tarea|consigna)(?:\s+(?:teorica|practica))?\s*(\d+)\s*(?:[:—–-]\s*)?\(?\s*(\d+(?:[.,]\d+)?)\s*(?:puntos?|pts?)\s*\)?/g;

const REQUESTED_THEORETICAL_COUNT_PATTERN =
  /\b(\d+)\s+(?:preguntas?|actividades?|tareas?)\s+teoricas?\b/;

const REQUESTED_PRACTICAL_COUNT_PATTERN =
  /\b(\d+)\s+(?:tareas?|actividades?)\s+practicas?\b/;

const THEORETICAL_ITEM_PATTERN =
  /\b(?:pregunta|actividad)\s*(\d+)\b/g;

const TASK_ITEM_PATTERN =
  /\b(?:tarea|actividad|situacion|ejercicio|prueba)(?:\s+practica)?\s*(\d+)\b/g;

const PRACTICAL_PASS_TOTAL_PATTERNS = [
  /\b(?:realiza|realizara|realice|ejecuta|ejecutara|ejecute|registra|registrar|registre|completa|completar|complete)\b[^.!?]{0,60}?\b(\d+)\s+pases\b/g,
  /\b\d+\s+de\s+(\d+)\s+pases\b/g,
];

const REQUIRED_SECTION_RULES = [
  {
    label: "Objetivo e indicaciones",
    pattern:
      /\b(?:objetivo[^|]{0,80}indicaciones|indicaciones[^|]{0,80}objetivo)\b/,
  },
  {
    label:
      "Preguntas o actividades teóricas",
    pattern:
      /\b(?:preguntas?|actividades?)\s+teoricas?\b/,
  },
  {
    label:
      "Tareas prácticas o situaciones de aplicación",
    pattern:
      /\b(?:tareas?\s+practicas?|situaciones?\s+de\s+aplicacion)\b/,
  },
  {
    label: "Criterios de calificación",
    pattern:
      /\bcriterios?\s+de\s+calificacion\b/,
  },
  {
    label:
      "Respuestas esperadas u orientaciones para el docente",
    pattern:
      /\b(?:respuestas?\s+esperadas?|orientaciones?\s+para\s+el\s+docente|solucionario)\b/,
  },
] as const;

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

function hasBalancedParentheses(
  value: string,
): boolean {
  let depth = 0;

  for (const character of value) {
    if (character === "(") {
      depth += 1;
    } else if (character === ")") {
      if (depth === 0) {
        return false;
      }

      depth -= 1;
    }
  }

  return depth === 0;
}

function parseNumericValue(
  value: string,
): number {
  return Number(
    value.replace(",", "."),
  );
}

function invalid(
  message: string,
): AssessmentValidationResult {
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

function extractPatternValues(
  text: string,
  pattern: RegExp,
): number[] {
  const values: number[] = [];

  for (
    const match of
      text.matchAll(pattern)
  ) {
    const parsedValue =
      parseNumericValue(match[1]);

    if (
      Number.isFinite(
        parsedValue,
      )
    ) {
      values.push(parsedValue);
    }
  }

  return values;
}

function getQuestionScores(
  sections:
    GeneratedAIContent["sections"],
  answerSections: boolean,
): Map<number, number> {
  const scores =
    new Map<number, number>();

  for (const section of sections) {
    const normalizedTitle =
      normalizeText(section.title);

    const isAnswerSection =
      normalizedTitle.includes(
        "respuesta",
      ) ||
      normalizedTitle.includes(
        "orientacion",
      ) ||
      normalizedTitle.includes(
        "solucion",
      );

    if (
      isAnswerSection !==
      answerSections
    ) {
      continue;
    }

    const sectionText =
      normalizeText(
        section.content.join(" "),
      );

    for (
      const match of
        sectionText.matchAll(
          QUESTION_SCORE_PATTERN,
        )
    ) {
      const questionNumber =
        Number.parseInt(
          match[1],
          10,
        );

      const score =
        parseNumericValue(
          match[2],
        );

      if (
        Number.isInteger(
          questionNumber,
        ) &&
        Number.isFinite(score)
      ) {
        scores.set(
          questionNumber,
          score,
        );
      }
    }
  }

  return scores;
}

function validateRequiredSections(
  content: GeneratedAIContent,
): AssessmentValidationResult {
  let previousSectionIndex = -1;

  for (
    const rule of
      REQUIRED_SECTION_RULES
  ) {
    const sectionIndex =
      content.sections.findIndex(
        (section) =>
          rule.pattern.test(
            normalizeText(
              section.title,
            ),
          ),
      );

    if (sectionIndex < 0) {
      return invalid(
        `La evaluación debe incluir una sección diferenciada para "${rule.label}".`,
      );
    }

    if (
      sectionIndex <=
      previousSectionIndex
    ) {
      return invalid(
        `La sección "${rule.label}" no aparece en el orden requerido.`,
      );
    }

    previousSectionIndex =
      sectionIndex;
  }

  return {
    valid: true,
  };
}

function getRequestedItemCount(
  requestText: string,
  pattern: RegExp,
): number | null {
  const match = requestText.match(pattern);

  if (!match?.[1]) {
    return null;
  }

  const count = Number.parseInt(
    match[1],
    10,
  );

  return Number.isInteger(count) &&
    count > 0
    ? count
    : null;
}

function countDistinctItems(
  content: GeneratedAIContent,
  sectionTitlePattern: RegExp,
  itemPattern: RegExp,
): number {
  const itemNumbers = new Set<number>();

  for (const section of content.sections) {
    const normalizedTitle =
      normalizeText(section.title);

    if (
      !sectionTitlePattern.test(
        normalizedTitle,
      )
    ) {
      continue;
    }

    const sectionText = normalizeText(
      [
        section.title,
        ...section.content,
      ].join(" "),
    );

    for (
      const match of
        sectionText.matchAll(itemPattern)
    ) {
      const itemNumber =
        Number.parseInt(match[1], 10);

      if (Number.isInteger(itemNumber)) {
        itemNumbers.add(itemNumber);
      }
    }
  }

  return itemNumbers.size;
}

function validateRequestedItemCounts(
  formData: AIFormData,
  content: GeneratedAIContent,
): AssessmentValidationResult {
  const requestText = normalizeText(
    [
      formData.topic,
      formData.additionalInstructions,
    ].join(" "),
  );

  const requestedTheoreticalCount =
    getRequestedItemCount(
      requestText,
      REQUESTED_THEORETICAL_COUNT_PATTERN,
    );

  const requestedPracticalCount =
    getRequestedItemCount(
      requestText,
      REQUESTED_PRACTICAL_COUNT_PATTERN,
    );

  const generatedTheoreticalCount =
    countDistinctItems(
      content,
      /\b(?:preguntas?|actividades?)\s+teoricas?\b/,
      THEORETICAL_ITEM_PATTERN,
    );

  const generatedPracticalCount =
    countDistinctItems(
      content,
      /\b(?:tareas?\s+practicas?|situaciones?\s+de\s+aplicacion)\b/,
      TASK_ITEM_PATTERN,
    );

  if (
    requestedTheoreticalCount !== null &&
    generatedTheoreticalCount !==
      requestedTheoreticalCount
  ) {
    return invalid(
      `Se solicitaron ${requestedTheoreticalCount} preguntas o actividades teóricas, pero la evaluación generó ${generatedTheoreticalCount}.`,
    );
  }

  if (
    requestedPracticalCount !== null &&
    generatedPracticalCount !==
      requestedPracticalCount
  ) {
    return invalid(
      `Se solicitaron ${requestedPracticalCount} tareas prácticas, pero la evaluación generó ${generatedPracticalCount}.`,
    );
  }

  return {
    valid: true,
  };
}

function getTaskFragments(
  content: GeneratedAIContent,
): Map<number, string[]> {
  const fragments =
    new Map<number, string[]>();

  for (const section of content.sections) {
    for (const item of section.content) {
      const normalizedItem =
        normalizeText(item);

      const taskMatches = Array.from(
        normalizedItem.matchAll(
          TASK_ITEM_PATTERN,
        ),
      );

      for (
        let index = 0;
        index < taskMatches.length;
        index += 1
      ) {
        const taskNumber =
          Number.parseInt(
            taskMatches[index][1],
            10,
          );

        const start =
          taskMatches[index].index ?? 0;

        const end =
          taskMatches[index + 1]?.index ??
          normalizedItem.length;

        const taskFragment =
          normalizedItem.slice(start, end);

        const previousFragments =
          fragments.get(taskNumber) ?? [];

        fragments.set(taskNumber, [
          ...previousFragments,
          taskFragment,
        ]);
      }
    }
  }

  return fragments;
}

function validatePracticalAttemptConsistency(
  content: GeneratedAIContent,
): AssessmentValidationResult {
  const taskFragments =
    getTaskFragments(content);

  for (
    const [taskNumber, fragments] of
      taskFragments
  ) {
    const declaredPassTotals =
      new Set<number>();

    for (const fragment of fragments) {
      for (
        const pattern of
          PRACTICAL_PASS_TOTAL_PATTERNS
      ) {
        for (
          const match of
            fragment.matchAll(pattern)
        ) {
          const passTotal =
            Number.parseInt(match[1], 10);

          if (
            Number.isInteger(passTotal) &&
            passTotal > 0
          ) {
            declaredPassTotals.add(
              passTotal,
            );
          }
        }
      }
    }

    if (declaredPassTotals.size > 1) {
      return invalid(
        `La Tarea ${taskNumber} utiliza cantidades diferentes de pases o intentos: ${[
          ...declaredPassTotals,
        ].join(", ")}. La consigna, los criterios y las orientaciones deben utilizar la misma cantidad.`,
      );
    }
  }

  return {
    valid: true,
  };
}

function validateAssessmentLanguageAndTechnique(
  content: GeneratedAIContent,
  visibleText: string,
): AssessmentValidationResult {
  const visibleFragments = [
    content.title,
    content.introduction,
    ...content.sections.flatMap((section) => [
      section.title,
      ...section.content,
    ]),
  ];

  if (
    visibleFragments.some(
      (fragment) => !hasBalancedParentheses(fragment),
    )
  ) {
    return invalid(
      "Cierra todos los paréntesis y coloca el punto final después del paréntesis de cierre.",
    );
  }

  if (/\bfollow[-\s]?through\b/.test(visibleText)) {
    return invalid(
      'Utiliza "acompañamiento final de manos y muñecas" en lugar del anglicismo "follow-through".',
    );
  }

  if (/\bvocalmente\b/.test(visibleText)) {
    return invalid(
      'Utiliza "verbalmente" en lugar de "vocalmente".',
    );
  }

  if (/\bfichas\s+verbales\b/.test(visibleText)) {
    return invalid(
      'Utiliza "retroalimentaciones verbales breves" o "indicaciones verbales breves"; no escribas "fichas verbales".',
    );
  }

  if (
    /\bpor\s+cada\s+elemento\s+correcto\s+se\s+evaluara\s+la\s+escala\s+completa\b/.test(
      visibleText,
    )
  ) {
    return invalid(
      'Presenta la puntuación con la expresión "se aplicará la siguiente escala de puntuación".',
    );
  }

  const missingBulletSpace = content.sections.some((section) =>
    section.content.some((item) => /^-\S/.test(item.trim())),
  );

  if (missingBulletSpace) {
    return invalid(
      "Deja un espacio después de cada guion utilizado como viñeta.",
    );
  }

  if (
    /\bmicroturnos?\b/.test(visibleText) &&
    /\b(?:los\s+)?primeros\s+dos\s+intentos\b/.test(visibleText)
  ) {
    return invalid(
      'La organización utiliza microturnos. Escribe "los dos primeros microturnos" también en las opciones DUA y las orientaciones.',
    );
  }

  if (/\buno\s+pase\b/.test(visibleText)) {
    return invalid(
      'Corrige la concordancia gramatical: escribe "un pase por microturno", no "uno pase por microturno".',
    );
  }

  if (
    /\bmicroturnos?\b/.test(visibleText) &&
    /\b(?:intentos\s+previos|numero\s+de\s+intentos)\b/.test(visibleText)
  ) {
    return invalid(
      'Mantén la terminología de la organización: escribe "microturnos anteriores" y "número de microturnos" en lugar de expresiones con "intentos".',
    );
  }

  if (/\baltura\s+de\s+la\s+linea\s+de\s+recepcion\b/.test(visibleText)) {
    return invalid(
      "El criterio del pase de pique debe indicar un solo bote controlado aproximadamente a dos tercios de la distancia entre el pasador y el receptor y la llegada a una zona recepcionable.",
    );
  }

  const questionSections = content.sections.filter((section) =>
    /\b(?:preguntas?|actividades?)\s+teoricas?\b/.test(
      normalizeText(section.title),
    ),
  );
  const answerSections = content.sections.filter((section) => {
    const title = normalizeText(section.title);
    return (
      title.includes("respuesta") ||
      title.includes("orientacion") ||
      title.includes("solucion")
    );
  });

  const comparativeQuestionNumbers = new Set<number>();

  for (const section of questionSections) {
    for (const item of section.content) {
      const normalizedItem = normalizeText(item);
      const match = normalizedItem.match(/\bpregunta\s+(\d+)\b/);

      if (
        match &&
        /\b(?:diferenci\w*|compar\w*)\b/.test(
          normalizedItem,
        ) &&
        /\bpase\s+de\s+pecho\b/.test(normalizedItem) &&
        /\bpase\s+de\s+pique\b/.test(normalizedItem)
      ) {
        comparativeQuestionNumbers.add(Number(match[1]));
      }
    }
  }

  for (const questionNumber of comparativeQuestionNumbers) {
    for (const section of answerSections) {
      const normalizedItems = section.content.map(normalizeText);
      const answerIndex = normalizedItems.findIndex((item) =>
        new RegExp(
          `\\b(?:respuesta\\s+esperada\\s+)?pregunta\\s+${questionNumber}\\b`,
        ).test(item),
      );

      if (answerIndex < 0) {
        continue;
      }

      const answerFragments: string[] = [];

      for (let index = answerIndex; index < normalizedItems.length; index += 1) {
        const fragment = normalizedItems[index];

        if (
          index > answerIndex &&
          /\b(?:respuesta\s+esperada\s+)?pregunta\s+\d+\b/.test(fragment)
        ) {
          break;
        }

        if (
          /\borientaciones?\s+practicas?\s+tarea\b/.test(fragment) ||
          /\bobservacion\s+y\s+registro\b/.test(fragment)
        ) {
          break;
        }

        answerFragments.push(fragment);
      }

      if (
        /\bpase\s+por\s+encima\s+de\s+la\s+cabeza\b/.test(
          answerFragments.join(" "),
        )
      ) {
        return invalid(
          `La respuesta esperada de la pregunta ${questionNumber} debe comparar exclusivamente el pase de pecho y el pase de pique. No introduzcas el pase por encima de la cabeza como tercera técnica.`,
        );
      }
    }
  }

  return { valid: true };
}

function parseSmallCount(value: string): number | null {
  const normalizedValue = normalizeText(value);
  const wordValues: Record<string, number> = {
    un: 1,
    uno: 1,
    una: 1,
    dos: 2,
    tres: 3,
    cuatro: 4,
    cinco: 5,
  };
  const numericValue = Number.parseInt(normalizedValue, 10);

  if (Number.isInteger(numericValue) && numericValue > 0) {
    return numericValue;
  }

  return wordValues[normalizedValue] ?? null;
}

function validateAssessmentLogistics(
  formData: AIFormData,
  content: GeneratedAIContent,
  visibleText: string,
): AssessmentValidationResult {
  const requestText = normalizeText(
    [
      formData.topic,
      formData.materials,
      formData.additionalInstructions,
    ].join(" "),
  );
  const practicalSections = content.sections.filter((section) => {
    const title = normalizeText(section.title);

    return (
      title.includes("tareas practicas") ||
      title.includes("situaciones de aplicacion")
    );
  });
  const practicalTasks = getTaskFragments({
    ...content,
    sections: practicalSections,
  });
  const hasWritingMaterials =
    /\b(?:papel|hojas?|fichas?|cuadernos?|lapices?|boligrafos?|pizarras?)\b/.test(
      requestText,
    );

  if (
    !hasWritingMaterials &&
    /\b(?:por\s+escrito|respuesta\s+escrita|respuestas\s+escritas|anota(?:r)?\b)\b/.test(
      visibleText,
    )
  ) {
    return invalid(
      "No solicites respuestas escritas cuando el docente no proporcionó papel, fichas, cuadernos ni instrumentos de escritura. Utiliza respuestas orales breves integradas en las rotaciones.",
    );
  }

  for (const [taskNumber, fragments] of practicalTasks) {
    const taskText = fragments.join(" ");
    const studentsMatch = taskText.match(
      /\b(\d+)\s+estudiantes\s+cada\s+una\b/,
    );
    const microturnMatch = taskText.match(
      /\bmicroturno\s*\(?(\d+)\s+segundos?\)?/,
    );
    const turnsMatch = taskText.match(
      /\b(?:exactamente\s+)?(\d+|un|uno|una|dos|tres|cuatro|cinco)\s+microturnos?\s+como\s+pasador\b/,
    );
    const allocatedMinutesMatch = taskText.match(
      /\btiempo\s+asignado\s*:\s*(\d+(?:[.,]\d+)?)\s+minutos?\b/,
    );
    const simultaneousPassersMatch = taskText.match(
      /\b(\d+)\s+pasadores?\b/,
    );
    const students = studentsMatch
      ? Number.parseInt(studentsMatch[1], 10)
      : null;
    const microturnSeconds = microturnMatch
      ? Number.parseInt(microturnMatch[1], 10)
      : null;
    const turnsPerStudent = turnsMatch
      ? parseSmallCount(turnsMatch[1])
      : null;
    const allocatedMinutes = allocatedMinutesMatch
      ? parseNumericValue(allocatedMinutesMatch[1])
      : null;
    const simultaneousPassers = simultaneousPassersMatch
      ? Number.parseInt(simultaneousPassersMatch[1], 10)
      : 1;

    if (
      students &&
      microturnSeconds &&
      turnsPerStudent &&
      allocatedMinutes &&
      simultaneousPassers > 0
    ) {
      const requiredMinutes =
        (students * turnsPerStudent * microturnSeconds) /
        (simultaneousPassers * 60);

      if (allocatedMinutes + 0.001 < requiredMinutes) {
        return invalid(
          `La Tarea ${taskNumber} necesita al menos ${requiredMinutes} minutos: ${students} estudiantes x ${turnsPerStudent} microturnos x ${microturnSeconds} segundos, con ${simultaneousPassers} pasador por turno. Se declararon solamente ${allocatedMinutes} minutos. Ajusta el bloque y redistribuye la duración total sin superponer tiempos.`,
        );
      }
    }
  }

  if (/\bparejas\s+fijas\b/.test(visibleText)) {
    return invalid(
      'No utilices "parejas fijas". Organiza parejas asignadas con funciones rotativas de pase y recepción.',
    );
  }

  if (/\bregistre\s+mentalmente\b/.test(visibleText)) {
    return invalid(
      'No indiques "registre mentalmente". Utiliza observación directa del docente y retroalimentación oral breve durante las rotaciones.',
    );
  }

  if (
    /\b(?:stability|retroalimentacion\s+activo|retroalimentacion\s+inmediato|preguntas?\s+puntadas?)\b/.test(
      visibleText,
    )
  ) {
    return invalid(
      "La evaluación debe estar completamente en español y utilizar concordancia gramatical correcta: estabilidad, retroalimentación activa y preguntas puntuadas.",
    );
  }

  const objectiveText = normalizeText(
    content.sections
      .filter((section) =>
        normalizeText(section.title).includes("objetivo e indicaciones"),
      )
      .flatMap((section) => section.content)
      .join(" "),
  );
  const practicalText = normalizeText(
    practicalSections.flatMap((section) => section.content).join(" "),
  );

  if (
    /\btoma\s+de\s+decision\b/.test(objectiveText) &&
    !/\b(?:elige|selecciona|escoge|decide)\b[^.!?]{0,120}\bpase\b/.test(
      practicalText,
    )
  ) {
    return invalid(
      'El objetivo menciona "toma de decisión", pero ninguna tarea práctica exige elegir el pase apropiado ante una situación concreta. Elimina esa capacidad del objetivo o incorpora una consigna evaluada que realmente la compruebe.',
    );
  }

  const duaText = normalizeText(
    content.sections
      .filter((section) =>
        normalizeText(section.title).includes("estrategias dua"),
      )
      .flatMap((section) => section.content)
      .join(" "),
  );

  if (
    /\b(?:concentrar|concentrarlos|completar)\b[^.!?]{0,100}\b(?:un\s+solo\s+microturno|6\s+en\s+30\s+segundos?)\b/.test(
      duaText,
    )
  ) {
    return invalid(
      "DUA debe conservar los dos microturnos definidos en la tarea práctica y no puede concentrar todos los intentos en uno solo.",
    );
  }

  if (/\belegir\s+en\s+cual\s+de\s+sus\s+(?:tres\s+)?oportunidades\b/.test(duaText)) {
    return invalid(
      "DUA debe permitir elegir solamente el orden de los dos primeros microturnos y reservar al docente la selección del pase que se repite en el tercero.",
    );
  }

  if (
    /\bcronometro\b/.test(visibleText) &&
    !/\bcronometro\b/.test(requestText)
  ) {
    return invalid(
      "No añadas un cronómetro si no fue proporcionado. Indica que el docente controla el tiempo y anuncia verbalmente cada cambio.",
    );
  }

  if (
    /\bayudante\b/.test(visibleText) &&
    !/\bayudante\b/.test(requestText)
  ) {
    return invalid(
      "No añadas un ayudante no solicitado. El docente debe controlar y anunciar las rotaciones.",
    );
  }

  return {
    valid: true,
  };
}

function validateExplicitPartialScoreScale(
  content: GeneratedAIContent,
): AssessmentValidationResult {
  const theoreticalText = normalizeText(
    content.sections
      .filter((section) =>
        /\b(?:preguntas?|actividades?)\s+teoricas?\b/.test(
          normalizeText(section.title),
        ),
      )
      .flatMap((section) => section.content)
      .join(" "),
  );
  const criteriaText = normalizeText(
    content.sections
      .filter((section) =>
        normalizeText(section.title).includes("criterios de calificacion"),
      )
      .flatMap((section) => section.content)
      .join(" "),
  );
  const asksThreeElementsForTwoPoints =
    /\bpregunta\s+\d+\s*\(\s*2\s+puntos?\s*\)[^|]{0,500}\b(?:tres|3)\b/.test(
      theoreticalText,
    );

  if (!asksThreeElementsForTwoPoints) {
    return {
      valid: true,
    };
  }

  const hasFullScoreRule =
    /\b(?:tres|3)\b[^.!?]{0,100}\b2\s+puntos?\b/.test(criteriaText);
  const hasPartialScoreRule =
    /\b(?:dos|2)\b[^.!?]{0,100}\b1\s+punto\b/.test(criteriaText);
  const hasZeroScoreRule =
    /\b(?:una|uno|1|ninguna|ninguno|cero|0)\b[^.!?]{0,120}\b0\s+puntos?\b/.test(
      criteriaText,
    );

  if (
    !hasFullScoreRule ||
    !hasPartialScoreRule ||
    !hasZeroScoreRule
  ) {
    return invalid(
      "Una pregunta de 2 puntos que solicita tres respuestas debe declarar una escala inequívoca: tres respuestas correctas = 2 puntos; dos = 1 punto; una o ninguna = 0 puntos.",
    );
  }

  return {
    valid: true,
  };
}

function validateIndividualPracticalScoring(
  content: GeneratedAIContent,
): AssessmentValidationResult {
  const criteriaText = normalizeText(
    content.sections
      .filter((section) =>
        normalizeText(section.title).includes("criterios de calificacion"),
      )
      .flatMap((section) => section.content)
      .join(" "),
  );
  const orientationText = normalizeText(
    content.sections
      .filter((section) => {
        const title = normalizeText(section.title);

        return (
          title.includes("respuestas esperadas") ||
          title.includes("orientaciones para el docente")
        );
      })
      .flatMap((section) => section.content)
      .join(" "),
  );
  const task4Criteria =
    criteriaText.match(/\btarea\s+4\b[\s\S]*?(?=\btarea\s+5\b|$)/)?.[0] ?? "";
  const assignsPasserScoreFromReceiver =
    /\brecepcion\s+y\s+control\b[^.!?]{0,180}\breceptor\b[^.!?]{0,120}\b1\s+punto\b/.test(
      task4Criteria,
    ) ||
    /\breceptor\b[^.!?]{0,180}\b(?:absorbe|controla|recibe)\b[^.!?]{0,120}\b1\s+punto\b/.test(
      task4Criteria,
    );

  if (assignsPasserScoreFromReceiver) {
    return invalid(
      "La Tarea 4 es una evaluación individual del pasador. Sus tres puntos deben depender exclusivamente de sus dos pases y de su propia técnica corporal; no atribuyas al pasador un punto por el control realizado por el receptor.",
    );
  }

  if (
    /\b(?:mejora(?:da)?|mejorada)\s+t[eé]cnica\b|\bt[eé]cnica\s+mejorada\b/.test(
      `${criteriaText} ${orientationText}`,
    )
  ) {
    return invalid(
      "El tercer microturno de la Tarea 5 debe comprobar nuevamente un criterio técnico observable. No exijas una mejora respecto al intento anterior para obtener el punto.",
    );
  }

  const allAssessmentText = normalizeText(
    content.sections.flatMap((section) => section.content).join(" "),
  );

  if (
    /\b(?:balon|pase)\s+dirigido\s+por\s+encima\s+de\s+la\s+cabeza\s+del\s+receptor\b/.test(
      allAssessmentText,
    )
  ) {
    return invalid(
      "El pase por encima de la cabeza debe liberarse desde encima de la cabeza del pasador y llegar a una zona recepcionable del compañero; no debe dirigirse por encima de la cabeza del receptor.",
    );
  }

  if (/\bemerger\s+las\s+manos\b/.test(allAssessmentText)) {
    return invalid(
      'La expresión "emerger las manos" es incorrecta. Utiliza "colocar" o "mantener las manos frente al pecho".',
    );
  }

  const task5Text = normalizeText(
    content.sections
      .flatMap((section) => section.content)
      .join(" ")
      .match(/\btarea\s+5\b[\s\S]*?(?=\btarea\s+6\b|$)/)?.[0] ?? "",
  );
  const givesFreeChoiceAcrossThreeTurns =
    /\bel\s+estudiante\s+(?:puede\s+)?(?:elegir|elige)\b[^.!?]{0,180}\b(?:tres\s+microturnos|tres\s+oportunidades|cada\s+tipo\s+de\s+pase)\b/.test(
      task5Text,
    );

  if (givesFreeChoiceAcrossThreeTurns) {
    return invalid(
      "En la Tarea 5, el estudiante puede elegir únicamente el orden de los dos primeros microturnos. El docente debe indicar cuál pase se repite en el tercer microturno.",
    );
  }

  const usesFourZones = /\b4\s+zonas\b/.test(allAssessmentText);
  const hasStaggeredObservation =
    /\bzona\s*1\b[^.!?]{0,100}\bsegundo\s*0\b/.test(allAssessmentText) &&
    /\bzona\s*2\b[^.!?]{0,100}\bsegundo\s*5\b/.test(allAssessmentText) &&
    /\bzona\s*3\b[^.!?]{0,100}\bsegundo\s*10\b/.test(allAssessmentText) &&
    /\bzona\s*4\b[^.!?]{0,100}\bsegundo\s*15\b/.test(allAssessmentText);

  if (usesFourZones && !hasStaggeredObservation) {
    return invalid(
      "Con 4 zonas simultáneas, escalona la ejecución calificada dentro de cada microturno de 30 segundos: zona 1 al segundo 0, zona 2 al segundo 5, zona 3 al segundo 10 y zona 4 al segundo 15, para que el docente observe individualmente a cada pasador.",
    );
  }

  return {
    valid: true,
  };
}

function validateStudentScoreTotal(
  content: GeneratedAIContent,
): AssessmentValidationResult {
  const studentScores =
    getQuestionScores(
      content.sections,
      false,
    );

  if (studentScores.size === 0) {
    return invalid(
      'Cada pregunta, actividad o tarea debe identificarse y mostrar inmediatamente su puntaje, por ejemplo: "Pregunta 1 (2 puntos)".',
    );
  }

  const calculatedTotal = [
    ...studentScores.values(),
  ].reduce(
    (total, score) =>
      total + score,
    0,
  );

  if (
    Math.abs(
      calculatedTotal - 10,
    ) > 0.001
  ) {
    return invalid(
      `Los puntajes individuales suman ${calculatedTotal} puntos. Deben sumar exactamente 10 puntos.`,
    );
  }

  return {
    valid: true,
  };
}

function validateQuestionScoreMatching(
  content: GeneratedAIContent,
): AssessmentValidationResult {
  const studentScores =
    getQuestionScores(
      content.sections,
      false,
    );

  const answerScores =
    getQuestionScores(
      content.sections,
      true,
    );

  for (
    const [
      questionNumber,
      studentScore,
    ] of studentScores
  ) {
    const answerScore =
      answerScores.get(
        questionNumber,
      );

    if (
      answerScore !== undefined &&
      Math.abs(
        studentScore -
          answerScore,
      ) > 0.001
    ) {
      return invalid(
        `La pregunta ${questionNumber} vale ${studentScore} puntos en las consignas, pero ${answerScore} puntos en las respuestas esperadas.`,
      );
    }
  }

  return {
    valid: true,
  };
}

export function validateGeneratedAssessment(
  formData: AIFormData,
  content: GeneratedAIContent,
): AssessmentValidationResult {
  if (
    formData.toolId !==
    "assessment"
  ) {
    return {
      valid: true,
    };
  }

  const sectionValidation =
    validateRequiredSections(
      content,
    );

  if (!sectionValidation.valid) {
    return sectionValidation;
  }

  const itemCountValidation =
    validateRequestedItemCounts(
      formData,
      content,
    );

  if (!itemCountValidation.valid) {
    return itemCountValidation;
  }

  const attemptConsistencyValidation =
    validatePracticalAttemptConsistency(
      content,
    );

  if (
    !attemptConsistencyValidation.valid
  ) {
    return attemptConsistencyValidation;
  }

  const visibleText =
    getVisibleContentText(content);

  const logisticsValidation =
    validateAssessmentLogistics(
      formData,
      content,
      visibleText,
    );

  if (!logisticsValidation.valid) {
    return logisticsValidation;
  }

  const replacesPracticalExecution =
    /\bo\s+explicacion\b[^.!?]{0,120}\bsi\s+hay\s+limitacion\s+temporal\b/.test(
      visibleText,
    ) ||
    /\b(?:sustituir|reemplazar)\b[^.!?]{0,100}\b(?:ejecucion|tarea\s+practica)\b/.test(
      visibleText,
    );

  if (replacesPracticalExecution) {
    return invalid(
      "Las opciones DUA pueden adaptar el acceso o la forma de ejecución, pero no sustituir una evidencia motriz por una explicación debido al tiempo disponible.",
    );
  }

  const languageAndTechniqueValidation =
    validateAssessmentLanguageAndTechnique(content, visibleText);

  if (!languageAndTechniqueValidation.valid) {
    return languageAndTechniqueValidation;
  }

  const declaredTotals =
    extractPatternValues(
      visibleText,
      TOTAL_SCORE_PATTERN,
    );

  if (declaredTotals.length === 0) {
    return invalid(
      'La evaluación debe indicar explícitamente "Puntaje total: 10 puntos".',
    );
  }

  const invalidTotal =
    declaredTotals.find(
      (total) =>
        Math.abs(total - 10) >
        0.001,
    );

  if (
    invalidTotal !== undefined
  ) {
    return invalid(
      `La evaluación declara un total de ${invalidTotal} puntos. La puntuación total debe ser exactamente 10 puntos.`,
    );
  }

  const pointValues =
    extractPatternValues(
      visibleText,
      POINT_VALUE_PATTERN,
    );

  const excessivePointValue =
    pointValues.find(
      (value) => value > 10,
    );

  if (
    excessivePointValue !==
    undefined
  ) {
    return invalid(
      `El contenido incluye una escala o componente de ${excessivePointValue} puntos. Ningún valor puede superar el total de 10 puntos.`,
    );
  }

  const forbiddenScalePattern =
    /\b(?:sobre|escala\s+de|escala\s+sobre)\s+(?:20|30|40|50|60|100)\b/;

  if (
    forbiddenScalePattern.test(
      visibleText,
    )
  ) {
    return invalid(
      "La evaluación utiliza una escala diferente de 10 puntos.",
    );
  }

  const conversionPattern =
    /\bconvertir\b[^.!?]{0,100}\b(?:sobre\s+10|calificacion|nota)\b/;

  if (
    conversionPattern.test(
      visibleText,
    )
  ) {
    return invalid(
      "La evaluación debe calificarse directamente sobre 10 y no convertir otra escala posteriormente.",
    );
  }

  const scoreTotalValidation =
    validateStudentScoreTotal(
      content,
    );

  if (!scoreTotalValidation.valid) {
    return scoreTotalValidation;
  }

  const partialScoreValidation =
    validateExplicitPartialScoreScale(
      content,
    );

  if (!partialScoreValidation.valid) {
    return partialScoreValidation;
  }

  const individualScoringValidation =
    validateIndividualPracticalScoring(
      content,
    );

  if (!individualScoringValidation.valid) {
    return individualScoringValidation;
  }

  return validateQuestionScoreMatching(
    content,
  );
}
