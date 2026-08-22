import type {
  AIFormData,
  AILogisticsPlan,
  AIToolId,
  GeneratedAIContent,
} from "@/features/ai/types/ai";
import { normalizeGeneratedPhysicalCircuitStructure } from "@/features/ai/utils/normalizeGeneratedPhysicalCircuitStructure";

const LOGISTICS_AWARE_TOOLS =
  new Set<AIToolId>([
    "lesson-plan",
    "game",
    "assessment",
    "dua-adaptation",
    "nee-adaptation",
    "physical-circuit",
  ]);

export interface LogisticsValidationResult {
  valid: boolean;
  message?: string;
}

interface ArithmeticEquation {
  expression: string;
  statedResult: number;
  calculatedResult: number;
  start: number;
}

export function requiresLogisticsPlan(toolId: AIToolId): boolean {
  return LOGISTICS_AWARE_TOOLS.has(toolId);
}

function normalizeText(value: string): string {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();
}

function parseNumericValue(value: string): number | null {
  const parsed = Number.parseFloat(value.replace(",", "."));

  return Number.isFinite(parsed) ? parsed : null;
}

function nearlyEqual(first: number, second: number): boolean {
  return Math.abs(first - second) < 0.01;
}

function evaluateArithmeticExpression(expression: string): number | null {
  const normalized = expression
    .replace(/[xX×]/g, "*")
    .replace(/,/g, ".")
    .replace(/\s+/g, "");

  if (!/^\d+(?:\.\d+)?(?:[+*]\d+(?:\.\d+)?)+$/.test(normalized)) {
    return null;
  }

  const additiveParts = normalized.split("+");
  let total = 0;

  for (const additivePart of additiveParts) {
    const factors = additivePart.split("*");
    let product = 1;

    for (const factor of factors) {
      const value = Number.parseFloat(factor);

      if (!Number.isFinite(value)) {
        return null;
      }

      product *= value;
    }

    total += product;
  }

  return total;
}

function extractArithmeticEquations(value: string): ArithmeticEquation[] {
  const equations: ArithmeticEquation[] = [];
  const normalized = normalizeText(value);

  const equationPattern =
    /(\d+(?:[.,]\d+)?(?:\s*(?:\+|[x×*])\s*\d+(?:[.,]\d+)?)+)\s*=\s*(\d+(?:[.,]\d+)?)/g;

  for (const match of normalized.matchAll(equationPattern)) {
    const expression = match[1];
    const statedResult = parseNumericValue(match[2]);

    const calculatedResult = evaluateArithmeticExpression(expression);

    if (statedResult === null || calculatedResult === null) {
      continue;
    }

    equations.push({
      expression,
      statedResult,
      calculatedResult,
      start: match.index ?? 0,
    });
  }

  return equations;
}

function extractStudentCount(value: string): number | null {
  const match = value.match(/\d+/);

  if (!match) {
    return null;
  }

  const count = Number.parseInt(match[0], 10);

  return Number.isInteger(count) && count > 0 ? count : null;
}

function inferFixedTargetsAvailable(
  formData: AIFormData,
  plan: AILogisticsPlan,
): number | null {
  const inputContext = normalizeText(
    [formData.topic, formData.materials, formData.additionalInstructions].join(
      " ",
    ),
  );

  const completeContext = normalizeText(
    [inputContext, plan.spaceDescription].join(" "),
  );

  const explicitMatch = inputContext.match(
    /\b(\d+)\s*(?:aros?|canastas?|porterias?|arcos?|dianas?)\b/,
  );

  if (explicitMatch) {
    return Number.parseInt(explicitMatch[1], 10);
  }

  const isBasketballActivity =
    /\b(?:baloncesto|basket|canasta|tiro\s+al\s+aro)\b/.test(completeContext);

  if (!isBasketballActivity) {
    return null;
  }

  const usesHalfCourt = /\b(?:media\s+cancha|mitad\s+de\s+cancha)\b/.test(
    completeContext,
  );

  if (usesHalfCourt) {
    return 1;
  }

  const usesFullCourt = /\b(?:cancha\s+completa|cancha\s+entera)\b/.test(
    completeContext,
  );

  if (usesFullCourt) {
    return 2;
  }

  return 1;
}

