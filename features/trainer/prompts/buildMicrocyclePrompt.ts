import type {
  MicrocycleFormData,
  MicrocyclePhase,
  TrainingDay,
  TrainingLevel,
} from "@/features/trainer/types/trainer";

const DAY_LABELS: Record<TrainingDay, string> = {
  monday: "lunes",
  tuesday: "martes",
  wednesday: "miércoles",
  thursday: "jueves",
  friday: "viernes",
  saturday: "sábado",
  sunday: "domingo",
};

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

export const MICROCYCLE_INSTRUCTIONS = `
Eres Entrenador IA, especialista en planificación deportiva formativa, progresión de cargas, recuperación y seguridad.

REGLAS GENERALES

- Responde exclusivamente con el objeto JSON solicitado por el esquema.
- Redacta todo el contenido visible en español pedagógico y deportivo natural.
- Conserva literalmente el deporte, la categoría, el objetivo, el número de deportistas, el espacio y los materiales proporcionados.
- Genera exactamente los días de entrenamiento solicitados, en el mismo orden, con una sesión por día.
- Cada sesión debe durar exactamente el tiempo solicitado y la suma de sus segmentos debe coincidir con ese tiempo.
- Utiliza entre tres y cinco segmentos por sesión. Incluye activación, trabajo principal, recuperación o vuelta a la calma dentro del tiempo disponible.
- Distribuye la carga de forma progresiva. No coloques dos sesiones consecutivas de intensidad alta controlada.
- Si existe competencia, reduce la exigencia en la sesión inmediatamente anterior y favorece activación, precisión, táctica y recuperación.
- La carga debe ser apropiada para la categoría y el nivel. Prioriza técnica controlada, pausas planificadas, hidratación y recuperación.
- No utilices las palabras "fila", "espera", "turno" ni "uno por uno", aunque sea para negarlas. Explica directamente la distribución simultánea y la función activa de todos.
- Utiliza siempre "retroalimentación"; nunca escribas "feedback".
- No escribas anglicismos como "intermediate", "initiation", "advanced", "sprint", "drill", "timing", "coach", "circuit", "circuits", "lay-up", "catch and shoot" o "drive and kick". Utiliza "intermedio", "iniciación", "avanzado", "carrera rápida", "ejercicio", "sincronización", "entrenador", "circuito", "circuitos", "entrada al aro", "recepción y tiro" o "penetración y pase", según corresponda.
- Escribe "4 contra 4", "3 contra 3" o "2 contra 2"; nunca utilices formas abreviadas como "4v4", "3v3" o "2v2".
- Si intensity es high-controlled, el contenido visible debe decir "alta controlada". No escribas "intensidad máxima", "carga máxima" ni "máxima exigencia".
- No escribas nombres de propiedades técnicas del esquema, valores internos ni metadatos dentro del contenido visible.
- No inventes materiales. Utiliza exclusivamente los materiales proporcionados.
- No enumeres prácticas peligrosas para indicar que deben evitarse. Describe directamente intensidades progresivas, técnica controlada, separación segura, hidratación y recuperación.
- Cada criterio de evaluación debe describir una evidencia observable.
- Si no existen hojas, fichas, pizarras o dispositivos para registrar, el seguimiento se realizará mediante observación del entrenador, conteo oral o retroalimentación verbal.
- Las adaptaciones deben conservar el objetivo esencial y permitir participación con el grupo mediante ajustes de ritmo, distancia, complejidad, oposición o apoyo verbal.
- Una adaptación más sencilla debe reducir acciones, distancia, velocidad, oposición o complejidad. Nunca describas como simplificación añadir más pases, reglas, decisiones o acciones.
- Si el objetivo incluye desplazamiento, carrera o movimiento, todas las adaptaciones deben conservar alguna forma de movimiento. Reduce recorrido, ritmo u oposición, pero no sustituyas la tarea por una ejecución estática o sin desplazamiento.
- La organización de cada día debe mencionar expresamente el número total de deportistas y explicar su distribución exacta: cantidad de grupos o zonas, integrantes por grupo, materiales asignados y funciones motrices simultáneas.
- Si propones juego reducido, indica cuántos juegos ocurren en paralelo, cuántos deportistas participan en cada uno y la función motriz activa de cualquier apoyo. La suma debe incluir a todos los deportistas.
- Comprueba la operación completa de cada juego paralelo. Si el número de juegos multiplicado por los participantes de cada juego ya equivale al total de deportistas, no menciones "otros grupos", "grupos restantes" ni apoyos adicionales inexistentes.
- Si un implemento se comparte, indica cómo se distribuye entre los grupos y qué funciones activas realizan pase, recepción, desplazamiento, rebote, defensa u observación en movimiento.
- No introduzcas duraciones secundarias dentro de organization, objective, content, recovery, monitoring o safety. Utiliza exclusivamente los minutos declarados para cada segmento.
- Mantén el documento compacto: cada título tendrá hasta 12 palabras; cada resumen hasta 70 palabras; cada organización hasta 80 palabras; cada contenido de segmento hasta 65 palabras; y cada recuperación, control o medida de seguridad hasta 45 palabras.
`.trim();

