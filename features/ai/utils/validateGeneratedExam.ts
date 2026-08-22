import type {
  AIExamData,
  AIExamQuestionType,
  AIExamType,
  AIFormData,
  GeneratedAIContent,
} from "@/features/ai/types/ai";

export interface GeneratedExamValidationResult {
  valid: boolean;
  message?: string;
}

const validExamTypes = new Set([
  "theoretical",
  "practical",
  "mixed",
]);

const validDifficulties = new Set([
  "basic",
  "intermediate",
  "advanced",
]);

const validQuestionTypes =
  new Set<AIExamQuestionType>([
    "multiple-choice",
    "true-false",
    "matching",
    "fill-in-the-blank",
    "short-answer",
    "applied-case",
    "practical-task",
  ]);

  const allowedQuestionTypesByExamType: Record<
  AIExamType,
  ReadonlySet<AIExamQuestionType>
> = {
  theoretical:
    new Set<AIExamQuestionType>([
      "multiple-choice",
      "true-false",
      "matching",
      "fill-in-the-blank",
      "short-answer",
      "applied-case",
    ]),

  practical:
    new Set<AIExamQuestionType>([
      "applied-case",
      "practical-task",
    ]),

  mixed:
    new Set<AIExamQuestionType>([
      "multiple-choice",
      "true-false",
      "matching",
      "fill-in-the-blank",
      "short-answer",
      "applied-case",
      "practical-task",
    ]),
};

function isRecord(
  value: unknown,
): value is Record<string, unknown> {
  return (
    typeof value === "object" &&
    value !== null
  );
}

function isNonEmptyString(
  value: unknown,
): value is string {
  return (
    typeof value === "string" &&
    value.trim().length > 0
  );
}

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
    .replace(/\s+/g, " ")
    .trim();
}

function isPositiveInteger(
  value: unknown,
): value is number {
  return (
    Number.isInteger(value) &&
    Number(value) > 0
  );
}

function isStringArray(
  value: unknown,
): value is string[] {
  return (
    Array.isArray(value) &&
    value.length > 0 &&
    value.every(isNonEmptyString)
  );
}

function isValidOptions(
  value: unknown,
): boolean {
  if (value === null) {
    return true;
  }

  return (
    Array.isArray(value) &&
    value.length >= 2 &&
    value.every((option) => {
      if (!isRecord(option)) {
        return false;
      }

      return (
        isNonEmptyString(option.label) &&
        isNonEmptyString(option.text)
      );
    })
  );
}

function isValidQuestion(
  value: unknown,
): boolean {
  if (!isRecord(value)) {
    return false;
  }

  return (
    isPositiveInteger(value.number) &&
    isNonEmptyString(value.type) &&
    validQuestionTypes.has(
      value.type as AIExamQuestionType,
    ) &&
    isNonEmptyString(value.prompt) &&
    isValidOptions(value.options) &&
    isPositiveInteger(value.score) &&
    (
      value.evaluationCriteria === null ||
      isStringArray(
        value.evaluationCriteria,
      )
    )
  );
}

function isValidVersion(
  value: unknown,
): boolean {
  if (!isRecord(value)) {
    return false;
  }

  return (
    (
      value.label === "A" ||
      value.label === "B"
    ) &&
    Array.isArray(value.questions) &&
    value.questions.length > 0 &&
    value.questions.every(
      isValidQuestion,
    )
  );
}

function isValidAnswer(
  value: unknown,
): boolean {
  if (!isRecord(value)) {
    return false;
  }

  return (
    (
      value.version === "A" ||
      value.version === "B"
    ) &&
    isPositiveInteger(
      value.questionNumber,
    ) &&
    isNonEmptyString(value.answer) &&
    (
      value.explanation === null ||
      isNonEmptyString(
        value.explanation,
      )
    )
  );
}

function isValidGradeRow(
  value: unknown,
): boolean {
  if (!isRecord(value)) {
    return false;
  }

  return (
    Number.isInteger(value.earnedScore) &&
    Number(value.earnedScore) >= 0 &&
    typeof value.finalGrade === "number" &&
    Number.isFinite(value.finalGrade) &&
    value.finalGrade >= 0 &&
    value.finalGrade <= 10
  );
}