function createInvalidResult(message: string): LogisticsValidationResult {
  return {
    valid: false,
    message,
  };
}

function getVisibleContentText(content: GeneratedAIContent): string {
  return normalizeText(
    content.sections
      .flatMap((section) => [section.title, ...section.content])
      .join(" "),
  );
}

const VISIBLE_RESOURCE_RULES = [
  {
    label: "carteles, láminas o tarjetas",
    visiblePattern:
      /\b(?:carteles?|laminas?|tarjetas?)\b/,
    requestedPattern:
      /\b(?:carteles?|laminas?|tarjetas?)\b/,
  },
  {
    label: "pizarras o tableros",
    visiblePattern:
      /\b(?:pizarras?|tableros?)\b/,
    requestedPattern:
      /\b(?:pizarras?|tableros?)\b/,
  },
  {
    label: "una tabla física",
    visiblePattern:
      /\b(?:con|usar|usa|utilizar|utiliza|mediante|sobre)\s+(?:una\s+|la\s+)?tablas?\b/,
    requestedPattern:
      /\btablas?\b/,
  },
  {
    label:
      "colchonetas o superficies acolchadas",
    visiblePattern:
      /\b(?:colchonetas?|superficies?\s+acolchadas?)\b/,
    requestedPattern:
      /\b(?:colchonetas?|superficies?\s+acolchadas?)\b/,
  },
  {
    label:
      "videos o dispositivos electrónicos",
    visiblePattern:
      /\b(?:videos?|telefonos?|celulares?|tabletas?|proyectores?|pantallas?)\b/,
    requestedPattern:
      /\b(?:videos?|telefonos?|celulares?|tabletas?|proyectores?|pantallas?)\b/,
  },
  {
    label: "hojas o fichas impresas",
    visiblePattern:
      /\b(?:hojas?\s+(?:entregadas?|impresas?|de\s+(?:respuesta|cotejo|evaluacion|trabajo))|fichas?\s+(?:impresas?|de\s+(?:trabajo|evaluacion)))\b/,
    requestedPattern:
      /\b(?:hojas?|fichas?|papel|cuadernos?)\b/,
  },
  {
    label: "cuerdas o escaleras",
    visiblePattern:
      /\b(?:cuerdas?|escaleras?\s+de\s+agilidad)\b/,
    requestedPattern:
      /\b(?:cuerdas?|escaleras?\s+de\s+agilidad)\b/,
  },
  {
    label: "conos",
    visiblePattern:
      /\b(?:con|usar|usa|utilizar|utiliza|mediante)\s+(?:los?\s+|unos?\s+)?conos?\b|\bdelimitad[oa]s?\s+por\s+(?:los?\s+)?conos?\b/,
    requestedPattern:
      /\bconos?\b/,
  },
  {
    label: "silbato",
    visiblePattern:
      /\b(?:con|usar|usa|utilizar|utiliza|mediante)\s+(?:un\s+|el\s+)?silbato\b/,
    requestedPattern:
      /\bsilbato\b/,
  },
  {
  label: "palos o bastones",
  visiblePattern:
    /\b(?:palos?|bastones?)\b/,
  requestedPattern:
    /\b(?:palos?|bastones?)\b/,
},
] as const;

function validateVisibleResourceConsistency(
  formData: AIFormData,
  content: GeneratedAIContent,
): LogisticsValidationResult {
  const requestedText =
    normalizeText(
      [
        formData.topic,
        formData.materials,
        formData.additionalInstructions,
      ].join(" "),
    );

  const visibleText =
    getVisibleContentText(content);

  const unrequestedResources =
    VISIBLE_RESOURCE_RULES.filter(
      (rule) =>
        rule.visiblePattern.test(
          visibleText,
        ) &&
        !rule.requestedPattern.test(
          requestedText,
        ),
    ).map((rule) => rule.label);

  if (
    unrequestedResources.length > 0
  ) {
    return createInvalidResult(
      `El contenido utiliza recursos no proporcionados: ${unrequestedResources.join(
        ", ",
      )}. Utiliza exclusivamente los materiales indicados por el docente.`,
    );
  }

  return {
    valid: true,
  };
}

