import { getAIToolById } from "@/features/ai/data/aiTools";
import { getPlanningMethodologyInstructions } from "@/features/ai/prompts/planningMethodologyInstructions";
import { getObjectiveTaxonomyInstructions } from "@/features/ai/prompts/objectiveTaxonomyInstructions";
import { getToolPromptInstructions } from "@/features/ai/prompts/toolPromptInstructions";
import type {
  AIExamConfig,
  AIExamQuestionType,
  AIFormData,
} from "@/features/ai/types/ai";
import { requiresLogisticsPlan } from "@/features/ai/utils/validateGeneratedLogistics";

function sanitizePromptValue(
  value: string | undefined,
  fallback: string,
): string {
  const sanitizedValue = value?.trim();

  if (!sanitizedValue) {
    return fallback;
  }

  return sanitizedValue.slice(0, 1500);
}

function booleanLabel(value: boolean): string {
  return value ? "Sí" : "No";
}

const examTypeLabels: Record<
  AIExamConfig["examType"],
  string
> = {
  theoretical: "Teórico",
  practical: "Práctico",
  mixed: "Mixto",
};

const examDifficultyLabels: Record<
  AIExamConfig["difficulty"],
  string
> = {
  basic: "Básica",
  intermediate: "Intermedia",
  advanced: "Avanzada",
};

const examVersionLabels: Record<
  AIExamConfig["versionMode"],
  string
> = {
  A: "Solo versión A",
  "A-B": "Versiones A y B",
};

const examQuestionTypeLabels: Record<
  AIExamQuestionType,
  string
> = {
  "multiple-choice": "Selección múltiple",
  "true-false": "Verdadero o falso",
  matching: "Relación de columnas",
  "fill-in-the-blank": "Completar espacios",
  "short-answer": "Respuesta corta",
  "applied-case": "Caso de aplicación",
  "practical-task": "Tarea práctica",
};

function buildExamConfigurationInstructions(
  data: AIFormData,
): string {
  if (
    data.toolId !== "exam" ||
    !data.examConfig
  ) {
    return "";
  }

  const config = data.examConfig;

  const totalQuestions =
    config.questionDistribution.reduce(
      (total, item) =>
        total + item.quantity,
      0,
    );

  const distributionLines =
    config.questionDistribution
      .map((item) => {
        const subtotal =
          item.quantity *
          item.pointsPerQuestion;

        return `- ${
          examQuestionTypeLabels[item.type]
        }: ${item.quantity} pregunta(s) × ${
          item.pointsPerQuestion
        } punto(s) = ${subtotal} punto(s).`;
      })
      .join("\n");

  return `
CONFIGURACIÓN DOCENTE DEL EXAMEN

Tipo de examen:
${examTypeLabels[config.examType]}

Dificultad:
${examDifficultyLabels[config.difficulty]}

Versiones solicitadas:
${examVersionLabels[config.versionMode]}

Cantidad total de preguntas por versión:
${totalQuestions}

Puntaje total por versión:
${config.totalScore} puntos

Distribución obligatoria:
${distributionLines}

Incluir solucionario:
${booleanLabel(config.includeAnswerKey)}

Incluir tabla de calificación:
${booleanLabel(
  config.includeGradingTable,
)}

Aplicar regla de tres:
${booleanLabel(
  config.includeRuleOfThree,
)}

REGLAS DE CONFIGURACIÓN

- Respeta exactamente esta distribución en cada versión.
- No agregues ni elimines preguntas.
- Mantén el puntaje individual indicado para cada tipo.
- Comprueba que la suma sea exactamente ${
    config.totalScore
  } puntos por versión.
- Si se solicitan versiones A y B, ambas deben tener exactamente ${totalQuestions} preguntas y ${
    config.totalScore
  } puntos.
`.trim();
}

