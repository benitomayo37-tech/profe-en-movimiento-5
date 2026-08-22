import type { AIAssistant, AssistantId } from "../types/assistant";

export const AI_ASSISTANTS: Record<AssistantId, AIAssistant> = {
  "profe-ia": {
    id: "profe-ia",
    name: "Profe IA",
    shortName: "Profe IA",
    description:
      "Asistente principal de Profe en Movimiento. Analiza cada consulta y selecciona al especialista más adecuado.",
    domain: "orchestrator",
    icon: "🤖",
    status: "active",
    capabilities: [
      "Analizar la intención del usuario",
      "Seleccionar asistentes especializados",
      "Coordinar respuestas",
      "Orientar dentro de la plataforma",
    ],
  },

  profegpt: {
    id: "profegpt",
    name: "ProfeGPT",
    shortName: "ProfeGPT",
    description:
      "Especialista en Educación Física, planificación pedagógica, evaluación, currículo, DUA y recursos docentes.",
    domain: "education",
    icon: "🧑‍🏫",
    status: "active",
    capabilities: [
      "Crear planificaciones de clase",
      "Diseñar rúbricas e instrumentos de evaluación",
      "Aplicar DUA y adaptaciones educativas",
      "Proponer juegos, circuitos y actividades",
      "Desarrollar contenidos curriculares",
    ],
  },

  sportgpt: {
    id: "sportgpt",
    name: "SportGPT",
    shortName: "SportGPT",
    description:
      "Especialista en deporte, entrenamiento, técnica, táctica, reglamentos, historia y análisis deportivo.",
    domain: "sport",
    icon: "🏃",
    status: "coming-soon",
    capabilities: [
      "Explicar técnicas deportivas",
      "Analizar tácticas y sistemas de juego",
      "Crear sesiones de entrenamiento",
      "Explicar reglamentos",
      "Desarrollar contenidos de historia del deporte",
    ],
  },

  saludgpt: {
    id: "saludgpt",
    name: "SaludGPT",
    shortName: "SaludGPT",
    description:
      "Especialista en actividad física, bienestar, hábitos saludables, prevención del sedentarismo y ejercicio seguro.",
    domain: "health",
    icon: "❤️",
    status: "coming-soon",
    capabilities: [
      "Orientar sobre actividad física saludable",
      "Proponer hábitos de movimiento",
      "Crear rutinas generales de ejercicio",
      "Promover bienestar y prevención",
      "Adaptar recomendaciones generales a diferentes poblaciones",
    ],
  },
};

export const getAssistantById = (
  assistantId: AssistantId,
): AIAssistant => {
  return AI_ASSISTANTS[assistantId];
};

export const getActiveAssistants = (): AIAssistant[] => {
  return Object.values(AI_ASSISTANTS).filter(
    (assistant) => assistant.status === "active",
  );
};

export const isAssistantAvailable = (
  assistantId: AssistantId,
): boolean => {
  return AI_ASSISTANTS[assistantId].status === "active";
};