function validateVisibleParticipationConsistency(
  plan: AILogisticsPlan,
  content: GeneratedAIContent,
): LogisticsValidationResult {
  const operationalText =
    normalizeText(
      content.sections
        .filter((section) => {
          const sectionTitle =
            normalizeText(
              section.title,
            );

          return !(
            sectionTitle.includes(
              "pregunta",
            ) ||
            sectionTitle.includes(
              "respuesta",
            ) ||
            sectionTitle.includes(
              "orientacion",
            ) ||
            sectionTitle.includes(
              "criterio",
            ) ||
            sectionTitle.includes(
              "estrategias dua",
            )
          );
        })
        .flatMap((section) => [
          section.title,
          ...section.content,
        ])
        .join(" "),
    );

    const textWithoutNegatedWaiting =
    operationalText
       .replace(
  /\b(?:sin|evitar|evita|evitando|eliminar|elimina|impedir|impide|prohibir|prohibe|no\s+hay|no\s+habra|no\s+debe\s+haber|no\s+existe(?:n)?|no\s+se\s+permite(?:n)?|no\s+se\s+generara(?:n)?|se\s+evita(?:n)?|libre\s+de|ausencia\s+de)\b[^.!?;]{0,120}\bespera(?:s)?\s+pasiva(?:s)?\b/g,
  "",
)
      .replace(
        /\b(?:sin|no\s+hay|no\s+existen)\s+(?:estudiantes?|alumnos?|participantes?)\s+inactiv[oa]s?\b/g,
        "",
      )
      .replace(
        /\bningun[oa]?\s+(?:estudiante|alumno|participante)\s+inactiv[oa]\b/g,
        "",
      )
      .replace(
        /\bnadie\s+(?:queda|permanece|esta)\s+inactiv[oa]\b/g,
        "",
      )
      .replace(
        /\bevitar\s+que\s+(?:los\s+|las\s+)?(?:estudiantes?|alumnos?|participantes?)\s+(?:queden|permanezcan)\s+inactiv[oa]s?\b/g,
        "",
      );

  const passiveWaitingPatterns = [
    /\b(?:otros?|otras?)\s+(?:\d+\s+)?(?:estudiantes?|alumnos?|participantes?)?\s*esperan\b/,
    /\bquienes\s+esperan\b/,
    /\b(?:parejas?|estudiantes?|alumnos?|participantes?|grupos?|equipos?)\s+que\s+esperan\b/,
    /\b(?:grupo|equipo)\s+(?:[a-z]|\d+)\s+espera\b/,
    /\b(?:aguardan?|esperan)\s+(?:su\s+)?turno\b/,
    /\bespera pasiva\b/,
    /\b(?:estudiantes?|alumnos?|participantes?|grupos?|equipos?)\s+(?:quedan?|permanecen?|estan?|se\s+mantienen?)\s+en\s+espera\b/,
    /\bhay\s+(?:\d+\s+)?(?:estudiantes?|alumnos?|participantes?)\s+(?:sin actividad|inactiv[oa]s?)\b/,
    /\b(?:estudiantes?|alumnos?|participantes?|grupos?|equipos?)\s+(?:quedan?|permanecen?|estan?|se\s+mantienen?)\s+(?:sin actividad|inactiv[oa]s?)\b/,
  ];

  let passiveWaitingFragment:
    string | null = null;

  for (
    const pattern of
      passiveWaitingPatterns
  ) {
    const match =
      textWithoutNegatedWaiting.match(
        pattern,
      );

    if (match) {
      passiveWaitingFragment =
        match[0];

      break;
    }
  }

  if (
    plan.waitingParticipants === 0 &&
    passiveWaitingFragment
  ) {
    return createInvalidResult(
      `El plan logístico declara participación simultánea, pero el contenido visible incluye esta espera pasiva: "${passiveWaitingFragment}". Todos deben mantener una función activa.`,
    );
  }

  return {
    valid: true,
  };
  }


