import type {
  GeneratedTrainingSession,
  TrainingSessionFormData,
} from "@/features/trainer/types/trainer";

export interface TrainingSessionValidationResult {
  valid: boolean;
  message?: string;
}

const validLevels = new Set([
  "initiation",
  "intermediate",
  "advanced",
]);

const validFocuses = new Set([
  "technical",
  "tactical",
  "physical",
  "coordination",
  "recovery",
  "combined",
]);

const validIntensities = new Set([
  "low",
  "moderate",
  "high-controlled",
]);

function isSafeString(
  value: unknown,
  maximumLength: number,
  allowEmpty = false,
): value is string {
  return (
    typeof value === "string" &&
    value.trim().length >= (allowEmpty ? 0 : 1) &&
    value.length <= maximumLength
  );
}

export function isValidTrainingSessionFormData(
  value: unknown,
): value is TrainingSessionFormData {
  if (typeof value !== "object" || value === null) {
    return false;
  }

  const data = value as Record<string, unknown>;

  return (
    isSafeString(data.sport, 100) &&
    isSafeString(data.category, 100) &&
    typeof data.level === "string" &&
    validLevels.has(data.level) &&
    typeof data.focus === "string" &&
    validFocuses.has(data.focus) &&
    isSafeString(data.objective, 800) &&
    Number.isInteger(data.durationMinutes) &&
    Number(data.durationMinutes) >= 15 &&
    Number(data.durationMinutes) <= 300 &&
    Number.isInteger(data.athleteCount) &&
    Number(data.athleteCount) >= 1 &&
    Number(data.athleteCount) <= 200 &&
    typeof data.intensity === "string" &&
    validIntensities.has(data.intensity) &&
    isSafeString(data.materials, 500) &&
    isSafeString(data.space, 300) &&
    isSafeString(data.competitionContext, 100) &&
    isSafeString(data.additionalInstructions, 1200, true)
  );
}

function isStringArray(
  value: unknown,
  minimum: number,
  maximum: number,
): value is string[] {
  return (
    Array.isArray(value) &&
    value.length >= minimum &&
    value.length <= maximum &&
    value.every((item) => isSafeString(item, 700))
  );
}

export function isGeneratedTrainingSession(
  value: unknown,
): value is GeneratedTrainingSession {
  if (typeof value !== "object" || value === null) {
    return false;
  }

  const session = value as Record<string, unknown>;

  if (
    !isSafeString(session.title, 180) ||
    !isSafeString(session.summary, 1000) ||
    !isSafeString(session.objective, 800) ||
    !Number.isInteger(session.totalMinutes) ||
    !isSafeString(session.loadGuidance, 1000) ||
    !Array.isArray(session.blocks) ||
    session.blocks.length < 4 ||
    session.blocks.length > 6 ||
    !isStringArray(session.evaluationCriteria, 2, 6) ||
    !isStringArray(session.safetyMeasures, 3, 7) ||
    !isStringArray(session.adaptationNotes, 2, 5)
  ) {
    return false;
  }

  return session.blocks.every((block) => {
    if (typeof block !== "object" || block === null) {
      return false;
    }

    const item = block as Record<string, unknown>;

    const activitiesAreValid =
      Array.isArray(item.activities) &&
      item.activities.length >= 1 &&
      item.activities.length <= 5 &&
      item.activities.every((activity) => {
        if (
          typeof activity !== "object" ||
          activity === null
        ) {
          return false;
        }

        const typedActivity = activity as Record<
          string,
          unknown
        >;

        const segmentsAreValid =
          Array.isArray(typedActivity.segments) &&
          typedActivity.segments.length >= 1 &&
          typedActivity.segments.length <= 12 &&
          typedActivity.segments.every((segment) => {
            if (
              typeof segment !== "object" ||
              segment === null
            ) {
              return false;
            }

            const typedSegment = segment as Record<
              string,
              unknown
            >;

            return (
              isSafeString(typedSegment.name, 160) &&
              Number.isInteger(typedSegment.seconds) &&
              Number(typedSegment.seconds) > 0 &&
              isSafeString(typedSegment.description, 600)
            );
          });

        return (
          isSafeString(typedActivity.name, 180) &&
          Number.isInteger(typedActivity.minutes) &&
          Number(typedActivity.minutes) > 0 &&
          isSafeString(typedActivity.description, 900) &&
          segmentsAreValid
        );
      });

    return (
      isSafeString(item.name, 160) &&
      isSafeString(item.objective, 600) &&
      Number.isInteger(item.minutes) &&
      Number(item.minutes) > 0 &&
      isSafeString(item.intensity, 300) &&
      isSafeString(item.organization, 1200) &&
      activitiesAreValid &&
      isStringArray(item.coachingPoints, 1, 5) &&
      isSafeString(item.recovery, 600) &&
      isSafeString(item.safety, 600)
    );
  });
}

