import type { GeneratedAIContent } from "../types/ai";

export const isGeneratedAIContent = (
  value: unknown,
): value is GeneratedAIContent => {
  if (
    typeof value !== "object" ||
    value === null
  ) {
    return false;
  }

  const content =
    value as Record<string, unknown>;

  if (
    typeof content.title !== "string" ||
    typeof content.introduction !== "string" ||
    !Array.isArray(content.sections)
  ) {
    return false;
  }

  return content.sections.every(
    (section) => {
      if (
        typeof section !== "object" ||
        section === null
      ) {
        return false;
      }

      const typedSection =
        section as Record<string, unknown>;

      return (
        typeof typedSection.title ===
          "string" &&
        Array.isArray(
          typedSection.content,
        ) &&
        typedSection.content.every(
          (item) =>
            typeof item === "string",
        )
      );
    },
  );
};