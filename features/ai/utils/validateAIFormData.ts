import { aiTools } from "@/features/ai/data/aiTools";
import { planningMethodologies } from "@/features/ai/data/planningMethodologies";
import { objectiveTaxonomies } from "@/features/ai/data/objectiveTaxonomies";
import type {
  AIExamConfig,
  AIExamQuestionType,
  AIExamType,
  AIFormData,
  AIPlanningMethodology,
  AIToolId,
  AIObjectiveTaxonomy,
} from "@/features/ai/types/ai";

const validToolIds = new Set<AIToolId>(
  aiTools.map((tool) => tool.id),
);

const validPlanningMethodologies =
  new Set<AIPlanningMethodology>(
    planningMethodologies.map(
      (methodology) => methodology.id,
    ),
  );

  const validObjectiveTaxonomies =
  new Set<AIObjectiveTaxonomy>(
    objectiveTaxonomies.map(
      (taxonomy) => taxonomy.id,
    ),
  );

const validExamTypes = new Set<
  AIExamConfig["examType"]
>([
  "theoretical",
  "practical",
  "mixed",
]);

const validExamDifficulties = new Set<
  AIExamConfig["difficulty"]
>([
  "basic",
  "intermediate",
  "advanced",
]);

const validExamVersionModes = new Set<
  AIExamConfig["versionMode"]
>([
  "A",
  "A-B",
]);

const validExamQuestionTypes = new Set<
  AIExamQuestionType
>([
  "multiple-choice",
  "true-false",
  "matching",
  "fill-in-the-blank",
  "short-answer",
  "applied-case",
  "practical-task",
]);

function isString(
  value: unknown,
): value is string {
  return typeof value === "string";
}

function isBoolean(
  value: unknown,
): value is boolean {
  return typeof value === "boolean";
}

function isOptionalString(
  value: unknown,
): value is string | undefined {
  return (
    value === undefined ||
    isString(value)
  );
}

function isPositiveInteger(
  value: unknown,
): value is number {
  return (
    Number.isInteger(value) &&
    Number(value) > 0
  );
}

function isQuestionTypeAllowed(
  examType: AIExamType,
  questionType: AIExamQuestionType,
): boolean {
  if (examType === "theoretical") {
    return questionType !== "practical-task";
  }

  if (examType === "practical") {
    return (
      questionType === "applied-case" ||
      questionType === "practical-task"
    );
  }

  return true;
}

function isValidExamConfig(
  value: unknown,
): value is AIExamConfig {
  if (
    typeof value !== "object" ||
    value === null
  ) {
    return false;
  }

  const config =
    value as Record<string, unknown>;

  if (
    !isString(config.examType) ||
    !validExamTypes.has(
      config.examType as AIExamConfig["examType"],
    ) ||
    !isString(config.difficulty) ||
    !validExamDifficulties.has(
      config.difficulty as AIExamConfig["difficulty"],
    ) ||
    !isString(config.versionMode) ||
    !validExamVersionModes.has(
      config.versionMode as AIExamConfig["versionMode"],
    ) ||
    !isPositiveInteger(config.totalScore) ||
    Number(config.totalScore) > 100 ||
    !isBoolean(config.includeAnswerKey) ||
    !isBoolean(config.includeGradingTable) ||
    !isBoolean(config.includeRuleOfThree) ||
    !Array.isArray(
      config.questionDistribution,
    ) ||
    config.questionDistribution.length === 0 ||
    config.questionDistribution.length >
      validExamQuestionTypes.size
  ) {
    return false;
  }

  const examType =
    config.examType as AIExamType;

  const usedQuestionTypes =
    new Set<AIExamQuestionType>();

  let calculatedTotalScore = 0;
  let totalQuestions = 0;

  for (
    const distributionItem of
      config.questionDistribution
  ) {
    if (
      typeof distributionItem !== "object" ||
      distributionItem === null
    ) {
      return false;
    }

    const item =
      distributionItem as Record<
        string,
        unknown
      >;

    if (
      !isString(item.type) ||
      !validExamQuestionTypes.has(
        item.type as AIExamQuestionType,
      ) ||
      !isPositiveInteger(item.quantity) ||
      !isPositiveInteger(
        item.pointsPerQuestion,
      )
    ) {
      return false;
    }

    const questionType =
      item.type as AIExamQuestionType;

    if (
      usedQuestionTypes.has(questionType) ||
      !isQuestionTypeAllowed(
        examType,
        questionType,
      )
    ) {
      return false;
    }

    usedQuestionTypes.add(questionType);

    totalQuestions += Number(
      item.quantity,
    );

    calculatedTotalScore +=
      Number(item.quantity) *
      Number(item.pointsPerQuestion);
  }

  return (
    totalQuestions <= 50 &&
    calculatedTotalScore ===
      Number(config.totalScore)
  );
}

export function isValidAIFormData(
  value: unknown,
): value is AIFormData {
  if (
    typeof value !== "object" ||
    value === null
  ) {
    return false;
  }

  const data =
    value as Record<string, unknown>;

    if (
    !isString(data.toolId) ||
    !validToolIds.has(
      data.toolId as AIToolId,
    ) ||
    !isString(
      data.planningMethodology,
    ) ||
        !isString(
      data.objectiveTaxonomy,
    ) ||
    !validObjectiveTaxonomies.has(
      data.objectiveTaxonomy as
        AIObjectiveTaxonomy,
    ) ||
    !validPlanningMethodologies.has(
      data.planningMethodology as AIPlanningMethodology,
    ) ||
    !isString(data.topic) ||
    !isString(data.educationalLevel) ||
    !isString(data.grade) ||
    !isString(data.duration) ||
    !isString(data.students) ||
    !isString(data.materials) ||
    !isString(data.curriculumCode) ||
    !isBoolean(data.includeDua) ||
    !isBoolean(data.includeNee) ||
    !isString(
      data.additionalInstructions,
    ) ||
    !isOptionalString(
      data.sourceResourceSlug,
    )
  ) {
    return false;
  }

  if (data.toolId === "exam") {
    return isValidExamConfig(
      data.examConfig,
    );
  }

  return data.examConfig === undefined;
}