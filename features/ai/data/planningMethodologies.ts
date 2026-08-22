import type {
  AIPlanningMethodology,
  AIPlanningMethodologyOption,
} from "@/features/ai/types/ai";

export const planningMethodologies: AIPlanningMethodologyOption[] = [
  {
    id: "automatic",
    label: "Selección automática",
    shortLabel: "Automática",
    description:
      "Profe IA selecciona la metodología más adecuada según el tema, nivel, estudiantes, tiempo y materiales.",
  },
  {
    id: "cooperative-learning",
    label: "Aprendizaje cooperativo",
    shortLabel: "Cooperativo",
    description:
      "Organiza equipos con objetivos compartidos, responsabilidad individual, interdependencia positiva y roles definidos.",
  },
  {
    id: "gamification",
    label: "Gamificación",
    shortLabel: "Gamificación",
    description:
      "Incorpora retos, niveles, logros, retroalimentación y progreso sin convertir necesariamente toda la clase en un juego.",
  },
  {
    id: "game-based-learning",
    label: "Aprendizaje basado en juegos (ABJ)",
    shortLabel: "ABJ",
    description:
      "Utiliza juegos con propósito pedagógico para desarrollar y evaluar los aprendizajes previstos.",
  },
  {
    id: "problem-based-learning",
    label: "Aprendizaje basado en problemas (ABP)",
    shortLabel: "ABP",
    description:
      "Presenta un problema contextualizado que el estudiantado debe analizar y resolver colaborativamente.",
  },
  {
    id: "project-based-learning",
    label: "Aprendizaje basado en proyectos",
    shortLabel: "Proyectos",
    description:
      "Organiza el aprendizaje alrededor de un producto, demostración o proyecto desarrollado mediante varias tareas relacionadas.",
  },
  {
    id: "guided-discovery",
    label: "Descubrimiento guiado",
    shortLabel: "Descubrimiento guiado",
    description:
      "El docente formula consignas y preguntas progresivas para que el estudiantado descubra soluciones motrices o conceptuales.",
  },
  {
    id: "problem-solving",
    label: "Resolución de problemas",
    shortLabel: "Resolución de problemas",
    description:
      "Propone situaciones abiertas con diferentes respuestas posibles que deben explorarse, justificarse y evaluarse.",
  },
  {
    id: "reciprocal-teaching",
    label: "Enseñanza recíproca",
    shortLabel: "Enseñanza recíproca",
    description:
      "El estudiantado trabaja por parejas o equipos alternando roles de ejecución, observación y retroalimentación.",
  },
  {
    id: "stations",
    label: "Estaciones de aprendizaje",
    shortLabel: "Estaciones",
    description:
      "Distribuye actividades simultáneas en espacios definidos con rotaciones, tiempos y tareas específicas.",
  },
  {
    id: "task-circuit",
    label: "Circuito de tareas",
    shortLabel: "Circuito de tareas",
    description:
      "Organiza una secuencia de tareas motrices que se realizan siguiendo un orden, tiempo o número de repeticiones.",
  },
  {
    id: "flipped-classroom",
    label: "Aula invertida",
    shortLabel: "Aula invertida",
    description:
      "Traslada la revisión inicial de información fuera de la sesión y utiliza la clase para aplicar, practicar y recibir retroalimentación.",
  },
  {
    id: "direct-instruction",
    label: "Instrucción directa",
    shortLabel: "Instrucción directa",
    description:
      "Utiliza explicación breve, demostración, práctica guiada, corrección y práctica autónoma progresiva.",
  },
  {
    id: "combined",
    label: "Metodología combinada",
    shortLabel: "Combinada",
    description:
      "Integra de manera justificada dos o más metodologías compatibles dentro de diferentes momentos de la planificación.",
  },
];

export function getPlanningMethodologyById(
  id: AIPlanningMethodology,
): AIPlanningMethodologyOption | undefined {
  return planningMethodologies.find(
    (methodology) => methodology.id === id,
  );
}