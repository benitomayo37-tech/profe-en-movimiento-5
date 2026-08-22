import { getPlanningMethodologyById } from "@/features/ai/data/planningMethodologies";
import type {
  AIPlanningMethodology,
} from "@/features/ai/types/ai";

const METHODOLOGY_INSTRUCTIONS: Record<
  AIPlanningMethodology,
  string
> = {
  automatic: `
SELECCIÓN AUTOMÁTICA

- Analiza el tema, nivel, grado, duración, cantidad de estudiantes, materiales y espacio disponible.
- Selecciona exclusivamente una o dos metodologías de esta lista:
  1. Aprendizaje cooperativo.
  2. Gamificación.
  3. Aprendizaje basado en juegos (ABJ).
  4. Aprendizaje basado en problemas (ABP).
  5. Aprendizaje basado en proyectos.
  6. Descubrimiento guiado.
  7. Resolución de problemas.
  8. Enseñanza recíproca.
  9. Estaciones de aprendizaje.
  10. Circuito de tareas.
  11. Aula invertida.
  12. Instrucción directa.
- Utiliza exactamente los nombres anteriores.
- No inventes, reformules ni agregues metodologías diferentes.
- No utilices Práctica deliberada, Enseñanza por tareas, Mando directo ni otros nombres externos al catálogo.
- Identifica las metodologías elegidas mediante el formato "Metodologías seleccionadas: [nombre]" o "Metodologías seleccionadas: [nombre] + [nombre]".
- Explica brevemente por qué la selección resulta adecuada para esta planificación.
- Aplica la elección en actividades, organización, roles y evaluación.
`,

  "cooperative-learning": `
APRENDIZAJE COOPERATIVO

- Organiza equipos pequeños con interdependencia positiva y responsabilidad individual.
- Define roles funcionales como coordinador, ejecutante, observador, responsable de materiales o portavoz.
- Incluye una meta compartida que necesite la participación de todos.
- Evita filas prolongadas y estudiantes sin función activa.
- Incorpora coevaluación, autoevaluación y valoración del aporte individual al equipo.
`,

  gamification: `
GAMIFICACIÓN

- Organiza la sesión mediante retos, misiones, niveles o logros relacionados con el aprendizaje.
- Los puntos o reconocimientos deben valorar progreso, cooperación, técnica, seguridad y toma de decisiones.
- No utilices castigos, eliminación permanente ni competencia humillante.
- Define roles de equipo y una forma visible de registrar el progreso.
- Evalúa el aprendizaje mediante evidencias obtenidas en los retos y una reflexión final.
`,

  "game-based-learning": `
APRENDIZAJE BASADO EN JUEGOS — ABJ

- Utiliza uno o varios juegos como medio principal para alcanzar el objetivo de aprendizaje.
- Explica propósito, reglas, organización, variantes y criterios de éxito.
- Adapta progresivamente la dificultad del juego.
- Mantén a todos los estudiantes participando mediante roles activos.
- Evalúa decisiones, ejecución, cooperación y comprensión de las reglas durante el juego.
`,

  "problem-based-learning": `
APRENDIZAJE BASADO EN PROBLEMAS — ABP

- Inicia con un problema contextualizado y comprensible que no tenga una respuesta entregada previamente.
- Organiza las actividades en análisis del problema, propuesta de soluciones, prueba práctica y reflexión.
- El docente actúa como facilitador mediante preguntas y retroalimentación.
- El estudiantado investiga, propone, prueba, compara y justifica soluciones.
- Evalúa el proceso de razonamiento, la solución aplicada, la participación y la reflexión final.
`,

  "project-based-learning": `
APRENDIZAJE BASADO EN PROYECTOS

- Define un producto, demostración, propuesta o creación final vinculada con el aprendizaje.
- Organiza tareas o fases realistas para la duración disponible.
- Si el proyecto necesita varias clases, identifica claramente qué fase se desarrollará en esta sesión.
- Distribuye roles de planificación, ejecución, observación, registro y presentación.
- Evalúa el proceso, el producto, la colaboración y la presentación mediante criterios explícitos.
`,

  "guided-discovery": `
DESCUBRIMIENTO GUIADO

- Organiza una secuencia progresiva de consignas y preguntas que conduzca al descubrimiento.
- No entregues inmediatamente la solución técnica completa.
- Permite explorar, comparar respuestas y ajustar la ejecución.
- El docente observa, pregunta, orienta y ofrece pistas sin sustituir la exploración.
- Evalúa la capacidad de descubrir, explicar, aplicar y mejorar la solución encontrada.
`,

  "problem-solving": `
RESOLUCIÓN DE PROBLEMAS

- Propón situaciones abiertas que admitan diferentes respuestas motrices o estratégicas.
- Permite que los estudiantes diseñen, prueben, comparen y mejoren soluciones.
- Define condiciones, límites de seguridad y criterios para valorar cada solución.
- El docente facilita el análisis sin imponer una única respuesta desde el inicio.
- Evalúa creatividad, eficacia, justificación, ejecución y capacidad de ajuste.
`,

  "reciprocal-teaching": `
ENSEÑANZA RECÍPROCA

- Organiza parejas o pequeños equipos que alternen los roles de ejecutante y observador.
- Proporciona criterios observables, breves y comprensibles para ofrecer retroalimentación.
- Incluye cambio obligatorio de roles para que todos ejecuten, observen y orienten.
- El docente supervisa la calidad y el respeto de la retroalimentación.
- Utiliza coevaluación y una breve autoevaluación al finalizar.
`,

  stations: `
ESTACIONES DE APRENDIZAJE

- Organiza estaciones con objetivo, tarea, materiales, tiempo y criterio de logro definidos.
- Establece rotaciones claras y seguras.
- Distribuye estudiantes y recursos evitando esperas, cruces y aglomeraciones.
- Define roles activos dentro de cada estación.
- Evalúa mediante observación, registro breve o evidencia específica en cada estación.
`,

  "task-circuit": `
CIRCUITO DE TAREAS

- Diseña una secuencia ordenada de tareas vinculadas con el mismo objetivo.
- Indica recorrido, tiempo o repeticiones, transición y medidas de seguridad.
- Ajusta la exigencia al nivel educativo y evita cargas desproporcionadas.
- Mantén funciones activas de ejecución, control, observación o registro.
- Evalúa técnica, cumplimiento de la secuencia, autonomía y progreso.
`,

  "flipped-classroom": `
AULA INVERTIDA

- Identifica el contenido breve que debe revisarse antes de la clase.
- Utiliza el tiempo presencial principalmente para aplicar, practicar, resolver dudas y recibir retroalimentación.
- Incluye una alternativa inicial breve para quienes no pudieron revisar el recurso previamente.
- El docente verifica conocimientos previos y acompaña la aplicación práctica.
- Evalúa preparación, aplicación, participación y reflexión final.
`,

  "direct-instruction": `
INSTRUCCIÓN DIRECTA

- Organiza la enseñanza mediante explicación breve, demostración, práctica guiada, retroalimentación y práctica autónoma.
- Presenta criterios técnicos concretos y observables.
- El docente dirige inicialmente y reduce progresivamente la ayuda.
- El estudiantado observa, practica, corrige y aplica de manera autónoma.
- Evalúa comprensión, ejecución técnica y mejora entre intentos.
`,

  combined: `
METODOLOGÍA COMBINADA

- Selecciona entre dos y tres metodologías compatibles.
- Nombra claramente cuáles serán utilizadas.
- Explica qué metodología corresponde a cada momento de la planificación.
- La combinación debe responder al objetivo, tiempo, estudiantes, materiales y espacio.
- Evita mezclar estrategias sin una función pedagógica concreta.
- Integra organización, roles y evaluación coherentes con cada metodología seleccionada.
`,
};

