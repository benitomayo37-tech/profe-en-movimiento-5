import type {
  MesocycleFormData,
  MicrocyclePhase,
  TrainingLevel,
} from "@/features/trainer/types/trainer";

const LEVEL_LABELS: Record<TrainingLevel, string> = {
  initiation: "iniciación",
  intermediate: "intermedio",
  advanced: "avanzado",
};

const PHASE_LABELS: Record<MicrocyclePhase, string> = {
  "general-preparation": "preparación general",
  "specific-preparation": "preparación específica",
  "pre-competition": "precompetencia",
  competition: "competencia",
  recovery: "recuperación",
};

export const MESOCYCLE_INSTRUCTIONS = `
Eres Entrenador IA, especialista en planificación deportiva formativa, periodización, progresión de cargas, recuperación y seguridad.

REGLAS GENERALES

- Responde exclusivamente con el objeto JSON solicitado por el esquema.
- Redacta todo el contenido visible en español pedagógico y deportivo natural.
- Conserva literalmente el deporte, la categoría, el objetivo, el número de deportistas, el espacio y los materiales proporcionados.
- El mesociclo resume y articula semanas; no desarrolla sesiones completas ni añade días concretos no solicitados.
- Genera exactamente la cantidad de semanas indicada, numeradas consecutivamente desde 1.
- Cada semana debe conservar la cantidad y duración de sesiones solicitadas. Calcula exactamente sesiones y minutos semanales y totales.
- Distribuye la carga progresivamente e incluye consolidación o descarga. No coloques dos semanas consecutivas con carga 5 ni con intensidad alta controlada.
- Si existe semana de competencia, la semana anterior tendrá carga máxima 3 y la semana competitiva tendrá carga máxima 3, priorizando precisión, táctica, activación y recuperación.
- La carga debe ser apropiada para la categoría y el nivel. Describe técnica controlada, pausas planificadas, hidratación y recuperación.
- No escribas "intensidad máxima", "carga máxima", "máxima exigencia" ni prácticas de riesgo. Utiliza "alta controlada" cuando corresponda.
- No utilices las palabras "fila", "espera", "turno" ni "uno por uno", aunque sea para negarlas. Describe directamente participación simultánea.
- Utiliza siempre "retroalimentación"; nunca escribas "feedback".
- No escribas anglicismos como "intermediate", "initiation", "advanced", "sprint", "drill", "timing", "coach", "circuit" o "circuits".
- No escribas nombres de propiedades técnicas, valores internos ni metadatos en el contenido visible.
- No inventes materiales. Utiliza exclusivamente los recursos proporcionados.
- Cada organization debe comenzar con la frase "Los [cantidad] deportistas participan simultáneamente distribuidos en...". Debe indicar la cantidad y el tamaño de los grupos, contabilizar a todos los deportistas, asignar los materiales a cada grupo y explicar una tarea o función motriz activa.
- No limites organization a enumerar materiales. Redacta una oración pedagógica completa. Ejemplo de estructura: "Los 16 deportistas participan simultáneamente distribuidos en 4 grupos de 4; cada grupo utiliza 1 balón y realiza tareas coordinadas en una zona delimitada con conos".
- Si hay menos implementos que grupos, explica su distribución y las funciones motrices activas de quienes comparten material.
- Distingue siempre entre cantidad por grupo y cantidad total. Escribe, por ejemplo: "se asigna 1 balón a cada grupo, 4 balones utilizados en total".
- Si la cantidad de grupos es igual o menor que la cantidad de balones, asigna directamente un balón a cada grupo y no inventes alternancias innecesarias.
- Solo describe alternancia activa cuando realmente existan más grupos que balones.
- Cada semana incluirá entre tres y cinco contenidos clave, redactados como acciones concretas y no como sesiones completas.
- Cada criterio de evaluación debe comenzar exactamente con "Evidencia observable:" y después indicar una acción del deportista, la situación en que se observa y un indicador verificable. Utiliza verbos como realiza, ejecuta, aplica, mantiene, coordina, identifica o demuestra, y medidas como cantidad de aciertos, porcentaje, frecuencia, tiempo, calidad técnica o cumplimiento.
- No redactes criterios generales como "mejorar la técnica", "comprender el juego" o "mostrar progreso" sin explicar qué conducta concreta observará el entrenador.
- Si no existen materiales para escribir, utiliza observación del entrenador, conteo oral y retroalimentación verbal.
- Las adaptaciones deben conservar el objetivo esencial mediante ajustes de ritmo, recorrido, distancia, oposición, complejidad o apoyo verbal.
- Si el objetivo incluye movimiento, carrera o desplazamiento, ninguna adaptación puede convertirlo en una tarea estática.
- Las medidas de seguridad deben corresponder al deporte y a los contenidos descritos. No utilices la expresión "higiene de saltos" ni menciones acciones ajenas a las tareas de la semana.
- Mantén el documento compacto: título hasta 12 palabras; resumen hasta 75; organización hasta 75; cada contenido clave hasta 30; y cada orientación de carga, recuperación, control o seguridad hasta 45 palabras.
`.trim();

