import {
  AlignmentType,
  BorderStyle,
  Document,
  Footer,
  Header,
  HorizontalPositionAlign,
  HorizontalPositionRelativeFrom,
  ImageRun,
  LevelFormat,
  Packer,
  PageNumber,
  PageOrientation,
  Paragraph,
  ShadingType,
  Table,
  TableCell,
  TableLayoutType,
  TableRow,
  TextRun,
  VerticalAlign,
  VerticalPositionAlign,
  VerticalPositionRelativeFrom,
  WidthType,
} from "docx";

import type { GeneratedAIContent } from "@/features/ai/types/ai";

type DUAPrinciple =
  | "representation"
  | "action-expression"
  | "engagement";

interface DUAPalette {
  text: string;
  border: string;
  fill: string;
  bulletReference: string;
}

const PAGE_WIDTH = 11906;
const PAGE_HEIGHT = 16838;
const SIDE_MARGIN = 567;
const CONTENT_WIDTH =
  PAGE_WIDTH - SIDE_MARGIN * 2;

const SECTION_COLUMN_WIDTH = 3016;
const CONTENT_COLUMN_WIDTH =
  CONTENT_WIDTH - SECTION_COLUMN_WIDTH;

const FONT_FAMILY = "Arial";

const COLORS = {
  ink: "0F172A",
  muted: "64748B",
  brand: "1D4ED8",
  border: "94A3B8",
  softBorder: "CBD5E1",
  headerFill: "F1F5F9",
};

const BORDER = {
  style: BorderStyle.SINGLE,
  size: 1,
  color: COLORS.border,
};

const NO_BORDER = {
  style: BorderStyle.NONE,
  size: 0,
  color: "FFFFFF",
};

const CELL_BORDERS = {
  top: BORDER,
  bottom: BORDER,
  left: BORDER,
  right: BORDER,
};

const NO_CELL_BORDERS = {
  top: NO_BORDER,
  bottom: NO_BORDER,
  left: NO_BORDER,
  right: NO_BORDER,
};

const CELL_MARGINS = {
  top: 45,
  bottom: 45,
  left: 100,
  right: 100,
};

const DUA_PALETTES: Record<
  DUAPrinciple,
  DUAPalette
> = {
  representation: {
    text: "6D28D9",
    border: "8B5CF6",
    fill: "F5F3FF",
    bulletReference: "dua-representation-bullets",
  },

  "action-expression": {
    text: "1D4ED8",
    border: "3B82F6",
    fill: "EFF6FF",
    bulletReference:
      "dua-action-expression-bullets",
  },

  engagement: {
    text: "047857",
    border: "22C55E",
    fill: "ECFDF5",
    bulletReference: "dua-engagement-bullets",
  },
};

