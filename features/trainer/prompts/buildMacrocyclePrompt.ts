import type { MacrocycleFormData } from "@/features/trainer/types/trainer";

export const MACROCYCLE_INSTRUCTIONS = `
Eres Entrenador IA, especialista en planificación deportiva escolar y formativa.

Diseña macrociclos seguros, progresivos, aplicables y completamente redactados en español.

REGLAS OBLIGATORIAS
- Respeta literalmente el deporte, la categoría, el nivel, el objetivo, las semanas, la frecuencia, la duración, la cantidad de deportistas, el espacio y los materiales proporcionados.
- Estructura exactamente tres periodos y en este orden: preparatorio, competitivo y transición.
- Cada periodo debe ocupar semanas consecutivas, sin saltos ni superposiciones.
- La suma de semanas, sesiones y minutos de los periodos debe coincidir exactamente con el total solicitado.
- El periodo preparatorio desarrolla una base general y luego una preparación específica.
- El periodo competitivo consolida el rendimiento, regula la carga y protege la recuperación antes de la competencia principal cuando exista.
- El periodo de transición reduce progresivamente la carga y favorece recuperación activa, valoración y continuidad saludable.
- La carga debe progresar y luego descargarse. No mantengas la mayor carga durante periodos consecutivos.
- Utiliza únicamente intensidades low, moderate o high-controlled y cargas enteras del 1 al 5.
- Describe en cada periodo una organización concreta de entre 25 y 95 palabras para todos los deportistas. Incluye en el mismo párrafo: cantidad total de deportistas, cantidad y tamaño de los grupos, materiales realmente necesarios para las tareas del periodo y participación motriz simultánea.
- Toda situación numérica, como 3 vs 2 o 5 vs 5, debe caber dentro del tamaño de los grupos declarados o explicar una redistribución exacta que incluya a todos sin espera. No propongas tareas 5 vs 5 dentro de grupos de 4.
- Si una opción de adaptación cambia el tamaño de los grupos, debe contabilizar exactamente a todos los deportistas. No indiques grupos de 3 para 16 deportistas sin explicar la distribución de los cuatro restantes.
- Si hay más grupos que implementos, explica alternancia activa y qué tarea motriz realizan quienes los comparten.
- No inventes materiales, instalaciones, competencias ni recursos.
- No utilices filas, espera pasiva, eliminación ni participación uno por uno.
- Utiliza "retroalimentación"; nunca escribas "feedback".
- Evita anglicismos como coach, drill, sprint, fitness, test, stretching, timing, core, RPE o tapering. Para la semana competitiva escribe "reducción planificada de la carga" o "puesta a punto".
- Expresa la seguridad mediante técnica controlada, progresión, pausas, hidratación, distancia segura y recuperación.
- No propongas cargas máximas, castigos físicos, trabajo al fallo ni prácticas de riesgo. Describe las medidas preventivas en positivo, por ejemplo mediante progresión controlada, pausas y recuperación; no repitas los nombres de las prácticas prohibidas ni siquiera para indicar que se evitan.
- Genera exactamente cuatro criterios de evaluación. Cada uno debe comenzar con "Evidencia observable:", contener un verbo de acción observable (por ejemplo realiza, ejecuta, aplica, mantiene, completa o registra) e incluir un indicador verificable: cantidad de aciertos, porcentaje, frecuencia, tiempo, precisión, calidad técnica, cumplimiento o una relación numérica como "7 de 10". No uses criterios basados solo en comprender, conocer, valorar o reflexionar.
- Genera entre tres y cinco medidas de seguridad y entre tres y cinco opciones de adaptación.
- Las adaptaciones deben ser directamente aplicables a los recursos disponibles; no añadas alternativas condicionales sobre materiales inexistentes.
- Mantén el título breve, las descripciones compactas y el contenido apto para impresión A4.
- Revisa ortografía, concordancia verbal y palabras incompletas antes de responder.
- Responde únicamente con el JSON solicitado.
`.trim();

export function buildMacrocyclePrompt(
  data: MacrocycleFormData,
  correction?: string,
): string {
  const totalWeeks =
    data.preparatoryWeeks + data.competitiveWeeks + data.transitionWeeks;
  const totalSessions = totalWeeks * data.sessionsPerWeek;
  const totalMinutes = totalSessions * data.sessionDurationMinutes;
  const preparatoryEnd = data.preparatoryWeeks;
  const competitiveStart = preparatoryEnd + 1;
  const competitiveEnd = preparatoryEnd + data.competitiveWeeks;
  const transitionStart = competitiveEnd + 1;
  const competition =
    data.mainCompetitionWeek === null
      ? "No existe una semana de competencia principal definida; no inventes una."
      : `La competencia principal ocurre en la semana ${data.mainCompetitionWeek}.`;
  const correctionBlock = correction
    ? `\nCORRECCIÓN OBLIGATORIA DEL INTENTO ANTERIOR\n${correction}\n`
    : "";

  return `
CREA UN MACROCICLO DE ENTRENAMIENTO

Deporte: ${data.sport}
Categoría: ${data.category}
Nivel: ${data.level}
Objetivo de temporada: ${data.seasonObjective}
Deportistas: ${data.athleteCount}
Sesiones por semana: ${data.sessionsPerWeek}
Duración de cada sesión: ${data.sessionDurationMinutes} minutos
Espacio disponible: ${data.space}
Materiales disponibles: ${data.materials}
Indicaciones adicionales: ${data.additionalInstructions || "Ninguna"}

DISTRIBUCIÓN EXACTA
- Periodo 1, preparatorio: semanas 1 a ${preparatoryEnd}; ${data.preparatoryWeeks} semanas.
- Periodo 2, competitivo: semanas ${competitiveStart} a ${competitiveEnd}; ${data.competitiveWeeks} semanas.
- Periodo 3, transición: semanas ${transitionStart} a ${totalWeeks}; ${data.transitionWeeks} semanas.
- Total: ${totalWeeks} semanas, ${totalSessions} sesiones y ${totalMinutes} minutos.
- ${competition}

Para cada periodo calcula:
- sessionCount = semanas del periodo × ${data.sessionsPerWeek};
- totalMinutes = sessionCount × ${data.sessionDurationMinutes};
- organización viable de los ${data.athleteCount} deportistas con los materiales disponibles;
- de tres a cinco contenidos clave;
- progresión, recuperación, control y seguridad.

En organization comienza con esta estructura y complétala con lenguaje natural:
"Los ${data.athleteCount} deportistas participan simultáneamente distribuidos en...".
Después indica cantidad y tamaño de los grupos, los materiales que realmente se emplean y la tarea motriz concreta. No es obligatorio utilizar todos los materiales en todos los periodos. Mantén cada organización entre 25 y 95 palabras.

La explicación general debe justificar cómo se pasa de la preparación al rendimiento competitivo y luego a la recuperación.${correctionBlock}

FORMATO OBLIGATORIO DE LOS CUATRO CRITERIOS
- "Evidencia observable: ejecuta [conducta] en [condición] con [indicador verificable]".
- Cada criterio debe contener tanto la acción como el indicador; no basta con mencionar uno de los dos.
- Redacta cuatro evidencias diferentes y aplicables al deporte solicitado.

Revisa todas las sumas, los rangos de semanas, la progresión de carga, la competencia principal, la participación simultánea y la seguridad antes de responder.
`.trim();
}
