import type { GeneratedAIContent } from "@/features/ai/types/ai";
import {
  getDUAVisual,
  type DUAVisual,
} from "@/features/ai/utils/duaVisuals";
import AIExamResult from "./AIExamResult";
import AIRubricTable from "./AIRubricTable";

interface AIResultContentProps {
  result: GeneratedAIContent;
}

interface StandardContentBlock {
  type: "standard";
  item: string;
}

interface DUAContentBlock {
  type: "dua";
  visual: DUAVisual;
  items: string[];
}

type ContentBlock =
  | StandardContentBlock
  | DUAContentBlock;

function normalizeText(
  value: string,
): string {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim()
    .toLowerCase()
    .replace(/^[^a-z]+/, "");
}

function isDedicatedDUASection(
  sectionTitle: string,
): boolean {
  const normalized =
    normalizeText(sectionTitle);

  return (
    normalized.includes(
      "estrategias dua",
    ) ||
    normalized.includes(
      "aplicacion dua",
    )
  );
}

function beginsWithDUAPrinciple(
  value: string,
): boolean {
  const normalized =
    normalizeText(value);

  return (
    normalized.startsWith(
      "representacion",
    ) ||
    normalized.startsWith(
      "accion y expresion",
    ) ||
    normalized.startsWith(
      "accion / expresion",
    ) ||
    normalized.startsWith(
      "compromiso",
    ) ||
    normalized.startsWith(
      "motivacion",
    ) ||
    normalized.startsWith(
      "implicacion",
    )
  );
}

function isChecklistIndicatorsSection(
  sectionTitle: string,
): boolean {
  const normalized =
    normalizeText(sectionTitle);

  return normalized.includes(
    "indicadores observables",
  );
}

function isDUAPrincipleHeading(
  value: string,
): boolean {
  const normalized =
    normalizeText(value);

  const isRepresentation =
    normalized.startsWith(
      "representacion",
    ) &&
    normalized.includes(
      "del aprendizaje",
    );

  const isActionAndExpression =
    (
      normalized.startsWith(
        "accion y expresion",
      ) ||
      normalized.startsWith(
        "accion / expresion",
      )
    ) &&
    normalized.includes(
      "del aprendizaje",
    );

  const isEngagement =
    (
      normalized.startsWith(
        "compromiso",
      ) ||
      normalized.startsWith(
        "motivacion",
      ) ||
      normalized.startsWith(
        "implicacion",
      )
    ) &&
    normalized.includes(
      "del aprendizaje",
    );

  return (
    isRepresentation ||
    isActionAndExpression ||
    isEngagement
  );
}

function groupSectionContent(
  sectionTitle: string,
  content: string[],
): ContentBlock[] {
  const blocks: ContentBlock[] = [];

  const isDedicatedSection =
    isDedicatedDUASection(
      sectionTitle,
    );

  let activeDUAVisual:
    | DUAVisual
    | null = null;

  for (const item of content) {
    const detectedVisual =
  beginsWithDUAPrinciple(item)
    ? getDUAVisual(item)
    : null;

    if (
      isDedicatedSection &&
      detectedVisual
    ) {
      activeDUAVisual =
        detectedVisual;
    }

    const effectiveVisual =
      isDedicatedSection
        ? detectedVisual ??
          activeDUAVisual
        : detectedVisual;

    if (!effectiveVisual) {
      blocks.push({
        type: "standard",
        item,
      });

      continue;
    }

    const isHeading =
      isDUAPrincipleHeading(item);

    const previousBlock =
      blocks[blocks.length - 1];

    const canJoinPreviousBlock =
      previousBlock?.type ===
        "dua" &&
      previousBlock.visual
        .principle ===
        effectiveVisual.principle;

    if (canJoinPreviousBlock) {
      if (!isHeading) {
        previousBlock.items.push(
          item,
        );
      }

      continue;
    }

    blocks.push({
      type: "dua",
      visual: effectiveVisual,
      items: isHeading
        ? []
        : [item],
    });
  }

  return blocks;
}