function cleanListItem(value: string): string {
  return value
    .replace(/\*+/g, "")
    .replace(/`+/g, "")
    .trim()
    .replace(/^[•●▪◦]\s*/u, "")
    .replace(/^[-–—]\s*/u, "");
}

function removeDuaColorName(
  value: string,
): string {
  return value
    .replace(
      /^\s*(?:[—–-]\s*)?(MORADO|AZUL|VERDE)\s*(?:[—–-]+\s*|:\s*)?/i,
      "",
    )
    .replace(
      /\s*[—–-]\s*(MORADO|AZUL|VERDE)\s*[—–-]\s*/gi,
      " — ",
    )
    .replace(
      /\s*[—–-]\s*(MORADO|AZUL|VERDE)(?=\s*[):,;.]|\s*$)/gi,
      "",
    );
}

function normalizeDuaText(
  value: string,
): string {
  return cleanListItem(value)
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim()
    .toUpperCase()
    .replace(/^[^A-Z]+/, "");
}

function detectDuaPrinciple(
  value: string,
): DUAPrinciple | null {
  const normalized = normalizeDuaText(value);

  if (normalized.startsWith("REPRESENTACION")) {
    return "representation";
  }

  if (
    normalized === "ACCION" ||
    normalized.startsWith("ACCION Y EXPRESION") ||
    normalized.startsWith("ACCION / EXPRESION") ||
    normalized.startsWith("ACCION/EXPRESION")
  ) {
    return "action-expression";
  }

  if (
    normalized.startsWith("COMPROMISO") ||
    normalized.startsWith("MOTIVACION") ||
    normalized.startsWith("IMPLICACION")
  ) {
    return "engagement";
  }

  return null;
}

function isDedicatedDuaSection(
  sectionTitle: string,
): boolean {
  const normalized = normalizeDuaText(
    sectionTitle,
  );

  return (
    normalized.includes("ESTRATEGIAS DUA") ||
    normalized.includes("APLICACION DUA") ||
    normalized.includes("INCLUSION DUA")
  );
}

const DUA_LABELS: Record<
  DUAPrinciple,
  string
> = {
  representation: "REPRESENTACIÓN",
  "action-expression": "ACCIÓN Y EXPRESIÓN",
  engagement: "COMPROMISO / MOTIVACIÓN",
};

interface DUAStrategy {
  principle: DUAPrinciple;
  content: string;
}

const POSTFIX_DUA_PATTERN =
  /\((REPRESENTACI[ÓO]N|ACCI[ÓO]N\s*(?:Y|\/)\s*EXPRESI[ÓO]N|COMPROMISO\s*\/\s*MOTIVACI[ÓO]N|COMPROMISO|MOTIVACI[ÓO]N|IMPLICACI[ÓO]N)\)/gi;

function cleanDuaClause(
  value: string,
): string {
  return value
    .replace(/^\s*[,;:—–-]+\s*/, "")
    .replace(/\s*[,;:—–-]+\s*$/, "")
    .trim();
}

function expandPostfixDuaStrategies(
  strategy: DUAStrategy,
): DUAStrategy[] {
  const matches = Array.from(
    strategy.content.matchAll(
      POSTFIX_DUA_PATTERN,
    ),
  );

  if (matches.length === 0) {
    return [strategy];
  }

  const expanded: DUAStrategy[] = [];
  let contentStart = 0;

  for (const match of matches) {
    const principle = detectDuaPrinciple(
      match[1],
    );
    const content = cleanDuaClause(
      strategy.content.slice(
        contentStart,
        match.index,
      ),
    );

    if (principle && content) {
      expanded.push({
        principle,
        content,
      });
    }

    contentStart =
      (match.index ?? 0) + match[0].length;
  }

  const trailingContent = cleanDuaClause(
    strategy.content.slice(contentStart),
  );

  if (trailingContent) {
    expanded.push({
      principle: strategy.principle,
      content: trailingContent,
    });
  }

  return expanded.length > 0
    ? expanded
    : [strategy];
}

function mergeAdjacentDuaStrategies(
  strategies: DUAStrategy[],
): DUAStrategy[] {
  return strategies.reduce<DUAStrategy[]>(
    (merged, strategy) => {
      const previous =
        merged[merged.length - 1];

      if (
        previous?.principle ===
        strategy.principle
      ) {
        previous.content = [
          previous.content,
          strategy.content,
        ]
          .filter(Boolean)
          .join(" ");

        return merged;
      }

      merged.push({ ...strategy });
      return merged;
    },
    [],
  );
}

function extractDuaStrategies(
  value: string,
): DUAStrategy[] {
  const learningAxisSuffix =
    String.raw`\s*(?:\(\s*(?:QU[EÉ]|C[ÓO]MO|POR\s*QU[EÉ])(?:\s+DEL\s+APRENDIZAJE)?\s*\))?`;

  const explicitPattern =
    new RegExp(
      String.raw`(REPRESENTACI[ÓO]N|ACCI[ÓO]N\s*(?:Y|\/)\s*EXPRESI[ÓO]N|COMPROMISO\s*\/\s*MOTIVACI[ÓO]N|COMPROMISO|MOTIVACI[ÓO]N|IMPLICACI[ÓO]N)${learningAxisSuffix}\s*\)?\s*(?:[—–-]+|:)\s*`,
      "gi",
    );

  /*
   * La IA también puede escribir varios principios como
   * una oración continua:
   * "DUA aplicado: REPRESENTACIÓN usando...;
   * ACCIÓN permitiendo...; COMPROMISO con...".
   *
   * Esta variante solo se habilita tras un prefijo DUA
   * explícito para no confundir menciones ordinarias con
   * tarjetas.
   */
  const inlineContext = value.match(
    /\b(?:DUA\s+(?:APLICAD[OA]S?|INTEGRAD[OA]S?)|ESTRATEGIAS?\s+DUA)\s*:\s*/i,
  );

  let source = value;
  let matches: RegExpMatchArray[] = [];

  if (
    inlineContext &&
    inlineContext.index !== undefined
  ) {
    source = value.slice(
      inlineContext.index +
        inlineContext[0].length,
    );

    const inlinePattern =
      /(?:^|[;.]\s*)(REPRESENTACI[ÓO]N|ACCI[ÓO]N\s*(?:Y|\/)\s*EXPRESI[ÓO]N|ACCI[ÓO]N|COMPROMISO\s*\/\s*MOTIVACI[ÓO]N|COMPROMISO|MOTIVACI[ÓO]N|IMPLICACI[ÓO]N)\s*\)?\s*(?:[—–-]+|:)?\s*/gi;

    matches = Array.from(
      source.matchAll(inlinePattern),
    );
  }

  if (matches.length === 0) {
    source = value;
    matches = Array.from(
      source.matchAll(explicitPattern),
    );
  }

  if (matches.length > 0) {
    return matches
      .flatMap((match, matchIndex) => {
        const principle = detectDuaPrinciple(
          match[1],
        );

        if (!principle) {
          return [];
        }

        const start =
          (match.index ?? 0) + match[0].length;

        const end =
          matchIndex + 1 < matches.length
            ? (matches[matchIndex + 1].index ??
              value.length)
            : value.length;

        const content = removeDuaColorName(
          source.slice(start, end),
        )
          .replace(/^\s*[;:—–-]\s*/, "")
          .replace(/\s*;\s*$/, "")
          .trim();

        return [
          {
            principle,
            content,
          },
        ];
      })
      .flatMap(expandPostfixDuaStrategies);
  }

  /*
   * Algunos resultados identifican el principio al final
   * de cada estrategia:
   * "Demostración visual (Representación)."
   * Esta variante se transforma en las mismas tarjetas.
   */
  return value
    .split(/\.\s+(?=[A-ZÁÉÍÓÚ])/u)
    .flatMap((clause) => {
      const match = clause.match(
        /\s*\((REPRESENTACI[ÓO]N|ACCI[ÓO]N\s*(?:Y|\/)\s*EXPRESI[ÓO]N|COMPROMISO\s*\/\s*MOTIVACI[ÓO]N|COMPROMISO|MOTIVACI[ÓO]N|IMPLICACI[ÓO]N)\)\.?\s*$/i,
      );

      if (!match) {
        return [];
      }

      const principle = detectDuaPrinciple(
        match[1],
      );

      if (!principle) {
        return [];
      }

      const content = removeDuaColorName(
        clause.slice(0, match.index),
      )
        .replace(
          /^(?:MEDIDA|ESTRATEGIA|APLICACI[ÓO]N)\s+DUA[^:]*:\s*/i,
          "",
        )
        .trim();

      return content
        ? [
            {
              principle,
              content,
            },
          ]
        : [];
    });
}

function createStandardParagraph(
  value: string,
): Paragraph {
  return new Paragraph({
    numbering: {
      reference: "content-bullets",
      level: 0,
    },
    spacing: {
      after: 20,
      line: 220,
    },
    keepLines: true,
    widowControl: true,
    children: [
      new TextRun({
        text: removeDuaColorName(
          cleanListItem(value),
        ),
        font: FONT_FAMILY,
        size: 15,
        color: COLORS.ink,
      }),
    ],
  });
}

function cleanDuaCardContent(
  value: string,
): string {
  return removeDuaColorName(
    cleanListItem(value),
  )
    .replace(
      /^\s*\(?\s*(?:QU[EÉ]|C[ÓO]MO|POR\s*QU[EÉ])\s+DEL APRENDIZAJE(?:\s*\([^)]*\))?\s*\)?\s*:\s*/i,
      "",
    )
    .replace(
      /^\s*\)+\s*[:;—–-]+\s*/,
      "",
    )
    .trim();
}

function createDuaCardParagraph(
  content: string,
  principle: DUAPrinciple,
  keepNext = false,
): Paragraph {
  const palette = DUA_PALETTES[principle];

  return new Paragraph({
    shading: {
      type: ShadingType.CLEAR,
      fill: palette.fill,
      color: "auto",
    },
    border: {
      top: {
        style: BorderStyle.SINGLE,
        size: 6,
        color: palette.border,
        space: 2,
      },
      bottom: {
        style: BorderStyle.SINGLE,
        size: 6,
        color: palette.border,
        space: 2,
      },
      left: {
        style: BorderStyle.SINGLE,
        size: 18,
        color: palette.text,
        space: 3,
      },
      right: {
        style: BorderStyle.SINGLE,
        size: 6,
        color: palette.border,
        space: 2,
      },
    },
    indent: {
      left: 120,
      right: 80,
    },
    spacing: {
      before: 18,
      after: 25,
      line: 210,
    },
    keepNext,
    keepLines: true,
    widowControl: true,
    children: [
      new TextRun({
        text: `- ${DUA_LABELS[principle]}: ${cleanDuaCardContent(
          content,
        )}`,
        bold: true,
        font: FONT_FAMILY,
        size: 15,
        color: palette.text,
      }),
    ],
  });
}

function createDuaCardGroup(
  strategies: DUAStrategy[],
): Table {
  const mergedStrategies =
    mergeAdjacentDuaStrategies(strategies);
  const groupWidth =
    CONTENT_COLUMN_WIDTH -
    CELL_MARGINS.left -
    CELL_MARGINS.right;

  return new Table({
    width: {
      size: groupWidth,
      type: WidthType.DXA,
    },
    columnWidths: [groupWidth],
    layout: TableLayoutType.FIXED,
    borders: {
      top: NO_BORDER,
      bottom: NO_BORDER,
      left: NO_BORDER,
      right: NO_BORDER,
      insideHorizontal: NO_BORDER,
      insideVertical: NO_BORDER,
    },
    rows: [
      new TableRow({
        cantSplit: true,
        children: [
          new TableCell({
            width: {
              size: groupWidth,
              type: WidthType.DXA,
            },
            borders: NO_CELL_BORDERS,
            margins: {
              top: 0,
              bottom: 0,
              left: 0,
              right: 0,
            },
            children: mergedStrategies.map(
              (strategy) =>
                createDuaCardParagraph(
                  strategy.content,
                  strategy.principle,
                ),
            ),
          }),
        ],
      }),
    ],
  });
}

function createDedicatedDuaParagraphs(
  content: string[],
): Paragraph[] {
  const paragraphs: Paragraph[] = [];
  let itemIndex = 0;

  while (itemIndex < content.length) {
    const heading = content[itemIndex];
    const headingStrategies =
      extractDuaStrategies(heading);
    const principle =
      headingStrategies[0]?.principle ??
      detectDuaPrinciple(heading);

    if (!principle) {
      paragraphs.push(
        createStandardParagraph(heading),
      );
      itemIndex += 1;
      continue;
    }

    if (headingStrategies.length > 1) {
      paragraphs.push(
        ...headingStrategies.map(
          (strategy, strategyIndex) =>
            createDuaCardParagraph(
              strategy.content,
              strategy.principle,
              strategyIndex <
                headingStrategies.length - 1,
            ),
        ),
      );
      itemIndex += 1;
      continue;
    }

    const strategyItems: string[] = [];
    itemIndex += 1;

    while (
      itemIndex < content.length &&
      !detectDuaPrinciple(content[itemIndex]) &&
      !normalizeDuaText(
        content[itemIndex],
      ).startsWith("NOTA:")
    ) {
      strategyItems.push(content[itemIndex]);
      itemIndex += 1;
    }

    const headingContent =
      cleanDuaCardContent(
        headingStrategies[0]?.content ??
          heading,
      );

    const cardContent = [
      headingContent,
      ...strategyItems.map((item) =>
        cleanDuaCardContent(item),
      ),
    ]
      .filter(Boolean)
      .join(" ");

    paragraphs.push(
      createDuaCardParagraph(
        cardContent,
        principle,
      ),
    );
  }

  return paragraphs;
}

function splitEmbeddedContent(
  value: string,
): string[] {
  return value
    .split(/[\r\n\u2028\u2029]+/u)
    .map((item) => item.trim())
    .filter(Boolean);
}

function createSectionParagraphs(
  sectionTitle: string,
  content: string[],
): Array<Paragraph | Table> {
  const paragraphs: Array<
    Paragraph | Table
  > = [];
  const dedicatedDuaSection =
    isDedicatedDuaSection(sectionTitle);
  const normalizedContent = content.flatMap(
    splitEmbeddedContent,
  );

  if (dedicatedDuaSection) {
    return createDedicatedDuaParagraphs(
      normalizedContent,
    );
  }

  for (
    let itemIndex = 0;
    itemIndex < normalizedContent.length;
    itemIndex += 1
  ) {
    const item = normalizedContent[itemIndex];
    const duaStrategies =
      extractDuaStrategies(item);

    if (duaStrategies.length > 0) {
      const groupedStrategies = [
        ...duaStrategies,
      ];

      while (
        itemIndex + 1 <
        normalizedContent.length
      ) {
        const nextStrategies =
          extractDuaStrategies(
            normalizedContent[itemIndex + 1],
          );

        if (nextStrategies.length === 0) {
          break;
        }

        groupedStrategies.push(
          ...nextStrategies,
        );
        itemIndex += 1;
      }

      paragraphs.push(
        createDuaCardGroup(
          groupedStrategies,
        ),
      );

      continue;
    }

    paragraphs.push(
      createStandardParagraph(item),
    );
  }

  return paragraphs;
}

function shouldKeepRowTogether(
  sectionTitle: string,
  content: string[],
): boolean {
  if (isDedicatedDuaSection(sectionTitle)) {
    return true;
  }

  const totalCharacters =
    sectionTitle.length +
    content.reduce(
      (total, item) => total + item.length,
      0,
    );

  return totalCharacters <= 750;
}

function createContentTable(
  result: GeneratedAIContent,
): Table {
  const headerRow = new TableRow({
    tableHeader: true,
    cantSplit: true,
    children: [
      new TableCell({
        width: {
          size: SECTION_COLUMN_WIDTH,
          type: WidthType.DXA,
        },
        verticalAlign: VerticalAlign.CENTER,
        shading: {
          type: ShadingType.CLEAR,
          fill: COLORS.headerFill,
          color: "auto",
        },
        margins: CELL_MARGINS,
        borders: CELL_BORDERS,
        children: [
          new Paragraph({
            spacing: {
              after: 0,
              line: 220,
            },
            children: [
              new TextRun({
                text: "Sección",
                bold: true,
                font: FONT_FAMILY,
                size: 18,
                color: COLORS.ink,
              }),
            ],
          }),
        ],
      }),

      new TableCell({
        width: {
          size: CONTENT_COLUMN_WIDTH,
          type: WidthType.DXA,
        },
        verticalAlign: VerticalAlign.CENTER,
        shading: {
          type: ShadingType.CLEAR,
          fill: COLORS.headerFill,
          color: "auto",
        },
        margins: CELL_MARGINS,
        borders: CELL_BORDERS,
        children: [
          new Paragraph({
            spacing: {
              after: 0,
              line: 220,
            },
            children: [
              new TextRun({
                text: "Contenido",
                bold: true,
                font: FONT_FAMILY,
                size: 18,
                color: COLORS.ink,
              }),
            ],
          }),
        ],
      }),
    ],
  });

  const contentRows = result.sections.map(
    (section) =>
      new TableRow({
        cantSplit: shouldKeepRowTogether(
          section.title,
          section.content,
        ),
        children: [
          new TableCell({
            width: {
              size: SECTION_COLUMN_WIDTH,
              type: WidthType.DXA,
            },
            verticalAlign: VerticalAlign.TOP,
            margins: CELL_MARGINS,
            borders: CELL_BORDERS,
            children: [
              new Paragraph({
                spacing: {
                  after: 0,
                  line: 245,
                },
                keepLines: true,
                widowControl: true,
                children: [
                  new TextRun({
                    text: section.title,
                    bold: true,
                    font: FONT_FAMILY,
                    size: 15,
                    color: COLORS.ink,
                  }),
                ],
              }),
            ],
          }),

          new TableCell({
            width: {
              size: CONTENT_COLUMN_WIDTH,
              type: WidthType.DXA,
            },
            verticalAlign: VerticalAlign.TOP,
            margins: CELL_MARGINS,
            borders: CELL_BORDERS,
            children: createSectionParagraphs(
              section.title,
              section.content,
            ),
          }),
        ],
      }),
  );

  return new Table({
    width: {
      size: CONTENT_WIDTH,
      type: WidthType.DXA,
    },
    columnWidths: [
      SECTION_COLUMN_WIDTH,
      CONTENT_COLUMN_WIDTH,
    ],
    layout: TableLayoutType.FIXED,
    margins: CELL_MARGINS,
    borders: {
      top: BORDER,
      bottom: BORDER,
      left: BORDER,
      right: BORDER,
      insideHorizontal: BORDER,
      insideVertical: BORDER,
    },
    rows: [headerRow, ...contentRows],
  });
}

function createRubricTable(
  result: GeneratedAIContent,
): Table | null {
  if (!result.rubric) {
    return null;
  }

  const headers = [
    "Criterio",
    "Excelente (10)",
    "Bien (9)",
    "Regular (8)",
    "Aceptable (7)",
    "Mejorable (5)",
  ];

  const columnWidths = [
    1720,
    1810,
    1810,
    1810,
    1810,
    1812,
  ];

  const headerRow = new TableRow({
    tableHeader: true,
    cantSplit: true,
    children: headers.map(
      (header, index) =>
        new TableCell({
          width: {
            size: columnWidths[index],
            type: WidthType.DXA,
          },
          verticalAlign: VerticalAlign.CENTER,
          shading: {
            type: ShadingType.CLEAR,
            fill: COLORS.headerFill,
            color: "auto",
          },
          margins: {
            top: 60,
            bottom: 60,
            left: 70,
            right: 70,
          },
          borders: CELL_BORDERS,
          children: [
            new Paragraph({
              alignment: AlignmentType.CENTER,
              spacing: {
                after: 0,
                line: 230,
              },
              keepLines: true,
              children: [
                new TextRun({
                  text: header,
                  bold: true,
                  font: FONT_FAMILY,
                  size: 15,
                  color: COLORS.ink,
                }),
              ],
            }),
          ],
        }),
    ),
  });

  const criterionRows =
    result.rubric.criteria.map(
      (criterion) =>
        new TableRow({
          cantSplit: true,
          children: [
            criterion.criterion,
            criterion.excellent,
            criterion.good,
            criterion.regular,
            criterion.acceptable,
            criterion.improvable,
          ].map(
            (value, index) =>
              new TableCell({
                width: {
                  size: columnWidths[index],
                  type: WidthType.DXA,
                },
                verticalAlign:
                  VerticalAlign.CENTER,
                margins: {
                  top: 60,
                  bottom: 60,
                  left: 70,
                  right: 70,
                },
                borders: CELL_BORDERS,
                children: [
                  new Paragraph({
                    spacing: {
                      after: 0,
                      line: 225,
                    },
                    keepLines: true,
                    widowControl: true,
                    children: [
                      new TextRun({
                        text: value,
                        bold: index === 0,
                        font: FONT_FAMILY,
                        size: 15,
                        color: COLORS.ink,
                      }),
                    ],
                  }),
                ],
              }),
          ),
        }),
    );

  return new Table({
    width: {
      size: CONTENT_WIDTH,
      type: WidthType.DXA,
    },
    columnWidths,
    layout: TableLayoutType.FIXED,
    margins: {
      top: 60,
      bottom: 60,
      left: 70,
      right: 70,
    },
    borders: {
      top: BORDER,
      bottom: BORDER,
      left: BORDER,
      right: BORDER,
      insideHorizontal: BORDER,
      insideVertical: BORDER,
    },
    rows: [headerRow, ...criterionRows],
  });
}

function createHeader(
  logoData: ArrayBuffer,
  watermarkData: ArrayBuffer,
): Header {
  const watermarkParagraph = new Paragraph({
    spacing: {
      after: 0,
    },
    children: [
      new ImageRun({
        type: "png",
        data: watermarkData,
        transformation: {
          width: 320,
          height: 320,
        },
        floating: {
          horizontalPosition: {
            relative:
              HorizontalPositionRelativeFrom.PAGE,
            align:
              HorizontalPositionAlign.CENTER,
          },
          verticalPosition: {
            relative:
              VerticalPositionRelativeFrom.PAGE,
            align:
              VerticalPositionAlign.CENTER,
          },
          behindDocument: true,
          allowOverlap: true,
          lockAnchor: true,
        },
      }),
    ],
  });

  const brandTable = new Table({
    width: {
      size: CONTENT_WIDTH,
      type: WidthType.DXA,
    },
    columnWidths: [650, CONTENT_WIDTH - 650],
    layout: TableLayoutType.FIXED,
    borders: {
      top: NO_BORDER,
      bottom: NO_BORDER,
      left: NO_BORDER,
      right: NO_BORDER,
      insideHorizontal: NO_BORDER,
      insideVertical: NO_BORDER,
    },
    rows: [
      new TableRow({
        cantSplit: true,
        children: [
          new TableCell({
            width: {
              size: 650,
              type: WidthType.DXA,
            },
            verticalAlign: VerticalAlign.CENTER,
            margins: {
              top: 0,
              bottom: 0,
              left: 0,
              right: 70,
            },
            borders: NO_CELL_BORDERS,
            children: [
              new Paragraph({
                spacing: {
                  after: 0,
                },
                children: [
                  new ImageRun({
                    type: "png",
                    data: logoData,
                    transformation: {
                      width: 38,
                      height: 38,
                    },
                  }),
                ],
              }),
            ],
          }),

          new TableCell({
            width: {
              size: CONTENT_WIDTH - 650,
              type: WidthType.DXA,
            },
            verticalAlign: VerticalAlign.CENTER,
            margins: {
              top: 0,
              bottom: 0,
              left: 0,
              right: 0,
            },
            borders: NO_CELL_BORDERS,
            children: [
              new Paragraph({
                spacing: {
                  after: 5,
                  line: 220,
                },
                children: [
                  new TextRun({
                    text:
                      "PROFE EN MOVIMIENTO 5.0",
                    bold: true,
                    font: FONT_FAMILY,
                    size: 18,
                    color: COLORS.brand,
                  }),
                ],
              }),

              new Paragraph({
                spacing: {
                  after: 0,
                  line: 210,
                },
                children: [
                  new TextRun({
                    text:
                      "PROFE IA · ASISTENTE INTELIGENTE PARA DOCENTES",
                    bold: true,
                    font: FONT_FAMILY,
                    size: 14,
                    color: COLORS.muted,
                  }),
                ],
              }),
            ],
          }),
        ],
      }),
    ],
  });

  return new Header({
    children: [
      watermarkParagraph,
      brandTable,
    ],
  });
}

function createFooter(): Footer {
  const leftWidth = 7200;
  const rightWidth =
    CONTENT_WIDTH - leftWidth;

  return new Footer({
    children: [
      new Table({
        width: {
          size: CONTENT_WIDTH,
          type: WidthType.DXA,
        },
        columnWidths: [
          leftWidth,
          rightWidth,
        ],
        layout: TableLayoutType.FIXED,
        borders: {
          top: NO_BORDER,
          bottom: NO_BORDER,
          left: NO_BORDER,
          right: NO_BORDER,
          insideHorizontal: NO_BORDER,
          insideVertical: NO_BORDER,
        },
        rows: [
          new TableRow({
            cantSplit: true,
            children: [
              new TableCell({
                width: {
                  size: leftWidth,
                  type: WidthType.DXA,
                },
                borders: NO_CELL_BORDERS,
                margins: {
                  top: 0,
                  bottom: 0,
                  left: 0,
                  right: 0,
                },
                children: [
                  new Paragraph({
                    spacing: {
                      after: 0,
                    },
                    children: [
                      new TextRun({
                        text:
                          "Profe en Movimiento 5.0 · Proyecto FARO · Profe IA",
                        font: FONT_FAMILY,
                        size: 14,
                        color: COLORS.muted,
                      }),
                    ],
                  }),
                ],
              }),

              new TableCell({
                width: {
                  size: rightWidth,
                  type: WidthType.DXA,
                },
                borders: NO_CELL_BORDERS,
                margins: {
                  top: 0,
                  bottom: 0,
                  left: 0,
                  right: 0,
                },
                children: [
                  new Paragraph({
                    alignment: AlignmentType.RIGHT,
                    spacing: {
                      after: 0,
                    },
                    children: [
                      new TextRun({
                        text: "Página ",
                        font: FONT_FAMILY,
                        size: 14,
                        color: COLORS.muted,
                      }),
                      new TextRun({
                        children: [
                          PageNumber.CURRENT,
                        ],
                        font: FONT_FAMILY,
                        size: 14,
                        color: COLORS.muted,
                      }),
                      new TextRun({
                        text: " de ",
                        font: FONT_FAMILY,
                        size: 14,
                        color: COLORS.muted,
                      }),
                      new TextRun({
                        children: [
                          PageNumber.TOTAL_PAGES,
                        ],
                        font: FONT_FAMILY,
                        size: 14,
                        color: COLORS.muted,
                      }),
                    ],
                  }),
                ],
              }),
            ],
          }),
        ],
      }),
    ],
  });
}

function sanitizeFileName(
  value: string,
): string {
  return value
    .trim()
    .replace(/[<>:"/\\|?*]/g, "")
    .replace(/\s+/g, "-")
    .toLowerCase()
    .slice(0, 80);
}

async function loadLogoImage(): Promise<ArrayBuffer> {
  const response = await fetch(
    "/logos/logo-profe-en-movimiento.png",
  );

  if (!response.ok) {
    throw new Error(
      "No fue posible cargar el logo de Profe en Movimiento.",
    );
  }

  return response.arrayBuffer();
}

async function createWatermarkImage(): Promise<ArrayBuffer> {
  const response = await fetch(
    "/logos/logo-profe-en-movimiento.png",
  );

  if (!response.ok) {
    throw new Error(
      "No fue posible cargar la marca de agua de Profe en Movimiento.",
    );
  }

  const blob = await response.blob();
  const imageBitmap = await createImageBitmap(
    blob,
  );

  const canvas =
    window.document.createElement("canvas");

  const canvasSize = 700;

  canvas.width = canvasSize;
  canvas.height = canvasSize;

  const context = canvas.getContext("2d");

  if (!context) {
    imageBitmap.close();

    throw new Error(
      "No fue posible preparar la marca de agua.",
    );
  }

  context.clearRect(
    0,
    0,
    canvasSize,
    canvasSize,
  );

  context.globalAlpha = 0.055;

  const maximumSize = 470;

  const scale = Math.min(
    maximumSize / imageBitmap.width,
    maximumSize / imageBitmap.height,
  );

  const width = imageBitmap.width * scale;
  const height = imageBitmap.height * scale;

  const x = (canvasSize - width) / 2;
  const y = (canvasSize - height) / 2;

  context.drawImage(
    imageBitmap,
    x,
    y,
    width,
    height,
  );

  imageBitmap.close();

  const watermarkBlob =
    await new Promise<Blob>(
      (resolve, reject) => {
        canvas.toBlob(
          (generatedBlob) => {
            if (!generatedBlob) {
              reject(
                new Error(
                  "No fue posible generar la marca de agua.",
                ),
              );

              return;
            }

            resolve(generatedBlob);
          },
          "image/png",
        );
      },
    );

  return watermarkBlob.arrayBuffer();
}

export function createWordDocument(
  result: GeneratedAIContent,
  logoData: ArrayBuffer,
  watermarkData: ArrayBuffer,
): Document {
  const wordHeader = createHeader(
    logoData,
    watermarkData,
  );

  const wordFooter = createFooter();

  const rubricTable =
    createRubricTable(result);

  const documentChildren = [
    new Paragraph({
      spacing: {
        before: 0,
        after: 100,
        line: 220,
      },
      keepNext: true,
      keepLines: true,
      widowControl: true,
      children: [
        new TextRun({
          text: result.title,
          bold: true,
          font: FONT_FAMILY,
          size: 32,
          color: COLORS.ink,
        }),
      ],
    }),

    new Paragraph({
      spacing: {
        after: 100,
        line: 250,
      },
      keepNext: true,
      keepLines: true,
      widowControl: true,
      children: [
        new TextRun({
          text: result.introduction,
          font: FONT_FAMILY,
          size: 18,
          color: "475569",
        }),
      ],
    }),

    createContentTable(result),
  ];

  if (rubricTable && result.rubric) {
    documentChildren.push(
      new Paragraph({
        pageBreakBefore: true,
        spacing: {
          before: 0,
          after: 120,
          line: 220,
        },
        keepNext: true,
        keepLines: true,
        children: [
          new TextRun({
            text: result.rubric.title,
            bold: true,
            font: FONT_FAMILY,
            size: 28,
            color: COLORS.ink,
          }),
        ],
      }),

      rubricTable,
    );
  }

  return new Document({
    creator: "Profe en Movimiento 5.0",
    title: result.title,
    description:
      "Contenido educativo generado por Profe IA.",
    features: {
      updateFields: true,
    },
    styles: {
      default: {
        document: {
          run: {
            font: FONT_FAMILY,
            size: 15,
            color: COLORS.ink,
          },
          paragraph: {
            spacing: {
              after: 20,
              line: 220,
            },
          },
        },
      },
    },
    numbering: {
      config: [
        {
          reference: "content-bullets",
          levels: [
            {
              level: 0,
              format: LevelFormat.BULLET,
              text: "•",
              alignment: AlignmentType.LEFT,
              style: {
                run: {
                  font: FONT_FAMILY,
                  size: 15,
                  color: COLORS.brand,
                },
                paragraph: {
                  indent: {
                    left: 300,
                    hanging: 160,
                  },
                  spacing: {
                    after: 20,
                    line: 220,
                  },
                },
              },
            },
          ],
        },
        ...(
          Object.values(
            DUA_PALETTES,
          ) as DUAPalette[]
        ).map((palette) => ({
          reference:
            palette.bulletReference,
          levels: [
            {
              level: 0,
              format: LevelFormat.BULLET,
              text: "•",
              alignment: AlignmentType.LEFT,
              style: {
                run: {
                  font: FONT_FAMILY,
                  size: 15,
                  color: palette.border,
                },
                paragraph: {
                  indent: {
                    left: 330,
                    hanging: 180,
                  },
                  spacing: {
                    after: 20,
                    line: 220,
                  },
                },
              },
            },
          ],
        })),
      ],
    },
    sections: [
      {
        headers: {
          default: wordHeader,
        },
        footers: {
          default: wordFooter,
        },
        properties: {
          page: {
            size: {
              width: PAGE_WIDTH,
              height: PAGE_HEIGHT,
              orientation:
                PageOrientation.PORTRAIT,
            },
            margin: {
              top: 1000,
              right: SIDE_MARGIN,
              bottom: 850,
              left: SIDE_MARGIN,
              header: 220,
              footer: 300,
            },
          },
        },
        children: documentChildren,
      },
    ],
  });
}

export async function exportResultToWord(
  result: GeneratedAIContent,
) {
  const [logoData, watermarkData] =
    await Promise.all([
      loadLogoImage(),
      createWatermarkImage(),
    ]);

  const wordDocument = createWordDocument(
    result,
    logoData,
    watermarkData,
  );

  const blob = await Packer.toBlob(
    wordDocument,
  );

  const url = URL.createObjectURL(blob);

  const anchor =
    window.document.createElement("a");

  anchor.href = url;
  anchor.download = `${sanitizeFileName(
    result.title,
  ) || "profe-ia"}-profe-en-movimiento.docx`;

  window.document.body.appendChild(anchor);

  anchor.click();
  anchor.remove();

  window.setTimeout(() => {
    URL.revokeObjectURL(url);
  }, 1000);
}