function requestsContinuousGame(formData: AIFormData): boolean {
  const request = normalizeText(
    [formData.topic, formData.additionalInstructions].join(" "),
  );

  return /(?:juego\s+continuo|sin\s+estaciones|sin\s+circuito|una\s+unica\s+zona)/.test(
    request,
  );
}

function extractSectionDuration(
  sectionTitle: string,
  sectionContent: string[],
): number | null {
  const normalizedTitle = normalizeText(sectionTitle);

  const titleMatches = Array.from(
    normalizedTitle.matchAll(/(\d+(?:[.,]\d+)?)\s*minutos?\b/g),
  );

  if (titleMatches.length > 0) {
    return parseNumericValue(titleMatches[titleMatches.length - 1][1]);
  }

  for (const item of sectionContent.slice(0, 2)) {
    const normalizedItem = normalizeText(item);

    const timeMatch = normalizedItem.match(
      /\b(?:tiempo|duracion)\s*:\s*(\d+(?:[.,]\d+)?)\s*minutos?\b/,
    );

    if (timeMatch) {
      return parseNumericValue(timeMatch[1]);
    }
  }

  return null;
}

function extractTotalSessionDuration(
  content: GeneratedAIContent,
): number | null {
  for (const section of content.sections) {
    for (const item of section.content) {
      const normalizedItem = normalizeText(item);

      const durationMatch = normalizedItem.match(
        /\bduracion\s*:\s*(\d+(?:[.,]\d+)?)\s*minutos?\b/,
      );

      if (durationMatch) {
        return parseNumericValue(durationMatch[1]);
      }
    }
  }

  return null;
}

function validateArithmeticConsistency(
  content: GeneratedAIContent,
): LogisticsValidationResult {
  for (const section of content.sections) {
    for (const item of section.content) {
      const equations = extractArithmeticEquations(item);

      for (const equation of equations) {
        if (!nearlyEqual(equation.calculatedResult, equation.statedResult)) {
          return createInvalidResult(
            `La operación "${equation.expression} = ${equation.statedResult}" es incorrecta. El resultado matemático es ${equation.calculatedResult}.`,
          );
        }
      }
    }
  }

  return {
    valid: true,
  };
}

function validateSectionTimeEquations(
  content: GeneratedAIContent,
): LogisticsValidationResult {
  for (const section of content.sections) {
    const declaredMinutes = extractSectionDuration(
      section.title,
      section.content,
    );

    if (declaredMinutes === null) {
      continue;
    }

    for (const item of section.content) {
      const normalizedItem = normalizeText(item);
      const equations = extractArithmeticEquations(item);

      for (const equation of equations) {
        const precedingContext = normalizedItem.slice(
          Math.max(0, equation.start - 45),
          equation.start,
        );

        const representsSectionTotal =
          /\b(?:tiempo|duracion|rotacion)\s+total\s*(?:=|:)?\s*$/.test(
            precedingContext,
          );

        if (
          representsSectionTotal &&
          !nearlyEqual(equation.calculatedResult, declaredMinutes)
        ) {
          return createInvalidResult(
            `La sección "${section.title}" declara ${declaredMinutes} minutos, pero su operación de tiempo produce ${equation.calculatedResult} minutos.`,
          );
        }
      }
    }
  }

  return {
    valid: true,
  };
}

