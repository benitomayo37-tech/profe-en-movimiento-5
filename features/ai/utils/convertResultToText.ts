import type { GeneratedAIContent } from "@/features/ai/types/ai";

/**
 * Convierte el contenido estructurado generado por Profe IA
 * en texto plano reutilizable para copiar, exportar o compartir.
 */
export function convertResultToText(
  result: GeneratedAIContent,
): string {
  const sectionsText = result.sections
    .map((section) => {
      const items = section.content
        .map((item) => `- ${item}`)
        .join("\n");

      return `${section.title}\n${items}`;
    })
    .join("\n\n");

  return [
    result.title,
    "",
    result.introduction,
    "",
    sectionsText,
  ]
    .join("\n")
    .trim();
}
