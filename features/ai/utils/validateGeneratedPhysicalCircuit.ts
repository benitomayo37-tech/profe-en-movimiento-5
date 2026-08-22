import type {
  AIFormData,
  GeneratedAIContent,
} from "@/features/ai/types/ai";
import { normalizeGeneratedPhysicalCircuitStructure } from "@/features/ai/utils/normalizeGeneratedPhysicalCircuitStructure";

export interface PhysicalCircuitValidationResult {
  valid: boolean;
  message?: string;
}

const REQUIRED_SECTION_TITLES = [
  "objetivo y capacidades fisicas trabajadas",
  "organizacion general del grupo espacio y materiales",
  "calentamiento",
  "estaciones del circuito",
  "tiempos pausas y sistema de rotacion",
  "vuelta a la calma",
  "evaluacion y control del esfuerzo",
  "medidas de seguridad",
] as const;

const PASSIVE_WAITING_PATTERN =
  /\b(?:espera pasiva|esperan sin actividad|los demas esperan|en fila|forman filas|aguardan|sin funcion activa|permanece inactivo|permanecen inactivos)\b/;

const INTERNAL_LANGUAGE_PATTERN =
  /\b(?:logisticsplan|durationplan|waitingparticipants|studentcount|groupcount|groupsperstation|simultaneousparticipants|fixedtargetsavailable|fixedtargetsrequired|collisionriskcontrolled|true|false|null)\b/;

const FORBIDDEN_MATERIAL_PATTERN =
  /\b(?:pesas?|vallas?|colchonetas?|bandas elasticas?|escaleras? de coordinacion|cronometros?|pulsometros?|telefonos?|grabaciones?|carteles?|pictogramas?|fichas?|hojas?|tarjetas?|steps?|bancos?|plataformas?)\b/;

const FORBIDDEN_LANGUAGE_PATTERN =
  /\b(?:alugo|ritmo conversacionable|corridas|core dinamico|palpacion de (?:la )?respiracion controlada|shuttle(?: run| runs|s)?|pases? simulados? sin balon|sprints?|slalom|sub[- ]?subgrupos?|resistencia aerobica local|participantes? en espera)\b/;

const DUPLICATED_MATERIAL_LABEL_PATTERN =
  /\bmateriales\s*:\s*balones? asignados?\s*:\s*\d+\s*;\s*materiales\s*:/;

const BALL_COUNT_PATTERN =
  /\b(\d+)\s+balon(?:es)?\b/;

const BALL_ASSIGNMENT_PATTERN =
  /\bbalones? asignados?\s*:\s*(\d+)\b/;

const MATERIALS_LABEL_PATTERN =
  /\bmateriales\s*:\s*([^.;]+)/;

const CONDITIONAL_BALL_USE_PATTERN =
  /\b(?:si se dispone|si hay|si existe|cuando se use|cuando haya|en caso de disponer)\b[^.!?]{0,50}\bbalon\b/;

const IMAGINARY_BALL_TARGET_PATTERN =
  /\b(?:pared|compañero|companero|objetivo|receptor) imaginari[oa]\b/;

const BALL_DEPENDENT_ACTION_PATTERN =
  /\b(?:dribl\w*|bot\w*|conduc\w*|pases?|pasar|recep\w*|lanz\w*|tiros?)\b/;

const IMPOSSIBLE_SHARED_BALL_PATTERN =
  /\b(?:ambos|los dos) grupos\b[^.!?]{0,120}\b(?:usan|utilizan|trabajan con|emplean)\b[^.!?]{0,40}\b(?:el|un) balon\b[^.!?]{0,60}\b(?:simultaneamente|al mismo tiempo)\b|\b(?:simultaneamente|al mismo tiempo)\b[^.!?]{0,60}\b(?:ambos|los dos) grupos\b[^.!?]{0,120}\b(?:el|un) balon\b/;

const TWO_PAIR_PASSING_PATTERN =
  /\b(?:dos|2)\s+parejas?\b[^.!?]{0,180}\b(?:realizan|ejecutan|practican|hacen)\b[^.!?]{0,100}\bpases?\b/;

const EXPLICIT_PAIR_ALTERNATION_PATTERN =
  /\b(?:microturnos?|alternan|alternancia|intercambian|una pareja[^.!?]{0,100}(?:mientras|despues|luego)[^.!?]{0,100}(?:la otra|otra pareja))\b/;

const CYCLE_COUNT_PATTERNS = [
  /\b(\d+)\s+ciclos?\b/,
  /\bcantidad de ciclos?\s*:?\s*(\d+)\b/,
] as const;

const UNSUPPORTED_TIMEKEEPER_PATTERN =
  /\b(?:[a-e]|estudiante|integrante|participante|responsable|rol|uno|una|1)\b[^.!?]{0,50}\b(?:controla|controlar|mide|medir|cronometra|cronometrar)\b[^.!?]{0,25}\btiempo\b/;