function validateSessionPhaseSum(
  content: GeneratedAIContent,
): LogisticsValidationResult {
  const totalSessionMinutes = extractTotalSessionDuration(content);

  if (totalSessionMinutes === null) {
    return {
      valid: true,
    };
  }

  const phasePattern =
    /\b(?:inicio|desarrollo|parte\s+principal|cierre|vuelta\s+a\s+la\s+calma|evaluacion)\b/;

  const phaseDurations: number[] = [];
  let matchedPhaseSections = 0;
  let phaseWithoutDuration = false;

  for (const section of content.sections) {
    const normalizedTitle = normalizeText(section.title);

    if (!phasePattern.test(normalizedTitle)) {
      continue;
    }

    matchedPhaseSections += 1;

    const duration = extractSectionDuration(section.title, section.content);

    if (duration === null) {
      phaseWithoutDuration = true;
      continue;
    }

    phaseDurations.push(duration);
  }

  /*
   * Solo se compara cuando existe una estructura
   * completa y todas las fases identificadas tienen tiempo.
   */
  if (matchedPhaseSections < 3 || phaseWithoutDuration) {
    return {
      valid: true,
    };
  }

  const calculatedTotal = phaseDurations.reduce(
    (total, duration) => total + duration,
    0,
  );

  if (!nearlyEqual(calculatedTotal, totalSessionMinutes)) {
    return createInvalidResult(
      `La sesión declara ${totalSessionMinutes} minutos, pero la suma de sus fases es ${calculatedTotal} minutos.`,
    );
  }

  return {
    valid: true,
  };
}

function validateTimeConsistency(
  content: GeneratedAIContent,
): LogisticsValidationResult {
  const arithmeticValidation = validateArithmeticConsistency(content);

  if (!arithmeticValidation.valid) {
    return arithmeticValidation;
  }

  const sectionTimeValidation = validateSectionTimeEquations(content);

  if (!sectionTimeValidation.valid) {
    return sectionTimeValidation;
  }

  return validateSessionPhaseSum(content);
}

function buildStationChunks(content: GeneratedAIContent): Map<number, string> {
  const chunks = new Map<number, string>();

  for (const section of content.sections) {
    let activeStation: number | null = null;

    for (const item of section.content) {
      const normalizedItem = normalizeText(item).trim();

      const stationMatch = normalizedItem.match(
        /^(?:[-•]\s*)?(?:\d+[.)]\s*)?estacion\s+(\d+)\b/,
      );

      if (stationMatch) {
        activeStation = Number.parseInt(stationMatch[1], 10);

        const previousValue = chunks.get(activeStation) ?? "";

        chunks.set(activeStation, `${previousValue} ${normalizedItem}`.trim());

        continue;
      }

      if (activeStation !== null) {
        const previousValue = chunks.get(activeStation) ?? "";

        chunks.set(activeStation, `${previousValue} ${normalizedItem}`.trim());
      }
    }
  }

  return chunks;
}

function stationUsesBall(
  stationContent: string,
): boolean {
  const normalizedContent =
    normalizeText(stationContent)
      .replace(
        /\bsin\s+(?:usar\s+)?balon(?:es)?\b/g,
        "",
      )
      .replace(
        /\bno\s+(?:se\s+)?(?:usa|utiliza|requiere)\s+balon(?:es)?\b/g,
        "",
      );

  return /\bbalon(?:es)?\b/.test(
    normalizedContent,
  );
}

function validateStationBallCapacity(
  stationChunks: Map<number, string>,
  plan: AILogisticsPlan,
): LogisticsValidationResult {
  const ballResource =
    plan.resources.find((resource) =>
      /\bbalon(?:es)?\b/.test(
        normalizeText(resource.name),
      ),
    );

  if (!ballResource) {
    return {
      valid: true,
    };
  }

  const stationsUsingBall = [
    ...stationChunks.values(),
  ].filter(stationUsesBall).length;

  if (
    stationsUsingBall >
    ballResource.required
  ) {
    return createInvalidResult(
      `El plan logístico declara ${ballResource.required} balones necesarios, pero el contenido los asigna simultáneamente a ${stationsUsingBall} estaciones.`,
    );
  }

  if (
    ballResource.available !== null &&
    stationsUsingBall >
      ballResource.available
  ) {
    return createInvalidResult(
      `La actividad asigna balones simultáneamente a ${stationsUsingBall} estaciones, pero solamente hay ${ballResource.available} balones disponibles.`,
    );
  }

  return {
    valid: true,
  };
}

