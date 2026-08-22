import type {
  GeneratedAIContent,
} from "@/features/ai/types/ai";

type GeneratedSection =
  GeneratedAIContent["sections"][number];

const CANONICAL_STATION_SECTION_TITLE =
  "Estaciones del circuito";

const TECHNICAL_TEXT_REPLACEMENTS = [
  {
    pattern:
      /\bsaltos?\s+cortos?\s+[^,.;]{0,24}\/\s*step\s+improvisado\b/gi,
    replacement:
      "saltos cortos en el lugar",
  },
  {
    pattern:
      /\bstep\s+improvisado\b/gi,
    replacement:
      "ejercicio en el lugar delimitado por conos",
  },
  {
    pattern:
      /\britmo\s+conversaci[oó]nable\b/gi,
    replacement:
      "ritmo que permita conversar",
  },
  {
    pattern: /\bcorridas\b/gi,
    replacement: "carreras",
  },
  {
    pattern: /\bsprints?\s+cortos?\b/gi,
    replacement:
      "aceleraciones cortas",
  },
  {
    pattern: /\bslalom\b/gi,
    replacement:
      "recorrido en zigzag",
  },
  {
    pattern:
      /\bsub[- ]?subgrupos?\s*\(\s*2\s*\+\s*2\s*\+\s*1\s*\)/gi,
    replacement:
      "dos parejas y un estudiante de apoyo activo",
  },
  {
    pattern:
      /\bresistencia\s+aer[oó]bica\s+local\b/gi,
    replacement:
      "resistencia aeróbica moderada",
  },
  {
    pattern:
      /\bparticipantes?\s+en\s+espera\s*:\s*0\b/gi,
    replacement:
      "ningún estudiante queda sin función motriz",
  },
  {
    pattern: /\bal\s+señal\b/gi,
    replacement: "a la señal",
  },
  {
    pattern:
      /\bal\s+menos\s+separaci[oó]n\s+visual\b/gi,
    replacement:
      "una separación visible suficiente",
  },
  {
    pattern:
      /\brecuperaci[oó]n\s+en\s+30\s*s\s+tras\s+la\s+recuperaci[oó]n\s+activa\b/gi,
    replacement:
      "respiración más estable después de 30 segundos de recuperación activa",
  },
  {
    pattern: /\bshuttle\s+runs?\b/gi,
    replacement:
      "carreras de ida y vuelta",
  },
  {
    pattern: /\bshuttles?\b/gi,
    replacement:
      "recorridos de ida y vuelta",
  },
  {
    pattern:
      /\bpases?\s+simulados?\s+sin\s+bal[oó]n\b/gi,
    replacement:
      "gestos técnicos de pase sin implemento",
  },
  {
    pattern:
      /\bpalpaci[oó]n\s+de\s+(?:la\s+)?respiraci[oó]n\s+controlada\b/gi,
    replacement:
      "comprobación de la respiración controlada",
  },
  {
    pattern:
      /\babsorci[oó]n\s+en\s+saltos\s+y\s+contactos\b/gi,
    replacement:
      "aterrizajes controlados después de los saltos",
  },
  {
    pattern: /\bcore\s+din[aá]mico\b/gi,
    replacement:
      "estabilidad dinámica de la zona media",
  },
  {
    pattern:
      /\b(?:(?:logistics[\s._-]*plan)[\s._-]*)?waiting[\s_-]*participants\b\s*(?::|=|es|debe\s+ser)?\s*0\b/gi,
    replacement:
      "todos los estudiantes mantienen una función activa",
  },
  {
    pattern: /\blogisticsPlan\b/gi,
    replacement:
      "plan de organización",
  },
  {
    pattern: /\bdurationPlan\b/gi,
    replacement:
      "plan temporal",
  },
  {
    pattern: /\bstudentCount\b/gi,
    replacement:
      "cantidad de estudiantes",
  },
  {
    pattern: /\bgroupCount\b/gi,
    replacement:
      "cantidad de grupos",
  },
  {
    pattern: /\bgroupsPerStation\b/gi,
    replacement:
      "grupos por estación",
  },
  {
    pattern:
      /\bsimultaneous[\s_-]*participants\b/gi,
    replacement:
      "participación simultánea",
  },
  {
    pattern:
      /\bwaiting[\s_-]*participants\b/gi,
    replacement:
      "participación activa",
  },
  {
    pattern:
      /\bfixedTargetsAvailable\b/gi,
    replacement:
      "objetivos fijos disponibles",
  },
  {
    pattern:
      /\bfixedTargetsRequired\b/gi,
    replacement:
      "objetivos fijos necesarios",
  },
  {
    pattern: /\bspaceDescription\b/gi,
    replacement:
      "descripción del espacio",
  },
  {
    pattern:
      /\bcollisionRiskControlled\b/gi,
    replacement:
      "control de cruces",
  },
  {
    pattern: /\brequestedMinutes\b/gi,
    replacement:
      "minutos solicitados",
  },
  {
    pattern: /\btotalMinutes\b/gi,
    replacement:
      "minutos totales",
  },
] as const;