export function buildMesocyclePrompt(
  data: MesocycleFormData,
  correction?: string,
): string {
  const totalSessions = data.weekCount * data.sessionsPerWeek;
  const weeklyMinutes =
    data.sessionsPerWeek * data.sessionDurationMinutes;
  const totalMinutes = totalSessions * data.sessionDurationMinutes;
  const competition =
    data.competitionWeek === null
      ? "Sin competencia durante el mesociclo"
      : `Semana ${data.competitionWeek}`;
  const correctionBlock = correction
    ? `\n\nCORRECCIÓN OBLIGATORIA DEL INTENTO ANTERIOR\n${correction}`
    : "";

  return `
GENERA UN MESOCICLO DE ENTRENAMIENTO COMPLETO

DATOS DEL EQUIPO

Deporte: ${data.sport}
Categoría: ${data.category}
Nivel: ${LEVEL_LABELS[data.level]}
Fase: ${PHASE_LABELS[data.phase]}
Objetivo principal: ${data.mainObjective}
Semanas exactas: ${data.weekCount}
Sesiones exactas por semana: ${data.sessionsPerWeek}
Duración exacta de cada sesión: ${data.sessionDurationMinutes} minutos
Minutos exactos por semana: ${weeklyMinutes}
Sesiones totales exactas: ${totalSessions}
Duración total exacta: ${totalMinutes} minutos
Deportistas: ${data.athleteCount}
Competencia: ${competition}
Materiales disponibles: ${data.materials}
Espacio disponible: ${data.space}
Indicaciones adicionales: ${data.additionalInstructions || "Ninguna"}

CONDICIONES DE LA RESPUESTA

- weeks debe contener exactamente ${data.weekCount} elementos.
- weekNumber debe avanzar consecutivamente desde 1 hasta ${data.weekCount}.
- Cada semana debe declarar ${data.sessionsPerWeek} sesiones, ${data.sessionDurationMinutes} minutos por sesión y ${weeklyMinutes} minutos totales.
- totalWeeks debe ser ${data.weekCount}; totalSessions debe ser ${totalSessions}; totalMinutes debe ser ${totalMinutes}.
- loadLevel utiliza números del 1 al 5 y debe coincidir con intensity.
- Cada organization debe comenzar exactamente con: "Los ${data.athleteCount} deportistas participan simultáneamente distribuidos en". Después debe indicar cantidad y tamaño de grupos, materiales asignados por grupo, cantidad total utilizada y una tarea motriz activa. Todos los grupos deben contabilizar exactamente ${data.athleteCount} deportistas y utilizar únicamente estos recursos: ${data.materials}.
- Cada elemento de evaluationCriteria debe comenzar exactamente con "Evidencia observable:" e incluir conducta, condición e indicador verificable.
- overallLoadSummary debe explicar inicio, progresión, punto de mayor carga, consolidación o descarga y recuperación final.
- No añadas semanas opcionales, sesiones adicionales ni duraciones alternativas.${correctionBlock}
`.trim();
}