export function isStructurallyValidGeneratedExam(
  value: unknown,
): value is AIExamData | null {
  if (value === null) {
    return true;
  }

  if (!isRecord(value)) {
    return false;
  }

  const answerKeyIsValid =
    value.answerKey === null ||
    (
      Array.isArray(value.answerKey) &&
      value.answerKey.length > 0 &&
      value.answerKey.every(
        isValidAnswer,
      )
    );

  const gradingTableIsValid =
    value.gradingTable === null ||
    (
      Array.isArray(
        value.gradingTable,
      ) &&
      value.gradingTable.length > 0 &&
      value.gradingTable.every(
        isValidGradeRow,
      )
    );

  const formulaIsValid =
    value.ruleOfThreeFormula === null ||
    isNonEmptyString(
      value.ruleOfThreeFormula,
    );

  return (
    isNonEmptyString(value.title) &&
    isNonEmptyString(value.examType) &&
    validExamTypes.has(value.examType) &&
    isNonEmptyString(value.difficulty) &&
    validDifficulties.has(
      value.difficulty,
    ) &&
    isPositiveInteger(
      value.totalScore,
    ) &&
    isStringArray(
      value.generalInstructions,
    ) &&
    Array.isArray(value.versions) &&
    value.versions.length >= 1 &&
    value.versions.length <= 2 &&
    value.versions.every(
      isValidVersion,
    ) &&
    answerKeyIsValid &&
    gradingTableIsValid &&
    formulaIsValid
  );
}

function invalid(
  message: string,
): GeneratedExamValidationResult {
  return {
    valid: false,
    message,
  };
}

function validateExamConfiguration(
  config: NonNullable<
    AIFormData["examConfig"]
  >,
): GeneratedExamValidationResult {
  if (
    !validExamTypes.has(
      config.examType,
    ) ||
    !validDifficulties.has(
      config.difficulty,
    )
  ) {
    return invalid(
      "La configuración contiene un tipo de examen o dificultad no válido.",
    );
  }

  if (
    config.versionMode !== "A" &&
    config.versionMode !== "A-B"
  ) {
    return invalid(
      "La modalidad de versiones no es válida.",
    );
  }

  if (
    !Array.isArray(
      config.questionDistribution,
    ) ||
    config.questionDistribution
      .length === 0
  ) {
    return invalid(
      "El examen debe tener al menos un tipo de pregunta seleccionado.",
    );
  }

  const selectedTypes =
    new Set<AIExamQuestionType>();

  const allowedTypes =
    allowedQuestionTypesByExamType[
      config.examType
    ];

  let calculatedTotal = 0;

  for (
    const item of
      config.questionDistribution
  ) {
    if (
      !validQuestionTypes.has(
        item.type,
      ) ||
      !allowedTypes.has(
        item.type,
      )
    ) {
      return invalid(
        "La configuración contiene un tipo de pregunta incompatible con el tipo de examen.",
      );
    }

    if (selectedTypes.has(item.type)) {
      return invalid(
        "La configuración contiene tipos de pregunta duplicados.",
      );
    }

    selectedTypes.add(item.type);

    if (
      !isPositiveInteger(
        item.quantity,
      ) ||
      item.quantity > 50
    ) {
      return invalid(
        "La cantidad de preguntas debe ser un número entero entre 1 y 50.",
      );
    }

    if (
      !isPositiveInteger(
        item.pointsPerQuestion,
      ) ||
      item.pointsPerQuestion > 100
    ) {
      return invalid(
        "El puntaje individual debe ser un número entero entre 1 y 100.",
      );
    }

    calculatedTotal +=
      item.quantity *
      item.pointsPerQuestion;
  }

  if (
    !isPositiveInteger(
      config.totalScore,
    ) ||
    config.totalScore !==
      calculatedTotal
  ) {
    return invalid(
      `El puntaje total configurado es ${config.totalScore}, pero la distribución suma ${calculatedTotal}.`,
    );
  }

  return {
    valid: true,
  };
}