function validateStationConsistency(
  content: GeneratedAIContent,
  plan: AILogisticsPlan,
): LogisticsValidationResult {
  const visibleText = getVisibleContentText(content);

  const optionalStationPattern =
    /(?:\bestacion\s+\d+\b[^.]{0,100}\b(?:opcional|si\s+se\s+incorpora|si\s+se\s+desea)\b|\b(?:opcional|si\s+se\s+incorpora|si\s+se\s+desea)\b[^.]{0,100}\bestacion\s+\d+\b)/;

  if (optionalStationPattern.test(visibleText)) {
    return createInvalidResult(
      "La propuesta presenta una estación como opcional o condicional. Todas las estaciones declaradas deben formar parte real de las rondas.",
    );
  }

  const stationChunks = buildStationChunks(content);

  if (stationChunks.size === 0) {
    return createInvalidResult(
      "La actividad debe desarrollar las estaciones mediante elementos que comiencen con «Estación 1», «Estación 2», etc.",
    );
  }

  for (
    let stationNumber = 1;
    stationNumber <= plan.stations;
    stationNumber += 1
  ) {
    const stationContent = stationChunks.get(stationNumber);

    if (!stationContent) {
      return createInvalidResult(
        `La organización declara ${plan.stations} estaciones, pero falta desarrollar la Estación ${stationNumber}.`,
      );
    }

    const stationDescription = stationContent
      .replace(
        /^(?:[-•]\s*)?(?:\d+[.)]\s*)?estacion\s+\d+\b\s*(?:[:—–-]\s*)?/,
        "",
      )
      .trim();

    if (stationDescription.length < 30) {
      return createInvalidResult(
        `La Estación ${stationNumber} está incompleta. Debe incluir una descripción concreta de la actividad.`,
      );
    }
  }

    for (
    const stationNumber of
      stationChunks.keys()
  ) {
    if (
      stationNumber < 1 ||
      stationNumber > plan.stations
    ) {
      return createInvalidResult(
        `La descripción incluye la Estación ${stationNumber}, pero el plan logístico declara solamente ${plan.stations} estaciones.`,
      );
    }
  }

  const ballCapacityValidation =
    validateStationBallCapacity(
      stationChunks,
      plan,
    );

  if (!ballCapacityValidation.valid) {
    return ballCapacityValidation;
  }

  return {
    valid: true,
  };
}

