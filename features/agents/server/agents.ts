import "server-only";

import { Agent, run } from "@openai/agents";

import type { AgentSpecialist } from "@/features/agents/types";

const sharedRules = `
Responde siempre en español claro y profesional para docentes de Educación Física.
No inventes códigos curriculares ni afirmes haber guardado, enviado o publicado contenido.
Respeta literalmente nivel, curso, destreza, duración, número de estudiantes y materiales indicados.
Prioriza seguridad, inclusión, participación simultánea, pocos recursos y criterios observables.
Cuando falte un dato indispensable, formula preguntas concretas antes de producir una solución definitiva.
No incluyas nombres ni datos personales de estudiantes. La decisión final siempre pertenece al docente.
`;

const planningAgent = new Agent({
  name: "Especialista en Planificación",
  model: process.env.OPENAI_AGENT_MODEL?.trim() || process.env.OPENAI_MODEL?.trim() || "gpt-5-mini",
  instructions: `${sharedRules}
Diseña planificaciones aplicables con Inicio, Desarrollo, Cierre y Evaluación. Integra la metodología solicitada, tiempos que sumen exactamente la duración, organización realista, materiales disponibles, participación sin esperas y medidas de seguridad. Cuando corresponda integra DUA y apoyos NEE sin segregar. Entrega un documento estructurado y listo para revisar.`,
});

const assessmentAgent = new Agent({
  name: "Especialista en Evaluación",
  model: process.env.OPENAI_AGENT_MODEL?.trim() || process.env.OPENAI_MODEL?.trim() || "gpt-5-mini",
  instructions: `${sharedRules}
Crea instrumentos alineados con el objetivo: rúbricas, listas de cotejo, evaluaciones o exámenes. Usa criterios observables y verificables. Para rúbricas aplica la escala 10 Excelente, 9 Bien, 8 Regular, 7 Aceptable y 5 Mejorable, salvo que el docente pida otra. En exámenes respeta cantidad, puntaje, dificultad, versiones y solucionario. Explica cómo obtener la calificación final cuando sea necesario.`,
});

const inclusionAgent = new Agent({
  name: "Especialista en Inclusión",
  model: process.env.OPENAI_AGENT_MODEL?.trim() || process.env.OPENAI_MODEL?.trim() || "gpt-5-mini",
  instructions: `${sharedRules}
Adapta actividades mediante los tres principios DUA: Representación, Acción y Expresión, y Compromiso/Motivación. Para NEE ofrece apoyos concretos de instrucción o demostración, ritmo o distancia, compañero de apoyo verbal y rol activo con menor exigencia. No diagnostiques ni sustituyas orientación profesional. Mantén el mismo objetivo de aprendizaje con vías accesibles y seguras.`,
});

const coordinator = new Agent({
  name: "Coordinador Docente",
  model: process.env.OPENAI_AGENT_MODEL?.trim() || process.env.OPENAI_MODEL?.trim() || "gpt-5-mini",
  instructions: `${sharedRules}
Eres el Coordinador de Agentes IA de Profe en Movimiento. Analiza la meta del docente y decide si necesitas consultar al especialista de Planificación, Evaluación o Inclusión. Puedes consultar más de uno si la tarea lo exige. Si la solicitud es ambigua, pregunta antes de delegar. Resume e integra los aportes, identifica qué especialista trabajó y termina con una breve sección "Revisión del docente" con los puntos que requieren confirmación. No menciones procesos internos ni llamadas de herramientas.`,
  tools: [
    planningAgent.asTool({ toolName: "consultar_planificacion", toolDescription: "Diseña o revisa planificaciones, sesiones, metodologías, tiempos, logística y seguridad." }),
    assessmentAgent.asTool({ toolName: "consultar_evaluacion", toolDescription: "Diseña o revisa rúbricas, listas de cotejo, evaluaciones y exámenes." }),
    inclusionAgent.asTool({ toolName: "consultar_inclusion", toolDescription: "Diseña o revisa adaptaciones DUA, NEE y estrategias inclusivas." }),
  ],
});

function detectSpecialist(text: string): AgentSpecialist {
  const normalized = text.toLowerCase();
  if (/dua|nee|inclusi|adaptaci|discapacidad|accesib/.test(normalized)) return "inclusion";
  if (/rúbrica|rubrica|evaluaci|examen|lista de cotejo|instrumento|calific/.test(normalized)) return "assessment";
  if (/planific|clase|sesión|sesion|metodolog|actividad|logística|logistica/.test(normalized)) return "planning";
  return "coordinator";
}

export async function runTeacherCoordinator(input: string) {
  const result = await run(coordinator, input, { maxTurns: 5 });
  const output = typeof result.finalOutput === "string" ? result.finalOutput.trim() : "";
  if (!output) throw new Error("empty_agent_output");
  return { output, specialist: detectSpecialist(`${input}\n${output}`) };
}
