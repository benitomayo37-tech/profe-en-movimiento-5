import {
  getObjectiveTaxonomyById,
} from "@/features/ai/data/objectiveTaxonomies";
import type {
  AIObjectiveTaxonomy,
} from "@/features/ai/types/ai";

const OBJECTIVE_TAXONOMY_INSTRUCTIONS:
  Record<
    AIObjectiveTaxonomy,
    string
  > = {
    automatic: `
SELECCIÓN AUTOMÁTICA

- Analiza el tema, la destreza curricular, el nivel educativo y las actividades solicitadas.
- Selecciona Taxonomía de Bloom cuando el propósito sea principalmente cognitivo.
- Selecciona Taxonomía de Harrow cuando el propósito sea principalmente psicomotor.
- Selecciona Bloom + Harrow cuando la comprensión y la ejecución motriz deban integrarse.
- No selecciones una taxonomía por defecto sin analizar el aprendizaje solicitado.
- Identifica claramente la taxonomía y el nivel elegidos.
`,

    bloom: `
TAXONOMÍA DE BLOOM

- Formula el objetivo desde el dominio cognitivo.
- Selecciona el nivel más adecuado entre:
  - Recordar.
  - Comprender.
  - Aplicar.
  - Analizar.
  - Evaluar.
  - Crear.
- Utiliza verbos observables como identificar, describir, explicar, aplicar, diferenciar, analizar, comparar, evaluar, justificar, diseñar o crear.
- Evita verbos imprecisos como conocer, saber, aprender, entender, interiorizar o familiarizarse.
- El objetivo debe permitir obtener una evidencia cognitiva verificable.
- Las actividades y la evaluación deben corresponder al nivel de Bloom seleccionado.
`,

    harrow: `
TAXONOMÍA DE HARROW

- Formula el objetivo desde el dominio psicomotor.
- Selecciona el nivel más adecuado entre:
  - Movimientos básicos o fundamentales.
  - Habilidades perceptivas.
  - Capacidades físicas.
  - Movimientos especializados o habilidades motrices.
  - Comunicación corporal no discursiva.
  - El nivel taxonómico debe ser uno de los niveles anteriores, no un verbo de acción.
- No utilices "Ejecutar", "Coordinar", "Aplicar", "Demostrar" ni otro verbo como nombre del nivel de Harrow.
- Para habilidades deportivas específicas utiliza preferentemente "Movimientos especializados o habilidades motrices".
- Ejemplo correcto: "Nivel taxonómico: Harrow — Movimientos especializados o habilidades motrices."
- Utiliza verbos observables como ejecutar, coordinar, controlar, ajustar, combinar, desplazarse, lanzar, recibir, equilibrar, demostrar, adaptar o crear una secuencia motriz.
- El objetivo debe describir una conducta motriz directamente observable.
- Incluye condiciones seguras de ejecución y un criterio verificable de logro.
- Las actividades y la evaluación deben medir realmente la habilidad motriz expresada en el objetivo.
`,

    combined: `
TAXONOMÍA COMBINADA: BLOOM + HARROW

- Integra en un mismo objetivo una evidencia cognitiva y una evidencia psicomotora.
- Selecciona y nombra un nivel de Bloom y un nivel de Harrow.
- En "Nivel taxonómico", Bloom debe mostrar un nivel cognitivo y Harrow un nivel psicomotor, no los verbos utilizados en el objetivo.
- Utiliza este formato: "Nivel taxonómico: Bloom — [Recordar, Comprender, Aplicar, Analizar, Evaluar o Crear]; Harrow — [nivel psicomotor correspondiente]."
- Para una técnica deportiva, un ejemplo correcto es: "Nivel taxonómico: Bloom — Aplicar; Harrow — Movimientos especializados o habilidades motrices."
- Es incorrecto escribir "Harrow — Ejecutar", porque ejecutar es un verbo y no un nivel taxonómico.
- Utiliza al menos un verbo cognitivo observable y un verbo motor observable.
- La línea "Objetivo:" debe contener literalmente ambos componentes.
- Utiliza preferentemente esta estructura: "[verbo de Bloom] el contenido y [verbo de Harrow] la habilidad motriz, bajo determinadas condiciones y con un criterio de logro".
- Ejemplo de estructura: "Aplicar los principios técnicos y ejecutar la habilidad motriz con control y precisión durante situaciones cooperativas".
- No redactes únicamente un verbo motor acompañado de expresiones generales como "comprendiendo la técnica".
- Para el componente Bloom utiliza explícitamente identificar, explicar, aplicar, analizar, evaluar, justificar, diseñar, resolver o tomar decisiones.
- Para el componente Harrow utiliza explícitamente ejecutar, coordinar, controlar, ajustar, combinar, lanzar, recibir, equilibrar, demostrar o adaptar.
- Relaciona la comprensión con la ejecución; no presentes dos aprendizajes desconectados.
- El componente cognitivo debe ayudar a tomar decisiones, comprender, aplicar, analizar, evaluar o crear.
- El componente psicomotor debe evidenciar coordinación, control, adaptación o ejecución motriz.
- Las actividades y la evaluación deben comprobar ambos componentes.
- Evita redactar dos objetivos independientes unidos artificialmente.
`,
  };