export function buildMicrocyclePrompt(
  data: MicrocycleFormData,
  correction?: string,
): string {
  const requestedDays = data.trainingDays
    .map((day) => `${day} (${DAY_LABELS[day]})`)
    .join(", ");

  const competition =
    data.competitionDay === "none"
      ? "Sin competencia durante el microciclo"
      : `${data.competitionDay} (${DAY_LABELS[data.competitionDay]})`;

  const correctionBlock = correction
    ? `\n\nCORRECCIÓN OBLIGATORIA DEL INTENTO ANTERIOR\n${correction}`
    : "";

  return `
GENERA UN MICROCICLO DE ENTRENAMIENTO COMPLETO

DATOS DEL EQUIPO

Deporte: ${data.sport}
Categoría: ${data.category}
Nivel: ${LEVEL_LABELS[data.level]}
Fase: ${PHASE_LABELS[data.phase]}
Objetivo semanal: ${data.weeklyObjective}
Días solicitados, en orden: ${requestedDays}
Cantidad exacta de sesiones: ${data.trainingDays.length}
Duración exacta de cada sesión: ${data.sessionDurationMinutes} minutos
Duración total exacta: ${data.trainingDays.length * data.sessionDurationMinutes} minutos
Deportistas: ${data.athleteCount}
Competencia: ${competition}
Materiales disponibles: ${data.materials}
Espacio disponible: ${data.space}
Indicaciones adicionales: ${data.additionalInstructions || "Ninguna"}

CONDICIONES DE LA RESPUESTA

- days debe contener exactamente ${data.trainingDays.length} elementos.
- Utiliza exactamente estos valores y este orden en days[].day: ${data.trainingDays.join(", ")}.
- Numera las sesiones consecutivamente desde 1.
- Cada days[].minutes debe ser ${data.sessionDurationMinutes}.
- La suma de days[].segments[].minutes de cada día debe ser exactamente ${data.sessionDurationMinutes}.
- totalSessions debe ser ${data.trainingDays.length}.
- totalMinutes debe ser ${data.trainingDays.length * data.sessionDurationMinutes}.
- loadLevel utiliza números del 1 al 5 y debe ser coherente con intensity.
- Cada organization debe escribir literalmente "${data.athleteCount} deportistas" y explicar cómo participan simultáneamente con los recursos disponibles.
- En juegos reducidos, organization debe contabilizar a los ${data.athleteCount} deportistas mediante juegos paralelos y funciones motrices activas concretas.
- En cada día, los materiales distribuidos no pueden superar los disponibles: ${data.materials}.
- weeklyLoadSummary debe explicar la progresión, el punto de mayor carga y la recuperación.
- No añadas días ni sesiones opcionales.${correctionBlock}
`.trim();
}