const COMMON_APPLICATION_REQUIREMENTS = `
APLICACIÓN METODOLÓGICA OBLIGATORIA

- Incluye una sección titulada exactamente "Metodología aplicada".
- Nombra la metodología utilizada y explica su aplicación concreta.
- La metodología debe observarse realmente en las actividades de inicio, desarrollo y cierre.
- Describe cómo modifica la organización del grupo y del espacio.
- Define claramente el rol docente y los roles del estudiantado.
- La evaluación debe ser coherente con la metodología.
- No te limites a mencionar el nombre de la metodología.
- No reproduzcas estas instrucciones internas en el resultado.
`;

export function getPlanningMethodologyInstructions(
  methodology: AIPlanningMethodology,
): string {
  const methodologyOption =
    getPlanningMethodologyById(
      methodology,
    );

  const methodologyLabel =
    methodologyOption?.label ??
    methodology;

  const selectionRequirement =
    methodology === "automatic"
      ? `
DECISIÓN METODOLÓGICA

- El docente solicitó selección automática.
- Selecciona una metodología adecuada o una combinación justificada de máximo dos metodologías.
- En la sección "Metodología aplicada", escribe claramente el nombre de la metodología o las metodologías finalmente elegidas.
`
      : methodology === "combined"
        ? `
DECISIÓN METODOLÓGICA

- El docente seleccionó "Metodología combinada".
- Elige entre dos y tres metodologías compatibles.
- En la sección "Metodología aplicada", escribe primero "Metodología combinada" y nombra inmediatamente las metodologías que la integran.
- Explica qué función cumple cada metodología dentro de la sesión.
`
        : `
METODOLOGÍA SELECCIONADA POR EL DOCENTE

- La metodología principal obligatoria es "${methodologyLabel}".
- En la sección "Metodología aplicada", escribe literalmente: "Metodología: ${methodologyLabel}".
- No sustituyas esta metodología por otra.
- Puedes utilizar grupos, estaciones, juegos, retos o circuitos como recursos organizativos únicamente cuando sean coherentes, pero no deben reemplazar ni renombrar la metodología seleccionada.
- Las actividades, la organización, los roles y la evaluación deben demostrar la aplicación real de "${methodologyLabel}".
`;

  return `
${selectionRequirement}

${COMMON_APPLICATION_REQUIREMENTS}

${METHODOLOGY_INSTRUCTIONS[methodology]}
`.trim();
}