function validateLessonPlanMaterialFeasibility(
  formData: AIFormData,
  plan: AILogisticsPlan,
  content: GeneratedAIContent,
): LogisticsValidationResult {
  if (formData.toolId !== "lesson-plan") {
    return {
      valid: true,
    };
  }

  const visibleText = getVisibleContentText(content);

  if (/\bobservador(?:-coevaluador)?\b/.test(visibleText)) {
    return createInvalidResult(
      'La planificaciÃ³n asigna a estudiantes el rol de "observador". La coevaluaciÃ³n debe realizarse mientras el estudiante mantiene una funciÃ³n motriz activa como pasador, receptor o participante en desplazamiento.',
    );
  }

  const evaluationText = normalizeText(
    content.sections
      .filter((section) =>
        normalizeText(section.title).includes("evaluacion"),
      )
      .flatMap((section) => section.content)
      .join(" "),
  );
  const ballResource = plan.resources.find((resource) =>
    /\bbalon(?:es)?\b/.test(normalizeText(resource.name)),
  );
  const availableBalls = ballResource?.available ?? ballResource?.required;
  const pairCount = Math.ceil(plan.studentCount / 2);
  const declaresSimultaneousPairBallUse =
    /\b(?:todas?\s+las?\s+parejas?|cada\s+pareja)\b[^.!?]{0,160}\b(?:realizan?|ejecutan?|completan?|practican?)\b[^.!?]{0,120}\b(?:prueba|pases?|ejecucion)\b[^.!?]{0,100}\b(?:simultaneamente|al\s+mismo\s+tiempo)\b/.test(
      evaluationText,
    ) ||
    /\b(?:simultaneamente|al\s+mismo\s+tiempo)\b[^.!?]{0,160}\b(?:todas?\s+las?\s+parejas?|cada\s+pareja)\b[^.!?]{0,120}\b(?:pases?|prueba|ejecucion)\b/.test(
      evaluationText,
    );

  if (
    availableBalls !== undefined &&
    availableBalls !== null &&
    availableBalls < pairCount &&
    declaresSimultaneousPairBallUse
  ) {
    return createInvalidResult(
      `La evaluaciÃ³n propone que ${pairCount} parejas utilicen balÃ³n simultÃ¡neamente, pero solamente hay ${availableBalls} balones disponibles. Organiza microturnos por zonas y mantÃ©n activas a las parejas que esperan el balÃ³n.`,
    );
  }

  const requestedTechniqueText = normalizeText(
    [formData.topic, formData.additionalInstructions].join(" "),
  );
  const requestsThreeBasketballPasses =
    /\bpase(?:s)?\s+de\s+pecho\b/.test(requestedTechniqueText) &&
    /\bpase(?:s)?\s+(?:de\s+)?(?:pique|picado)\b/.test(
      requestedTechniqueText,
    ) &&
    /\bpase(?:s)?\s+(?:sobre|por\s+encima\s+de)\s+la\s+cabeza\b/.test(
      requestedTechniqueText,
    );

  if (
    plan.studentCount === 40 &&
    availableBalls === 4 &&
    requestsThreeBasketballPasses
  ) {
    const evaluationMinutes = content.durationPlan?.blocks.find((block) =>
      normalizeText(block.label).includes("evaluacion"),
    )?.minutes;
    const hasThreeEvaluationRounds =
      /\b(?:3|tres)\s+rondas?\b/.test(evaluationText);
    const hasFifteenMicroturns =
      /\b(?:15|quince)\s+microturnos?\b/.test(evaluationText);
    const assignsOnePassTypePerMicroturn =
      /\b(?:un|1)\s+(?:solo\s+)?tipo\s+de\s+pase\b[^.!?]{0,100}\b(?:por|en|durante)\s+(?:cada\s+|el\s+)?microturno\b/.test(
        evaluationText,
      ) ||
      /\bmicroturno\b[^.!?]{0,100}\b(?:un|1)\s+(?:solo\s+)?tipo\s+de\s+pase\b/.test(
        evaluationText,
      );

    if (evaluationMinutes === undefined || evaluationMinutes < 9) {
      return createInvalidResult(
        "La evaluaciÃ³n de pase de pecho, pase de pique y pase sobre la cabeza para 40 estudiantes con 4 balones necesita 9 minutos: 1 minuto de explicaciÃ³n, 15 microturnos de 30 segundos y 30 segundos de cierre.",
      );
    }

    if (
      !hasThreeEvaluationRounds ||
      !hasFifteenMicroturns ||
      !assignsOnePassTypePerMicroturn
    ) {
      return createInvalidResult(
        "La evaluaciÃ³n debe organizar 3 rondas por zona y 15 microturnos en total. Cada pareja realiza 5 intentos de un solo tipo de pase en cada microturno de 30 segundos; no debe evaluar los tres tipos en el mismo turno.",
      );
    }
  }

  return {
    valid: true,
  };
}