function sanitizeVisibleText(
  value: string,
): string {
  let sanitized = value;

  for (
    const replacement of
      TECHNICAL_TEXT_REPLACEMENTS
  ) {
    sanitized = sanitized.replace(
      replacement.pattern,
      replacement.replacement,
    );
  }

  return sanitized
    .replace(
      /\bMateriales:\s*(?=Balones?\s+asignados?\s*:)/gi,
      "",
    )
    .replace(
      /\bBalones asignados:\s*([1-9]\d*)\s*;\s*Materiales:\s*(?![^.;]*\bbal[oó]n(?:es)?\b)([^.;]+)/gi,
      (
        _match,
        count: string,
        materials: string,
      ) => {
        const ballLabel =
          count === "1"
            ? "1 balón"
            : `${count} balones`;

        return `Balones asignados: ${count}; Materiales: ${ballLabel} y ${materials.trim()}`;
      },
    )
    .replace(
      /\b1\s+balones\b/gi,
      "1 balón",
    )
    .replace(/\s+/g, " ")
    .trim();
}

function sanitizeVisibleContent(
  content: GeneratedAIContent,
): void {
  content.title = sanitizeVisibleText(
    content.title,
  );

  content.introduction =
    sanitizeVisibleText(
      content.introduction,
    );

  content.sections =
    content.sections.map((section) => ({
      ...section,
      title: sanitizeVisibleText(
        section.title,
      ),
      content: section.content.map(
        (item) =>
          sanitizeVisibleText(item),
      ),
    }));
}

function normalizeText(
  value: string,
): string {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
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

function ensureSimultaneousRotationStatement(
  content: GeneratedAIContent,
): void {
  const rotationSection =
    content.sections.find(
      (section) =>
        normalizeTitle(
          section.title,
        ) ===
        "tiempos pausas y sistema de rotacion",
    );

  if (!rotationSection) {
    return;
  }

  const rotationText = normalizeText(
    rotationSection.content.join(" "),
  );

  const hasSimultaneousChange =
    /\b(?:simultaneamente|al mismo tiempo|a la vez|todos los grupos[^.!?]{0,100}(?:cambian|rotan|avanzan|pasan|se desplazan)[^.!?]{0,100}(?:juntos|simultaneamente|a la vez))\b/.test(
      rotationText,
    );

  if (!hasSimultaneousChange) {
    rotationSection.content.push(
      "Todos los grupos cambian simultáneamente a la estación siguiente siguiendo la ruta indicada.",
    );
  }
}

function getStationNumber(
  value: string,
): number | null {
  const match = normalizeText(value).match(
    /^(?:[-•]\s*)?(?:\d+(?:\.\d+)*[.)]?\s*)?estacion\s+(\d+)\b/,
  );

  if (!match?.[1]) {
    return null;
  }

  return Number.parseInt(match[1], 10);
}

