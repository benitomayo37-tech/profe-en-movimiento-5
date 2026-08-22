import type { GeneratedAIContent } from "@/features/ai/types/ai";

export interface PrintableRow {
  sectionTitle: string;
  content: string[];
  continuation?: boolean;
}

export interface PrintablePage {
  pageNumber: number;
  rows: PrintableRow[];
}

/*
 * Presupuestos calibrados para pÃ¡ginas A4.
 * La primera pÃ¡gina dispone de menos espacio por el encabezado
 * principal y la descripciÃ³n introductoria.
 */
const FIRST_PAGE_BUDGET = 82;
const NEXT_PAGE_BUDGET = 82;
const METHODOLOGY_FIRST_PAGE_BUDGET = 66;
const METHODOLOGY_NEXT_PAGE_BUDGET = 68;
const ASSESSMENT_FIRST_PAGE_BUDGET = 72;
const ASSESSMENT_NEXT_PAGE_BUDGET = 82;
const GAME_FIRST_PAGE_BUDGET = 58;
const GAME_NEXT_PAGE_BUDGET = 104;
/*
 * El circuito físico utiliza descripciones de estación extensas.
 * Estos límites reservan espacio real para el encabezado, la tabla
 * y el pie de página, evitando que el pie salte a una hoja vacía.
 */
const PHYSICAL_CIRCUIT_FIRST_PAGE_BUDGET = 74;
const PHYSICAL_CIRCUIT_NEXT_PAGE_BUDGET = 68;
const LATER_PAGE_BUDGET = 82;
const CHECKLIST_HEADER_LINES = 7;
const CHECKLIST_ITEM_EXTRA_LINES = 2;


/*
 * La columna del tÃ­tulo es considerablemente mÃ¡s estrecha
 * que la columna del contenido.
 */
const TITLE_CHARS_PER_LINE = 30;
const CONTENT_CHARS_PER_LINE = 72;

/*
 * Reserva para bordes, relleno vertical y separaciÃ³n
 * entre los diferentes pÃ¡rrafos de una misma secciÃ³n.
 */
const ROW_EXTRA_LINES = 1;
const CONTENT_ITEM_GAP_LINES = 0.35;
const DUA_CARD_EXTRA_LINES = 2;
const MINIMUM_AVAILABLE_LINES = 5;

function normalizeText(text: string): string {
  return text
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim()
    .toUpperCase()
    .replace(/^[^A-Z]+/, "");
}

function isDuaCard(text: string): boolean {
  const normalized = normalizeText(text);

  return (
    normalized.startsWith("REPRESENTACION") ||
    normalized.startsWith("ACCION Y EXPRESION") ||
    normalized.startsWith("ACCION / EXPRESION") ||
    normalized.startsWith("COMPROMISO") ||
    normalized.startsWith("MOTIVACION") ||
    normalized.startsWith("IMPLICACION")
  );
}

function isChecklistSectionTitle(
  sectionTitle: string,
): boolean {
  const normalized =
    normalizeText(sectionTitle);

  return (
    normalized.includes(
      "INDICADORES OBSERVABLES",
    ) ||
    normalized.startsWith(
      "INDICADOR OBSERVABLE",
    ) ||
    normalized.startsWith(
      "INDICADORES OBSERVABLES",
    )
  );
}

function estimateWrappedLines(
  text: string,
  charactersPerLine: number,
): number {
  const normalized = text.trim();

  if (!normalized) {
    return 1;
  }

  return normalized
    .split(/\r?\n/)
    .reduce((total, paragraph) => {
      const paragraphLength = paragraph.trim().length;

      return (
        total +
        Math.max(
          1,
          Math.ceil(
            paragraphLength / charactersPerLine,
          ),
        )
      );
    }, 0);
}

function estimateTitleLines(text: string): number {
  return estimateWrappedLines(
    text,
    TITLE_CHARS_PER_LINE,
  );
}

function estimateContentLines(text: string): number {
  const textLines = estimateWrappedLines(
    text,
    CONTENT_CHARS_PER_LINE,
  );

  return (
    textLines +
    (isDuaCard(text)
      ? DUA_CARD_EXTRA_LINES
      : 0)
  );
}

function estimateRowLines(
  sectionTitle: string,
  content: string[],
): number {
  const titleLines =
    estimateTitleLines(
      sectionTitle,
    );

  const isChecklistSection =
    isChecklistSectionTitle(
      sectionTitle,
    );

  const contentLines =
    content.reduce(
      (
        total,
        item,
        itemIndex,
      ) =>
        total +
        estimateContentLines(item) +
        (
          itemIndex > 0
            ? CONTENT_ITEM_GAP_LINES
            : 0
        ) +
        (
          isChecklistSection
            ? CHECKLIST_ITEM_EXTRA_LINES
            : 0
        ),
      0,
    );

  if (isChecklistSection) {
    return (
      Math.max(
        titleLines,
        contentLines +
          CHECKLIST_HEADER_LINES,
      ) +
      ROW_EXTRA_LINES
    );
  }

  return (
    Math.max(
      titleLines,
      contentLines,
    ) +
    ROW_EXTRA_LINES
  );
}

