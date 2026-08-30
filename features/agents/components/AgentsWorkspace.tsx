"use client";

import Link from "next/link";
import { FormEvent, useMemo, useState } from "react";

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

export default function AgentsWorkspace({ initialConversations, initialMessages, initialConversationId, initialRemaining, monthlyLimit }: { initialConversations: AgentConversation[]; initialMessages: AgentMessage[]; initialConversationId: string | null; initialRemaining: number; monthlyLimit: number }) {
  const [conversations, setConversations] = useState(initialConversations);
  const [conversationId, setConversationId] = useState(initialConversationId);
  const [messages, setMessages] = useState(initialMessages);
  const [message, setMessage] = useState("");
  const [remaining, setRemaining] = useState(initialRemaining);
  const [working, setWorking] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const selectedTitle = useMemo(() => conversations.find((item) => item.id === conversationId)?.title ?? "Nueva conversación", [conversations, conversationId]);

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
        {!messages.length ? <div><div className="rounded-2xl border border-blue-100 bg-white p-6"><h3 className="text-xl font-black text-slate-950">¿Qué necesitas preparar?</h3><p className="mt-2 leading-7 text-slate-600">Describe tu meta. Si faltan datos, el agente te preguntará antes de elaborar el resultado.</p></div><div className="mt-4 grid gap-3 lg:grid-cols-3">{starterPrompts.map((prompt) => <button key={prompt} onClick={() => setMessage(prompt)} className="rounded-2xl border border-slate-200 bg-white p-4 text-left text-sm font-bold leading-6 text-slate-700 hover:border-blue-400">{prompt}</button>)}</div></div> : messages.map((item) => <article key={item.id} className={`rounded-2xl p-5 shadow-sm ${item.role === "user" ? "ml-auto max-w-3xl bg-blue-700 text-white" : "mr-auto max-w-4xl border border-slate-200 bg-white text-slate-700"}`}>
          <p className={`text-xs font-black uppercase tracking-[.14em] ${item.role === "user" ? "text-blue-100" : "text-violet-700"}`}>{item.role === "user" ? "Docente" : specialistLabel[item.specialist ?? "coordinator"]}</p>
          <div className="mt-3 whitespace-pre-wrap text-sm leading-7">{item.content}</div>
          {item.role === "assistant" ? <button onClick={() => void saveResult(item.id)} disabled={Boolean(item.saved_at)} className="mt-4 rounded-xl border border-emerald-300 bg-emerald-50 px-4 py-2 text-xs font-black text-emerald-800 disabled:opacity-70">{item.saved_at ? "✓ Resultado guardado" : "Guardar resultado"}</button> : null}
        </article>)}
        {working ? <div className="mr-auto max-w-md rounded-2xl border border-violet-200 bg-white p-5 font-bold text-violet-800 shadow-sm" aria-live="polite">Los agentes están analizando y revisando la solicitud…</div> : null}
      </div>
      <form onSubmit={submit} className="border-t border-slate-200 bg-white p-5"><label htmlFor="agent-message" className="text-sm font-black text-slate-900">Solicitud para el Coordinador</label><textarea id="agent-message" value={message} onChange={(event) => setMessage(event.target.value)} maxLength={6000} rows={4} className="mt-2 w-full rounded-2xl border border-slate-300 p-4 leading-7 outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100" placeholder="Ejemplo: necesito una clase de 45 minutos para 40 estudiantes…" />{error ? <p className="mt-3 rounded-xl bg-red-50 p-3 text-sm font-bold text-red-700">{error}</p> : null}<div className="mt-3 flex flex-wrap items-center justify-between gap-3"><p className="text-xs font-semibold text-slate-500">No incluyas nombres ni información personal de estudiantes.</p><button disabled={working || !message.trim() || remaining <= 0} className="min-h-11 rounded-xl bg-blue-700 px-6 font-black text-white disabled:cursor-not-allowed disabled:opacity-40">{working ? "Coordinando…" : "Enviar al Coordinador →"}</button></div></form>
    </section>
  </div>;
}
