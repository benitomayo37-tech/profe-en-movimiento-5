import type {
  AIFormData,
  GeneratedAIContent,
} from "@/features/ai/types/ai";

function valueOrFallback(
  value: string,
  fallback: string,
): string {
  return value.trim() || fallback;
}

function createLessonPlan(
  data: AIFormData,
): GeneratedAIContent {
  const topic = valueOrFallback(
    data.topic,
    "fundamentos básicos de Educación Física",
  );

  const level = valueOrFallback(
    data.educationalLevel,
    "Bachillerato General Unificado",
  );

  const duration = valueOrFallback(
    data.duration,
    "45 minutos",
  );

  return {
    title: `Planificación: ${topic}`,
    introduction:
      `Sesión diseñada para ${level}, con una duración aproximada de ${duration}.`,
    sections: [
      {
        title: "Objetivo de aprendizaje",
        content: [
          `Aplicar conocimientos y habilidades relacionadas con ${topic} mediante actividades progresivas, seguras y participativas.`,
        ],
      },
      {
        title: "Inicio",
        content: [
          "Saludo, organización del grupo y explicación del propósito de la clase.",
          "Activación de conocimientos previos mediante preguntas breves.",
          "Calentamiento general con movilidad articular y desplazamientos dinámicos.",
        ],
      },
      {
        title: "Desarrollo",
        content: [
          `Demostración guiada de los elementos principales de ${topic}.`,
          "Práctica progresiva individual o en parejas.",
          "Actividad cooperativa para aplicar el aprendizaje.",
          "Retroalimentación inmediata y corrección de aspectos técnicos.",
        ],
      },
      {
        title: "Cierre",
        content: [
          "Vuelta a la calma y ejercicios suaves de respiración.",
          "Reflexión sobre los aprendizajes alcanzados.",
          "Autoevaluación rápida mediante una escala de percepción.",
        ],
      },
      {
        title: "Evaluación",
        content: [
          "Observación directa de la participación.",
          "Aplicación correcta de los elementos trabajados.",
          "Cooperación, respeto de normas y cuidado de los compañeros.",
        ],
      },
    ],
  };
}

function createRubric(
  data: AIFormData,
): GeneratedAIContent {
  const topic = valueOrFallback(
    data.topic,
    "actividad práctica",
  );

  return {
    title: `Rúbrica de evaluación: ${topic}`,
    introduction:
      "Instrumento elaborado con cinco niveles de desempeño y criterios observables.",
    sections: [
      {
        title: "Criterio 1: ejecución técnica",
        content: [
          "Excelente — 10: ejecuta todos los elementos con control, precisión y seguridad.",
          "Bien — 9: ejecuta correctamente con pequeños errores.",
          "Regular — 8: cumple la mayoría de los elementos solicitados.",
          "Aceptable — 7: presenta dificultades, pero completa la actividad.",
          "Mejorable — 5: necesita acompañamiento constante para realizarla.",
        ],
      },
      {
        title: "Criterio 2: participación",
        content: [
          "Excelente — 10: participa activamente y favorece el trabajo del grupo.",
          "Bien — 9: mantiene una participación constante.",
          "Regular — 8: participa durante la mayor parte de la actividad.",
          "Aceptable — 7: su participación es irregular.",
          "Mejorable — 5: participa poco incluso con acompañamiento.",
        ],
      },
      {
        title: "Criterio 3: respeto y cooperación",
        content: [
          "Excelente — 10: coopera, respeta normas y ayuda a sus compañeros.",
          "Bien — 9: respeta las normas y trabaja adecuadamente.",
          "Regular — 8: coopera con recordatorios ocasionales.",
          "Aceptable — 7: requiere varios recordatorios.",
          "Mejorable — 5: necesita apoyo constante para integrarse.",
        ],
      },
    ],
  };
}

function createGame(
  data: AIFormData,
): GeneratedAIContent {
  const topic = valueOrFallback(
    data.topic,
    "coordinación y velocidad de reacción",
  );

  return {
    title: `Juego motor: El desafío de ${topic}`,
    introduction:
      "Actividad lúdica de fácil organización y adaptable a diferentes cantidades de estudiantes.",
    sections: [
      {
        title: "Objetivo",
        content: [
          `Desarrollar ${topic} mediante una experiencia cooperativa y dinámica.`,
        ],
      },
      {
        title: "Organización",
        content: [
          `Participantes: ${valueOrFallback(data.students, "grupo completo")}.`,
          `Materiales: ${valueOrFallback(data.materials, "conos y balones disponibles")}.`,
          "Dividir el grupo en equipos equilibrados.",
        ],
      },
      {
        title: "Desarrollo",
        content: [
          "Cada equipo completa un recorrido y resuelve un reto motor.",
          "El siguiente participante inicia cuando recibe la señal de su compañero.",
          "El equipo obtiene un punto cuando todos completan la tarea respetando las reglas.",
        ],
      },
      {
        title: "Variantes",
        content: [
          "Cambiar la forma de desplazamiento.",
          "Realizar el reto en parejas.",
          "Reducir o ampliar el espacio.",
          "Añadir una decisión táctica antes de finalizar el recorrido.",
        ],
      },
      {
        title: "Normas de seguridad",
        content: [
          "Mantener una distancia suficiente entre participantes.",
          "Evitar superficies resbaladizas u obstáculos peligrosos.",
          "Priorizar la ejecución correcta sobre la velocidad.",
        ],
      },
    ],
  };
}