export function validateGeneratedLogistics(
  formData: AIFormData,
  content: GeneratedAIContent,
): LogisticsValidationResult {
  if (
    formData.toolId ===
    "physical-circuit"
  ) {
    normalizeGeneratedPhysicalCircuitStructure(
      content,
    );
  }

  const logisticsRequired = requiresLogisticsPlan(formData.toolId);

  if (!logisticsRequired) {
    if (content.logisticsPlan) {
      return createInvalidResult(
        "La herramienta seleccionada no requiere un plan logístico; logisticsPlan debe ser null.",
      );
    }

    return {
      valid: true,
    };
  }

  const plan = content.logisticsPlan;

if (!plan) {
  return createInvalidResult(
    "La actividad requiere un plan logístico estructurado.",
  );
}

const visibleResourceValidation =
  validateVisibleResourceConsistency(
    formData,
    content,
  );

if (
  !visibleResourceValidation.valid
) {
  return visibleResourceValidation;
}

const timeValidation =
  validateTimeConsistency(content);

  if (!timeValidation.valid) {
    return timeValidation;
  }

  const expectedStudents = extractStudentCount(formData.students);

  if (expectedStudents !== null && plan.studentCount !== expectedStudents) {
    return createInvalidResult(
      `La organización utiliza ${plan.studentCount} estudiantes, pero se solicitaron ${expectedStudents}.`,
    );
  }

  const distributedStudents =
    plan.simultaneousParticipants + plan.waitingParticipants;

  if (distributedStudents !== plan.studentCount) {
    return createInvalidResult(
      `La distribución logística contabiliza ${distributedStudents} estudiantes, pero el grupo tiene ${plan.studentCount}.`,
    );
  }

  if (plan.waitingParticipants > 0) {
    return createInvalidResult(
      `La propuesta deja ${plan.waitingParticipants} estudiantes esperando. Todos deben tener una tarea o rol activo simultáneo.`,
    );
  }

const visibleParticipationValidation =
  validateVisibleParticipationConsistency(
    plan,
    content,
  );

if (
  !visibleParticipationValidation.valid
) {
  return visibleParticipationValidation;
}

const lessonPlanMaterialValidation =
  validateLessonPlanMaterialFeasibility(
    formData,
    plan,
    content,
  );

if (!lessonPlanMaterialValidation.valid) {
  return lessonPlanMaterialValidation;
}

  const stationCapacity = plan.stations * plan.groupsPerStation;

  if (stationCapacity < plan.groupCount) {
    return createInvalidResult(
      `Las ${plan.stations} estaciones solamente admiten ${stationCapacity} grupos, pero se organizaron ${plan.groupCount}.`,
    );
  }

  if (!plan.collisionRiskControlled) {
    return createInvalidResult(
      "La distribución espacial no controla adecuadamente los cruces o el riesgo de colisiones.",
    );
  }

  for (const resource of plan.resources) {
    if (resource.available !== null && resource.required > resource.available) {
      return createInvalidResult(
        `Se requieren ${resource.required} unidades de "${resource.name}", pero solamente hay ${resource.available} disponibles.`,
      );
    }
  }

  const inferredFixedTargets = inferFixedTargetsAvailable(formData, plan);

  const effectiveFixedTargets =
    inferredFixedTargets ?? plan.fixedTargetsAvailable;

  if (
    effectiveFixedTargets !== null &&
    plan.fixedTargetsRequired > effectiveFixedTargets
  ) {
    return createInvalidResult(
      `La actividad necesita ${plan.fixedTargetsRequired} objetivos fijos simultáneos, pero solamente hay ${effectiveFixedTargets} disponibles.`,
    );
  }
   const visibleText =
    getVisibleContentText(content);

  const usesStationCircuit =
    /\bestaciones?\s*:\s*tareas\b/.test(
      visibleText,
    ) ||
    /\bestacion\s+\d+\b/.test(
      visibleText,
    );

  const isStationBasedGame =
    formData.toolId === "game" &&
    !requestsContinuousGame(formData) &&
    usesStationCircuit;

  const isStationBasedAssessment =
    formData.toolId === "assessment" &&
    usesStationCircuit;

  const shouldValidateStations =
    formData.toolId ===
      "physical-circuit" ||
    isStationBasedGame ||
    isStationBasedAssessment;

  if (shouldValidateStations) {
    const stationValidation =
      validateStationConsistency(
        content,
        plan,
      );

    if (!stationValidation.valid) {
      return stationValidation;
    }
  }
  return {
    valid: true,
  };
}
