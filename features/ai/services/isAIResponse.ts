import type { GeneratedAIContent } from "@/features/ai/types/ai";

interface SuccessfulAIResponse {
  success: true;
  data: GeneratedAIContent;
}

interface FailedAIResponse {
  success: false;
  error: string;
}

export type AIResponse =
  | SuccessfulAIResponse
  | FailedAIResponse;

function isGeneratedAIContent(
  value: unknown,
): value is GeneratedAIContent {
  if (
    typeof value !== "object" ||
    value === null
  ) {
    return false;
  }

  const candidate =
    value as Record<string, unknown>;

  if (
    typeof candidate.title !== "string" ||
    typeof candidate.introduction !== "string" ||
    !Array.isArray(candidate.sections)
  ) {
    return false;
  }

  return candidate.sections.every(
    (section) => {
      if (
        typeof section !== "object" ||
        section === null
      ) {
        return false;
      }

      const sectionCandidate =
        section as Record<string, unknown>;

      return (
        typeof sectionCandidate.title === "string" &&
        Array.isArray(sectionCandidate.content) &&
        sectionCandidate.content.every(
          (item) => typeof item === "string",
        )
      );
    },
  );
}

export function isAIResponse(
  value: unknown,
): value is AIResponse {
  if (
    typeof value !== "object" ||
    value === null
  ) {
    return false;
  }

  const candidate =
    value as Record<string, unknown>;

  if (candidate.success === true) {
    return isGeneratedAIContent(
      candidate.data,
    );
  }

  if (candidate.success === false) {
    return typeof candidate.error === "string";
  }

  return false;
}
