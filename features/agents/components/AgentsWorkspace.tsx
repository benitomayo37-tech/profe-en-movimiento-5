"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";

import type { AgentConversation, AgentMessage, AgentSpecialist } from "@/features/agents/types";

interface AgentResultVersion {
  id: string;
  message_id: string;
  version_number: number;
  content: string;
  created_at: string;
}

const specialistLabel: Record<AgentSpecialist, string> = {
  coordinator: "Coordinador Docente",
  planning: "Agente de Planificación",
  assessment: "Agente de Evaluación",
  inclusion: "Agente de Inclusión",
  training: "Agente de Entrenamiento Deportivo",
};

const starterPrompts = [
  { text: "Diseña una clase de 45 minutos con 40 estudiantes y 4 balones.", pro: false },
  { text: "Crea una rúbrica con criterios observables para evaluar pases de baloncesto.", pro: false },
  { text: "Adapta mediante DUA y apoyos NEE una actividad de pases de pecho para 8.º de EGB, con 40 estudiantes y 45 minutos. Los únicos materiales disponibles son 4 balones: no añadas conos, aros, marcas, fichas ni otros recursos. Mantén este objetivo: ejecutar pases de pecho con precisión hacia un compañero situado a 5 metros.", pro: false },
  { text: "Diseña un microciclo de entrenamiento deportivo con carga y recuperación progresivas.", pro: false },
  { text: "Diseña un mesociclo deportivo de cuatro semanas con progresión de cargas.", pro: true },
  { text: "Diseña un macrociclo con periodos preparatorio, competitivo y de transición.", pro: true },
];

function duaLineClass(line: string): string {
  const normalized = line
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/^[^a-z]+/, "");
  const trimmed = line.trimStart();

  if (normalized.startsWith("compromiso") || normalized.startsWith("proporcionar multiples formas de compromiso")) {
    return "agent-dua-compromiso";
  }

  if (normalized.startsWith("representacion") || normalized.startsWith("proporcionar multiples formas de representacion")) {
    return "agent-dua-representacion";
  }

  if (normalized.startsWith("accion y expresion") || normalized.startsWith("proporcionar multiples formas de accion y expresion")) {
    return "agent-dua-accion-expresion";
  }

  if (trimmed.startsWith("🟢")) return "agent-dua-compromiso";
  if (trimmed.startsWith("🟣")) return "agent-dua-representacion";
  if (trimmed.startsWith("🔵")) return "agent-dua-accion-expresion";

  return "";
}

function tableCells(line: string) {
  return line.trim().replace(/^\|/, "").replace(/\|$/, "").split("|").map((cell) => cell.trim());
}

function isTableSeparator(line: string) {
  const cells = tableCells(line);
  return cells.length > 1 && cells.every((cell) => /^:?-{3,}:?$/.test(cell));
}

