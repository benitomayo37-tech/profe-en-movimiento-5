"use client";

import { FormEvent, useState } from "react";
import Image from "next/image";
import Link from "next/link";

import type { StudentHistoryApiResponse, StudentHistoryResult } from "@/features/students/history/types";

interface StudentHistoryWorkspaceProps {
  initialRemaining: number;
  isTeacher: boolean;
}

const examples = [
  "Historia de los Juegos Olímpicos",
  "Origen y evolución del baloncesto",
  "Historia de la Copa Mundial de Fútbol",
];

const reservedFinalSectionTitles = new Set([
  "ideas clave",
  "idea clave",
  "para reflexionar",
  "reflexion final",
  "pregunta de reflexion",
]);

function normalizeSectionTitle(title: string) {
  return title
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLocaleLowerCase("es")
    .replace(/[^a-z0-9\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function isReservedFinalSection(title: string) {
  return reservedFinalSectionTitles.has(normalizeSectionTitle(title));
}

export default function StudentHistoryWorkspace({ initialRemaining, isTeacher }: StudentHistoryWorkspaceProps) {
  const [topic, setTopic] = useState("");
  const [remaining, setRemaining] = useState(initialRemaining);
  const [result, setResult] = useState<StudentHistoryResult | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (loading) return;
    setError("");
    setResult(null);
    setLoading(true);

    try {
      const request = await fetch("/api/students/history/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ topic }),
      });
      const data = await request.json() as StudentHistoryApiResponse;
      if (!request.ok || !data.success || !data.result) throw new Error(data.error || "No pudimos crear la investigación.");
      setResult(data.result);
      if (typeof data.remaining === "number") setRemaining(data.remaining);
      window.setTimeout(() => document.getElementById("resultado-historia")?.scrollIntoView({ behavior: "smooth" }), 80);
    } catch (caughtError) {
      setError(caughtError instanceof Error ? caughtError.message : "No pudimos crear la investigación.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-8">
      <section className="student-history-controls rounded-[2rem] border border-amber-200 bg-white p-6 shadow-sm sm:p-8">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.18em] text-orange-600">Tu reto histórico</p>
            <h2 className="mt-2 text-3xl font-black tracking-tight">¿Qué quieres investigar hoy?</h2>
            <p className="mt-3 max-w-3xl leading-7 text-slate-600">Escribe un deporte, evento o competencia. Recibirás un resumen histórico adaptado a tu curso y listo para imprimir.</p>
          </div>
          <div className="rounded-2xl border border-cyan-100 bg-gradient-to-br from-emerald-50 to-cyan-50 px-5 py-4 text-center text-emerald-900 shadow-inner">
            <p className="text-xs font-black uppercase tracking-wider">{isTeacher ? "Vista docente" : "Energía disponible"}</p>
            <p className="mt-1 text-2xl font-black">{isTeacher ? "Sin consumo" : `${remaining} de 10`}</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="mt-7">
          <label htmlFor="history-topic" className="text-sm font-black text-slate-900">Tema histórico</label>
          <textarea
            id="history-topic"
            value={topic}
            onChange={(event) => setTopic(event.target.value)}
            minLength={5}
            maxLength={160}
            required
            rows={3}
            placeholder="Ejemplo: Historia de los Juegos Olímpicos"
            className="mt-2 w-full resize-y rounded-2xl border border-slate-300 px-4 py-3 text-base outline-none transition focus:border-amber-500 focus:ring-4 focus:ring-amber-100"
          />
          <div className="mt-3 flex flex-wrap gap-2">
            {examples.map((example) => (
              <button key={example} type="button" onClick={() => setTopic(example)} className="rounded-full border border-amber-200 bg-amber-50 px-3 py-2 text-xs font-bold text-amber-900 hover:bg-amber-100">{example}</button>
            ))}
          </div>
          {error ? <p role="alert" className="mt-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-800">{error}</p> : null}
          <div className="mt-6 flex flex-wrap items-center gap-4">
            <button type="submit" disabled={loading || (!isTeacher && remaining <= 0)} className="rounded-2xl bg-gradient-to-r from-amber-500 to-orange-500 px-6 py-3.5 font-black text-white shadow-lg transition hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-50">
              {loading ? "Investigando…" : "¡Comenzar investigación!"}
            </button>
            <p className="text-sm text-slate-500">{isTeacher ? "Las vistas docentes no descuentan investigaciones." : "Se descontará 1 investigación únicamente si el contenido se genera correctamente."}</p>
          </div>
        </form>
      </section>

      {loading ? (
        <section className="student-history-controls relative overflow-hidden rounded-3xl border border-cyan-100 bg-gradient-to-br from-blue-50 via-white to-amber-50 p-10 text-center shadow-sm" aria-live="polite">
          <div className="absolute left-10 top-8 h-3 w-3 animate-pulse rounded-full bg-orange-400" aria-hidden="true" /><div className="absolute right-12 top-16 h-4 w-4 animate-pulse rounded-full bg-cyan-400" aria-hidden="true" />
          <div className="relative mx-auto h-32 w-32 animate-pulse" aria-hidden="true"><div className="absolute inset-5 rounded-full bg-cyan-100" /><Image src="/images/profe-ia-robot.png" alt="" width={220} height={280} className="relative z-10 h-full w-full object-contain" /></div>
          <p className="mt-4 text-xs font-black uppercase tracking-[0.18em] text-orange-600">Misión en progreso</p>
          <h2 className="mt-2 text-2xl font-black">Historia en Movimiento está investigando…</h2>
          <p className="mx-auto mt-2 max-w-xl text-sm leading-6 text-slate-600">El robot está organizando los hechos y adaptando la explicación a tu nivel. ¡Enseguida estará lista!</p>
        </section>
      ) : null}

      {result ? (
        <section id="resultado-historia" className="space-y-5">
          <div className="student-history-controls flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div><p className="text-xs font-black uppercase tracking-[0.18em] text-emerald-700">🏆 ¡Misión completada!</p><p className="mt-1 text-sm text-slate-600">{result.pages.length} páginas · adaptada a {result.studentLevel}</p></div>
            <button type="button" onClick={() => window.print()} className="rounded-xl bg-blue-700 px-5 py-3 text-sm font-black text-white hover:bg-blue-800">Imprimir o guardar en PDF</button>
          </div>

          <div className="student-history-document space-y-6">
            {result.pages.map((page, pageIndex) => (
              <article key={page.pageNumber} className="student-history-page mx-auto min-h-[270mm] w-full max-w-[210mm] rounded-2xl border border-slate-200 bg-white p-8 shadow-sm sm:p-12">
                <header className="border-b-4 border-amber-400 pb-5">
                  <p className="text-xs font-black uppercase tracking-[0.2em] text-amber-700">Historia en Movimiento · Página {page.pageNumber} de {result.pages.length}</p>
                  {pageIndex === 0 ? <><h1 className="mt-4 text-4xl font-black tracking-tight text-slate-950">{result.title}</h1><p className="mt-3 text-lg font-semibold text-slate-600">{result.subtitle}</p></> : null}
                  <h2 className={`${pageIndex === 0 ? "mt-6" : "mt-4"} text-2xl font-black text-slate-900`}>{page.heading}</h2>
                </header>
                <div className="mt-7 space-y-6">
                  {page.blocks.filter((block) => !isReservedFinalSection(block.title)).map((block) => (
                    <section key={block.title} className="break-inside-avoid">
                      <h3 className="text-lg font-black text-blue-900">{block.title}</h3>
                      <p className="mt-2 whitespace-pre-line text-[15px] leading-7 text-slate-700">{block.content}</p>
                    </section>
                  ))}
                </div>
                {pageIndex === result.pages.length - 1 ? (
                  <div className="mt-8 space-y-5 border-t border-slate-200 pt-6">
                    <section className="break-inside-avoid rounded-2xl bg-blue-50 p-5"><h3 className="font-black text-blue-950">Ideas clave</h3><ul className="mt-3 space-y-2 text-sm leading-6 text-slate-700">{result.keyIdeas.map((idea) => <li key={idea} className="flex gap-2"><span className="font-black text-blue-700">✓</span><span>{idea}</span></li>)}</ul></section>
                    <section className="break-inside-avoid rounded-2xl bg-amber-50 p-5"><h3 className="font-black text-amber-950">Para reflexionar</h3><p className="mt-2 text-sm leading-6 text-slate-700">{result.reflectionQuestion}</p></section>
                  </div>
                ) : null}
                <footer className="mt-8 border-t border-slate-200 pt-4 text-center text-xs font-semibold text-slate-400">Profe en Movimiento 5.0 · Recurso educativo estudiantil</footer>
              </article>
            ))}
          </div>
          <div className="student-history-controls flex flex-wrap items-center justify-center gap-3 rounded-3xl border border-blue-100 bg-gradient-to-r from-blue-50 to-cyan-50 p-6">
            <button type="button" onClick={() => window.print()} className="rounded-xl bg-blue-700 px-5 py-3 text-sm font-black text-white shadow-sm hover:bg-blue-800">🖨️ Imprimir o guardar en PDF</button>
            <button type="button" onClick={() => { setResult(null); setTopic(""); window.scrollTo({ top: 0, behavior: "smooth" }); }} className="rounded-xl border border-orange-300 bg-white px-5 py-3 text-sm font-black text-orange-700 hover:bg-orange-50">🔎 Realizar otra investigación</button>
            <Link href="/estudiantes" className="rounded-xl border border-slate-300 bg-white px-5 py-3 text-sm font-black text-slate-700 hover:bg-slate-50">← Volver al espacio estudiantil</Link>
          </div>
        </section>
      ) : null}
    </div>
  );
}
