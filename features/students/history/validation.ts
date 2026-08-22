import type { StudentHistoryResult } from "@/features/students/history/types";

const MAX_TOTAL_CHARACTERS = 9_600;
const MAX_PAGE_CHARACTERS = 2_800;

function isText(value: unknown, minimum = 1, maximum = 1_200): value is string {
  return typeof value === "string" && value.trim().length >= minimum && value.trim().length <= maximum;
}

export function isStudentHistoryResult(value: unknown): value is StudentHistoryResult {
  if (typeof value !== "object" || value === null) return false;
  const result = value as Record<string, unknown>;

  if (
    !isText(result.title, 5, 140) ||
    !isText(result.subtitle, 5, 180) ||
    !isText(result.studentLevel, 2, 100) ||
    !Array.isArray(result.pages) ||
    result.pages.length < 2 ||
    result.pages.length > 4 ||
    !Array.isArray(result.keyIdeas) ||
    result.keyIdeas.length < 3 ||
    result.keyIdeas.length > 5 ||
    !result.keyIdeas.every((idea) => isText(idea, 12, 180)) ||
    !isText(result.reflectionQuestion, 15, 240)
  ) return false;

  let totalCharacters = 0;
  const pagesAreValid = result.pages.every((page, index) => {
    if (typeof page !== "object" || page === null) return false;
    const typedPage = page as Record<string, unknown>;
    if (
      typedPage.pageNumber !== index + 1 ||
      !isText(typedPage.heading, 4, 100) ||
      !Array.isArray(typedPage.blocks) ||
      typedPage.blocks.length < 2 ||
      typedPage.blocks.length > 4
    ) return false;

    let pageCharacters = String(typedPage.heading).length;
    const blocksAreValid = typedPage.blocks.every((block) => {
      if (typeof block !== "object" || block === null) return false;
      const typedBlock = block as Record<string, unknown>;
      if (!isText(typedBlock.title, 3, 90) || !isText(typedBlock.content, 80, 1_100)) return false;
      pageCharacters += String(typedBlock.title).length + String(typedBlock.content).length;
      return true;
    });

    totalCharacters += pageCharacters;
    return blocksAreValid && pageCharacters <= MAX_PAGE_CHARACTERS;
  });

  return pagesAreValid && totalCharacters <= MAX_TOTAL_CHARACTERS;
}