function printableResult(content: string, fallbackTitle: string) {
  const lines = content.split("\n");
  const tableStart = lines.findIndex((line, index) => line.includes("|") && index + 1 < lines.length && isTableSeparator(lines[index + 1]));
  const meaningfulBeforeTable = tableStart >= 0 ? lines.slice(0, tableStart).filter((line) => line.trim() && !/^#{1,6}\s+/.test(line.trim())) : [];

  if (tableStart >= 0 && meaningfulBeforeTable.length <= 2) {
    let tableEnd = tableStart + 2;
    while (tableEnd < lines.length && lines[tableEnd].includes("|") && lines[tableEnd].trim()) tableEnd += 1;
    let headingIndex = tableStart - 1;
    while (headingIndex >= 0 && !lines[headingIndex].trim()) headingIndex -= 1;
    const heading = headingIndex >= 0 && /rúbrica/i.test(lines[headingIndex]) ? lines[headingIndex].replace(/^[-*#\s]+/, "").trim() : "Rúbrica de evaluación";
    return { title: heading, content: lines.slice(tableStart, tableEnd).join("\n") };
  }

  const firstHeading = lines.findIndex((line) => /^#\s+/.test(line.trim()));
  const productTitle = lines.findIndex((line) => /^(Microciclo|Mesociclo|Macrociclo|Sesión de entrenamiento)\b/i.test(line.replace(/^#{1,6}\s+/, "").trim()));
  const titleIndex = firstHeading >= 0 ? firstHeading : productTitle;
  const fallbackContent = `${fallbackTitle}
${content}`;
  const defaultTitle = /\b(microciclo|mesociclo|macrociclo|sesión de entrenamiento)\b/i.test(fallbackContent)
    ? "Plan de entrenamiento deportivo"
    : /\b(clase|educación física|dua|estudiantes)\b/i.test(fallbackContent)
      ? "Planificación de clase de Educación Física"
      : fallbackTitle.length <= 90
        ? fallbackTitle
        : "Recurso docente";
  const title = titleIndex >= 0
    ? lines[titleIndex].replace(/^#{1,6}\s+/, "").trim()
    : defaultTitle;
  const withoutTitle = titleIndex >= 0 ? lines.filter((_, index) => index !== titleIndex) : lines;
  const processStart = withoutTitle.findIndex((line) => /^(especialista consultado|resumen del aporte|revisión del docente|revisión del entrenador)/i.test(line.replace(/^#{1,6}\s+/, "").trim()));
  const printableLines = (processStart >= 0 ? withoutTitle.slice(0, processStart) : withoutTitle).filter((line) => !/^(especialistas consultados|decisión final y responsabilidad|(?:[-*]\s*)?supuestos?(?:\s+(?:breves?|pedagógicos?))?\b)/i.test(line.replace(/^#{1,6}\s+/, "").trim()));
  return { title, content: printableLines.join("\n").trim() };
}

function AgentMessageContent({ content }: { content: string }) {
  const lines = content.split("\n");
  const blocks = [];

  for (let index = 0; index < lines.length;) {
    const rawLine = lines[index];
    const line = rawLine
      .replace(/^(\s*[-*]?\s*)🔵(\s+Representación\b)/i, "$1🟣$2")
      .replace(/^(\s*[-*]?\s*)🟣(\s+Acción y Expresión\b)/i, "$1🔵$2");
    if (/^\s*---+\s*$/.test(line)) {
      blocks.push(<hr key={index} className="agent-section-divider" />);
      index += 1;
      continue;
    }
    if (line.includes("|") && index + 1 < lines.length && isTableSeparator(lines[index + 1])) {
      const headers = tableCells(line);
      const isRubric = headers.some((header) => /Excelente\s*\(10\)/i.test(header));
      const rows: string[][] = [];
      index += 2;
      while (index < lines.length && lines[index].includes("|") && lines[index].trim()) {
        rows.push(tableCells(lines[index]));
        index += 1;
      }
      blocks.push(<div key={`table-${index}`} className={`agent-table-wrap my-4 overflow-x-auto rounded-xl border ${isRubric ? "agent-rubric-wrap" : "agent-plan-wrap"}`}><table className={`agent-content-table w-full border-collapse text-left text-xs leading-5 ${isRubric ? "agent-rubric-table min-w-[900px]" : "agent-plan-table min-w-[720px]"}`}><thead><tr>{headers.map((header, cellIndex) => <th key={cellIndex} className="px-3 py-2 font-black">{header}</th>)}</tr></thead><tbody>{rows.map((row, rowIndex) => <tr key={rowIndex}>{headers.map((_, cellIndex) => <td key={cellIndex} className="px-3 py-2 align-top">{row[cellIndex] ?? ""}</td>)}</tr>)}</tbody></table></div>);
      continue;
    }

    const duaClass = duaLineClass(line);
    const heading = line.match(/^(#{2,4})\s+(.+)$/);
    const sessionHeading = line.match(/^(Sesión\s+\d+|Semana\s+\d+|Periodo\s+\d+)(?:\s*[-—:]\s*)?(.+)?$/i);
    blocks.push(!line ? <div key={index} className="h-3" aria-hidden="true" /> : heading ? <h3 key={index} className="agent-content-heading">{heading[2]}</h3> : sessionHeading ? <h4 key={index} className="agent-session-heading">{line}</h4> : <div key={index} className={duaClass ? `my-1 rounded-xl border px-3 py-2 font-semibold ${duaClass}` : "agent-content-line whitespace-pre-wrap"}>{line}</div>);
    index += 1;
  }

  return <div className="mt-3 text-sm leading-7">{blocks}</div>;
}

export default function AgentsWorkspace({ initialConversations, initialMessages, initialConversationId, initialRemaining, monthlyLimit, initialMicrocycleRemaining, hasProAccess }: { initialConversations: AgentConversation[]; initialMessages: AgentMessage[]; initialConversationId: string | null; initialRemaining: number; monthlyLimit: number; initialMicrocycleRemaining: number | null; hasProAccess: boolean }) {
  const [conversations, setConversations] = useState(initialConversations);
  const [conversationId, setConversationId] = useState(initialConversationId);
  const [messages, setMessages] = useState(initialMessages);
  const [message, setMessage] = useState("");
  const [remaining, setRemaining] = useState(initialRemaining);
  const [microcycleRemaining, setMicrocycleRemaining] = useState(initialMicrocycleRemaining);
  const [working, setWorking] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [upgradeRequired, setUpgradeRequired] = useState(false);
  const [showPrevious, setShowPrevious] = useState(false);
  const [printMessage, setPrintMessage] = useState<AgentMessage | null>(null);
  const [editingMessage, setEditingMessage] = useState<AgentMessage | null>(null);
  const [editorContent, setEditorContent] = useState("");
  const [versions, setVersions] = useState<AgentResultVersion[]>([]);
  const [versionsLoading, setVersionsLoading] = useState(false);
  const [versionSaving, setVersionSaving] = useState(false);
  const [versionError, setVersionError] = useState<string | null>(null);
  const [revisionMessage, setRevisionMessage] = useState<AgentMessage | null>(null);
  const [revisionSourceContent, setRevisionSourceContent] = useState("");
  const [revisionMode, setRevisionMode] = useState<"full" | "section">("section");
  const [revisionSection, setRevisionSection] = useState("");
  const [revisionInstruction, setRevisionInstruction] = useState("");
  const [revisionWorking, setRevisionWorking] = useState(false);
  const [revisionError, setRevisionError] = useState<string | null>(null);
  const [conversationSearch, setConversationSearch] = useState("");
  const [conversationAction, setConversationAction] = useState<{
    type: "rename" | "delete";
    conversation: AgentConversation;
  } | null>(null);
  const [conversationTitle, setConversationTitle] = useState("");
  const [conversationBusyId, setConversationBusyId] = useState<string | null>(null);
  const [conversationActionError, setConversationActionError] = useState<string | null>(null);

  const selectedTitle = useMemo(() => conversations.find((item) => item.id === conversationId)?.title ?? "Nueva conversación", [conversations, conversationId]);
  const filteredConversations = useMemo(() => {
    const search = conversationSearch.trim().toLocaleLowerCase("es");

    if (!search) return conversations;

    return conversations.filter((item) =>
      item.title.toLocaleLowerCase("es").includes(search)
    );
  }, [conversationSearch, conversations]);
  const hiddenMessageCount = Math.max(0, messages.length - 2);
  const visibleMessages = showPrevious ? messages : messages.slice(-2);
  const printTitle = useMemo(() => {
    if (!printMessage) return selectedTitle;
    const messageIndex = messages.findIndex((item) => item.id === printMessage.id);
    for (let index = messageIndex - 1; index >= 0; index -= 1) {
      if (messages[index].role === "user") return messages[index].content.split("\n")[0].trim();
    }
    return selectedTitle;
  }, [messages, printMessage, selectedTitle]);
  const printData = useMemo(() => printMessage ? printableResult(printMessage.content, printTitle) : null, [printMessage, printTitle]);

  useEffect(() => {
    if (!printMessage) return;
    let timer: number | undefined;
    let cancelled = false;
    const finishPrinting = () => setPrintMessage(null);
    const frame = window.requestAnimationFrame(() => {
      const prepareAndPrint = async () => {
        const logo = document.querySelector<HTMLImageElement>(".agent-print-sheet img");
        if (logo && !logo.complete) {
          await new Promise<void>((resolve) => {
            logo.addEventListener("load", () => resolve(), { once: true });
            logo.addEventListener("error", () => resolve(), { once: true });
          });
        }
        if (logo?.decode) await logo.decode().catch(() => undefined);
        if (!cancelled) timer = window.setTimeout(() => window.print(), 50);
      };
      void prepareAndPrint();
    });
    window.addEventListener("afterprint", finishPrinting, { once: true });
    return () => {
      cancelled = true;
      window.cancelAnimationFrame(frame);
      if (timer) window.clearTimeout(timer);
      window.removeEventListener("afterprint", finishPrinting);
    };
  }, [printMessage]);

  async function submit(event: FormEvent) {
    event.preventDefault();
    const clean = message.trim();
    if (!clean || working) return;
    setWorking(true); setError(null); setUpgradeRequired(false);
    try {
      const request = await fetch("/api/agents/run", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ conversationId, message: clean }) });
      const payload = await request.json();
      if (!request.ok || !payload.success) {
        if (["agents_pro_required", "agents_microcycle_limit", "agents_correction_limit"].includes(payload.code)) setUpgradeRequired(true);
        throw new Error(payload.message || "No se pudo generar la respuesta.");
      }
      setMessages((current) => [...current, payload.userMessage, payload.assistantMessage]);
      setShowPrevious(false);
      setMessage("");
      setRemaining(typeof payload.remaining === "number" ? payload.remaining : remaining);
      if (payload.feature === "microcycle" && !hasProAccess) setMicrocycleRemaining(0);
      if (!conversationId) {
        const newId = payload.conversationId as string;
        const title = clean.length > 76 ? `${clean.slice(0, 73)}…` : clean;
        setConversationId(newId);
        setConversations((current) => [{ id: newId, title, last_specialist: payload.assistantMessage.specialist, created_at: new Date().toISOString(), updated_at: new Date().toISOString() }, ...current]);
        window.history.replaceState(null, "", `/agentes?conversation=${newId}`);
      }
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "No se pudo generar la respuesta.");
    } finally { setWorking(false); }
  }

  function openConversationAction(
    type: "rename" | "delete",
    conversation: AgentConversation,
  ) {
    setConversationAction({ type, conversation });
    setConversationTitle(conversation.title);
    setConversationActionError(null);
  }

  async function renameConversation() {
    if (!conversationAction || conversationAction.type !== "rename") return;

    const title = conversationTitle.replace(/\s+/g, " ").trim();

    if (title.length < 2 || title.length > 120) {
      setConversationActionError(
        "El título debe contener entre 2 y 120 caracteres.",
      );
      return;
    }

    setConversationBusyId(conversationAction.conversation.id);
    setConversationActionError(null);

    try {
      const request = await fetch("/api/agents/conversations", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: conversationAction.conversation.id,
          title,
        }),
      });
      const payload = await request.json();

      if (!request.ok || !payload.success) {
        throw new Error(
          payload.message || "No se pudo renombrar la conversación.",
        );
      }

      setConversations((current) =>
        current.map((item) =>
          item.id === payload.conversation.id
            ? { ...item, ...payload.conversation }
            : item,
        ),
      );
      setConversationAction(null);
    } catch (caught) {
      setConversationActionError(
        caught instanceof Error
          ? caught.message
          : "No se pudo renombrar la conversación.",
      );
    } finally {
      setConversationBusyId(null);
    }
  }

  async function duplicateConversation(conversation: AgentConversation) {
    if (conversationBusyId) return;

    setConversationBusyId(conversation.id);
    setConversationActionError(null);

    try {
      const request = await fetch("/api/agents/conversations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: conversation.id }),
      });
      const payload = await request.json();

      if (!request.ok || !payload.success) {
        throw new Error(
          payload.message || "No se pudo duplicar la conversación.",
        );
      }

      window.location.assign(
        `/agentes?conversation=${payload.conversationId}`,
      );
    } catch (caught) {
      setConversationActionError(
        caught instanceof Error
          ? caught.message
          : "No se pudo duplicar la conversación.",
      );
      setConversationBusyId(null);
    }
  }

  async function deleteConversation() {
    if (!conversationAction || conversationAction.type !== "delete") return;

    const id = conversationAction.conversation.id;
    setConversationBusyId(id);
    setConversationActionError(null);

    try {
      const request = await fetch("/api/agents/conversations", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      });
      const payload = await request.json();

      if (!request.ok || !payload.success) {
        throw new Error(
          payload.message || "No se pudo eliminar la conversación.",
        );
      }

      setConversations((current) =>
        current.filter((item) => item.id !== id),
      );
      setConversationAction(null);

      if (conversationId === id) {
        window.location.assign("/agentes");
      }
    } catch (caught) {
      setConversationActionError(
        caught instanceof Error
          ? caught.message
          : "No se pudo eliminar la conversación.",
      );
    } finally {
      setConversationBusyId(null);
    }
  }

  function openAiRevision(
    item: AgentMessage,
    content: string = item.content,
  ) {
    setRevisionMessage(item);
    setRevisionSourceContent(content.trim());
    setRevisionMode("section");
    setRevisionSection("");
    setRevisionInstruction("");
    setRevisionError(null);
  }

  async function submitAiRevision() {
    if (!revisionMessage || revisionWorking) return;

    const cleanInstruction = revisionInstruction.trim();
    const cleanSection = revisionSection.trim();

    if (cleanInstruction.length < 2) {
      setRevisionError("Describe la corrección que necesitas.");
      return;
    }

    if (revisionMode === "section" && cleanSection.length < 2) {
      setRevisionError("Indica qué sección deseas corregir.");
      return;
    }

    setRevisionWorking(true);
    setRevisionError(null);

    try {
      const request = await fetch("/api/agents/revise", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messageId: revisionMessage.id,
          content: revisionSourceContent,
          instruction: cleanInstruction,
          mode: revisionMode,
          section: revisionMode === "section" ? cleanSection : null,
        }),
      });
      const payload = await request.json();

      if (!request.ok || !payload.success) {
        if (
          [
            "agents_pro_required",
            "agents_microcycle_limit",
            "agents_correction_limit",
          ].includes(payload.code)
        ) {
          setUpgradeRequired(true);
        }

        throw new Error(
          payload.message || "No se pudo completar la corrección.",
        );
      }

      setMessages((current) => [
        ...current,
        payload.userMessage,
        payload.assistantMessage,
      ]);
      setRemaining((current) =>
        typeof payload.remaining === "number"
          ? payload.remaining
          : current,
      );
      setShowPrevious(false);
      setRevisionMessage(null);
      setMessage("");
    } catch (caught) {
      setRevisionError(
        caught instanceof Error
          ? caught.message
          : "No se pudo completar la corrección.",
      );
    } finally {
      setRevisionWorking(false);
    }
  }

  async function openResultEditor(item: AgentMessage) {
    setEditingMessage(item);
    setEditorContent(item.content);
    setVersions([]);
    setVersionError(null);
    setVersionsLoading(true);

    try {
      const request = await fetch(
        `/api/agents/save?id=${encodeURIComponent(item.id)}`,
        { cache: "no-store" },
      );
      const payload = await request.json();

      if (!request.ok || !payload.success) {
        throw new Error(
          payload.message || "No se pudieron consultar las versiones.",
        );
      }

      const loadedVersions = Array.isArray(payload.versions)
        ? payload.versions as AgentResultVersion[]
        : [];

      setVersions(loadedVersions);

      if (loadedVersions[0]?.content) {
        setEditorContent(loadedVersions[0].content);
      }
    } catch (caught) {
      setVersionError(
        caught instanceof Error
          ? caught.message
          : "No se pudieron consultar las versiones.",
      );
    } finally {
      setVersionsLoading(false);
    }
  }

  async function saveEditedVersion() {
    if (!editingMessage || versionSaving) return;

    const cleanContent = editorContent.trim();
    if (!cleanContent) {
      setVersionError("El resultado no puede quedar vacío.");
      return;
    }

    setVersionSaving(true);
    setVersionError(null);

    try {
      const request = await fetch("/api/agents/save", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: editingMessage.id,
          content: cleanContent,
        }),
      });
      const payload = await request.json();

      if (!request.ok || !payload.success) {
        throw new Error(
          payload.message || "No se pudo guardar la versión.",
        );
      }

      const savedVersion = payload.version as AgentResultVersion;
      setVersions((current) => [
        savedVersion,
        ...current.filter((item) => item.id !== savedVersion.id),
      ]);
      setEditorContent(savedVersion.content);
      setMessages((current) =>
        current.map((item) =>
          item.id === editingMessage.id
            ? { ...item, saved_at: payload.savedAt }
            : item,
        ),
      );
    } catch (caught) {
      setVersionError(
        caught instanceof Error
          ? caught.message
          : "No se pudo guardar la versión.",
      );
    } finally {
      setVersionSaving(false);
    }
  }

  function printEditorContent() {
    if (!editingMessage || !editorContent.trim()) return;

    setPrintMessage({
      ...editingMessage,
      content: editorContent.trim(),
    });
    setEditingMessage(null);
  }

  return <div className="grid gap-6 xl:grid-cols-[290px_minmax(0,1fr)]">
    <aside className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
      <a href="/agentes" className="flex min-h-11 items-center justify-center rounded-xl bg-slate-950 px-4 font-black text-white">+ Nueva conversación</a>
      <p className="mt-6 text-xs font-black uppercase tracking-[.16em] text-blue-700">Conversaciones</p>
      <label htmlFor="agent-conversation-search" className="sr-only">Buscar conversaciones</label>
      <input id="agent-conversation-search" type="search" value={conversationSearch} onChange={(event) => setConversationSearch(event.target.value)} className="mt-3 min-h-11 w-full rounded-xl border border-slate-300 bg-white px-3 text-sm text-slate-800 outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100" placeholder="Buscar conversación…" />

      <div className="mt-3 space-y-3">
        {filteredConversations.map((item) => (
          <article key={item.id} className={`rounded-xl border p-3 ${item.id === conversationId ? "border-blue-500 bg-blue-50" : "border-slate-200 bg-white"}`}>
            <a href={`/agentes?conversation=${item.id}`} className={`block text-sm font-bold leading-5 ${item.id === conversationId ? "text-blue-900" : "text-slate-700 hover:text-blue-800"}`}>{item.title}</a>
            <div className="mt-3 flex flex-wrap gap-1.5 border-t border-slate-200 pt-2">
              <button type="button" onClick={() => openConversationAction("rename", item)} disabled={Boolean(conversationBusyId)} className="rounded-lg bg-slate-100 px-2.5 py-1.5 text-[11px] font-black text-slate-700 hover:bg-slate-200 disabled:opacity-40">Renombrar</button>
              <button type="button" onClick={() => void duplicateConversation(item)} disabled={Boolean(conversationBusyId)} className="rounded-lg bg-violet-100 px-2.5 py-1.5 text-[11px] font-black text-violet-800 hover:bg-violet-200 disabled:opacity-40">{conversationBusyId === item.id ? "Procesando…" : "Duplicar"}</button>
              <button type="button" onClick={() => openConversationAction("delete", item)} disabled={Boolean(conversationBusyId)} className="rounded-lg bg-red-50 px-2.5 py-1.5 text-[11px] font-black text-red-700 hover:bg-red-100 disabled:opacity-40">Eliminar</button>
            </div>
          </article>
        ))}
        {!conversations.length ? <p className="rounded-xl border border-dashed border-slate-300 p-4 text-sm text-slate-500">Todavía no hay conversaciones.</p> : null}
        {conversations.length > 0 && !filteredConversations.length ? <p className="rounded-xl border border-dashed border-slate-300 p-4 text-sm text-slate-500">No encontramos conversaciones con ese título.</p> : null}
      </div>

      {conversationActionError && !conversationAction ? <p className="mt-3 rounded-xl bg-red-50 p-3 text-xs font-bold leading-5 text-red-700">{conversationActionError}</p> : null}
      {!hasProAccess && conversations.length >= 3 ? <p className="mt-3 text-xs leading-5 text-slate-500">Plan Free muestra las 3 conversaciones más recientes. Tu historial completo se conserva al activar Pro.</p> : null}
      <div className="mt-6 rounded-2xl bg-violet-50 p-4"><div className="flex items-center justify-between gap-2"><p className="text-xs font-black uppercase tracking-wide text-violet-700">Uso mensual</p><span className="rounded-full bg-white px-2 py-1 text-[10px] font-black uppercase text-violet-800">{hasProAccess ? "Pro" : "Free"}</span></div><p className="mt-2 text-2xl font-black text-slate-950">{remaining} disponibles</p><p className="mt-1 text-xs text-slate-500">Límite actual: {monthlyLimit} ejecuciones.</p>{!hasProAccess ? <><p className="mt-2 rounded-lg bg-white px-2.5 py-2 text-xs font-bold text-violet-800">Microciclo: {microcycleRemaining} de 1 disponible este mes.</p><a href="/store/plan-pro-mensual?source=agents_usage" className="mt-3 inline-flex text-xs font-black text-blue-700 hover:text-blue-900">Conocer el Plan Pro →</a></> : null}</div>
    </aside>

    <section className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
      <header className="border-b border-slate-200 bg-gradient-to-r from-blue-950 to-violet-900 p-6 text-white"><p className="text-xs font-black uppercase tracking-[.18em] text-orange-300">Coordinación multiagente</p><h2 className="mt-2 text-2xl font-black">{selectedTitle}</h2><p className="mt-2 text-sm text-blue-100">El Coordinador consulta al especialista adecuado y tú apruebas cada resultado.</p></header>
      <div className="min-h-[420px] space-y-5 bg-slate-50 p-5 sm:p-7">
        {!messages.length ? <div><div className="rounded-2xl border border-blue-100 bg-white p-6"><h3 className="text-xl font-black text-slate-950">¿Qué necesitas preparar?</h3><p className="mt-2 leading-7 text-slate-600">Describe tu meta. Si faltan datos, el agente te preguntará antes de elaborar el resultado.</p></div><div className="mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-3">{starterPrompts.map((prompt) => prompt.pro && !hasProAccess ? <a key={prompt.text} href="/store/plan-pro-mensual" className="relative rounded-2xl border border-amber-200 bg-amber-50 p-4 text-left text-sm font-bold leading-6 text-slate-700 hover:border-amber-400"><span className="agent-pro-lock-badge absolute right-3 top-3 rounded-full px-2 py-1 text-[10px] font-black uppercase">Pro</span><span className="block pr-10">{prompt.text}</span><span className="agent-upgrade-link mt-2 block text-xs font-black">Activar Plan Pro →</span></a> : <button key={prompt.text} onClick={() => setMessage(prompt.text)} className="relative rounded-2xl border border-slate-200 bg-white p-4 text-left text-sm font-bold leading-6 text-slate-700 hover:border-blue-400">{prompt.pro ? <span className="agent-pro-active-badge absolute right-3 top-3 rounded-full px-2 py-1 text-[10px] font-black uppercase">Pro</span> : null}{!hasProAccess && prompt.text.includes("microciclo") ? <span className="absolute right-3 top-3 rounded-full bg-violet-700 px-2.5 py-1 text-[11px] font-black uppercase !text-white shadow-sm">1 al mes</span> : null}<span className={prompt.pro || (!hasProAccess && prompt.text.includes("microciclo")) ? "block pr-20" : "block"}>{prompt.text}</span></button>)}</div></div> : <>{hiddenMessageCount > 0 ? <button type="button" onClick={() => setShowPrevious((current) => !current)} className="mx-auto block rounded-full border border-slate-300 bg-white px-4 py-2 text-xs font-black text-slate-700 shadow-sm hover:bg-slate-100">{showPrevious ? "Ocultar mensajes anteriores" : `Ver ${hiddenMessageCount} mensajes anteriores`}</button> : null}{visibleMessages.map((item) => <article key={item.id} className={`rounded-2xl p-5 shadow-sm ${item.role === "user" ? "ml-auto max-w-3xl bg-blue-700 text-white" : "mr-auto max-w-4xl border border-slate-200 bg-white text-slate-700"}`}>
          <p className={`text-xs font-black uppercase tracking-[.14em] ${item.role === "user" ? "text-blue-100" : "text-violet-700"}`}>{item.role === "user" ? "Docente" : specialistLabel[item.specialist ?? "coordinator"]}</p>
          <AgentMessageContent content={item.content} />
          {item.role === "assistant" && item.response_kind !== "clarification" ? <div className="mt-4 flex flex-wrap gap-2"><button type="button" onClick={() => void openResultEditor(item)} className="rounded-xl border border-emerald-300 bg-emerald-50 px-4 py-2 text-xs font-black text-emerald-800">{item.saved_at ? "Editar y ver versiones" : "Editar y guardar"}</button><button type="button" onClick={() => openAiRevision(item)} disabled={remaining <= 0} className="rounded-xl border border-violet-300 bg-violet-50 px-4 py-2 text-xs font-black text-violet-800 disabled:cursor-not-allowed disabled:opacity-40">Corregir con IA</button><button type="button" onClick={() => setPrintMessage(item)} className="rounded-xl border border-blue-300 bg-blue-50 px-4 py-2 text-xs font-black text-blue-800">Imprimir resultado original</button></div> : null}
        </article>)}</>}
        {working ? <div className="mr-auto max-w-md rounded-2xl border border-violet-200 bg-white p-5 font-bold text-violet-800 shadow-sm" aria-live="polite">Los agentes están analizando y revisando la solicitud…</div> : null}
      </div>
      <form onSubmit={submit} className="border-t border-slate-200 bg-white p-5"><label htmlFor="agent-message" className="text-sm font-black text-slate-900">Solicitud para el Coordinador</label><textarea id="agent-message" value={message} onChange={(event) => setMessage(event.target.value)} maxLength={6000} rows={4} className="mt-2 w-full rounded-2xl border border-slate-300 p-4 leading-7 outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100" placeholder="Ejemplo: necesito una clase de 45 minutos para 40 estudiantes…" />{error || remaining <= 0 ? <div className="mt-3 rounded-xl bg-red-50 p-3 text-sm font-bold text-red-700"><p>{error ?? (hasProAccess ? `Has utilizado las ${monthlyLimit} ejecuciones mensuales disponibles.` : "Has utilizado las 3 ejecuciones mensuales del Plan Free. Activa Pro para continuar creando y corrigiendo resultados.")}</p>{upgradeRequired || (!hasProAccess && remaining <= 0) ? <a href="/store/plan-pro-mensual" className="mt-2 inline-flex rounded-lg bg-amber-300 px-3.5 py-2 text-xs font-black !text-slate-950 shadow-sm hover:bg-amber-400">Ver Plan Pro →</a> : null}</div> : null}<div className="mt-3 flex flex-wrap items-center justify-between gap-3"><p className="text-xs font-semibold text-slate-500">No incluyas nombres ni información personal de estudiantes.</p><button disabled={working || !message.trim() || remaining <= 0} className="min-h-11 rounded-xl bg-blue-700 px-6 font-black text-white disabled:cursor-not-allowed disabled:opacity-40">{working ? "Coordinando…" : "Enviar al Coordinador →"}</button></div></form>
    </section>
    {conversationAction && typeof document !== "undefined" ? createPortal(
      <div className="fixed inset-0 z-[120] flex items-center justify-center bg-slate-950/75 p-4" role="dialog" aria-modal="true" aria-labelledby="agent-conversation-action-title">
        <section className="w-full max-w-lg overflow-hidden rounded-3xl bg-white shadow-2xl">
          <header className={`px-6 py-5 text-white ${conversationAction.type === "delete" ? "bg-red-800" : "bg-gradient-to-r from-blue-950 to-violet-900"}`}>
            <p className="text-xs font-black uppercase tracking-[.16em] text-orange-200">Gestión de conversación</p>
            <h2 id="agent-conversation-action-title" className="mt-1 text-2xl font-black">{conversationAction.type === "rename" ? "Renombrar conversación" : "Eliminar conversación"}</h2>
          </header>

          <div className="p-6">
            {conversationAction.type === "rename" ? (
              <>
                <label htmlFor="agent-conversation-title" className="text-sm font-black text-slate-900">Nuevo título</label>
                <input id="agent-conversation-title" value={conversationTitle} onChange={(event) => setConversationTitle(event.target.value)} maxLength={120} autoFocus className="mt-2 min-h-11 w-full rounded-xl border border-slate-300 px-4 text-slate-800 outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100" />
                <p className="mt-2 text-right text-xs font-semibold text-slate-500">{conversationTitle.length}/120</p>
              </>
            ) : (
              <>
                <p className="text-base font-bold text-slate-900">¿Deseas eliminar esta conversación?</p>
                <p className="mt-3 rounded-xl bg-slate-100 p-4 text-sm font-bold leading-6 text-slate-700">{conversationAction.conversation.title}</p>
                <p className="mt-3 text-sm leading-6 text-red-700">Se eliminarán también todos sus mensajes y versiones guardadas. Esta acción no se puede deshacer.</p>
              </>
            )}

            {conversationActionError ? <p className="mt-4 rounded-xl bg-red-50 p-3 text-sm font-bold text-red-700" role="alert">{conversationActionError}</p> : null}

            <div className="mt-6 flex flex-wrap justify-end gap-3">
              <button type="button" onClick={() => setConversationAction(null)} disabled={Boolean(conversationBusyId)} className="min-h-11 rounded-xl border border-slate-300 bg-white px-5 text-sm font-black text-slate-700 hover:bg-slate-50 disabled:opacity-40">Cancelar</button>
              {conversationAction.type === "rename" ? <button type="button" onClick={() => void renameConversation()} disabled={Boolean(conversationBusyId) || conversationTitle.trim().length < 2} className="min-h-11 rounded-xl bg-blue-700 px-5 text-sm font-black text-white hover:bg-blue-800 disabled:opacity-40">{conversationBusyId ? "Guardando…" : "Guardar título"}</button> : <button type="button" onClick={() => void deleteConversation()} disabled={Boolean(conversationBusyId)} className="min-h-11 rounded-xl bg-red-700 px-5 text-sm font-black text-white hover:bg-red-800 disabled:opacity-40">{conversationBusyId ? "Eliminando…" : "Sí, eliminar"}</button>}
            </div>
          </div>
        </section>
      </div>,
      document.body,
    ) : null}
    {revisionMessage && typeof document !== "undefined" ? createPortal(
      <div className="fixed inset-0 z-[110] flex items-center justify-center bg-slate-950/75 p-4" role="dialog" aria-modal="true" aria-labelledby="agent-revision-title">
        <section className="w-full max-w-2xl overflow-hidden rounded-3xl bg-white shadow-2xl">
          <header className="flex items-center justify-between gap-4 bg-gradient-to-r from-blue-950 to-violet-900 px-6 py-5 text-white">
            <div>
              <p className="text-xs font-black uppercase tracking-[.16em] text-orange-300">Revisión dirigida</p>
              <h2 id="agent-revision-title" className="mt-1 text-2xl font-black">Corregir con IA</h2>
            </div>
            <button type="button" onClick={() => setRevisionMessage(null)} disabled={revisionWorking} className="flex h-11 w-11 items-center justify-center rounded-full border border-white/30 bg-white/10 text-xl font-black text-white hover:bg-white/20 disabled:opacity-40" aria-label="Cerrar corrección">×</button>
          </header>

          <div className="max-h-[78vh] overflow-y-auto p-6">
            <p className="text-sm leading-6 text-slate-600">El Coordinador generará un nuevo resultado. El documento actual y sus versiones permanecerán intactos.</p>

            <fieldset className="mt-5">
              <legend className="text-sm font-black text-slate-900">¿Qué deseas revisar?</legend>
              <div className="mt-3 grid gap-3 sm:grid-cols-2">
                <label className={`cursor-pointer rounded-2xl border p-4 ${revisionMode === "section" ? "border-violet-500 bg-violet-50" : "border-slate-200 bg-white"}`}>
                  <input type="radio" name="revision-mode" value="section" checked={revisionMode === "section"} onChange={() => setRevisionMode("section")} className="mr-2" />
                  <span className="font-black text-slate-900">Una sección</span>
                  <span className="mt-1 block text-xs leading-5 text-slate-500">Conserva el resto del documento.</span>
                </label>
                <label className={`cursor-pointer rounded-2xl border p-4 ${revisionMode === "full" ? "border-violet-500 bg-violet-50" : "border-slate-200 bg-white"}`}>
                  <input type="radio" name="revision-mode" value="full" checked={revisionMode === "full"} onChange={() => setRevisionMode("full")} className="mr-2" />
                  <span className="font-black text-slate-900">Documento completo</span>
                  <span className="mt-1 block text-xs leading-5 text-slate-500">Permite ajustes en todo el recurso.</span>
                </label>
              </div>
            </fieldset>

            {revisionMode === "section" ? <div className="mt-5"><label htmlFor="agent-revision-section" className="text-sm font-black text-slate-900">Sección que deseas corregir</label><input id="agent-revision-section" value={revisionSection} onChange={(event) => setRevisionSection(event.target.value)} maxLength={120} className="mt-2 min-h-11 w-full rounded-xl border border-slate-300 px-4 text-slate-800 outline-none focus:border-violet-500 focus:ring-4 focus:ring-violet-100" placeholder="Ejemplo: Desarrollo, DUA o Rúbrica de evaluación" /></div> : null}

            <div className="mt-5">
              <label htmlFor="agent-revision-instruction" className="text-sm font-black text-slate-900">¿Qué debe cambiar?</label>
              <textarea id="agent-revision-instruction" value={revisionInstruction} onChange={(event) => setRevisionInstruction(event.target.value)} maxLength={2000} rows={5} className="mt-2 w-full rounded-2xl border border-slate-300 p-4 leading-6 text-slate-800 outline-none focus:border-violet-500 focus:ring-4 focus:ring-violet-100" placeholder="Ejemplo: simplifica las instrucciones y mantén exactamente los mismos materiales y tiempos." />
              <div className="mt-1 text-right text-xs font-semibold text-slate-500">{revisionInstruction.length}/2000</div>
            </div>

            <div className="mt-5 rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm leading-6 text-amber-900">
              Esta corrección utilizará 1 ejecución. Te quedan <strong>{remaining}</strong> este mes.
            </div>

            {revisionError ? <div className="mt-4 rounded-xl bg-red-50 p-3 text-sm font-bold text-red-700" role="alert"><p>{revisionError}</p>{upgradeRequired ? <a href="/store/plan-pro-mensual?source=agents_revision" className="mt-2 inline-flex rounded-lg bg-amber-300 px-3.5 py-2 text-xs font-black !text-slate-950">Ver Plan Pro →</a> : null}</div> : null}

            <div className="mt-6 flex flex-wrap justify-end gap-3">
              <button type="button" onClick={() => setRevisionMessage(null)} disabled={revisionWorking} className="min-h-11 rounded-xl border border-slate-300 bg-white px-5 text-sm font-black text-slate-700 hover:bg-slate-50 disabled:opacity-40">Cancelar</button>
              <button type="button" onClick={() => void submitAiRevision()} disabled={revisionWorking || remaining <= 0 || revisionInstruction.trim().length < 2 || (revisionMode === "section" && revisionSection.trim().length < 2)} className="min-h-11 rounded-xl bg-violet-700 px-5 text-sm font-black text-white hover:bg-violet-800 disabled:cursor-not-allowed disabled:opacity-40">{revisionWorking ? "Corrigiendo…" : "Generar corrección →"}</button>
            </div>
          </div>
        </section>
      </div>,
      document.body,
    ) : null}
    {editingMessage && typeof document !== "undefined" ? createPortal(
      <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/75 p-4" role="dialog" aria-modal="true" aria-labelledby="agent-editor-title">
        <section className="flex max-h-[92vh] w-full max-w-6xl flex-col overflow-hidden rounded-3xl bg-white shadow-2xl">
          <header className="flex items-center justify-between gap-4 border-b border-slate-200 bg-gradient-to-r from-blue-950 to-violet-900 px-6 py-5 text-white">
            <div>
              <p className="text-xs font-black uppercase tracking-[.16em] text-orange-300">Documento editable</p>
              <h2 id="agent-editor-title" className="mt-1 text-2xl font-black">Editar y guardar versiones</h2>
            </div>
            <button type="button" onClick={() => setEditingMessage(null)} className="flex h-11 w-11 items-center justify-center rounded-full border border-white/30 bg-white/10 text-xl font-black text-white hover:bg-white/20" aria-label="Cerrar editor">×</button>
          </header>

          <div className="grid min-h-0 flex-1 lg:grid-cols-[minmax(0,1fr)_300px]">
            <div className="min-h-0 overflow-y-auto p-5 sm:p-6">
              <label htmlFor="agent-result-editor" className="text-sm font-black text-slate-900">Contenido del resultado</label>
              <p className="mt-1 text-xs leading-5 text-slate-500">Puedes corregir el texto manualmente. El resultado original de la conversación no será modificado.</p>
              <textarea id="agent-result-editor" value={editorContent} onChange={(event) => setEditorContent(event.target.value)} maxLength={20000} className="mt-4 min-h-[480px] w-full resize-y rounded-2xl border border-slate-300 bg-white p-4 font-mono text-sm leading-6 text-slate-800 outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100" />
              <div className="mt-2 flex items-center justify-between gap-3 text-xs font-semibold text-slate-500">
                <span>Los títulos y tablas Markdown se conservarán.</span>
                <span>{editorContent.length}/20000</span>
              </div>
              {versionError ? <p className="mt-3 rounded-xl bg-red-50 p-3 text-sm font-bold text-red-700" role="alert">{versionError}</p> : null}
              <div className="mt-5 flex flex-wrap gap-3">
                <button type="button" onClick={() => void saveEditedVersion()} disabled={versionSaving || !editorContent.trim() || versions.length >= 10} className="min-h-11 rounded-xl bg-emerald-600 px-5 text-sm font-black text-white hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-50">{versionSaving ? "Guardando…" : versions.length >= 10 ? "Límite de versiones alcanzado" : `Guardar versión ${versions.length + 1}`}</button>
                <button type="button" onClick={() => { openAiRevision(editingMessage, editorContent); setEditingMessage(null); }} disabled={!editorContent.trim() || remaining <= 0} className="min-h-11 rounded-xl bg-violet-700 px-5 text-sm font-black text-white hover:bg-violet-800 disabled:cursor-not-allowed disabled:opacity-50">Corregir esta versión con IA</button>
                <button type="button" onClick={printEditorContent} disabled={!editorContent.trim()} className="min-h-11 rounded-xl bg-blue-700 px-5 text-sm font-black text-white hover:bg-blue-800 disabled:opacity-50">Imprimir esta versión</button>
                <button type="button" onClick={() => setEditorContent(editingMessage.content)} className="min-h-11 rounded-xl border border-slate-300 bg-white px-5 text-sm font-black text-slate-700 hover:bg-slate-50">Recuperar original</button>
              </div>
            </div>

            <aside className="min-h-0 overflow-y-auto border-t border-slate-200 bg-slate-50 p-5 lg:border-l lg:border-t-0">
              <h3 className="font-black text-slate-950">Versiones guardadas</h3>
              <p className="mt-1 text-xs leading-5 text-slate-500">Puedes recuperar cualquier versión y volver a editarla.</p>
              {versionsLoading ? <p className="mt-4 rounded-xl bg-white p-4 text-sm font-bold text-violet-700">Cargando versiones…</p> : null}
              {!versionsLoading && !versions.length ? <p className="mt-4 rounded-xl border border-dashed border-slate-300 bg-white p-4 text-sm text-slate-500">Este resultado todavía no tiene versiones guardadas.</p> : null}
              <div className="mt-4 space-y-3">
                {versions.map((version) => (
                  <button key={version.id} type="button" onClick={() => { setEditorContent(version.content); setVersionError(null); }} className="w-full rounded-xl border border-slate-200 bg-white p-4 text-left hover:border-blue-400 hover:bg-blue-50">
                    <span className="block text-sm font-black text-blue-800">Versión {version.version_number}</span>
                    <span className="mt-1 block text-xs text-slate-500">{new Date(version.created_at).toLocaleString("es-EC")}</span>
                    <span className="mt-2 block line-clamp-3 text-xs leading-5 text-slate-600">{version.content}</span>
                  </button>
                ))}
              </div>
            </aside>
          </div>
        </section>
      </div>,
      document.body,
    ) : null}
    {printMessage && printData && typeof document !== "undefined" ? createPortal(<section className={`agent-print-sheet ${hasProAccess ? "agent-print-pro" : "agent-print-free"}`} aria-hidden="true"><header className="agent-print-brand"><img src="/logos/logo-profe-en-movimiento.png" alt="Profe en Movimiento" width="72" height="72" /><div><h1>Profe en Movimiento 5.0</h1><p>{hasProAccess ? "Recurso profesional generado con Agentes IA" : "Versión Free · Recurso generado con Agentes IA"}</p></div></header><h2>{printData.title}</h2><AgentMessageContent content={printData.content} /><footer>Profe en Movimiento 5.0 · {new Date().toLocaleDateString("es-EC")}{!hasProAccess ? " · Plan Free" : ""}</footer></section>, document.body) : null}
  </div>;
}