function createChecklist(
  data: AIFormData,
): GeneratedAIContent {
  const topic = valueOrFallback(
    data.topic,
    "actividad práctica",
  );

  return {
    title: `Lista de cotejo: ${topic}`,
    introduction:
      "Indicadores preparados para registrar Sí, En proceso o No.",
    sections: [
      {
        title: "Indicadores observables",
        content: [
          "Comprende las instrucciones de la actividad.",
          "Adopta una posición inicial adecuada.",
          "Ejecuta correctamente el movimiento principal.",
          "Mantiene control corporal durante la acción.",
          "Respeta el espacio y las normas de seguridad.",
          "Participa activamente durante la clase.",
          "Coopera con sus compañeros.",
          "Reconoce fortalezas y aspectos por mejorar.",
        ],
      },
    ],
  };
}

function createAssessment(
  data: AIFormData,
): GeneratedAIContent {
  const topic = valueOrFallback(
    data.topic,
    "contenido trabajado",
  );

  return {
    title: `Evaluación: ${topic}`,
    introduction:
      "Propuesta inicial con preguntas conceptuales y actividades de aplicación.",
    sections: [
      {
        title: "Preguntas de selección múltiple",
        content: [
          `¿Cuál es el objetivo principal de ${topic}?`,
          "¿Qué norma de seguridad debe respetarse durante su práctica?",
          "¿Qué acción permite una ejecución más eficiente?",
        ],
      },
      {
        title: "Actividad práctica",
        content: [
          `Demostrar una secuencia relacionada con ${topic}.`,
          "Explicar verbalmente dos aspectos técnicos importantes.",
          "Realizar una autoevaluación al finalizar.",
        ],
      },
      {
        title: "Criterios de calificación",
        content: [
          "Comprensión conceptual.",
          "Ejecución técnica.",
          "Participación y responsabilidad.",
          "Respeto de las normas de seguridad.",
        ],
      },
    ],
  };
}

function createCircuit(
  data: AIFormData,
): GeneratedAIContent {
  const duration = valueOrFallback(
    data.duration,
    "45 minutos",
  );

  return {
    title: "Circuito de condición física",
    introduction:
      `Circuito diseñado para una sesión aproximada de ${duration}.`,
    sections: [
      {
        title: "Organización general",
        content: [
          "Formar grupos equilibrados.",
          "Trabajar durante 40 segundos y descansar 20 segundos.",
          "Realizar entre dos y cuatro vueltas según el nivel.",
        ],
      },
      {
        title: "Estaciones",
        content: [
          "Estación 1: desplazamientos rápidos entre conos.",
          "Estación 2: sentadillas controladas.",
          "Estación 3: lanzamientos y recepciones.",
          "Estación 4: equilibrio en apoyo individual.",
          "Estación 5: saltos de baja intensidad.",
          "Estación 6: plancha adaptada.",
        ],
      },
      {
        title: "Seguridad",
        content: [
          "Adaptar la intensidad a las posibilidades individuales.",
          "Mantener hidratación y pausas suficientes.",
          "Detener la actividad ante dolor, mareo o malestar.",
        ],
      },
    ],
  };
}

function createInclusiveAdaptation(
  data: AIFormData,
): GeneratedAIContent {
  const topic = valueOrFallback(
    data.topic,
    "la actividad seleccionada",
  );

  return {
    title: `Adaptación inclusiva: ${topic}`,
    introduction:
      "Propuesta basada en participación, flexibilidad y diferentes formas de aprender.",
    sections: [
      {
        title: "Representación",
        content: [
          "Explicar las instrucciones de forma verbal y visual.",
          "Demostrar cada actividad antes de comenzar.",
          "Utilizar señales, colores o pictogramas.",
        ],
      },
      {
        title: "Acción y expresión",
        content: [
          "Permitir diferentes formas de ejecutar la tarea.",
          "Ofrecer materiales de tamaños o pesos distintos.",
          "Aceptar demostraciones prácticas, explicaciones orales o registros gráficos.",
        ],
      },
      {
        title: "Implicación",
        content: [
          "Ofrecer opciones de participación.",
          "Utilizar metas cortas y alcanzables.",
          "Favorecer parejas de apoyo y equipos cooperativos.",
        ],
      },
      {
        title: "Apoyos específicos",
        content: [
          "Reducir estímulos distractores cuando sea necesario.",
          "Dividir las instrucciones en pasos breves.",
          "Aumentar el tiempo de ejecución.",
          "Valorar el progreso individual.",
        ],
      },
    ],
  };
}

export async function generateDemoResponse(
  data: AIFormData,
): Promise<GeneratedAIContent> {
  await new Promise((resolve) => {
    window.setTimeout(resolve, 900);
  });

  switch (data.toolId) {
    case "rubric":
      return createRubric(data);

    case "checklist":
      return createChecklist(data);

    case "game":
      return createGame(data);

    case "assessment":
      return createAssessment(data);

    case "physical-circuit":
      return createCircuit(data);

    case "dua-adaptation":
    case "nee-adaptation":
      return createInclusiveAdaptation(data);

    case "lesson-plan":
    default:
      return createLessonPlan(data);
  }
}