function splitLongText(
  text: string,
  maximumLines: number,
): string[] {
  const additionalLines = isDuaCard(text)
    ? DUA_CARD_EXTRA_LINES
    : 0;

  const usableLines = Math.max(
    maximumLines - additionalLines,
    1,
  );

  const maximumCharacters =
    usableLines * CONTENT_CHARS_PER_LINE;

  if (text.length <= maximumCharacters) {
    return [text];
  }

  const words = text.trim().split(/\s+/);
  const chunks: string[] = [];
  let currentChunk = "";

  for (const word of words) {
    const candidate = currentChunk
      ? `${currentChunk} ${word}`
      : word;

    if (
      candidate.length > maximumCharacters &&
      currentChunk
    ) {
      chunks.push(currentChunk);
      currentChunk = word;
    } else {
      currentChunk = candidate;
    }
  }

  if (currentChunk) {
    chunks.push(currentChunk);
  }

  return chunks;
}

export function paginatePrintableContent(
  result: GeneratedAIContent,
): PrintablePage[] {
    const pages: PrintablePage[] = [];

  const isGameContent =
    result.sections.some(
      (section) =>
        normalizeText(
          section.title,
        ).startsWith(
          "NOMBRE Y PROPOSITO DEL JUEGO",
        ),
    ) &&
    result.sections.some(
      (section) =>
        normalizeText(
          section.title,
        ).includes(
          "VARIANTES Y PROGRESIONES",
        ),
    );

const isDuaAdaptationContent =
  result.sections.some(
    (section) =>
      normalizeText(
        section.title,
      ) ===
      "ACTIVIDAD Y PROPOSITO QUE SE ADAPTA",
  ) &&
  result.sections.some(
    (section) =>
      normalizeText(
        section.title,
      ) ===
      "BARRERAS PREVISIBLES",
  ) &&
  result.sections.some(
    (section) =>
      normalizeText(
        section.title,
      ) ===
      "APLICACION PRACTICA Y EVALUACION INCLUSIVA",
  );

const isNeeAdaptationContent =
  result.sections.some(
    (section) =>
      normalizeText(
        section.title,
      ).startsWith(
        "ACTIVIDAD Y APRENDIZAJE ESENCIAL",
      ),
  ) &&
  result.sections.some(
    (section) =>
      normalizeText(
        section.title,
      ).startsWith(
        "APOYOS DEL DOCENTE",
      ),
  ) &&
  result.sections.some(
    (section) =>
      normalizeText(
        section.title,
      ).startsWith(
        "EVALUACION",
      ),
  );

  const isPhysicalCircuitContent =
    result.sections.some(
      (section) =>
        normalizeText(
          section.title,
        ) ===
        "ESTACIONES DEL CIRCUITO",
    ) &&
    result.sections.some(
      (section) =>
        normalizeText(
          section.title,
        ).startsWith(
          "TIEMPOS",
        ) &&
        normalizeText(
          section.title,
        ).includes(
          "ROTACION",
        ),
    ) &&
    result.sections.some(
      (section) =>
        normalizeText(
          section.title,
        ) ===
        "MEDIDAS DE SEGURIDAD",
    );

  const isMethodologyPlanning =
    !isGameContent &&
    result.sections.some(
      (section) =>
        normalizeText(
          section.title,
        ) ===
        "METODOLOGIA APLICADA",
    );

    const isAssessmentContent =
  result.sections.some(
    (section) =>
      normalizeText(
        section.title,
      ).includes(
        "CRITERIOS DE CALIFICACION",
      ),
  ) &&
  result.sections.some(
    (section) =>
      normalizeText(
        section.title,
      ).includes(
        "RESPUESTAS ESPERADAS",
      ),
  );

     const estimateCurrentRowLines =
    estimateRowLines;

  let currentPage: PrintablePage = {
    pageNumber: 1,
    rows: [],
  };

  let usedLines = 0;

   function getCurrentBudget(): number {
  if (currentPage.pageNumber === 1) {
    if (isPhysicalCircuitContent) {
      return PHYSICAL_CIRCUIT_FIRST_PAGE_BUDGET;
    }
    if (isGameContent) {
      return GAME_FIRST_PAGE_BUDGET;
    }
    if (isMethodologyPlanning) {
      return METHODOLOGY_FIRST_PAGE_BUDGET;
    }

    if (isAssessmentContent) {
      return ASSESSMENT_FIRST_PAGE_BUDGET;
    }

    return FIRST_PAGE_BUDGET;
  }

  if (isPhysicalCircuitContent) {
    return PHYSICAL_CIRCUIT_NEXT_PAGE_BUDGET;
  }

  if (isGameContent) {
    return GAME_NEXT_PAGE_BUDGET;
  }

  if (isMethodologyPlanning) {
    return METHODOLOGY_NEXT_PAGE_BUDGET;
  }

  if (isAssessmentContent) {
    return ASSESSMENT_NEXT_PAGE_BUDGET;
  }

  if (currentPage.pageNumber === 2) {
    return NEXT_PAGE_BUDGET;
  }

  return LATER_PAGE_BUDGET;
}

  function pushCurrentPage(): void {
    if (currentPage.rows.length === 0) {
      return;
    }

    pages.push(currentPage);

    currentPage = {
      pageNumber: pages.length + 1,
      rows: [],
    };

    usedLines = 0;
  }

   for (const section of result.sections) {
  const normalizedSectionTitle =
    normalizeText(
      section.title,
    );

  const sectionIsChecklist =
    isChecklistSectionTitle(
      section.title,
    );

  const shouldStartDuaEngagementOnNewPage =
    isDuaAdaptationContent &&
    normalizedSectionTitle.startsWith(
      "ESTRATEGIAS DE COMPROMISO",
    ) &&
    normalizedSectionTitle.includes(
      "MOTIVACION",
    ) &&
    currentPage.rows.length > 0;

  /*
   * En las adaptaciones NEE, la segunda página
   * comienza con la sección de variantes.
   * Así se distribuyen las secciones 1–3 en la
   * primera página y las secciones 4–6 en la segunda.
   */
  const shouldStartNeeVariantsOnNewPage =
    isNeeAdaptationContent &&
    normalizedSectionTitle.startsWith(
      "VARIANTES DE EJECUCION",
    ) &&
    normalizedSectionTitle.includes(
      "PARTICIPACION",
    ) &&
    currentPage.rows.length > 0;

  if (
    shouldStartDuaEngagementOnNewPage ||
    shouldStartNeeVariantsOnNewPage
  ) {
    pushCurrentPage();
  }

  if (
    sectionIsChecklist &&
    currentPage.rows.length > 0
  ) {
    pushCurrentPage();
  }

  const pendingItems =
    [...section.content];

  let isContinuation = false;

  while (pendingItems.length > 0) {
    const budget =
      getCurrentBudget();

    const availableLines =
      budget - usedLines;

      if (
        availableLines <
        MINIMUM_AVAILABLE_LINES
      ) {
        pushCurrentPage();
        continue;
      }

      const rowItems: string[] = [];

     while (pendingItems.length > 0) {
  const nextItem = pendingItems[0];

  const itemLines =
  estimateCurrentRowLines(
    "",
    [nextItem],
  );

  /*
   * Una tarjeta DUA que no cabe en el espacio
   * restante pasa completa a la pÃ¡gina siguiente.
   * Solamente podrÃ¡ dividirse si fuera demasiado
   * extensa incluso para una pÃ¡gina vacÃ­a.
   */
  const shouldMoveDuaCardToNextPage =
    isDuaCard(nextItem) &&
    itemLines > availableLines - 3 &&
    usedLines > 0;

  if (shouldMoveDuaCardToNextPage) {
    break;
  }

  const candidateItems = [
    ...rowItems,
    nextItem,
  ];

  const candidateLines =
  estimateCurrentRowLines(
    section.title,
    candidateItems,
  );

  if (
    candidateLines <= availableLines ||
    rowItems.length === 0
  ) {
    pendingItems.shift();

    if (
      itemLines >
      availableLines - 3
    ) {
      const chunks = splitLongText(
        nextItem,
        Math.max(
          availableLines - 3,
          4,
        ),
      );

      rowItems.push(chunks[0]);

      if (chunks.length > 1) {
        pendingItems.unshift(
          ...chunks.slice(1),
        );
      }

      break;
    }

    rowItems.push(nextItem);
  } else {
    break;
  }
}
      if (rowItems.length === 0) {
        pushCurrentPage();
        continue;
      }

      const rowLines =
  estimateCurrentRowLines(
    section.title,
    rowItems,
  );

      currentPage.rows.push({
        sectionTitle: section.title,
        content: rowItems,
        continuation: isContinuation,
      });

      usedLines += rowLines;
      isContinuation = pendingItems.length > 0;

      if (pendingItems.length > 0) {
        pushCurrentPage();
      }
    }
  }

  pushCurrentPage();

  return pages;
}
