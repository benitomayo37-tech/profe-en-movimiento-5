import type {
  AIObjectiveTaxonomy,
  AIObjectiveTaxonomyOption,
} from "@/features/ai/types/ai";

export const objectiveTaxonomies:
  AIObjectiveTaxonomyOption[] = [
    {
      id: "automatic",
      label: "Selección automática",
      shortLabel: "Automática",
      description:
        "Profe IA selecciona Bloom, Harrow o una combinación según el tema, la destreza y el propósito de la clase.",
    },
    {
      id: "bloom",
      label: "Taxonomía de Bloom",
      shortLabel: "Bloom",
      description:
        "Prioriza objetivos cognitivos observables relacionados con comprender, aplicar, analizar, evaluar o crear.",
    },
    {
      id: "harrow",
      label: "Taxonomía de Harrow",
      shortLabel: "Harrow",
      description:
        "Prioriza objetivos psicomotores relacionados con percepción, coordinación, capacidades físicas y ejecución de habilidades motrices.",
    },
    {
      id: "combined",
      label: "Bloom + Harrow",
      shortLabel: "Combinada",
      description:
        "Integra comprensión y ejecución motriz dentro de un mismo objetivo coherente y evaluable.",
    },
  ];

export function getObjectiveTaxonomyById(
  id: AIObjectiveTaxonomy,
): AIObjectiveTaxonomyOption | undefined {
  return objectiveTaxonomies.find(
    (taxonomy) =>
      taxonomy.id === id,
  );
}