function normalize(value: string): string {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();
}

function extractAvailableBalls(materials: string): number | null {
  const normalizedMaterials = normalize(materials);

  if (/\bsin balon(?:es)?\b/.test(normalizedMaterials)) {
    return 0;
  }

  const match = normalizedMaterials.match(
    /\b(\d+)\s+balon(?:es)?\b/,
  );

  return match ? Number(match[1]) : null;
}

export function validateTrainingSession(
  formData: TrainingSessionFormData,
  session: GeneratedTrainingSession,
): TrainingSessionValidationResult {
  if (session.totalMinutes !== formData.durationMinutes) {
    return {
      valid: false,
      message: `La duración total debe ser exactamente ${formData.durationMinutes} minutos.`,
    };
  }

  const blockTotal = session.blocks.reduce(
    (total, block) => total + block.minutes,
    0,
  );

  if (blockTotal !== formData.durationMinutes) {
    return {
      valid: false,
      message: `Los bloques suman ${blockTotal} minutos y deben sumar ${formData.durationMinutes}.`,
    };
  }

  for (const block of session.blocks) {
    const activityTotal = block.activities.reduce(
      (total, activity) => total + activity.minutes,
      0,
    );

    if (activityTotal !== block.minutes) {
      return {
        valid: false,
        message: `Las actividades del bloque "${block.name}" suman ${activityTotal} minutos y deben sumar exactamente ${block.minutes}. Incluye dentro de ese tiempo pausas, transiciones y cambios de rol.`,
      };
    }

    for (const activity of block.activities) {
      const segmentTotalSeconds =
        activity.segments.reduce(
          (total, segment) => total + segment.seconds,
          0,
        );

      const expectedSeconds = activity.minutes * 60;

      if (segmentTotalSeconds !== expectedSeconds) {
        return {
          valid: false,
          message: `Los segmentos de la actividad "${activity.name}" del bloque "${block.name}" suman ${segmentTotalSeconds} segundos y deben sumar exactamente ${expectedSeconds} segundos (${activity.minutes} minutos).`,
        };
      }

      const descriptiveText = normalize(
        [
          activity.description,
          ...activity.segments.map(
            (segment) => segment.description,
          ),
        ].join(" "),
      );

      const numericTimePattern =
        /\b\d+(?:[.,]\d+)?\s*(?:s|seg|segs|segundos?|min|mins|minutos?)\b/;

      const writtenTimePattern =
        /\b(?:un|una|dos|tres|cuatro|cinco|seis|siete|ocho|nueve|diez|medio|media)\s+(?:segundos?|minutos?)\b/;

      if (
        numericTimePattern.test(descriptiveText) ||
        writtenTimePattern.test(descriptiveText)
      ) {
        return {
          valid: false,
          message: `La actividad "${activity.name}" del bloque "${block.name}" repite cantidades temporales dentro de una descripción. Expresa todos los subtiempos únicamente mediante los segmentos estructurados.`,
        };
      }
    }

  }

  const blockNames = normalize(
    session.blocks.map((block) => block.name).join(" "),
  );

  if (!/calentamiento|activacion/.test(blockNames)) {
    return {
      valid: false,
      message: "La sesión debe incluir un bloque de calentamiento o activación claramente identificado.",
    };
  }

  if (!/vuelta a la calma|enfriamiento|recuperacion final/.test(blockNames)) {
    return {
      valid: false,
      message: "La sesión debe incluir una vuelta a la calma claramente identificada.",
    };
  }

  const visibleText = normalize(
    JSON.stringify(session),
  );

  const forbiddenSpanishTerms: Array<{
    pattern: RegExp;
    term: string;
  }> = [
    { pattern: /\bfeedback\b/, term: "feedback" },
    { pattern: /\bcatch(?:\s*(?:&|and)\s*)?shoot\b/, term: "catch and shoot" },
    { pattern: /\bdrive(?:\s*(?:\+|&|and)\s*)?kick\b/, term: "drive and kick" },
    { pattern: /\blay[ -]?up\b/, term: "lay-up" },
    { pattern: /\bcoach(?:ing)?\b/, term: "coach" },
    { pattern: /\bdrill\b/, term: "drill" },
    { pattern: /\bsprints?\b/, term: "sprint" },
  ];

  const forbiddenTerm = forbiddenSpanishTerms.find(
    ({ pattern }) => pattern.test(visibleText),
  );

  if (forbiddenTerm) {
    return {
      valid: false,
      message: `La sesión utiliza el anglicismo "${forbiddenTerm.term}". Debe redactarse completamente en español.`,
    };
  }

  for (const block of session.blocks) {
    const organization = normalize(block.organization);

    const organizationWithoutNegatedWaiting =
      organization
        .replace(
          /\b(?:sin|evitar|evita|evitando|eliminar|elimina|impedir|impide|no hay|no existen|no se forman|se evitan)\b[^.!?;]{0,100}\bfilas?\b/g,
          "",
        )
        .replace(
          /\b(?:sin|evitar|evita|evitando|eliminar|elimina|impedir|impide|no hay|no existe|no se permite|se evita)\b[^.!?;]{0,100}\bespera(?:s)?(?: pasiva(?:s)?)?\b/g,
          "",
        );

    if (
      /\bsi el espacio (?:lo )?permite\b|\bsi no\b|\bopcional(?:mente)?\b|\bsegun disponibilidad\b/.test(
        organization,
      )
    ) {
      return {
        valid: false,
        message: `La organización del bloque "${block.name}" es condicional. Debe establecer una sola distribución exacta y viable.`,
      };
    }

    const passiveWaitingPattern =
      /\b(?:forman?|organizan?|distribuyen|permanecen?|quedan?) (?:en )?(?:\d+\s+)?filas?\b|\ben (?:\d+\s+)?filas?\b|\blineas? de espera\b|\bdetras de (?:la )?(?:fila|linea)\b|\bal final de (?:la )?(?:fila|linea)\b|\bminimizar (?:la )?espera\b|\bespera pasiva\b|\b(?:esperan?|aguardan?) (?:su )?turno\b|\buno por uno\b|\bsale (?:el|la) primer[oa]\b/;

    if (
      passiveWaitingPattern.test(
        organizationWithoutNegatedWaiting,
      )
    ) {
      return {
        valid: false,
        message: `La organización del bloque "${block.name}" genera filas o espera. Todos los deportistas deben mantener una tarea motriz o un rol activo simultáneo.`,
      };
    }
  }

  const availableBalls = extractAvailableBalls(
    formData.materials,
  );

  if (availableBalls !== null) {
    const requiredBallsForPairs = Math.ceil(
      formData.athleteCount / 2,
    );

    if (availableBalls < requiredBallsForPairs) {
      for (const block of session.blocks) {
        const organization = normalize(block.organization);
        const blockText = normalize(
          [
            block.organization,
            ...block.activities.map(
              (activity) => activity.description,
            ),
          ].join(" "),
        );

        const blockTextWithoutNegatedBall =
          blockText.replace(/\bsin balon(?:es)?\b/g, "");

        const usesPairsWithBall =
          /\bparejas?\b/.test(organization) &&
          /\bbalon(?:es)?\b|\bpases?\b|\btiros?\b|\bbote\b|\bdrible\b/.test(
            blockTextWithoutNegatedBall,
          );

        if (!usesPairsWithBall) {
          continue;
        }

        const explicitlyClaimsImpossibleSimultaneousUse =
          /\btodas las parejas\b[^.!?;]{0,180}\b(?:usan|utilizan|trabajan con|realizan pases|realizan tiros|tiran con)\b[^.!?;]{0,180}\bsimultaneamente\b/.test(
            blockText,
          ) ||
          /\bsimultaneamente\b[^.!?;]{0,180}\btodas las parejas\b[^.!?;]{0,180}\b(?:balon|pases|tiros|bote|drible)\b/.test(
            blockText,
          );

        if (explicitlyClaimsImpossibleSimultaneousUse) {
          return {
            valid: false,
            message: `El bloque "${block.name}" afirma que todas las parejas utilizan balón simultáneamente, pero solo hay ${availableBalls} balón(es). Debe organizar alternancia activa o tareas simultáneas sin balón.`,
          };
        }
      }
     }
  }

  /*
   * Comprueba la relación entre deportistas, formato de juego
   * y cantidad de canchas utilizadas simultáneamente.
   *
   * Ejemplo:
   * 16 deportistas en 4 contra 4 permiten como máximo
   * 2 partidos y 2 minicanchas simultáneas.
   */
  for (const block of session.blocks) {
    const blockText = normalize(
      [
        block.name,
        block.organization,
        ...block.activities.map(
          (activity) =>
            activity.description,
        ),
      ].join(" "),
    );

    const gameFormatMatch =
      blockText.match(
        /\b(\d{1,2})\s*(?:contra|vs?\.?|x)\s*(\d{1,2})\b/,
      );

    const declaredCourtsMatch =
      blockText.match(
        /\b(\d{1,2})\s+(?:mini\s*canchas?|minicanchas?|canchas?)\b/,
      );

    const describesSimultaneousGames =
      /\bsimultane[oa]s?\b|\bal mismo tiempo\b/.test(
        blockText,
      ) &&
      /\bpartidos?\b|\bjuegos?\b|\bencuentros?\b|\bmini\s*partidos?\b/.test(
        blockText,
      );

    if (
      gameFormatMatch &&
      declaredCourtsMatch &&
      describesSimultaneousGames
    ) {
      const playersOnFirstTeam =
        Number(gameFormatMatch[1]);

      const playersOnSecondTeam =
        Number(gameFormatMatch[2]);

      const playersRequiredPerGame =
        playersOnFirstTeam +
        playersOnSecondTeam;

      const declaredSimultaneousCourts =
        Number(declaredCourtsMatch[1]);

      const maximumSimultaneousGames =
        Math.floor(
          formData.athleteCount /
            playersRequiredPerGame,
        );

      if (
        declaredSimultaneousCourts >
        maximumSimultaneousGames
      ) {
        return {
          valid: false,
          message:
            `El bloque "${block.name}" propone ` +
            `${declaredSimultaneousCourts} canchas simultáneas para un juego ` +
            `${playersOnFirstTeam} contra ${playersOnSecondTeam}, pero con ` +
            `${formData.athleteCount} deportistas solo pueden realizarse ` +
            `${maximumSimultaneousGames} partido(s) simultáneo(s). ` +
            `Debe reducir la cantidad de canchas y distribuir dos equipos completos en cada una.`,
        };
      }
    }
  }

   const visibleTextWithoutNegatedRisk =
    visibleText
      .replace(
        /\b(?:no|nunca|evitar|evita|evitando|impedir|impide|prohibir|prohibe|se prohibe|no realizar|no realiza|no trabajar|no trabaja|no entrenar)\b[^.!?;]{0,120}\b(?:al fallo|carga(?:s)? maxima(?:s)?|sin descanso|castigo fisico|dolor como meta|hasta vomitar)\b/g,
        "",
      )
      .replace(
        /\bsin (?:carga(?:s)? maxima(?:s)?|castigo fisico|trabajo al fallo)\b/g,
        "",
      );

  const unsafePracticeMatch =
    visibleTextWithoutNegatedRisk.match(
      /\bal fallo\b|\bcarga(?:s)? maxima(?:s)?\b|\bsin descanso\b|\bcastigo fisico\b|\bdolor como meta\b|\bhasta vomitar\b/,
    );

  if (unsafePracticeMatch) {
    return {
      valid: false,
      message:
        `La sesión incluye esta carga o práctica de riesgo: ` +
        `"${unsafePracticeMatch[0]}". Debe reemplazarla por una tarea segura y apropiada para la categoría.`,
    };
  }

  if (
    formData.competitionContext === "next-48-hours" &&
    /maxima intensidad|intensidad maxima|carga maxima/.test(visibleText)
  ) {
    return {
      valid: false,
      message: "Con una competencia en las próximas 48 horas debe evitarse la carga máxima y la fatiga residual.",
    };
  }

  return { valid: true };
}
