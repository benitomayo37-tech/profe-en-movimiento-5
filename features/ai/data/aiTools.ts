import type { AITool } from "@/features/ai/types/ai";

export const aiTools: AITool[] = [
  {
    id: "lesson-plan",
    title: "Crear planificación",
    description:
      "Genera una sesión completa con inicio, desarrollo, cierre y evaluación.",
    icon: "📝",
    category: "Planificación",
  },
  {
    id: "rubric",
    title: "Crear rúbrica",
    description:
      "Diseña criterios, indicadores y niveles de desempeño.",
    icon: "📊",
    category: "Evaluación",
  },
  {
    id: "checklist",
    title: "Crear lista de cotejo",
    description:
      "Genera indicadores observables para evaluar una actividad práctica.",
    icon: "✅",
    category: "Evaluación",
  },
  {
    id: "game",
    title: "Inventar un juego",
    description:
      "Crea un juego motor adaptado al contenido, espacio y materiales.",
    icon: "🎮",
    category: "Actividades",
  },
  {
    id: "assessment",
    title: "Crear evaluación",
    description:
      "Produce preguntas teóricas, prácticas y situaciones de aplicación.",
    icon: "🧠",
    category: "Evaluación",
  },
  {
    id: "exam",
    title: "Elaborar examen",
    description:
      "Crea exámenes configurables con puntaje, solucionario, tabla de calificación y versiones A y B.",
    icon: "📄",
    category: "Evaluación",
  },
  {
    id: "dua-adaptation",
    title: "Adaptar con DUA",
    description:
      "Incorpora representación, acción y expresión, y compromiso o motivación.",
    icon: "🟢",
    category: "Inclusión",
  },
  {
    id: "nee-adaptation",
    title: "Adaptar para NEE",
    description:
      "Genera variantes inclusivas y apoyos para la participación.",
    icon: "♿",
    category: "Inclusión",
  },
  {
    id: "physical-circuit",
    title: "Crear circuito físico",
    description:
      "Organiza estaciones, tiempos, ejercicios y rotaciones.",
    icon: "🏃",
    category: "Condición física",
  },
];

export function getAIToolById(
  id: string,
): AITool | undefined {
  return aiTools.find((tool) => tool.id === id);
}