function removeStationPrefix(
  value: string,
): string {
  return value
    .trim()
    .replace(
      /^(?:[-•]\s*)?(?:\d+(?:\.\d+)*[.)]?\s*)?estaci[oó]n\s+\d+\b\s*(?:[:—–-]\s*)?/i,
      "",
    )
    .trim();
}

function createStationItem(
  stationNumber: number,
  parts: string[],
): string {
  const description = parts
    .map((part) => part.trim())
    .filter(Boolean)
    .join(" ")
    .replace(/\s+/g, " ")
    .trim();

  return description
    ? `Estación ${stationNumber} — ${description}`
    : `Estación ${stationNumber} —`;
}

function collectStationItems(
  section: GeneratedSection,
  stationItems: Map<number, string>,
): void {
  let activeStation: number | null = null;

  for (const item of section.content) {
    const stationNumber =
      getStationNumber(item);

    if (stationNumber !== null) {
      activeStation = stationNumber;

      const description =
        removeStationPrefix(item);

      const previous =
        stationItems.get(stationNumber);

      stationItems.set(
        stationNumber,
        createStationItem(
          stationNumber,
          [
            previous
              ? removeStationPrefix(
                  previous,
                )
              : "",
            description,
          ],
        ),
      );

      continue;
    }

    if (activeStation !== null) {
      const previous =
        stationItems.get(activeStation) ??
        "";

      stationItems.set(
        activeStation,
        createStationItem(
          activeStation,
          [
            removeStationPrefix(previous),
            item,
          ],
        ),
      );
    }
  }
}

/**
 * Repara una variación frecuente del modelo: crear "Estación 1",
 * "Estación 2", etc. como secciones independientes. La salida pública
 * conserva una sola sección "Estaciones del circuito" con un elemento
 * de contenido por estación.
 */
export function normalizeGeneratedPhysicalCircuitStructure(
  content: GeneratedAIContent,
): void {
  sanitizeVisibleContent(content);
  ensureSimultaneousRotationStatement(
    content,
  );

  const stationItems =
    new Map<number, string>();

  let canonicalSection:
    GeneratedSection | null = null;

  let canonicalSectionIndex = -1;

  const retainedSections:
    GeneratedSection[] = [];

  for (const section of content.sections) {
    const normalizedTitle =
      normalizeTitle(section.title);

    if (
      normalizedTitle ===
      "estaciones del circuito"
    ) {
      if (!canonicalSection) {
        canonicalSection = section;
        canonicalSectionIndex =
          retainedSections.length;
      }

      collectStationItems(
        section,
        stationItems,
      );

      continue;
    }

    const stationNumber =
      getStationNumber(section.title);

    if (stationNumber !== null) {
      const titleDescription =
        removeStationPrefix(
          section.title,
        );

      const previous =
        stationItems.get(stationNumber);

      stationItems.set(
        stationNumber,
        createStationItem(
          stationNumber,
          [
            previous
              ? removeStationPrefix(
                  previous,
                )
              : "",
            titleDescription,
            ...section.content,
          ],
        ),
      );

      continue;
    }

    retainedSections.push(section);
  }

  if (stationItems.size === 0) {
    return;
  }

  const normalizedStationSection:
    GeneratedSection = {
      title:
        CANONICAL_STATION_SECTION_TITLE,
      content: [...stationItems.entries()]
        .sort(
          ([first], [second]) =>
            first - second,
        )
        .map(([, item]) => item),
    };

  if (canonicalSectionIndex >= 0) {
    retainedSections.splice(
      canonicalSectionIndex,
      0,
      normalizedStationSection,
    );
  } else {
    const warmingIndex =
      retainedSections.findIndex(
        (section) =>
          normalizeTitle(
            section.title,
          ) === "calentamiento",
      );

    retainedSections.splice(
      warmingIndex >= 0
        ? warmingIndex + 1
        : Math.min(
            3,
            retainedSections.length,
          ),
      0,
      normalizedStationSection,
    );
  }

  content.sections = retainedSections;
}
