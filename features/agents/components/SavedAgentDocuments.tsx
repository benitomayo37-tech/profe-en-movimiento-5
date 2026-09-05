"use client";

import { useEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";

import {
  AgentDocumentContent,
  getPrintableAgentResult,
} from "@/features/agents/components/AgentDocumentContent";

type DocumentType =
  | "planning"
  | "rubric"
  | "assessment"
  | "inclusion"
  | "training";

export interface SavedAgentDocument {
  id: string;
  conversationId: string;
  conversationTitle: string;
  originalContent: string;
  content: string;
  savedAt: string;
  versionCount: number;
  latestVersionNumber: number | null;
}

const typeLabels: Record<DocumentType, string> = {
  planning: "Planificación",
  rubric: "Rúbrica",
  assessment: "Evaluación",
  inclusion: "Inclusión y DUA",
  training: "Entrenamiento",
};

const typeStyles: Record<DocumentType, string> = {
  planning: "border-blue-200 bg-blue-50 text-blue-800",
  rubric: "border-orange-200 bg-orange-50 text-orange-800",
  assessment: "border-violet-200 bg-violet-50 text-violet-800",
  inclusion: "border-emerald-200 bg-emerald-50 text-emerald-800",
  training: "border-cyan-200 bg-cyan-50 text-cyan-800",
};

function normalize(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();
}

function documentType(content: string): DocumentType {
  const value = normalize(content);

  if (/\b(?:microciclo|mesociclo|macrociclo|sesion de entrenamiento)\b/.test(value)) {
    return "training";
  }

  if (/\brubrica\b/.test(value)) {
    return "rubric";
  }

  if (/\b(?:examen|lista de cotejo|instrumento de evaluacion|evaluacion)\b/.test(value)) {
    return "assessment";
  }

  if (/\b(?:dua|nee|inclusion|adaptaciones)\b/.test(value)) {
    return "inclusion";
  }

  return "planning";
}

function formattedDate(value: string) {
  return new Intl.DateTimeFormat("es-EC", {
    dateStyle: "medium",
    timeZone: "UTC",
  }).format(new Date(value));
}

export default function SavedAgentDocuments({
  documents,
  hasProAccess,
}: {
  documents: SavedAgentDocument[];
  hasProAccess: boolean;
}) {
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<"all" | DocumentType>("all");
  const [selected, setSelected] = useState<SavedAgentDocument | null>(null);
  const [printDocument, setPrintDocument] = useState<SavedAgentDocument | null>(null);

  const preparedDocuments = useMemo(
    () =>
      documents.map((document) => ({
        ...document,
        type: documentType(document.content),
        printable: getPrintableAgentResult(
          document.content,
          document.conversationTitle,
        ),
      })),
    [documents],
  );

  const filteredDocuments = useMemo(() => {
    const cleanSearch = normalize(search.trim());

    return preparedDocuments.filter((document) => {
      const matchesType =
        filter === "all" || document.type === filter;
      const matchesSearch =
        !cleanSearch
        || normalize(
          `${document.printable.title}
${document.conversationTitle}
${document.content}`,
        ).includes(cleanSearch);

      return matchesType && matchesSearch;
    });
  }, [filter, preparedDocuments, search]);

  const selectedPrepared = useMemo(
    () =>
      selected
        ? {
            ...selected,
            printable: getPrintableAgentResult(
              selected.content,
              selected.conversationTitle,
            ),
          }
        : null,
    [selected],
  );

  const printPrepared = useMemo(
    () =>
      printDocument
        ? getPrintableAgentResult(
            printDocument.content,
            printDocument.conversationTitle,
          )
        : null,
    [printDocument],
  );

  useEffect(() => {
    if (!printDocument) return;

    let timer: number | undefined;
    let cancelled = false;
    const finishPrinting = () => setPrintDocument(null);

    const frame = window.requestAnimationFrame(() => {
      const prepareAndPrint = async () => {
        const logo = document.querySelector<HTMLImageElement>(
          ".agent-print-sheet img",
        );

        if (logo && !logo.complete) {
          await new Promise<void>((resolve) => {
            logo.addEventListener("load", () => resolve(), {
              once: true,
            });
            logo.addEventListener("error", () => resolve(), {
              once: true,
            });
          });
        }

        if (logo?.decode) {
          await logo.decode().catch(() => undefined);
        }

        if (!cancelled) {
          timer = window.setTimeout(() => window.print(), 50);
        }
      };

      void prepareAndPrint();
    });

    window.addEventListener("afterprint", finishPrinting, {
      once: true,
    });

    return () => {
      cancelled = true;
      window.cancelAnimationFrame(frame);
      if (timer) window.clearTimeout(timer);
      window.removeEventListener("afterprint", finishPrinting);
    };
  }, [printDocument]);

  return (
    <>
      <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-7">
        <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_240px]">
          <div>
            <label htmlFor="saved-agent-search" className="text-sm font-black text-slate-900">
              Buscar documentos
            </label>
            <input
              id="saved-agent-search"
              type="search"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              className="mt-2 min-h-12 w-full rounded-xl border border-slate-300 bg-white px-4 text-slate-800 outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
              placeholder="Título, contenido o conversación…"
            />
          </div>

          <div>
            <label htmlFor="saved-agent-filter" className="text-sm font-black text-slate-900">
              Tipo de documento
            </label>
            <select
              id="saved-agent-filter"
              value={filter}
              onChange={(event) =>
                setFilter(event.target.value as "all" | DocumentType)
              }
              className="mt-2 min-h-12 w-full rounded-xl border border-slate-300 bg-white px-4 text-slate-800 outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
            >
              <option value="all">Todos</option>
              <option value="planning">Planificaciones</option>
              <option value="rubric">Rúbricas</option>
              <option value="assessment">Evaluaciones</option>
              <option value="inclusion">Inclusión y DUA</option>
              <option value="training">Entrenamientos</option>
            </select>
          </div>
        </div>

        <div className="mt-5 flex flex-wrap items-center justify-between gap-3">
          <p className="text-sm font-bold text-slate-600">
            {filteredDocuments.length} de {documents.length} documentos
          </p>
          <a
            href="/agentes"
            className="inline-flex min-h-11 items-center rounded-xl bg-blue-700 px-5 text-sm font-black text-white hover:bg-blue-800"
          >
            Abrir Centro de Agentes →
          </a>
        </div>
      </section>

      {filteredDocuments.length ? (
        <section className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {filteredDocuments.map((document) => (
            <article
              key={document.id}
              className="flex flex-col rounded-3xl border border-slate-200 bg-white p-5 shadow-sm"
            >
              <div className="flex flex-wrap items-center justify-between gap-2">
                <span
                  className={`rounded-full border px-3 py-1 text-xs font-black ${typeStyles[document.type]}`}
                >
                  {typeLabels[document.type]}
                </span>
                <span className="text-xs font-bold text-slate-500">
                  {formattedDate(document.savedAt)}
                </span>
              </div>

              <h2 className="mt-4 text-xl font-black leading-7 text-slate-950">
                {document.printable.title}
              </h2>

              <p className="mt-2 text-xs font-bold uppercase tracking-wide text-violet-700">
                {document.conversationTitle}
              </p>

              <p className="mt-3 line-clamp-4 text-sm leading-6 text-slate-600">
                {document.printable.content}
              </p>

              <div className="mt-4 flex flex-wrap gap-2 text-xs font-bold text-slate-500">
                <span className="rounded-lg bg-slate-100 px-2.5 py-1.5">
                  {document.versionCount
                    ? `${document.versionCount} ${document.versionCount === 1 ? "versión" : "versiones"}`
                    : "Resultado guardado"}
                </span>
                {document.latestVersionNumber ? (
                  <span className="rounded-lg bg-emerald-50 px-2.5 py-1.5 text-emerald-700">
                    Última: versión {document.latestVersionNumber}
                  </span>
                ) : null}
              </div>

              <div className="mt-auto flex flex-wrap gap-2 pt-5">
                <button
                  type="button"
                  onClick={() => setSelected(document)}
                  className="min-h-11 rounded-xl bg-slate-950 px-4 text-sm font-black text-white hover:bg-blue-900"
                >
                  Ver documento
                </button>
                <a
                  href={`/agentes?conversation=${document.conversationId}`}
                  className="inline-flex min-h-11 items-center rounded-xl border border-blue-300 bg-blue-50 px-4 text-sm font-black text-blue-800 hover:bg-blue-100"
                >
                  Ir a conversación
                </a>
              </div>
            </article>
          ))}
        </section>
      ) : (
        <section className="rounded-3xl border border-dashed border-slate-300 bg-white p-10 text-center shadow-sm">
          <h2 className="text-xl font-black text-slate-950">
            {documents.length
              ? "No encontramos documentos"
              : "Todavía no hay documentos guardados"}
          </h2>
          <p className="mx-auto mt-2 max-w-xl leading-7 text-slate-600">
            {documents.length
              ? "Prueba con otra búsqueda o selecciona un tipo diferente."
              : "Abre el Centro de Agentes, edita un resultado y guarda una versión para que aparezca aquí."}
          </p>
          <a
            href="/agentes"
            className="mt-5 inline-flex min-h-11 items-center rounded-xl bg-blue-700 px-5 text-sm font-black text-white hover:bg-blue-800"
          >
            Ir al Centro de Agentes
          </a>
        </section>
      )}

      {selectedPrepared && typeof document !== "undefined"
        ? createPortal(
            <div
              className="fixed inset-0 z-[120] flex items-center justify-center bg-slate-950/75 p-4"
              role="dialog"
              aria-modal="true"
              aria-labelledby="saved-agent-document-title"
            >
              <section className="flex max-h-[92vh] w-full max-w-5xl flex-col overflow-hidden rounded-3xl bg-white shadow-2xl">
                <header className="flex items-center justify-between gap-4 bg-gradient-to-r from-blue-950 to-violet-900 px-6 py-5 text-white">
                  <div>
                    <p className="text-xs font-black uppercase tracking-[.16em] text-orange-300">
                      Documento guardado
                    </p>
                    <h2
                      id="saved-agent-document-title"
                      className="mt-1 text-2xl font-black"
                    >
                      {selectedPrepared.printable.title}
                    </h2>
                  </div>
                  <button
                    type="button"
                    onClick={() => setSelected(null)}
                    className="flex h-11 w-11 items-center justify-center rounded-full border border-white/30 bg-white/10 text-xl font-black text-white hover:bg-white/20"
                    aria-label="Cerrar documento"
                  >
                    ×
                  </button>
                </header>

                <div className="min-h-0 flex-1 overflow-y-auto bg-slate-50 p-5 sm:p-7">
                  <article className="rounded-2xl border border-slate-200 bg-white p-5 text-slate-700 shadow-sm">
                    <AgentDocumentContent
                      content={selectedPrepared.printable.content}
                    />
                  </article>
                </div>

                <footer className="flex flex-wrap justify-end gap-3 border-t border-slate-200 bg-white p-5">
                  <a
                    href={`/agentes?conversation=${selectedPrepared.conversationId}`}
                    className="inline-flex min-h-11 items-center rounded-xl border border-blue-300 bg-blue-50 px-5 text-sm font-black text-blue-800 hover:bg-blue-100"
                  >
                    Abrir conversación
                  </a>
                  <button
                    type="button"
                    onClick={() => {
                      setPrintDocument(selectedPrepared);
                      setSelected(null);
                    }}
                    className="min-h-11 rounded-xl bg-blue-700 px-5 text-sm font-black text-white hover:bg-blue-800"
                  >
                    Imprimir o guardar en PDF
                  </button>
                </footer>
              </section>
            </div>,
            document.body,
          )
        : null}

      {printDocument
      && printPrepared
      && typeof document !== "undefined"
        ? createPortal(
            <section
              className={`agent-print-sheet ${
                hasProAccess
                  ? "agent-print-pro"
                  : "agent-print-free"
              }`}
              aria-hidden="true"
            >
              <header className="agent-print-brand">
                <img
                  src="/logos/logo-profe-en-movimiento.png"
                  alt="Profe en Movimiento"
                  width="72"
                  height="72"
                />
                <div>
                  <h1>Profe en Movimiento 5.0</h1>
                  <p>
                    {hasProAccess
                      ? "Documento guardado · Agentes IA"
                      : "Versión Free · Documento guardado"}
                  </p>
                </div>
              </header>
              <h2>{printPrepared.title}</h2>
              <AgentDocumentContent content={printPrepared.content} />
              <footer>
                Profe en Movimiento 5.0 ·{" "}
                {new Date().toLocaleDateString("es-EC")}
                {!hasProAccess ? " · Plan Free" : ""}
              </footer>
            </section>,
            document.body,
          )
        : null}
    </>
  );
}