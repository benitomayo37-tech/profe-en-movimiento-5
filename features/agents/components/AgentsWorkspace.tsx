"use client";

import Link from "next/link";
import Image from "next/image";
import { FormEvent, useEffect, useMemo, useState } from "react";

import type { AgentConversation, AgentMessage, AgentSpecialist } from "@/features/agents/types";

const specialistLabel: Record<AgentSpecialist, string> = {
  coordinator: "Coordinador Docente",
  planning: "Agente de Planificación",
  assessment: "Agente de Evaluación",
  inclusion: "Agente de Inclusión",
};

const starterPrompts = [
  "Diseña una clase de 45 minutos con 40 estudiantes y 4 balones.",
  "Crea una rúbrica con criterios observables para evaluar pases de baloncesto.",
  "Adapta una actividad mediante DUA y apoyos NEE sin cambiar el objetivo.",
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

function AgentMessageContent({ content }: { content: string }) {
  const lines = content.split("\n");
  const blocks = [];

  for (let index = 0; index < lines.length;) {
    const line = lines[index];
    if (line.includes("|") && index + 1 < lines.length && isTableSeparator(lines[index + 1])) {
      const headers = tableCells(line);
      const rows: string[][] = [];
      index += 2;
      while (index < lines.length && lines[index].includes("|") && lines[index].trim()) {
        rows.push(tableCells(lines[index]));
        index += 1;
      }
      blocks.push(<div key={`table-${index}`} className="agent-rubric-wrap my-4 overflow-x-auto rounded-xl border"><table className="agent-rubric-table min-w-[900px] w-full border-collapse text-left text-xs leading-5"><thead><tr>{headers.map((header, cellIndex) => <th key={cellIndex} className="px-3 py-2 font-black">{header}</th>)}</tr></thead><tbody>{rows.map((row, rowIndex) => <tr key={rowIndex}>{headers.map((_, cellIndex) => <td key={cellIndex} className="px-3 py-2 align-top">{row[cellIndex] ?? ""}</td>)}</tr>)}</tbody></table></div>);
      continue;
    }

    const duaClass = duaLineClass(line);
    blocks.push(!line ? <div key={index} className="h-3" aria-hidden="true" /> : <div key={index} className={duaClass ? `my-1 rounded-xl border px-3 py-2 font-semibold ${duaClass}` : "whitespace-pre-wrap"}>{line}</div>);
    index += 1;
  }

  return <div className="mt-3 text-sm leading-7">{blocks}</div>;
}

export default function AgentsWorkspace({ initialConversations, initialMessages, initialConversationId, initialRemaining, monthlyLimit }: { initialConversations: AgentConversation[]; initialMessages: AgentMessage[]; initialConversationId: string | null; initialRemaining: number; monthlyLimit: number }) {
  const [conversations, setConversations] = useState(initialConversations);
  const [conversationId, setConversationId] = useState(initialConversationId);
  const [messages, setMessages] = useState(initialMessages);
  const [message, setMessage] = useState("");
  const [remaining, setRemaining] = useState(initialRemaining);
  const [working, setWorking] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showPrevious, setShowPrevious] = useState(false);
  const [printMessage, setPrintMessage] = useState<AgentMessage | null>(null);

  const selectedTitle = useMemo(() => conversations.find((item) => item.id === conversationId)?.title ?? "Nueva conversación", [conversations, conversationId]);
  const hiddenMessageCount = Math.max(0, messages.length - 2);
  const visibleMessages = showPrevious ? messages : messages.slice(-2);

  useEffect(() => {
    if (!printMessage) return;
    let timer: number | undefined;
    const finishPrinting = () => setPrintMessage(null);
    const frame = window.requestAnimationFrame(() => {
      timer = window.setTimeout(() => window.print(), 150);
    });
    window.addEventListener("afterprint", finishPrinting, { once: true });
    return () => {
      window.cancelAnimationFrame(frame);
      if (timer) window.clearTimeout(timer);
      window.removeEventListener("afterprint", finishPrinting);
    };
  }, [printMessage]);

  async function submit(event: FormEvent) {
    event.preventDefault();
    const clean = message.trim();
    if (!clean || working) return;
    setWorking(true); setError(null);
    try {
      const request = await fetch("/api/agents/run", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ conversationId, message: clean }) });
      const payload = await request.json();
      if (!request.ok || !payload.success) throw new Error(payload.message || "No se pudo generar la respuesta.");
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
      <Link href="/agentes" className="flex min-h-11 items-center justify-center rounded-xl bg-slate-950 px-4 font-black text-white">+ Nueva conversación</Link>
      <p className="mt-6 text-xs font-black uppercase tracking-[.16em] text-blue-700">Conversaciones</p>
      <div className="mt-3 space-y-2">{conversations.map((item) => <Link key={item.id} href={`/agentes?conversation=${item.id}`} className={`block rounded-xl border p-3 text-sm font-bold leading-5 ${item.id === conversationId ? "border-blue-500 bg-blue-50 text-blue-900" : "border-slate-200 text-slate-600 hover:bg-slate-50"}`}>{item.title}</Link>)}{!conversations.length ? <p className="rounded-xl border border-dashed border-slate-300 p-4 text-sm text-slate-500">Todavía no hay conversaciones.</p> : null}</div>
      <div className="mt-6 rounded-2xl bg-violet-50 p-4"><p className="text-xs font-black uppercase tracking-wide text-violet-700">Uso mensual</p><p className="mt-2 text-2xl font-black text-slate-950">{remaining} disponibles</p><p className="mt-1 text-xs text-slate-500">Límite actual: {monthlyLimit} ejecuciones.</p></div>
    </aside>

    <section className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
      <header className="border-b border-slate-200 bg-gradient-to-r from-blue-950 to-violet-900 p-6 text-white"><p className="text-xs font-black uppercase tracking-[.18em] text-orange-300">Coordinación multiagente</p><h2 className="mt-2 text-2xl font-black">{selectedTitle}</h2><p className="mt-2 text-sm text-blue-100">El Coordinador consulta al especialista adecuado y tú apruebas cada resultado.</p></header>
      <div className="min-h-[420px] space-y-5 bg-slate-50 p-5 sm:p-7">
        {!messages.length ? <div><div className="rounded-2xl border border-blue-100 bg-white p-6"><h3 className="text-xl font-black text-slate-950">¿Qué necesitas preparar?</h3><p className="mt-2 leading-7 text-slate-600">Describe tu meta. Si faltan datos, el agente te preguntará antes de elaborar el resultado.</p></div><div className="mt-4 grid gap-3 lg:grid-cols-3">{starterPrompts.map((prompt) => <button key={prompt} onClick={() => setMessage(prompt)} className="rounded-2xl border border-slate-200 bg-white p-4 text-left text-sm font-bold leading-6 text-slate-700 hover:border-blue-400">{prompt}</button>)}</div></div> : <>{hiddenMessageCount > 0 ? <button type="button" onClick={() => setShowPrevious((current) => !current)} className="mx-auto block rounded-full border border-slate-300 bg-white px-4 py-2 text-xs font-black text-slate-700 shadow-sm hover:bg-slate-100">{showPrevious ? "Ocultar mensajes anteriores" : `Ver ${hiddenMessageCount} mensajes anteriores`}</button> : null}{visibleMessages.map((item) => <article key={item.id} className={`rounded-2xl p-5 shadow-sm ${item.role === "user" ? "ml-auto max-w-3xl bg-blue-700 text-white" : "mr-auto max-w-4xl border border-slate-200 bg-white text-slate-700"}`}>
          <p className={`text-xs font-black uppercase tracking-[.14em] ${item.role === "user" ? "text-blue-100" : "text-violet-700"}`}>{item.role === "user" ? "Docente" : specialistLabel[item.specialist ?? "coordinator"]}</p>
          <AgentMessageContent content={item.content} />
          {item.role === "assistant" ? <div className="mt-4 flex flex-wrap gap-2"><button onClick={() => void saveResult(item.id)} disabled={Boolean(item.saved_at)} className="rounded-xl border border-emerald-300 bg-emerald-50 px-4 py-2 text-xs font-black text-emerald-800 disabled:opacity-70">{item.saved_at ? "✓ Resultado guardado" : "Guardar resultado"}</button><button type="button" onClick={() => setPrintMessage(item)} className="rounded-xl border border-blue-300 bg-blue-50 px-4 py-2 text-xs font-black text-blue-800">Imprimir o guardar en PDF</button></div> : null}
        </article>)}</>}
        {working ? <div className="mr-auto max-w-md rounded-2xl border border-violet-200 bg-white p-5 font-bold text-violet-800 shadow-sm" aria-live="polite">Los agentes están analizando y revisando la solicitud…</div> : null}
      </div>
      <form onSubmit={submit} className="border-t border-slate-200 bg-white p-5"><label htmlFor="agent-message" className="text-sm font-black text-slate-900">Solicitud para el Coordinador</label><textarea id="agent-message" value={message} onChange={(event) => setMessage(event.target.value)} maxLength={6000} rows={4} className="mt-2 w-full rounded-2xl border border-slate-300 p-4 leading-7 outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100" placeholder="Ejemplo: necesito una clase de 45 minutos para 40 estudiantes…" />{error ? <p className="mt-3 rounded-xl bg-red-50 p-3 text-sm font-bold text-red-700">{error}</p> : null}<div className="mt-3 flex flex-wrap items-center justify-between gap-3"><p className="text-xs font-semibold text-slate-500">No incluyas nombres ni información personal de estudiantes.</p><button disabled={working || !message.trim() || remaining <= 0} className="min-h-11 rounded-xl bg-blue-700 px-6 font-black text-white disabled:cursor-not-allowed disabled:opacity-40">{working ? "Coordinando…" : "Enviar al Coordinador →"}</button></div></form>
    </section>
    {printMessage ? <section className="agent-print-sheet hidden" aria-hidden="true"><header className="agent-print-brand"><Image src="/logos/logo-profe-en-movimiento.png" alt="Profe en Movimiento" width={72} height={72} /><div><h1>Profe en Movimiento 5.0</h1><p>Resultado del Centro de Agentes IA</p></div></header><h2>{selectedTitle}</h2><AgentMessageContent content={printMessage.content} /><footer>El docente conserva la decisión final · {new Date().toLocaleDateString("es-EC")}</footer></section> : null}
  </div>;
}