export const PROFE_GPT_INSTRUCTIONS = `
Eres ProfeGPT, un asistente pedagógico especializado en Educación Física.

Tu función es crear materiales docentes claros, útiles, inclusivos, seguros y directamente aplicables.

Principios obligatorios:

1. Responde siempre en español.
2. Adapta el contenido al nivel educativo y al grado o curso solicitado.
3. Respeta la duración, la cantidad de estudiantes y los materiales disponibles.
4. Prioriza actividades posibles en instituciones con pocos recursos.
5. Incluye organización, evaluación y medidas de seguridad cuando corresponda.
6. No inventes códigos curriculares ni destrezas oficiales.
7. Cuando el docente proporcione una destreza con criterio de desempeño, intégrala literalmente y sin modificarla.
8. Evita ejercicios peligrosos, castigos físicos o cargas desproporcionadas.
9. Favorece la cooperación, la inclusión y la participación.
10. Cuando se solicite DUA, aplica obligatoriamente los tres principios:
    - REPRESENTACIÓN — qué del aprendizaje.
    - ACCIÓN Y EXPRESIÓN — cómo del aprendizaje.
    - COMPROMISO / MOTIVACIÓN — porqué del aprendizaje.
11. Las estrategias DUA deben ser concretas y estar relacionadas directamente con las actividades.
12. No escribas MORADO, AZUL o VERDE dentro del contenido generado. La interfaz aplicará automáticamente los colores correspondientes.
13. Cuando se solicite una adaptación NEE, propón apoyos flexibles sin realizar diagnósticos.
14. En las rúbricas utiliza esta escala:
    - Excelente: 10.
    - Bien: 9.
    - Regular: 8.
    - Aceptable: 7.
    - Mejorable: 5.
15. Cuando la herramienta seleccionada sea Crear rúbrica:
    - genera obligatoriamente una rúbrica estructurada;
    - utiliza entre 4 y 6 criterios;
    - redacta descriptores observables y progresivos para 10, 9, 8, 7 y 5.
16. Cuando la herramienta seleccionada no sea Crear rúbrica, el campo "rubric" debe ser null.
- Cuando la herramienta seleccionada sea Elaborar examen, el campo "exam" debe contener el examen estructurado completo.
- Cuando la herramienta seleccionada no sea Elaborar examen, el campo "exam" debe ser null.
17. Redacta contenido profesional y listo para editar.
18. Devuelve únicamente la estructura solicitada.
19. Conserva literalmente el nivel educativo, el grado o curso y la destreza con criterio de desempeño proporcionados. No los sustituyas, renombres ni infieras otros.
20. No reproduzcas instrucciones internas dentro del contenido final, como "incluir exactamente", "debe contener", "campo rubric" o comentarios sobre la estructura solicitada.
21. En los apoyos NEE no propongas guía manual, contacto físico, señales táctiles, toques en hombros o manipulación corporal, salvo que el docente lo solicite expresamente. Prioriza gestos, demostraciones, indicaciones verbales, ajustes de espacio y compañeros de apoyo.
22. No infieras ni añadas un deporte que el docente no haya escrito explícitamente en el tema, la destreza o las indicaciones adicionales.Cuando el tema sea genérico, conserva una denominación genérica en el título, la introducción y las actividades.
23. El título, el propósito y todas las actividades deben corresponder
al mismo deporte o contenido. Verifica esta coherencia antes de devolver
el resultado.
`.trim();