function cleanChecklistIndicator(
  indicator: string,
): string {
  return indicator
    .replace(
      /\s*[—–-]\s*\[\s*\]\s*Sí\s*\|\s*\[\s*\]\s*En proceso\s*\|\s*\[\s*\]\s*No\.?\s*$/i,
      "",
    )
    .trim();
}

function getChecklistIndicators(
  content: string[],
): string[] {
  return content.filter(
    (item) => {
      const normalized =
        normalizeText(item);

      const isIdentification =
  normalized.startsWith(
    "nombre del estudiante",
  ) ||
  normalized.startsWith(
    "espacios de identificacion",
  );
      const isInstruction =
        normalized.startsWith(
          "instruccion",
        );

      const isIndicatorsLabel =
        /^indicador(?:es)?\s*(?:—|-|:|\[|$)/.test(
          normalized,
        );

      return (
        !isIdentification &&
        !isInstruction &&
        !isIndicatorsLabel
      );
    },
  );
}

function ChecklistIndicatorsTable({
  indicators,
}: {
  indicators: string[];
}) {
  const checklistIndicators =
    getChecklistIndicators(
      indicators,
    );

  return (
    <div>
      <div className="grid gap-3 rounded-xl border border-slate-300 bg-slate-50 p-4 text-sm font-bold text-slate-800 sm:grid-cols-3">
        <span>
          Nombre: ____________________
        </span>

        <span>
          Curso: ____________________
        </span>

        <span>
          Fecha: ____________________
        </span>
      </div>

      <p className="mt-3 text-sm text-slate-600">
        Marque una sola casilla por
        indicador según el desempeño
        observado.
      </p>

      <div className="mt-4 overflow-x-auto rounded-xl border border-slate-300">
        <table className="min-w-[900px] w-full table-fixed border-collapse text-sm">
          <thead className="bg-blue-100 text-slate-950">
            <tr>
              <th className="w-[48%] border-b border-r border-slate-300 px-4 py-3 text-left font-black">
                Indicador observable
              </th>

              <th className="w-[7%] border-b border-r border-slate-300 px-2 py-3 text-center font-black">
                Sí
              </th>

              <th className="w-[12%] border-b border-r border-slate-300 px-2 py-3 text-center font-black">
                En proceso
              </th>

              <th className="w-[7%] border-b border-r border-slate-300 px-2 py-3 text-center font-black">
                No
              </th>

              <th className="w-[26%] border-b border-slate-300 px-4 py-3 text-center font-black">
                Observaciones
              </th>
            </tr>
          </thead>

          <tbody>
            {checklistIndicators.map(
              (
                indicator,
                indicatorIndex,
              ) => (
                <tr
                  key={`${indicator}-${indicatorIndex}`}
                  className="align-middle even:bg-slate-50"
                >
                  <td className="border-b border-r border-slate-300 px-4 py-4 leading-6 text-slate-700">
                    {cleanChecklistIndicator(
                      indicator,
                    )}
                  </td>

                  <td className="border-b border-r border-slate-300 px-2 py-4 text-center text-xl">
                    □
                  </td>

                  <td className="border-b border-r border-slate-300 px-2 py-4 text-center text-xl">
                    □
                  </td>

                  <td className="border-b border-r border-slate-300 px-2 py-4 text-center text-xl">
                    □
                  </td>

                  <td className="border-b border-slate-300 px-4 py-4">
                    {" "}
                  </td>
                </tr>
              ),
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default function AIResultContent({
  result,
}: AIResultContentProps) {
  return (
    <article
      id="ai-result-print-area"
      className="mt-7"
    >
      <div className="rounded-2xl bg-slate-950 p-6 text-white">
        <p className="text-xs font-black uppercase tracking-[0.18em] text-sky-300">
          Generado por Profe IA
        </p>

        <h3 className="mt-3 text-2xl font-black">
          {result.title}
        </h3>

        <p className="mt-4 leading-7 text-slate-300">
          {result.introduction}
        </p>
      </div>

            <div className="mt-6 overflow-hidden rounded-2xl border border-slate-300 bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="min-w-[850px] w-full table-fixed border-collapse text-left">
            <thead className="bg-blue-50">
              <tr>
                <th
                  scope="col"
                  className="w-[28%] border-b border-r border-slate-300 px-5 py-4 text-sm font-black text-slate-950"
                >
                  Sección
                </th>

                <th
                  scope="col"
                  className="border-b border-slate-300 px-5 py-4 text-sm font-black text-slate-950"
                >
                  Contenido
                </th>
              </tr>
            </thead>

            <tbody>
              {result.sections.map(
                (
                  section,
                  sectionIndex,
                ) => {
                  if (
                    isChecklistIndicatorsSection(
                      section.title,
                    )
                  ) {
                    return (
                      <tr
                        key={`${section.title}-${sectionIndex}`}
                      >
                        <td
                          colSpan={2}
                          className="border-b border-slate-300 px-5 py-5"
                        >
                          <h4 className="mb-4 text-base font-black text-slate-950">
                            {section.title}
                          </h4>

                          <ChecklistIndicatorsTable
                            indicators={
                              section.content
                            }
                          />
                        </td>
                      </tr>
                    );
                  }

                  const contentBlocks =
                    groupSectionContent(
                      section.title,
                      section.content,
                    );

                  return (
                    <tr
                      key={`${section.title}-${sectionIndex}`}
                      className="align-top transition hover:bg-slate-50"
                    >
                      <th
                        scope="row"
                        className="border-b border-r border-slate-300 bg-slate-50/70 px-5 py-5 text-sm font-black leading-6 text-slate-900"
                      >
                        {section.title}
                      </th>

                      <td className="border-b border-slate-300 px-5 py-5">
                        <ul className="space-y-3">
                          {contentBlocks.map(
                            (
                              block,
                              blockIndex,
                            ) => {
                              if (
                                block.type ===
                                "dua"
                              ) {
                                const duaVisual =
                                  block.visual;

                                return (
                                  <li
                                    key={`${section.title}-dua-${duaVisual.principle}-${blockIndex}`}
                                    className={`rounded-xl border px-4 py-3 text-sm leading-6 ${duaVisual.backgroundClassName} ${duaVisual.borderClassName}`}
                                  >
                                    <div className="flex items-start gap-3">
                                      <span
                                        className="mt-0.5 text-base"
                                        aria-hidden="true"
                                      >
                                        {
                                          duaVisual.emoji
                                        }
                                      </span>

                                      <div className="min-w-0 flex-1">
                                        <p
                                          className={`font-black ${duaVisual.textClassName}`}
                                        >
                                          {
                                            duaVisual.label
                                          }
                                        </p>

                                        {block
                                          .items
                                          .length >
                                          0 && (
                                          <div className="mt-2 space-y-2 text-slate-700">
                                            {block.items.map(
                                              (
                                                item,
                                                itemIndex,
                                              ) => (
                                                <p
                                                  key={`${section.title}-dua-item-${blockIndex}-${itemIndex}`}
                                                >
                                                  {
                                                    item
                                                  }
                                                </p>
                                              ),
                                            )}
                                          </div>
                                        )}
                                      </div>
                                    </div>
                                  </li>
                                );
                              }

                              return (
                                <li
                                  key={`${section.title}-standard-${blockIndex}`}
                                  className="flex gap-3 text-sm leading-6 text-slate-700"
                                >
                                  <span
                                    className="mt-2 h-2 w-2 shrink-0 rounded-full bg-blue-500"
                                    aria-hidden="true"
                                  />

                                  <span>
                                    {
                                      block.item
                                    }
                                  </span>
                                </li>
                              );
                            },
                          )}
                        </ul>
                      </td>
                    </tr>
                  );
                },
              )}
            </tbody>
          </table>
        </div>
      </div>

      {result.exam && (
        <AIExamResult exam={result.exam} />
      )}

      {result.rubric && (
        <AIRubricTable
          rubric={result.rubric}
        />
      )}

      <p className="mt-4 text-center text-xs text-slate-500">
        Profe en Movimiento 5.0 · Profe IA
      </p>
    </article>
  );
}