export function validateGeneratedExam(
  data: AIFormData,
  content: GeneratedAIContent,
): GeneratedExamValidationResult {
  if (data.toolId !== "exam") {
    if (
      content.exam !== null &&
      content.exam !== undefined
    ) {
      return invalid(
        'El campo "exam" debe ser null para esta herramienta.',
      );
    }

    return {
      valid: true,
    };
  }

  const config = data.examConfig;
  const exam = content.exam;

  if (!config) {
    return invalid(
      "No se recibió la configuración del examen.",
    );
  }

  const configValidation =
  validateExamConfiguration(
    config,
  );

if (!configValidation.valid) {
  return configValidation;
}

  if (
    !exam ||
    !isStructurallyValidGeneratedExam(
      exam,
    )
  ) {
    return invalid(
      "El examen estructurado está ausente o incompleto.",
    );
  }

  if (
    exam.examType !== config.examType ||
    exam.difficulty !== config.difficulty ||
    exam.totalScore !== config.totalScore
  ) {
    return invalid(
      "El tipo, la dificultad o el puntaje total no coincide con la configuración.",
    );
  }

  const expectedVersionLabels: Array<
    "A" | "B"
  > =
    config.versionMode === "A-B"
      ? ["A", "B"]
      : ["A"];

  if (
    exam.versions.length !==
    expectedVersionLabels.length
  ) {
    return invalid(
      "La cantidad de versiones no coincide con lo solicitado.",
    );
  }

  const versionsByLabel = new Map(
    exam.versions.map(
      (version) =>
        [
          version.label,
          version,
        ] as const,
    ),
  );

  if (
    versionsByLabel.size !==
    expectedVersionLabels.length
  ) {
    return invalid(
      "Las versiones están duplicadas o incompletas.",
    );
  }

  const expectedDistribution =
    new Map(
      config.questionDistribution.map(
        (item) =>
          [
            item.type,
            item,
          ] as const,
      ),
    );

  const expectedQuestionCount =
    config.questionDistribution.reduce(
      (total, item) =>
        total + item.quantity,
      0,
    );

  for (
    const versionLabel of
      expectedVersionLabels
  ) {
    const version =
      versionsByLabel.get(versionLabel);

    if (!version) {
      return invalid(
        `Falta la versión ${versionLabel}.`,
      );
    }

    if (
      version.questions.length !==
      expectedQuestionCount
    ) {
      return invalid(
        `La versión ${versionLabel} debe contener exactamente ${expectedQuestionCount} preguntas.`,
      );
    }

    const questionNumbers =
      new Set<number>();

    const actualTypeCounts =
      new Map<
        AIExamQuestionType,
        number
      >();

    let versionScore = 0;

    for (
      const question of
        version.questions
    ) {
      if (
        questionNumbers.has(
          question.number,
        )
      ) {
        return invalid(
          `La versión ${versionLabel} contiene números duplicados.`,
        );
      }

      questionNumbers.add(
        question.number,
      );

      const expectedItem =
        expectedDistribution.get(
          question.type,
        );

      if (!expectedItem) {
        return invalid(
          `La versión ${versionLabel} contiene un tipo de pregunta no solicitado.`,
        );
      }

      if (
        question.score !==
        expectedItem.pointsPerQuestion
      ) {
        return invalid(
          `La versión ${versionLabel} no respeta el puntaje individual.`,
        );
      }

      actualTypeCounts.set(
        question.type,
        (
          actualTypeCounts.get(
            question.type,
          ) ?? 0
        ) + 1,
      );

      versionScore += question.score;

      if (
        question.type ===
          "multiple-choice" &&
        (
          !Array.isArray(
            question.options,
          ) ||
          question.options.length < 2
        )
      ) {
        return invalid(
          `Las preguntas de selección múltiple de la versión ${versionLabel} necesitan opciones.`,
        );
      }

      if (
        question.type ===
          "practical-task" &&
        (
          !Array.isArray(
            question.evaluationCriteria,
          ) ||
          question.evaluationCriteria
            .length === 0
        )
      ) {
        return invalid(
          `Las tareas prácticas de la versión ${versionLabel} necesitan criterios de evaluación.`,
        );
      }

      if (
        question.type !==
          "practical-task" &&
        question.evaluationCriteria !==
          null &&
        question.evaluationCriteria !==
          undefined
      ) {
        return invalid(
          `Las preguntas teóricas de la versión ${versionLabel} deben utilizar null en evaluationCriteria.`,
        );
      }
    }

    for (
      let questionNumber = 1;
      questionNumber <=
      expectedQuestionCount;
      questionNumber += 1
    ) {
      if (
        !questionNumbers.has(
          questionNumber,
        )
      ) {
        return invalid(
          `La numeración de la versión ${versionLabel} debe ser consecutiva desde 1.`,
        );
      }
    }

    for (
      const distributionItem of
        config.questionDistribution
    ) {
      if (
        actualTypeCounts.get(
          distributionItem.type,
        ) !== distributionItem.quantity
      ) {
        return invalid(
          `La versión ${versionLabel} no respeta la cantidad solicitada para cada tipo.`,
        );
      }
    }

    if (
      versionScore !== config.totalScore
    ) {
      return invalid(
        `La versión ${versionLabel} debe sumar exactamente ${config.totalScore} puntos.`,
      );
    }
  }

  if (config.includeAnswerKey) {
    if (
      !Array.isArray(
        exam.answerKey,
      )
    ) {
      return invalid(
        "Se solicitó solucionario, pero no fue generado.",
      );
    }

    const expectedAnswerCount =
      expectedQuestionCount *
      expectedVersionLabels.length;

    if (
      exam.answerKey.length !==
      expectedAnswerCount
    ) {
      return invalid(
        "El solucionario debe contener una respuesta por pregunta.",
      );
    }

    const answerIdentifiers =
      new Set(
        exam.answerKey.map(
          (answer) =>
            `${answer.version}-${answer.questionNumber}`,
        ),
      );

    if (
      answerIdentifiers.size !==
      expectedAnswerCount
    ) {
      return invalid(
        "El solucionario contiene respuestas duplicadas.",
      );
    }

    for (
      const versionLabel of
        expectedVersionLabels
    ) {
      for (
        let questionNumber = 1;
        questionNumber <=
        expectedQuestionCount;
        questionNumber += 1
      ) {
        if (
          !answerIdentifiers.has(
            `${versionLabel}-${questionNumber}`,
          )
        ) {
          return invalid(
            `Falta la respuesta ${questionNumber} de la versión ${versionLabel}.`,
          );
        }
      }
    }

   const answersByIdentifier =
  new Map(
    exam.answerKey.map(
      (answer) =>
        [
          `${answer.version}-${answer.questionNumber}`,
          answer,
        ] as const,
    ),
  );

for (
  const versionLabel of
    expectedVersionLabels
) {
  const version =
    versionsByLabel.get(
      versionLabel,
    );

  if (!version) {
    continue;
  }

  let trueAnswerCount = 0;
  let falseAnswerCount = 0;

  for (
    const question of
      version.questions
  ) {
    if (
      question.type !==
      "true-false"
    ) {
      continue;
    }

    const answer =
      answersByIdentifier.get(
        `${versionLabel}-${question.number}`,
      );

    if (!answer) {
      return invalid(
        `Falta la respuesta de la pregunta ${question.number} de la versión ${versionLabel}.`,
      );
    }

    const normalizedAnswer =
      normalizeText(
        answer.answer,
      );

    if (
      normalizedAnswer !==
        "verdadero" &&
      normalizedAnswer !==
        "falso"
    ) {
      return invalid(
        `La respuesta de verdadero o falso de la pregunta ${question.number}, versión ${versionLabel}, debe escribirse exactamente como "Verdadero" o "Falso".`,
      );
    }

    if (
      normalizedAnswer ===
      "verdadero"
    ) {
      trueAnswerCount += 1;
    } else {
      falseAnswerCount += 1;
    }
  }

  const trueFalseQuestionCount =
    trueAnswerCount +
    falseAnswerCount;

  if (
    trueFalseQuestionCount >= 2 &&
    Math.abs(
      trueAnswerCount -
        falseAnswerCount,
    ) > 1
  ) {
    return invalid(
      `La versión ${versionLabel} contiene ${trueAnswerCount} respuestas verdaderas y ${falseAnswerCount} falsas. La distribución debe ser equilibrada y la diferencia no puede superar uno.`,
    );
  }
}
  } else if (
    exam.answerKey !== null &&
    exam.answerKey !== undefined
  ) {
    return invalid(
      "Se generó un solucionario que no fue solicitado.",
    );
  }

  if (config.includeGradingTable) {
    if (
      !Array.isArray(
        exam.gradingTable,
      )
    ) {
      return invalid(
        "Se solicitó tabla de calificación, pero no fue generada.",
      );
    }

    if (
      exam.gradingTable.length !==
      config.totalScore + 1
    ) {
      return invalid(
        "La tabla debe incluir los puntajes desde 0 hasta el total.",
      );
    }

    const gradeRowsByScore =
      new Map(
        exam.gradingTable.map(
          (row) =>
            [
              row.earnedScore,
              row.finalGrade,
            ] as const,
        ),
      );

    if (
      gradeRowsByScore.size !==
      exam.gradingTable.length
    ) {
      return invalid(
        "La tabla contiene puntajes duplicados.",
      );
    }

    for (
      let earnedScore = 0;
      earnedScore <=
      config.totalScore;
      earnedScore += 1
    ) {
      const finalGrade =
        gradeRowsByScore.get(
          earnedScore,
        );

      if (
        finalGrade === undefined
      ) {
        return invalid(
          `Falta el puntaje ${earnedScore} en la tabla.`,
        );
      }

      const expectedGrade = Number(
        (
          earnedScore *
          10 /
          config.totalScore
        ).toFixed(2),
      );

      if (
        Math.abs(
          finalGrade -
            expectedGrade,
        ) > 0.01
      ) {
        return invalid(
          `La nota de ${earnedScore} puntos no aplica correctamente la regla de tres.`,
        );
      }
    }
  } else if (
    exam.gradingTable !== null &&
    exam.gradingTable !== undefined
  ) {
    return invalid(
      "Se generó una tabla que no fue solicitada.",
    );
  }

  if (config.includeRuleOfThree) {
    if (
      typeof exam.ruleOfThreeFormula !==
        "string" ||
      exam.ruleOfThreeFormula.trim()
        .length === 0
    ) {
      return invalid(
        "Se solicitó la regla de tres, pero no fue incluida.",
      );
    }
  } else if (
    exam.ruleOfThreeFormula !== null &&
    exam.ruleOfThreeFormula !== undefined
  ) {
    return invalid(
      "Se incluyó una fórmula que no fue solicitada.",
    );
  }

  return {
    valid: true,
  };
}