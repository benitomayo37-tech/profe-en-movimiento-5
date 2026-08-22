import type { StudentSportsResult } from "@/features/students/sports/types";

const MAX_TOTAL_CHARACTERS = 8_500;
const MAX_PAGE_CHARACTERS = 2_350;
const INTERNAL_TEXT_PATTERN = /(?:_{2,}|points?_[a-z0-9_]+|issue[_ -]?fix|error[_ -]?prevent|truncation|rewrite)/i;

function isText(value: unknown, minimum = 1, maximum = 700): value is string {
  return typeof value === "string" && value.trim().length >= minimum && value.trim().length <= maximum;
}

function isTextList(value: unknown, minimum: number, maximum: number, itemMaximum: number): value is string[] {
  return Array.isArray(value)
    && value.length >= minimum
    && value.length <= maximum
    && value.every((item) => isText(item, 3, itemMaximum));
}

function hasCleanVisibleText(value: unknown): boolean {
  if (typeof value === "string") {
    return !INTERNAL_TEXT_PATTERN.test(value.trim());
  }
  if (Array.isArray(value)) return value.every(hasCleanVisibleText);
  if (typeof value === "object" && value !== null) {
    return Object.values(value as Record<string, unknown>).every(hasCleanVisibleText);
  }
  return true;
}

export function isStudentSportsStructure(value: unknown): value is StudentSportsResult {
  if (typeof value !== "object" || value === null) return false;
  const result = value as Record<string, unknown>;
  if (
    !isText(result.title, 5, 140)
    || !isText(result.subtitle, 5, 180)
    || !isText(result.studentLevel, 2, 100)
    || !isText(result.detectedFocus, 3, 90)
    || !isText(result.introduction, 80, 500)
    || !Array.isArray(result.pages)
    || result.pages.length !== 3
    || !Array.isArray(result.glossary)
    || result.glossary.length < 4
    || result.glossary.length > 6
    || !isTextList(result.keyIdeas, 3, 5, 180)
    || !isText(result.reflectionQuestion, 15, 240)
  ) return false;

  const pagesValid = result.pages.every((page, index) => {
    if (typeof page !== "object" || page === null) return false;
    const typedPage = page as Record<string, unknown>;
    if (
      typedPage.pageNumber !== index + 1
      || !isText(typedPage.heading, 4, 100)
      || !Array.isArray(typedPage.blocks)
      || typedPage.blocks.length < 2
      || typedPage.blocks.length > 3
    ) return false;

    let pageCharacters = String(typedPage.heading).length;
    const blocksValid = typedPage.blocks.every((block) => {
      if (typeof block !== "object" || block === null) return false;
      const typedBlock = block as Record<string, unknown>;
      if (
        !isText(typedBlock.title, 3, 90)
        || !isText(typedBlock.content, 80, 650)
        || !isTextList(typedBlock.points, 2, 5, 180)
      ) return false;
      pageCharacters += String(typedBlock.title).length + String(typedBlock.content).length;
      pageCharacters += (typedBlock.points as string[]).join("").length;
      return true;
    });
    return blocksValid && pageCharacters <= MAX_PAGE_CHARACTERS;
  });

  const glossaryValid = result.glossary.every((entry) => {
    if (typeof entry !== "object" || entry === null) return false;
    const typedEntry = entry as Record<string, unknown>;
    return isText(typedEntry.term, 2, 50) && isText(typedEntry.definition, 12, 160);
  });

  return pagesValid && glossaryValid && JSON.stringify(result).length <= MAX_TOTAL_CHARACTERS;
}

export function isStudentSportsResult(value: unknown): value is StudentSportsResult {
  return isStudentSportsStructure(value) && hasCleanVisibleText(value);
}