const FORBIDDEN_RISK_PATTERN =
  /\b(?:carga maxima|cargas maximas|castigo fisico|castigos fisicos|empujones?|desplazamientos? a ciegas|contacto fisico obligatorio|dolor como meta|hasta el agotamiento)\b/;

function removeNegatedRiskStatements(
  value: string,
): string {
  return value.replace(
    /\b(?:no|sin|evitar|evita|evitando|prohibir|prohibe|prohibido|no\s+se\s+permite(?:n)?|no\s+debe(?:n)?|nunca)\b(?=[^.!?;]{0,260}\b(?:carga maxima|cargas maximas|castigo fisico|castigos fisicos|empujones?|desplazamientos? a ciegas|contacto fisico obligatorio|dolor como meta|hasta el agotamiento)\b)[^.!?;]{0,260}(?:[.!?;]|$)/g,
    "",
  );
}

const LOWER_INTENSITY_PATTERN =
  /\b(?:variante de menor intensidad|menor intensidad|menor complejidad|variante sencilla|opcion simplificada|ritmo mas lento|reducir(?: la| el)? (?:velocidad|ritmo|distancia|repeticiones))\b/;

const HIGHER_CHALLENGE_PATTERN =
  /\b(?:progresion(?: de)? mayor desafio|progresion avanzada|mayor desafio|mayor complejidad|variante avanzada|nivel avanzado|desafio adicional|aumentar(?: la| el)? (?:velocidad|ritmo|distancia|dificultad|complejidad|repeticiones)|incrementar(?: la| el)? (?:velocidad|ritmo|distancia|dificultad|complejidad|repeticiones)|reducir el tiempo de ejecucion)\b/;

function removeNegatedPassiveWaiting(
  value: string,
): string {
  return value.replace(
    /\b(?:sin|evitar|evita|evitando|eliminar|elimina|impedir|impide|prohibir|prohibe|no\s+hay|no\s+habra|no\s+debe\s+haber|no\s+existe(?:n)?|no\s+se\s+permite(?:n)?|no\s+se\s+generara(?:n)?|se\s+evita(?:n)?|libre\s+de|ausencia\s+de)\b[^.!?;]{0,120}\bespera(?:s)?\s+pasiva(?:s)?\b/g,
    "",
  );
}