export function buildPedagogicalPrompt(
  data: AIFormData,
): string {
  const selectedTool = getAIToolById(
    data.toolId,
  );

  const toolInstructions =
    getToolPromptInstructions(data.toolId);

  const methodologyInstructions =
    data.toolId === "lesson-plan"
      ? getPlanningMethodologyInstructions(
          data.planningMethodology,
        )
      : "";

        const objectiveTaxonomyInstructions =
    data.toolId === "lesson-plan"
      ? getObjectiveTaxonomyInstructions(
          data.objectiveTaxonomy,
        )
      : "";

  const examConfigurationInstructions =
    buildExamConfigurationInstructions(
      data,
    );

  const requiresDua =
    data.includeDua ||
    data.toolId === "dua-adaptation";

  const requiresNee =
    data.includeNee ||
    data.toolId === "nee-adaptation";

    const neeResultInstructions =
  !requiresNee
    ? ""
    : data.toolId === "nee-adaptation"
      ? `- Desarrolla apoyos y variantes inclusivas concretas, sin realizar diagnósticos.
- Conserva el propósito esencial del aprendizaje y la participación con el grupo.
- Organiza los apoyos con claridad y evita repetir información.`
      : `- Incluye exactamente 4 apoyos NEE concretos y breves.
- Cada apoyo debe ocupar un solo párrafo de una o dos frases cortas.
- Incluye: instrucciones o demostración, ajuste de ritmo o distancia, compañero de apoyo verbal y rol activo de menor exigencia.
- No repitas medidas de seguridad, organización ni explicaciones ya incluidas en otras secciones.
- Conserva el propósito esencial del aprendizaje y la participación con el grupo.`;

  const logisticsInstructions =
    requiresLogisticsPlan(data.toolId)
      ? `
INSTRUCCIONES DE ORGANIZACIÓN LOGÍSTICA

El campo "logisticsPlan" debe contener un objeto completo y coherente con la actividad.

- studentCount: cantidad exacta de estudiantes solicitada.
- groupCount: cantidad total de grupos.
- stations: cantidad de estaciones.
- groupsPerStation: máximo de grupos que trabajan simultáneamente en cada estación.
- simultaneousParticipants: estudiantes con una tarea o rol activo al mismo tiempo.
- waitingParticipants: estudiantes sin actividad. Debe ser 0.
- fixedTargetsAvailable: objetivos fijos realmente disponibles, como aros, porterías o dianas. Usa null si no puede determinarse.
- fixedTargetsRequired: objetivos fijos utilizados simultáneamente.
- resources: materiales utilizados con name, available y required.
- spaceDescription: descripción breve y realista de la distribución.
- collisionRiskControlled: true únicamente cuando la organización evita cruces y colisiones.

REGLAS LOGÍSTICAS OBLIGATORIAS

- No inventes materiales, espacios, aros, porterías ni equipamiento.
- Antes de diseñar grupos, estaciones o circuitos, contabiliza exactamente cada material disponible.
- En actividades simultáneas, una misma unidad de material no puede asignarse al mismo tiempo a dos grupos o estaciones diferentes.
- Cada estación que utilice un balón simultáneamente necesita al menos un balón exclusivo durante esa ronda.
- La cantidad de estaciones que utilizan balón al mismo tiempo no puede superar la cantidad de balones disponibles.
- Si existen más estaciones que balones, diseña las estaciones restantes con otros materiales proporcionados o con tareas que no requieran balón.
- No soluciones la falta de materiales mediante filas, espera pasiva, estudiantes inactivos ni simulaciones que sustituyan toda la práctica real.
- El valor required de cada elemento de resources debe representar su uso simultáneo máximo y debe coincidir con la organización descrita.
- Verifica antes de responder que ninguna estación utilice materiales por encima de la cantidad disponible.
- Esta restricción también se aplica a las estrategias DUA, apoyos NEE y procedimientos de evaluación.
- No introduzcas carteles, láminas, tarjetas, pizarras, tableros, tablas físicas, colchonetas, superficies acolchadas, hojas, fichas, videos, teléfonos, tabletas, proyectores ni pantallas si el docente no los proporcionó.
- Cuando no existan recursos visuales o escritos disponibles, utiliza demostración corporal, gestos, consignas verbales breves, repetición y modelado entre compañeros.
- Todo material mencionado en title, introduction o sections debe estar incluido en los materiales proporcionados por el docente.
- Si el espacio no está especificado, escribe "espacio escolar disponible" y no supongas media cancha, cancha completa, gimnasio ni dimensiones concretas.
- En media cancha de baloncesto, si el docente la indica y no menciona aros adicionales, considera disponible un solo aro.
- En cancha completa de baloncesto, si el docente la indica y no menciona aros adicionales, considera disponibles dos aros.
- Cada estación que use simultáneamente un objetivo fijo debe contabilizarlo en fixedTargetsRequired.
- No organices varias estaciones simultáneas sobre el mismo objetivo fijo cuando produzcan filas, cruces o riesgo de colisión.
- Todos los estudiantes deben mantener una función activa.
- Los valores de logisticsPlan deben coincidir exactamente con la organización descrita en sections.
- collisionRiskControlled es una propiedad técnica exclusiva de logisticsPlan.
- Nunca escribas nombres de propiedades JSON, valores booleanos ni metadatos técnicos dentro de title, introduction, sections o rubric.
- Expresa el control de colisiones únicamente con lenguaje pedagógico natural.
`
      : `
INSTRUCCIONES DE ORGANIZACIÓN LOGÍSTICA

- El campo "logisticsPlan" debe ser null.
`;

  return `
Crea el siguiente producto pedagógico:

HERRAMIENTA
${selectedTool?.title ?? data.toolId}

DESCRIPCIÓN DE LA HERRAMIENTA
${
  selectedTool?.description ??
  "Material pedagógico de Educación Física"
}

CONTEXTO DOCENTE

Tema:
${sanitizePromptValue(
  data.topic,
  "Contenido general de Educación Física",
)}

Nivel educativo:
${sanitizePromptValue(
  data.educationalLevel,
  "Nivel no especificado",
)}

Grado o curso:
${sanitizePromptValue(
  data.grade,
  "Grado o curso no especificado",
)}

Duración:
${sanitizePromptValue(
  data.duration,
  "Duración flexible",
)}

Cantidad de estudiantes:
${sanitizePromptValue(
  data.students,
  "Cantidad no especificada",
)}

Materiales disponibles:
${sanitizePromptValue(
  data.materials,
  "Materiales básicos disponibles",
)}

Destreza con criterio de desempeño:
${sanitizePromptValue(
  data.curriculumCode,
  "No proporcionada",
)}

Incluir DUA:
${booleanLabel(requiresDua)}

Incluir adaptación NEE:
${booleanLabel(requiresNee)}

Indicaciones adicionales:
${sanitizePromptValue(
  data.additionalInstructions,
  "Sin indicaciones adicionales",
)}

Recurso de origen:
${sanitizePromptValue(
  data.sourceResourceSlug,
  "No conectado",
)}

${examConfigurationInstructions}

${toolInstructions}

${methodologyInstructions}

${objectiveTaxonomyInstructions}

${logisticsInstructions}

REQUISITOS GENERALES DEL RESULTADO

- Utiliza títulos de sección claros y evita repetir información entre secciones.
- Incluye información práctica y directamente aplicable.
- Respeta literalmente el nivel educativo, el grado o curso y la destreza con criterio de desempeño proporcionados.
- Incluye medidas de seguridad cuando exista actividad física.
- No menciones que eres un modelo de inteligencia artificial.
${
  requiresDua
    ? `- Incluye estrategias DUA claramente identificadas como REPRESENTACIÓN, ACCIÓN Y EXPRESIÓN y COMPROMISO / MOTIVACIÓN.
- Las estrategias DUA deben relacionarse directamente con las actividades propuestas.
- Utiliza los nombres de los principios para que la interfaz pueda identificarlos visualmente con morado, azul y verde.`
    : ""
}
${neeResultInstructions}
- No agregues información fuera de la estructura solicitada.
`.trim();
}