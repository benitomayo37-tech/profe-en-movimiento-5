"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";

import type { AgentConversation, AgentMessage, AgentSpecialist } from "@/features/agents/types";

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
  { text: "Adapta una actividad mediante DUA y apoyos NEE sin cambiar el objetivo.", pro: false },
  { text: "Diseña un microciclo de entrenamiento deportivo con carga y recuperación progresivas.", pro: false },
  { text: "Diseña un mesociclo deportivo de cuatro semanas con progresión de cargas.", pro: true },
  { text: "Diseña un macrociclo con periodos preparatorio, competitivo y de transición.", pro: true },
];

function duaLineClass(line: string): string {
  const normalized = line.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().replace(/^[-*#\s]+/, "");
  const trimmed = line.trimStart();

  if (trimmed.startsWith("🟢") || normalized.startsWith("compromiso") || normalized.startsWith("proporcionar multiples formas de compromiso")) {
    return "agent-dua-compromiso";
  }

  if (trimmed.startsWith("🔵") || normalized.startsWith("representacion") || normalized.startsWith("proporcionar multiples formas de representacion")) {
    return "agent-dua-representacion";
  }

  if (trimmed.startsWith("🟣") || normalized.startsWith("accion y expresion") || normalized.startsWith("proporcionar multiples formas de accion y expresion")) {
    return "agent-dua-accion-expresion";
  }

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
  const title = titleIndex >= 0 ? lines[titleIndex].replace(/^#{1,6}\s+/, "").trim() : fallbackTitle.length > 90 ? "Plan de entrenamiento deportivo" : fallbackTitle;
  const withoutTitle = titleIndex >= 0 ? lines.filter((_, index) => index !== titleIndex) : lines;
  const processStart = withoutTitle.findIndex((line) => /^(especialista consultado|resumen del aporte|revisión del docente|revisión del entrenador)/i.test(line.replace(/^#{1,6}\s+/, "").trim()));
  const printableLines = (processStart >= 0 ? withoutTitle.slice(0, processStart) : withoutTitle).filter((line) => !/^(especialistas consultados|decisión final y responsabilidad|(?:[-*]\s*)?supuestos?(?:\s+(?:breves?|pedagógicos?))?\b)/i.test(line.replace(/^#{1,6}\s+/, "").trim()));
  return { title, content: printableLines.join("\n").trim() };
}

function AgentMessageContent({ content }: { content: string }) {
  const lines = content.split("\n");
  const blocks = [];

  for (let index = 0; index < lines.length;) {
    const line = lines[index];
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

export default function AgentsWorkspace({ initialConversations, initialMessages, initialConversationId, initialRemaining, monthlyLimit, hasProAccess }: { initialConversations: AgentConversation[]; initialMessages: AgentMessage[]; initialConversationId: string | null; initialRemaining: number; monthlyLimit: number; hasProAccess: boolean }) {
  const [conversations, setConversations] = useState(initialConversations);
  const [conversationId, setConversationId] = useState(initialConversationId);
  const [messages, setMessages] = useState(initialMessages);
  const [message, setMessage] = useState("");
  const [remaining, setRemaining] = useState(initialRemaining);
  const [working, setWorking] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [upgradeRequired, setUpgradeRequired] = useState(false);
  const [showPrevious, setShowPrevious] = useState(false);
  const [printMessage, setPrintMessage] = useState<AgentMessage | null>(null);

  const selectedTitle = useMemo(() => conversations.find((item) => item.id === conversationId)?.title ?? "Nueva conversación", [conversations, conversationId]);
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

  async function saveResult(id: string) {
    const request = await fetch("/api/agents/save", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id }) });
    const payload = await request.json();
    if (request.ok && payload.success) setMessages((current) => current.map((item) => item.id === id ? { ...item, saved_at: payload.savedAt } : item));
  }

  return <div className="grid gap-6 xl:grid-cols-[290px_minmax(0,1fr)]">
    <aside className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
      <a href="/agentes" className="flex min-h-11 items-center justify-center rounded-xl bg-slate-950 px-4 font-black text-white">+ Nueva conversación</a>
      <p className="mt-6 text-xs font-black uppercase tracking-[.16em] text-blue-700">Conversaciones</p>
      <div className="mt-3 space-y-2">{conversations.map((item) => <a key={item.id} href={`/agentes?conversation=${item.id}`} className={`block rounded-xl border p-3 text-sm font-bold leading-5 ${item.id === conversationId ? "border-blue-500 bg-blue-50 text-blue-900" : "border-slate-200 text-slate-600 hover:bg-slate-50"}`}>{item.title}</a>)}{!conversations.length ? <p className="rounded-xl border border-dashed border-slate-300 p-4 text-sm text-slate-500">Todavía no hay conversaciones.</p> : null}</div>
      {!hasProAccess && conversations.length >= 3 ? <p className="mt-3 text-xs leading-5 text-slate-500">Plan Free muestra las 3 conversaciones más recientes. Tu historial completo se conserva al activar Pro.</p> : null}
      <div className="mt-6 rounded-2xl bg-violet-50 p-4"><div className="flex items-center justify-between gap-2"><p className="text-xs font-black uppercase tracking-wide text-violet-700">Uso mensual</p><span className="rounded-full bg-white px-2 py-1 text-[10px] font-black uppercase text-violet-800">{hasProAccess ? "Pro" : "Free"}</span></div><p className="mt-2 text-2xl font-black text-slate-950">{remaining} disponibles</p><p className="mt-1 text-xs text-slate-500">Límite actual: {monthlyLimit} ejecuciones.</p>{!hasProAccess ? <a href="/store/plan-pro-mensual" className="mt-3 inline-flex text-xs font-black text-blue-700 hover:text-blue-900">Conocer el Plan Pro →</a> : null}</div>
    </aside>

    <section className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
      <header className="border-b border-slate-200 bg-gradient-to-r from-blue-950 to-violet-900 p-6 text-white"><p className="text-xs font-black uppercase tracking-[.18em] text-orange-300">Coordinación multiagente</p><h2 className="mt-2 text-2xl font-black">{selectedTitle}</h2><p className="mt-2 text-sm text-blue-100">El Coordinador consulta al especialista adecuado y tú apruebas cada resultado.</p></header>
      <div className="min-h-[420px] space-y-5 bg-slate-50 p-5 sm:p-7">
        {!messages.length ? <div><div className="rounded-2xl border border-blue-100 bg-white p-6"><h3 className="text-xl font-black text-slate-950">¿Qué necesitas preparar?</h3><p className="mt-2 leading-7 text-slate-600">Describe tu meta. Si faltan datos, el agente te preguntará antes de elaborar el resultado.</p></div><div className="mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-3">{starterPrompts.map((prompt) => prompt.pro && !hasProAccess ? <a key={prompt.text} href="/store/plan-pro-mensual" className="relative rounded-2xl border border-amber-200 bg-amber-50 p-4 text-left text-sm font-bold leading-6 text-slate-700 hover:border-amber-400"><span className="agent-pro-lock-badge absolute right-3 top-3 rounded-full px-2 py-1 text-[10px] font-black uppercase">Pro</span><span className="block pr-10">{prompt.text}</span><span className="agent-upgrade-link mt-2 block text-xs font-black">Activar Plan Pro →</span></a> : <button key={prompt.text} onClick={() => setMessage(prompt.text)} className="relative rounded-2xl border border-slate-200 bg-white p-4 text-left text-sm font-bold leading-6 text-slate-700 hover:border-blue-400">{prompt.pro ? <span className="agent-pro-active-badge absolute right-3 top-3 rounded-full px-2 py-1 text-[10px] font-black uppercase">Pro</span> : null}<span className={prompt.pro ? "block pr-10" : "block"}>{prompt.text}</span></button>)}</div></div> : <>{hiddenMessageCount > 0 ? <button type="button" onClick={() => setShowPrevious((current) => !current)} className="mx-auto block rounded-full border border-slate-300 bg-white px-4 py-2 text-xs font-black text-slate-700 shadow-sm hover:bg-slate-100">{showPrevious ? "Ocultar mensajes anteriores" : `Ver ${hiddenMessageCount} mensajes anteriores`}</button> : null}{visibleMessages.map((item) => <article key={item.id} className={`rounded-2xl p-5 shadow-sm ${item.role === "user" ? "ml-auto max-w-3xl bg-blue-700 text-white" : "mr-auto max-w-4xl border border-slate-200 bg-white text-slate-700"}`}>
          <p className={`text-xs font-black uppercase tracking-[.14em] ${item.role === "user" ? "text-blue-100" : "text-violet-700"}`}>{item.role === "user" ? "Docente" : specialistLabel[item.specialist ?? "coordinator"]}</p>
          <AgentMessageContent content={item.content} />
          {item.role === "assistant" ? <div className="mt-4 flex flex-wrap gap-2"><button onClick={() => void saveResult(item.id)} disabled={Boolean(item.saved_at)} className="rounded-xl border border-emerald-300 bg-emerald-50 px-4 py-2 text-xs font-black text-emerald-800 disabled:opacity-70">{item.saved_at ? "✓ Resultado guardado" : "Guardar resultado"}</button><button type="button" onClick={() => setPrintMessage(item)} className="rounded-xl border border-blue-300 bg-blue-50 px-4 py-2 text-xs font-black text-blue-800">Imprimir o guardar en PDF</button></div> : null}
        </article>)}</>}
        {working ? <div className="mr-auto max-w-md rounded-2xl border border-violet-200 bg-white p-5 font-bold text-violet-800 shadow-sm" aria-live="polite">Los agentes están analizando y revisando la solicitud…</div> : null}
      </div>
      <form onSubmit={submit} className="border-t border-slate-200 bg-white p-5"><label htmlFor="agent-message" className="text-sm font-black text-slate-900">Solicitud para el Coordinador</label><textarea id="agent-message" value={message} onChange={(event) => setMessage(event.target.value)} maxLength={6000} rows={4} className="mt-2 w-full rounded-2xl border border-slate-300 p-4 leading-7 outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100" placeholder="Ejemplo: necesito una clase de 45 minutos para 40 estudiantes…" />{error ? <div className="mt-3 rounded-xl bg-red-50 p-3 text-sm font-bold text-red-700"><p>{error}</p>{upgradeRequired ? <a href="/store/plan-pro-mensual" className="mt-2 inline-flex rounded-lg bg-amber-300 px-3 py-2 text-xs font-black text-amber-950">Ver Plan Pro →</a> : null}</div> : null}<div className="mt-3 flex flex-wrap items-center justify-between gap-3"><p className="text-xs font-semibold text-slate-500">No incluyas nombres ni información personal de estudiantes.</p><button disabled={working || !message.trim() || remaining <= 0} className="min-h-11 rounded-xl bg-blue-700 px-6 font-black text-white disabled:cursor-not-allowed disabled:opacity-40">{working ? "Coordinando…" : "Enviar al Coordinador →"}</button></div></form>
    </section>
    {printMessage && printData && typeof document !== "undefined" ? createPortal(<section className={`agent-print-sheet ${hasProAccess ? "agent-print-pro" : "agent-print-free"}`} aria-hidden="true"><header className="agent-print-brand"><img src="/logos/logo-profe-en-movimiento.png" alt="Profe en Movimiento" width="72" height="72" /><div><h1>Profe en Movimiento 5.0</h1><p>{hasProAccess ? "Recurso profesional generado con Agentes IA" : "Versión Free · Recurso generado con Agentes IA"}</p></div></header><h2>{printData.title}</h2><AgentMessageContent content={printData.content} /><footer>Profe en Movimiento 5.0 · {new Date().toLocaleDateString("es-EC")}{!hasProAccess ? " · Plan Free" : ""}</footer></section>, document.body) : null}
  </div>;
}