function normalizeText(
  value: string,
): string {
  return value
    .normalize("NFD")
    .replace(
      /[\u0300-\u036f]/g,
      "",
    )
    .toLowerCase()
    .replace(/[“”«»"'`´]/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

function normalizeTitle(
  value: string,
): string {
  return normalizeText(value)
    .replace(
      /^\s*\d+\s*[.):\-–—]?\s*/,
      "",
    )
    .replace(/[^a-z0-9]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function invalid(
  message: string,
): PhysicalCircuitValidationResult {
  return {
    valid: false,
    message,
  };
}

function getVisibleText(
  content: GeneratedAIContent,
): string {
  return normalizeText(
    [
      content.title,
      content.introduction,
      ...content.sections.flatMap(
        (section) => [
          section.title,
          ...section.content,
        ],
      ),
    ].join(" "),
  );
}

function getSectionText(
  section:
    GeneratedAIContent["sections"][number],
): string {
  return normalizeText(
    [
      section.title,
      ...section.content,
    ].join(" "),
  );
}

function validateSectionStructure(
  content: GeneratedAIContent,
): PhysicalCircuitValidationResult {
  if (
    content.sections.length !==
    REQUIRED_SECTION_TITLES.length
  ) {
    const generatedTitles =
      content.sections
        .map(
          (section, index) =>
            `${index + 1}. ${section.title}`,
        )
        .join(" | ");

    return invalid(
      `El circuito debe contener exactamente 8 secciones. Se generaron ${content.sections.length}. Títulos recibidos: ${generatedTitles || "ninguno"}.`,
    );
  }

  for (
    let index = 0;
    index <
    REQUIRED_SECTION_TITLES.length;
    index += 1
  ) {
    const actualTitle =
      normalizeTitle(
        content.sections[index]
          ?.title ?? "",
      );

    const expectedTitle =
      REQUIRED_SECTION_TITLES[
        index
      ];

    const titleIsValid =
      index === 4
        ? actualTitle.startsWith(
            "tiempos pausas",
          ) &&
          /\brotacion(?:es)?\b/.test(
            actualTitle,
          )
        : actualTitle ===
          expectedTitle;

    if (!titleIsValid) {
      return invalid(
        `La sección ${index + 1} debe conservar el título y el orden pedagógico solicitado. Se recibió: "${content.sections[index]?.title ?? "sin título"}".`,
      );
    }
  }

  return {
    valid: true,
  };
}

function validateStructuredPlans(
  content: GeneratedAIContent,
): PhysicalCircuitValidationResult {
  const durationPlan =
    content.durationPlan;

  if (!durationPlan) {
    return invalid(
      "El circuito físico debe incluir durationPlan con la distribución temporal completa.",
    );
  }

  if (
    durationPlan.blocks.length ===
    0
  ) {
    return invalid(
      "El plan temporal del circuito no contiene bloques.",
    );
  }

  const logisticsPlan =
    content.logisticsPlan;

  if (!logisticsPlan) {
    return invalid(
      "El circuito físico debe incluir logisticsPlan con la organización completa.",
    );
  }

  if (
    logisticsPlan.stations <
    2
  ) {
    return invalid(
      "El circuito físico debe organizarse mediante al menos dos estaciones reales.",
    );
  }

  if (
    logisticsPlan.waitingParticipants !==
    0
  ) {
    return invalid(
      "El circuito no puede declarar estudiantes esperando. waitingParticipants debe ser 0.",
    );
  }

  if (
    logisticsPlan.simultaneousParticipants !==
    logisticsPlan.studentCount
  ) {
    return invalid(
      "Todos los estudiantes deben participar simultáneamente en el circuito.",
    );
  }

  if (
    logisticsPlan.groupCount <= 0 ||
    logisticsPlan.groupsPerStation <=
      0
  ) {
    return invalid(
      "La cantidad de grupos y los grupos por estación deben ser mayores que cero.",
    );
  }

  return {
    valid: true,
  };
}

function validateVisibleInitialOrganizationDuration(
  content: GeneratedAIContent,
): PhysicalCircuitValidationResult {
  const durationPlan =
    content.durationPlan;

  const organizationSection =
    content.sections[1];

  if (
    !durationPlan ||
    !organizationSection
  ) {
    return invalid(
      "No se pudo comprobar la duración visible de la organización inicial.",
    );
  }

  const organizationText =
    getSectionText(
      organizationSection,
    );

  const visibleDurationMatch =
    organizationText.match(
      /\bduracion(?: de)? (?:la )?(?:organizacion(?: y)? explicacion|explicacion(?: y)? organizacion|organizacion inicial|explicacion inicial)\b[^.!?]{0,80}\b(\d+)\s*(?:min|minuto|minutos)\b/,
    );

  if (!visibleDurationMatch?.[1]) {
    return invalid(
      'La sección "Organización general del grupo, espacio y materiales" debe mostrar expresamente "Duración de organización y explicación inicial: X minutos".',
    );
  }

  const visibleMinutes =
    Number.parseInt(
      visibleDurationMatch[1],
      10,
    );

  if (
    durationPlan.requestedMinutes ===
      45 &&
    visibleMinutes !== 5
  ) {
    return invalid(
      `En una sesión de 45 minutos, la organización y explicación inicial debe mostrar 5 minutos. Se mostraron ${visibleMinutes}.`,
    );
  }

  const organizationBlock =
    durationPlan.blocks.find(
      (block) => {
        const normalizedLabel =
          normalizeText(
            block.label,
          );

        return (
          normalizedLabel.includes(
            "organizacion",
          ) ||
          normalizedLabel.includes(
            "explicacion inicial",
          ) ||
          normalizedLabel.includes(
            "instrucciones iniciales",
          )
        );
      },
    );

  if (
    organizationBlock &&
    organizationBlock.minutes !==
      visibleMinutes
  ) {
    return invalid(
      `La organización inicial muestra ${visibleMinutes} minutos, pero el plan temporal declara ${organizationBlock.minutes}. Ambas duraciones deben coincidir.`,
    );
  }

  return {
    valid: true,
  };
}

interface StationEntry {
  number: number;
  text: string;
}

function getStationEntries(
  section:
    GeneratedAIContent["sections"][number],
): StationEntry[] {
  const entries: StationEntry[] =
    [];

  for (
    const item of section.content
  ) {
    const normalizedItem =
      normalizeText(item);

    const match =
      normalizedItem.match(
        /^estacion\s+(\d+)\b/,
      );

    if (!match?.[1]) {
      continue;
    }

    entries.push({
      number: Number.parseInt(
        match[1],
        10,
      ),
      text: normalizedItem,
    });
  }

  return entries;
}

function validateStationEvidence(
  station: StationEntry,
): PhysicalCircuitValidationResult {
  const evidenceRules = [
    {
      label:
        "capacidad o habilidad",
      pattern:
        /\b(?:capacidad|habilidad)\b/,
    },
    {
      label: "tarea",
      pattern:
        /\b(?:tarea|ejercicio)\b/,
    },
    {
      label: "organización",
      pattern:
        /\b(?:organizacion|grupo|estudiantes|integrantes)\b/,
    },
    {
      label:
        "participación simultánea",
      pattern:
        /\b(?:participacion simultanea|simultaneamente|todos los integrantes|todos realizan)\b/,
    },
    {
      label:
        "tiempo de trabajo",
      pattern:
        /\b(?:tiempo de trabajo|duracion|segundos|minutos|repeticiones)\b/,
    },
    {
      label:
        "recuperación activa",
      pattern:
        /\b(?:recuperacion activa|pausa activa)\b/,
    },
    {
      label: "materiales",
      pattern:
        /\bmateriales?\b|\bsin implementos\b|\bbalones? asignados?\b|\b(?:balones?|conos?|silbato)\b/,
    },
    {
      label:
        "criterio observable",
      pattern:
        /\b(?:criterio observable|evidencia observable)\b/,
    },
  ] as const;

  for (
    const rule of evidenceRules
  ) {
    if (
      !rule.pattern.test(
        station.text,
      )
    ) {
      return invalid(
        `La Estación ${station.number} debe incluir ${rule.label} dentro de su propia descripción.`,
      );
    }
  }

  const declaresRecoveryDuration =
    /\brecuperacion activa\s*:?[^.!?]{0,50}\b\d+(?:[.,]\d+)?\s*(?:s|segundo|segundos|min|minuto|minutos)\b/.test(
      station.text,
    );

  const recoveryIsExplicitlyIncluded =
    /\b(?:recuperacion activa\s+incluida|incluye\s+(?:la\s+)?recuperacion activa|recuperacion activa[^.!?]{0,80}\bdentro\s+del\s+(?:bloque|tiempo)|bloque total[^.!?]{0,120}\btrabajo efectivo)\b/.test(
      station.text,
    );

  if (
    declaresRecoveryDuration &&
    !recoveryIsExplicitlyIncluded
  ) {
    return invalid(
      `La Estación ${station.number} debe aclarar que la recuperación activa está incluida dentro del bloque total y distinguirla del tiempo de trabajo efectivo.`,
    );
  }

  if (
    PASSIVE_WAITING_PATTERN.test(
      removeNegatedPassiveWaiting(
        station.text,
      ),
    )
  ) {
    return invalid(
      `La Estación ${station.number} incluye espera pasiva. Todos sus integrantes deben mantener una función motriz activa.`,
    );
  }

  return {
    valid: true,
  };
}

function extractAvailableBallCount(
  materials: string,
): number | null {
  const match =
    normalizeText(materials).match(
      BALL_COUNT_PATTERN,
    );

  if (!match?.[1]) {
    return null;
  }

  return Number.parseInt(match[1], 10);
}

function validateStationBallAllocation(
  formData: AIFormData,
  content: GeneratedAIContent,
  stations: StationEntry[],
): PhysicalCircuitValidationResult {
  const availableBalls =
    extractAvailableBallCount(
      formData.materials,
    );

  if (availableBalls === null) {
    return {
      valid: true,
    };
  }

  const groupsPerStation =
    content.logisticsPlan
      ?.groupsPerStation ?? 1;

  const studentsPerGroup =
    content.logisticsPlan &&
    content.logisticsPlan.groupCount > 0
      ? Math.round(
          content.logisticsPlan
            .studentCount /
            content.logisticsPlan
              .groupCount,
        )
      : 0;

  const hasTimingDevice =
    /\bcronometros?\b/.test(
      normalizeText(
        formData.materials,
      ),
    );

  let assignedTotal = 0;

  for (const station of stations) {
    const assignmentMatch =
      station.text.match(
        BALL_ASSIGNMENT_PATTERN,
      );

    if (!assignmentMatch?.[1]) {
      return invalid(
        `La Estación ${station.number} debe declarar expresamente "Balones asignados: N".`,
      );
    }

    const assignedBalls =
      Number.parseInt(
        assignmentMatch[1],
        10,
      );

    assignedTotal += assignedBalls;

    const materialsMatch =
      station.text.match(
        MATERIALS_LABEL_PATTERN,
      );

    if (
      assignedBalls > 0 &&
      !materialsMatch?.[1]?.match(
        new RegExp(
          `\\b${assignedBalls}\\s+balon(?:es)?\\b`,
        ),
      )
    ) {
      return invalid(
        `La Estación ${station.number} debe repetir los ${assignedBalls} balones asignados dentro de la etiqueta "Materiales".`,
      );
    }

    if (
      CONDITIONAL_BALL_USE_PATTERN.test(
        station.text,
      )
    ) {
      return invalid(
        `La Estación ${station.number} utiliza el balón de forma condicional. Debe indicar una asignación y una tarea concretas.`,
      );
    }

    if (
      IMAGINARY_BALL_TARGET_PATTERN.test(
        station.text,
      )
    ) {
      return invalid(
        `La Estación ${station.number} propone una pared, compañero, receptor u objetivo imaginario. Debe describir una ejecución motriz real y viable.`,
      );
    }

    const textWithoutAssignment =
      station.text.replace(
        BALL_ASSIGNMENT_PATTERN,
        "",
      );

    const usesBall =
      BALL_DEPENDENT_ACTION_PATTERN.test(
        textWithoutAssignment,
      );

    if (
      assignedBalls === 0 &&
      usesBall
    ) {
      return invalid(
        `La Estación ${station.number} incluye una acción con balón, pero declara cero balones asignados.`,
      );
    }

    if (
      assignedBalls > 0 &&
      !usesBall
    ) {
      return invalid(
        `La Estación ${station.number} asigna ${assignedBalls} balón o balones, pero no describe una tarea que los utilice. Asigna ese material a una estación que realmente lo necesite o incorpora una acción motriz concreta con balón.`,
      );
    }

    if (
      assignedBalls === 1 &&
      TWO_PAIR_PASSING_PATTERN.test(
        station.text,
      ) &&
      !EXPLICIT_PAIR_ALTERNATION_PATTERN.test(
        station.text,
      )
    ) {
      return invalid(
        `La Estación ${station.number} propone pases de dos parejas con un solo balón. Debe indicar microturnos o alternancia explícita y la tarea motriz de la pareja que está momentáneamente sin balón.`,
      );
    }

    const fiveStudentPairPassing =
      studentsPerGroup === 5 &&
      /\bgrupo\s+[a-z]\s*\(\s*5\s*\)[^.!?]{0,180}\bpases?\s+(?:estaticos?\s+)?en\s+pareja\b/.test(
        station.text,
      );

    const fifthStudentHasActiveRole =
      /\b(?:dos parejas|estudiante de apoyo|quinto estudiante|quinto integrante|5 integrantes)[^.!?]{0,120}\b(?:apoyo|desplazamiento|pasador|receptor|funcion activa|rol activo)\b/.test(
        station.text,
      );

    if (
      assignedBalls === 1 &&
      fiveStudentPairPassing &&
      !fifthStudentHasActiveRole
    ) {
      return invalid(
        `La Estación ${station.number} organiza pases en pareja dentro de un grupo de 5, pero no explica la función motriz activa del quinto estudiante.`,
      );
    }

    if (
      assignedBalls === 1 &&
      groupsPerStation > 1 &&
      usesBall &&
      IMPOSSIBLE_SHARED_BALL_PATTERN.test(
        station.text,
      )
    ) {
      return invalid(
        `La Estación ${station.number} declara que ${groupsPerStation} grupos utilizan simultáneamente un solo balón. Debe repartir las funciones en el tiempo o asignar una tarea motriz sin balón a uno de los grupos.`,
      );
    }

    if (
      !hasTimingDevice &&
      UNSUPPORTED_TIMEKEEPER_PATTERN.test(
        station.text,
      )
    ) {
      return invalid(
        `La Estación ${station.number} asigna a un estudiante el control del tiempo sin disponer de cronómetro. Sustituye esa función por conteo verbal de repeticiones combinado con movimiento seguro.`,
      );
    }
  }

  if (assignedTotal !== availableBalls) {
    return invalid(
      `Las estaciones asignan ${assignedTotal} balones en total, pero el docente proporcionó ${availableBalls}. La distribución debe coincidir exactamente.`,
    );
  }

  return {
    valid: true,
  };
}

function validateStations(
  formData: AIFormData,
  content: GeneratedAIContent,
): PhysicalCircuitValidationResult {
  const stationSection =
    content.sections[3];

  const logisticsPlan =
    content.logisticsPlan;

  if (
    !stationSection ||
    !logisticsPlan
  ) {
    return invalid(
      'No se encontró correctamente la sección "Estaciones del circuito".',
    );
  }

  const stationEntries =
    getStationEntries(
      stationSection,
    );

  if (
    stationEntries.length !==
    stationSection.content.length
  ) {
    return invalid(
      'Cada elemento de "Estaciones del circuito" debe comenzar con "Estación 1 —", "Estación 2 —", etc.',
    );
  }

  if (
    stationEntries.length !==
    logisticsPlan.stations
  ) {
    return invalid(
      `logisticsPlan declara ${logisticsPlan.stations} estaciones, pero se desarrollaron ${stationEntries.length}.`,
    );
  }

  for (
    let index = 0;
    index <
    stationEntries.length;
    index += 1
  ) {
    const station =
      stationEntries[index];

    const expectedNumber =
      index + 1;

    if (
      station.number !==
      expectedNumber
    ) {
      return invalid(
        `Las estaciones deben numerarse consecutivamente. Se esperaba Estación ${expectedNumber}, pero apareció Estación ${station.number}.`,
      );
    }

    const evidenceValidation =
      validateStationEvidence(
        station,
      );

    if (
      !evidenceValidation.valid
    ) {
      return evidenceValidation;
    }
  }

  const combinedStationText =
    stationEntries
      .map((station) => station.text)
      .join(" ");

  if (
    !LOWER_INTENSITY_PATTERN.test(
      combinedStationText,
    )
  ) {
    return invalid(
      "El conjunto de estaciones debe incluir al menos una variante claramente identificada como de menor intensidad o complejidad.",
    );
  }

  if (
    !HIGHER_CHALLENGE_PATTERN.test(
      combinedStationText,
    )
  ) {
    return invalid(
      "El conjunto de estaciones debe incluir al menos una progresión claramente identificada como de mayor desafío o complejidad.",
    );
  }

  const ballAllocationValidation =
    validateStationBallAllocation(
      formData,
      content,
      stationEntries,
    );

  if (!ballAllocationValidation.valid) {
    return ballAllocationValidation;
  }

  return {
    valid: true,
  };
}

function validateRotation(
  content: GeneratedAIContent,
): PhysicalCircuitValidationResult {
  const rotationSection =
    content.sections[4];

  const stationCount =
    content.logisticsPlan
      ?.stations ?? 0;

  if (!rotationSection) {
    return invalid(
      'No se encontró la sección "Tiempos, pausas y sistema de rotación".',
    );
  }

  const rotationText =
    getSectionText(
      rotationSection,
    );

  if (
    /\btransicion\b[^.!?]{0,100}\bincluida?\s+en\b[^.!?]{0,80}\brecuperacion\b|\brecuperacion\b[^.!?]{0,100}\bincluye\b[^.!?]{0,80}\btransicion\b/.test(
      rotationText,
    )
  ) {
    return invalid(
      "La transición y la recuperación activa deben tener tiempos independientes dentro del ciclo; no pueden ocupar los mismos segundos.",
    );
  }

  let declaredCycleCount:
    number | null = null;

  for (
    const pattern of
      CYCLE_COUNT_PATTERNS
  ) {
    const match =
      rotationText.match(pattern);

    if (match?.[1]) {
      declaredCycleCount =
        Number.parseInt(
          match[1],
          10,
        );

      break;
    }
  }

  if (
    stationCount > 0 &&
    declaredCycleCount !== null &&
    declaredCycleCount !== stationCount
  ) {
    return invalid(
      `El circuito tiene ${stationCount} estaciones, pero declara ${declaredCycleCount} ciclos. Debe incluir ${stationCount} ciclos para que todos los grupos visiten todas las estaciones.`,
    );
  }

  const routeStations =
    new Set<number>();

  for (
    const match of
      rotationText.matchAll(
        /\be\s*(\d+)\b/g,
      )
  ) {
    routeStations.add(
      Number.parseInt(
        match[1],
        10,
      ),
    );
  }

  if (
    stationCount > 0 &&
    routeStations.size <
      stationCount
  ) {
    return invalid(
      "La ruta de rotación debe mencionar todas las estaciones mediante E1, E2, E3, etc.",
    );
  }

  const rotationRules = [
    {
      label:
        "cantidad de ciclos",
      pattern:
        /\b(?:ciclo|ciclos)\b/,
    },
    {
      label:
        "tiempo de trabajo",
      pattern:
        /\b(?:tiempo de trabajo|trabajo)\b/,
    },
    {
      label:
        "recuperación",
      pattern:
        /\b(?:recuperacion|pausa activa)\b/,
    },
    {
      label: "transición",
      pattern:
        /\b(?:transicion|cambio de estacion)\b/,
    },
    {
      label:
        "tiempo total del circuito",
      pattern:
        /\b(?:tiempo total|duracion total|total del circuito|circuito completo|suma total|en total)\b/,
    },
    {
      label:
        "cambio simultáneo",
      pattern:
        /\b(?:simultaneamente|al mismo tiempo|a la vez|de forma simultanea|rotacion simultanea|rotacion conjunta|cambio simultaneo|todos los grupos[^.!?]{0,100}(?:cambian|rotan|avanzan|pasan|se desplazan)|los grupos[^.!?]{0,100}(?:cambian|rotan|avanzan|pasan|se desplazan)[^.!?]{0,80}(?:juntos|simultaneamente|a la vez))\b/,
    },
  ] as const;

  for (
    const rule of rotationRules
  ) {
    if (
      !rule.pattern.test(
        rotationText,
      )
    ) {
      return invalid(
        `La sección de tiempos y rotación debe indicar ${rule.label}.`,
      );
    }
  }

  return {
    valid: true,
  };
}

function validateEvaluationAndSafety(
  content: GeneratedAIContent,
): PhysicalCircuitValidationResult {
  const evaluationText =
    getSectionText(
      content.sections[6],
    );

  const safetyText =
    getSectionText(
      content.sections[7],
    );

  const evaluationBlock =
    content.durationPlan?.blocks.find(
      (block) =>
        normalizeText(
          block.label,
        ).includes("evaluacion"),
    );

  if (evaluationBlock) {
    const visibleDurationPattern =
      new RegExp(
        `\\b(?:duracion(?: de la evaluacion)?\\s*:?\\s*)?${evaluationBlock.minutes}\\s*(?:min|minuto|minutos)\\b`,
      );

    if (
      !visibleDurationPattern.test(
        evaluationText,
      )
    ) {
      return invalid(
        `La evaluación debe mostrar de forma explícita su duración de ${evaluationBlock.minutes} minutos.`,
      );
    }

    if (
      /\b(?:durante|dentro de|incluida? en|integrada? en)\b[^.!?]{0,100}\bvuelta a la calma\b|\bvuelta a la calma\b[^.!?]{0,100}\b(?:durante|dentro de|incluida? en|integrada? en)\b/.test(
        evaluationText,
      )
    ) {
      return invalid(
        "La evaluación tiene un bloque temporal propio y no debe contabilizarse dentro de la vuelta a la calma.",
      );
    }

    const groupCount =
      content.logisticsPlan
        ?.groupCount ?? 0;

    const feedbackRangeMatch =
      evaluationText.match(
        /\b(\d+)\s*[–—-]\s*(\d+)\s*(?:s|segundo|segundos)\s+por\s+grupo\b/,
      );

    const feedbackExactMatch =
      evaluationText.match(
        /\b(\d+)\s*(?:s|segundo|segundos)\s+por\s+grupo\b/,
      );

    const timedEachGroupMatch =
      evaluationText.match(
        /\bcada\s+grupo\b[^!?]{0,180}\b(?:max(?:imo)?\.?\s*)?(\d+)\s*(?:s|segundo|segundos)\b/,
      );

    const secondsPerGroup =
      feedbackRangeMatch?.[2]
        ? Number.parseInt(
            feedbackRangeMatch[2],
            10,
          )
        : feedbackExactMatch?.[1]
          ? Number.parseInt(
              feedbackExactMatch[1],
              10,
            )
          : timedEachGroupMatch?.[1]
            ? Number.parseInt(
                timedEachGroupMatch[1],
                10,
              )
            : null;

    const groupsRespondSimultaneously =
      /\b(?:todos los grupos|los grupos)\b[^.!?]{0,120}\b(?:responden|expresan|comunican)\b[^.!?]{0,80}\b(?:simultaneamente|al mismo tiempo|a la vez)\b|\b(?:simultaneamente|al mismo tiempo|a la vez)\b[^.!?]{0,120}\b(?:todos los grupos|los grupos)\b/.test(
        evaluationText,
      );

    if (
      secondsPerGroup !== null &&
      groupCount > 0 &&
      !groupsRespondSimultaneously &&
      secondsPerGroup * groupCount >
        evaluationBlock.minutes * 60
    ) {
      return invalid(
        `La retroalimentación de ${secondsPerGroup} segundos para cada uno de los ${groupCount} grupos supera los ${evaluationBlock.minutes} minutos disponibles para evaluación.`,
      );
    }
  }

  if (
    !/\b(?:criterio observable|criterios observables|evidencia observable)\b/.test(
      evaluationText,
    )
  ) {
    return invalid(
      "La evaluación debe incluir criterios o evidencias observables relacionados con el objetivo.",
    );
  }

  if (
    !/\b(?:respiracion|capacidad de hablar|percepcion de esfuerzo|recuperacion|tecnica estable)\b/.test(
      evaluationText,
    )
  ) {
    return invalid(
      "El control del esfuerzo debe utilizar señales escolares observables.",
    );
  }

  const safetyRules = [
    {
      label:
        "separación y control de cruces",
      pattern:
        /\b(?:separacion|separadas|evitar cruces|control de cruces)\b/,
    },
    {
      label:
        "uso seguro de materiales",
      pattern:
        /\b(?:uso seguro|uso responsable|materiales)\b/,
    },
    {
      label:
        "señales de inicio, detención o rotación",
      pattern:
        /\b(?:silbato|senal de inicio|detener|rotacion)\b/,
    },
    {
      label:
        "actuación ante dolor, mareo o pérdida de control",
      pattern:
        /\b(?:dolor|mareo|perdida de control)\b/,
    },
  ] as const;

  for (
    const rule of safetyRules
  ) {
    if (
      !rule.pattern.test(
        safetyText,
      )
    ) {
      return invalid(
        `Las medidas de seguridad deben incluir ${rule.label}.`,
      );
    }
  }

  return {
    valid: true,
  };
}

function validateOptionalSupports(
  formData: AIFormData,
  visibleText: string,
): PhysicalCircuitValidationResult {
  if (formData.includeDua) {
    const hasRepresentation =
      /\brepresentacion\b/.test(
        visibleText,
      );

    const hasActionExpression =
      /\baccion y expresion\b/.test(
        visibleText,
      );

    const hasEngagement =
      /\b(?:compromiso|motivacion)\b/.test(
        visibleText,
      );

    if (
      !hasRepresentation ||
      !hasActionExpression ||
      !hasEngagement
    ) {
      return invalid(
        "El circuito con DUA debe integrar Representación, Acción y Expresión y Compromiso o Motivación.",
      );
    }
  }

  if (
    formData.includeNee &&
    !/\b(?:apoyo|ajuste de ritmo|ajuste de distancia|instrucciones breves|demostracion)\b/.test(
      visibleText,
    )
  ) {
    return invalid(
      "El circuito con adaptación NEE debe incluir al menos un apoyo concreto y aplicable.",
    );
  }

  return {
    valid: true,
  };
}

function validateForbiddenContent(
  formData: AIFormData,
  content: GeneratedAIContent,
): PhysicalCircuitValidationResult {
  const visibleText =
    getVisibleText(content);

  if (
    PASSIVE_WAITING_PATTERN.test(
      removeNegatedPassiveWaiting(
        visibleText,
      ),
    )
  ) {
    return invalid(
      "El circuito incluye filas, espera pasiva o estudiantes sin una función activa.",
    );
  }

  const internalLanguageMatch =
    visibleText.match(
      INTERNAL_LANGUAGE_PATTERN,
    );

  if (internalLanguageMatch) {
    return invalid(
      `El contenido visible incluye esta propiedad, valor o expresión técnica interna: "${internalLanguageMatch[0]}". Debe utilizar únicamente lenguaje pedagógico natural y completamente en español.`,
    );
  }

  const forbiddenLanguageMatch =
    visibleText.match(
      FORBIDDEN_LANGUAGE_PATTERN,
    );

  if (forbiddenLanguageMatch) {
    return invalid(
      `El circuito incluye esta expresión poco clara o impropia del lenguaje pedagógico: "${forbiddenLanguageMatch[0]}". Debe utilizar una redacción natural, precisa y completamente en español.`,
    );
  }

  if (
    DUPLICATED_MATERIAL_LABEL_PATTERN.test(
      visibleText,
    )
  ) {
    return invalid(
      'Cada estación debe mostrar una sola secuencia: "Balones asignados: N; Materiales: ...".',
    );
  }

  if (
    FORBIDDEN_RISK_PATTERN.test(
      removeNegatedRiskStatements(
        visibleText,
      ),
    )
  ) {
    return invalid(
      "El circuito incluye una carga, castigo, contacto o ejercicio de riesgo no permitido.",
    );
  }

  const normalizedMaterials =
    normalizeText(
      formData.materials,
    );

  if (
    FORBIDDEN_MATERIAL_PATTERN.test(
      visibleText,
    )
  ) {
    const forbiddenMatches =
      visibleText.match(
        new RegExp(
          FORBIDDEN_MATERIAL_PATTERN.source,
          "g",
        ),
      ) ?? [];

    const inventedMaterial =
      forbiddenMatches.find(
        (material) =>
          !normalizedMaterials.includes(
            material,
          ),
      );

    if (inventedMaterial) {
      return invalid(
        `El circuito utiliza un material no proporcionado: "${inventedMaterial}".`,
      );
    }
  }

  if (
    /\bfeedback\b/.test(
      visibleText,
    )
  ) {
    return invalid(
      'Utiliza "retroalimentación" en lugar de "feedback".',
    );
  }

  if (
    content.rubric !== null &&
    content.rubric !== undefined
  ) {
    return invalid(
      "El campo rubric debe ser null para la herramienta Crear circuito físico.",
    );
  }

  return validateOptionalSupports(
    formData,
    visibleText,
  );
}

export function validateGeneratedPhysicalCircuit(
  formData: AIFormData,
  content: GeneratedAIContent,
): PhysicalCircuitValidationResult {
  if (
    formData.toolId !==
    "physical-circuit"
  ) {
    return {
      valid: true,
    };
  }

  normalizeGeneratedPhysicalCircuitStructure(
    content,
  );

  const sectionValidation =
    validateSectionStructure(
      content,
    );

  if (!sectionValidation.valid) {
    return sectionValidation;
  }

  const planValidation =
    validateStructuredPlans(
      content,
    );

  if (!planValidation.valid) {
    return planValidation;
  }

  const initialOrganizationValidation =
    validateVisibleInitialOrganizationDuration(
      content,
    );

  if (
    !initialOrganizationValidation.valid
  ) {
    return initialOrganizationValidation;
  }

  const stationValidation =
    validateStations(
      formData,
      content,
    );

  if (!stationValidation.valid) {
    return stationValidation;
  }

  const rotationValidation =
    validateRotation(
      content,
    );

  if (!rotationValidation.valid) {
    return rotationValidation;
  }

  const evaluationValidation =
    validateEvaluationAndSafety(
      content,
    );

  if (
    !evaluationValidation.valid
  ) {
    return evaluationValidation;
  }

  return validateForbiddenContent(
    formData,
    content,
  );
}