const COMMON_OBJECTIVE_REQUIREMENTS = `
FORMULACIÓN OBLIGATORIA DEL OBJETIVO

- La sección "Objetivo de aprendizaje" debe identificar la taxonomía aplicada.
- Dentro de esa sección incluye elementos separados con este formato:
  - "Taxonomía aplicada: [nombre de la taxonomía]."
  - "Nivel taxonómico: [nivel seleccionado]."
  - "Objetivo: [objetivo completo]."
- Conserva literalmente la destreza con criterio de desempeño proporcionada.
- No inventes, reemplaces ni modifiques códigos curriculares.
- Formula un objetivo principal directamente relacionado con la destreza y el tema.
- Respeta estrictamente el alcance del tema escrito por el docente.
- Si el tema menciona una técnica específica, formula el objetivo únicamente sobre esa técnica.
- No agregues otras técnicas, habilidades, deportes o contenidos que no aparezcan explícitamente en el tema, la destreza o las indicaciones adicionales.
- Las actividades y la evaluación tampoco deben ampliar el objetivo con habilidades no solicitadas.
- El objetivo debe comenzar con uno o más verbos observables en infinitivo.
- El objetivo debe incluir:
  - conducta o aprendizaje observable;
  - contenido específico;
  - condición de realización;
  - criterio verificable de logro.
- Ajusta la complejidad al nivel educativo y al grado o curso.
- Evita objetivos excesivamente amplios, vagos o imposibles de evaluar en la duración solicitada.
- No utilices actividades como si fueran objetivos.
- El inicio, desarrollo, cierre y evaluación deben contribuir al logro del mismo objetivo.
- Los indicadores o criterios de evaluación deben medir exactamente lo expresado en el objetivo.
- No reproduzcas estas instrucciones internas en el resultado.
- Si utilizas un porcentaje como criterio de logro, indica también la cantidad exacta de aciertos y el total de intentos.
- El porcentaje debe coincidir matemáticamente con la relación entre aciertos e intentos.
- Ejemplos correctos: "8 de 10 intentos, equivalente al 80%" y "6 de 8 intentos, equivalente al 75%".
- No escribas porcentajes sin un número total de intentos.
- No combines la expresión "pases consecutivos" con un porcentaje. Para una secuencia consecutiva utiliza solamente la cantidad de pases; para un porcentaje utiliza aciertos de un total de intentos.
`;

export function getObjectiveTaxonomyInstructions(
  taxonomy: AIObjectiveTaxonomy,
): string {
  const selectedTaxonomy =
    getObjectiveTaxonomyById(
      taxonomy,
    );

  return `
${COMMON_OBJECTIVE_REQUIREMENTS}

TAXONOMÍA SELECCIONADA POR EL DOCENTE

${
  selectedTaxonomy?.label ??
  taxonomy
}

${OBJECTIVE_TAXONOMY_INSTRUCTIONS[taxonomy]}
`.trim();
}