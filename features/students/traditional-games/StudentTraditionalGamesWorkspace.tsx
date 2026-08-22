"use client";

import { FormEvent, useState } from "react";
import Image from "next/image";
import Link from "next/link";

import type {
  StudentTraditionalGamesApiResponse,
  StudentTraditionalGamesResult,
} from "@/features/students/traditional-games/types";

interface StudentTraditionalGamesWorkspaceProps {
  initialRemaining: number;
  isTeacher: boolean;
}

const examples = [
  { country: "Ecuador", region: "Región Costa" },
  { country: "Ecuador", region: "Región Sierra" },
  { country: "México", region: "" },
];

function NumberedList({ items }: { items: string[] }) {
  return <ol className="mt-3 space-y-2 text-sm leading-6 text-slate-700">{items.map((item, index) => <li key={`${index}-${item}`} className="flex gap-3"><span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-xs font-black text-emerald-800">{index + 1}</span><span>{item}</span></li>)}</ol>;
}

function BulletList({ items, color = "text-emerald-700" }: { items: string[]; color?: string }) {
  return <ul className="mt-3 space-y-2 text-sm leading-6 text-slate-700">{items.map((item) => <li key={item} className="flex gap-2"><span className={`font-black ${color}`}>✓</span><span>{item}</span></li>)}</ul>;
}

export default function StudentTraditionalGamesWorkspace({ initialRemaining, isTeacher }: StudentTraditionalGamesWorkspaceProps) {
  const [country, setCountry] = useState("");
  const [region, setRegion] = useState("");
  const [remaining, setRemaining] = useState(initialRemaining);
  const [result, setResult] = useState<StudentTraditionalGamesResult | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (loading) return;
    setError("");
    setResult(null);
    setLoading(true);

    try {
      const request = await fetch("/api/students/traditional-games/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ country, region }),
      });
      const data = await request.json() as StudentTraditionalGamesApiResponse;
      if (!request.ok || !data.success || !data.result) {
        throw new Error(data.error || "No pudimos crear la guía.");
      }
      setResult(data.result);
      if (typeof data.remaining === "number") setRemaining(data.remaining);
      window.setTimeout(() => document.getElementById("resultado-juegos-tradicionales")?.scrollIntoView({ behavior: "smooth" }), 80);
    } catch (caughtError) {
      setError(caughtError instanceof Error ? caughtError.message : "No pudimos crear la guía.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-8">
      <section className="student-traditional-controls rounded-[2rem] border border-emerald-200 bg-white p-6 shadow-sm sm:p-8">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.18em] text-teal-700">Tu viaje cultural</p>
            <h2 className="mt-2 text-3xl font-black tracking-tight">¿A qué lugar quieres viajar jugando?</h2>
            <p className="mt-3 max-w-3xl leading-7 text-slate-600">Escribe el país y, si buscas una tradición más cercana, añade la región, provincia o localidad.</p>
          </div>
          <div className="rounded-2xl border border-cyan-100 bg-gradient-to-br from-emerald-50 to-cyan-50 px-5 py-4 text-center text-emerald-900 shadow-inner">
            <p className="text-xs font-black uppercase tracking-wider">{isTeacher ? "Vista docente" : "Energía disponible"}</p>
            <p className="mt-1 text-2xl font-black">{isTeacher ? "Sin consumo" : `${remaining} de 10`}</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="mt-7 grid gap-5 md:grid-cols-2">
          <div>
            <label htmlFor="traditional-country" className="text-sm font-black text-slate-900">País <span className="text-red-600">*</span></label>
            <input id="traditional-country" value={country} onChange={(event) => setCountry(event.target.value)} minLength={2} maxLength={60} required placeholder="Ejemplo: Ecuador" className="mt-2 w-full rounded-2xl border border-slate-300 px-4 py-3.5 text-base outline-none transition focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100" />
          </div>
          <div>
            <label htmlFor="traditional-region" className="text-sm font-black text-slate-900">Región, provincia o localidad <span className="font-medium text-slate-400">(opcional)</span></label>
            <input id="traditional-region" value={region} onChange={(event) => setRegion(event.target.value)} maxLength={80} placeholder="Ejemplo: Región Costa" className="mt-2 w-full rounded-2xl border border-slate-300 px-4 py-3.5 text-base outline-none transition focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100" />
          </div>
          <div className="md:col-span-2">
            <div className="flex flex-wrap gap-2">
              {examples.map((example) => <button key={`${example.country}-${example.region}`} type="button" onClick={() => { setCountry(example.country); setRegion(example.region); }} className="rounded-full border border-emerald-200 bg-emerald-50 px-3 py-2 text-xs font-bold text-emerald-900 hover:bg-emerald-100">{example.country}{example.region ? ` · ${example.region}` : ""}</button>)}
            </div>
            {error ? <p role="alert" className="mt-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-800">{error}</p> : null}
            <div className="mt-6 flex flex-wrap items-center gap-4">
              <button type="submit" disabled={loading || (!isTeacher && remaining <= 0)} className="rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-500 px-6 py-3.5 font-black text-white shadow-lg transition hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-50">{loading ? "Viajando…" : "¡Descubrir juegos!"}</button>
              <p className="text-sm text-slate-500">{isTeacher ? "Las vistas docentes no descuentan investigaciones." : "Se descontará 1 investigación únicamente si la guía se genera correctamente."}</p>
            </div>
          </div>
        </form>
      </section>

      {loading ? <section className="student-traditional-controls relative overflow-hidden rounded-3xl border border-emerald-100 bg-gradient-to-br from-emerald-50 via-white to-cyan-50 p-10 text-center shadow-sm" aria-live="polite"><div className="absolute left-10 top-8 h-3 w-3 animate-pulse rounded-full bg-orange-400" aria-hidden="true" /><div className="absolute right-12 top-16 h-4 w-4 animate-pulse rounded-full bg-cyan-400" aria-hidden="true" /><div className="relative mx-auto h-32 w-32 animate-pulse" aria-hidden="true"><div className="absolute inset-5 rounded-full bg-emerald-100" /><Image src="/images/profe-ia-robot.png" alt="" width={220} height={280} className="relative z-10 h-full w-full object-contain" /></div><p className="mt-4 text-xs font-black uppercase tracking-[0.18em] text-teal-700">Viaje en progreso</p><h2 className="mt-2 text-2xl font-black">Juegos de mi Tierra está explorando…</h2><p className="mx-auto mt-2 max-w-xl text-sm leading-6 text-slate-600">El robot está reuniendo juegos del lugar elegido y preparando reglas seguras para tu curso.</p></section> : null}

      {result ? <section id="resultado-juegos-tradicionales" className="space-y-5">
        <div className="student-traditional-controls flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"><div><p className="text-xs font-black uppercase tracking-[0.18em] text-emerald-700">🪁 ¡Viaje completado!</p><p className="mt-1 text-sm text-slate-600">{result.games.length} juegos · adaptados a {result.studentLevel}</p></div><button type="button" onClick={() => window.print()} className="rounded-xl bg-emerald-700 px-5 py-3 text-sm font-black text-white hover:bg-emerald-800">Imprimir o guardar en PDF</button></div>

        <div className="student-traditional-document mx-auto w-full max-w-[210mm] space-y-6">
          <article className="student-traditional-page rounded-2xl border border-slate-200 bg-white p-8 shadow-sm sm:p-10">
            <header className="border-b-4 border-emerald-400 pb-5"><p className="text-xs font-black uppercase tracking-[0.2em] text-emerald-700">Juegos de mi Tierra · {result.locationLabel}</p><h1 className="mt-4 text-4xl font-black tracking-tight text-slate-950">{result.title}</h1><p className="mt-3 text-lg font-semibold text-slate-600">{result.subtitle}</p></header>
            <div className="mt-6 rounded-2xl bg-gradient-to-r from-emerald-50 to-cyan-50 p-5"><h2 className="font-black text-emerald-950">Antes de comenzar</h2><p className="mt-2 text-sm leading-7 text-slate-700">{result.introduction}</p></div>
          </article>

          {result.games.map((game, gameIndex) => <article key={game.name} className="student-traditional-page rounded-2xl border border-slate-200 bg-white p-8 shadow-sm sm:p-10">
            <header className="border-b-4 border-amber-400 pb-5"><p className="text-xs font-black uppercase tracking-[0.2em] text-amber-700">Juego {gameIndex + 1} de {result.games.length} · {game.location}</p><h2 className="mt-3 text-3xl font-black text-slate-950">{game.name}</h2><div className="mt-4 flex flex-wrap gap-2 text-xs font-bold"><span className="rounded-full bg-blue-50 px-3 py-2 text-blue-800">👥 {game.participants}</span><span className="rounded-full bg-orange-50 px-3 py-2 text-orange-800">🎒 {game.materials.join(" · ")}</span></div></header>
            <div className="mt-6 grid gap-5 md:grid-cols-2">
              <section className="break-inside-avoid"><h3 className="font-black text-blue-950">🎯 Objetivo</h3><p className="mt-2 text-sm leading-6 text-slate-700">{game.objective}</p></section>
              <section className="break-inside-avoid"><h3 className="font-black text-blue-950">📍 Preparación</h3><p className="mt-2 text-sm leading-6 text-slate-700">{game.preparation}</p></section>
              <section className="break-inside-avoid"><h3 className="font-black text-emerald-950">▶️ Cómo se juega</h3><NumberedList items={game.steps} /></section>
              <section className="break-inside-avoid"><h3 className="font-black text-emerald-950">📋 Reglas principales</h3><BulletList items={game.rules} /></section>
              <section className="break-inside-avoid rounded-2xl bg-amber-50 p-4"><h3 className="font-black text-amber-950">🛡️ Juguemos con seguridad</h3><BulletList items={game.safety} color="text-amber-700" /></section>
              <section className="break-inside-avoid rounded-2xl bg-cyan-50 p-4"><h3 className="font-black text-cyan-950">🤝 Adaptación para todos</h3><p className="mt-2 text-sm leading-6 text-slate-700">{game.inclusiveAdaptation}</p></section>
            </div>
            <section className="mt-5 break-inside-avoid rounded-2xl border border-violet-100 bg-violet-50 p-4"><h3 className="font-black text-violet-950">🌎 Huella cultural</h3><p className="mt-2 text-sm leading-6 text-slate-700">{game.culturalNote}</p></section>
          </article>)}

          <article className="student-traditional-page rounded-2xl border border-slate-200 bg-white p-8 shadow-sm sm:p-10"><header className="border-b-4 border-cyan-400 pb-5"><p className="text-xs font-black uppercase tracking-[0.2em] text-cyan-700">Cierre de la misión</p><h2 className="mt-3 text-3xl font-black text-slate-950">Lo que aprendimos jugando</h2></header><section className="mt-6 rounded-2xl bg-emerald-50 p-5"><h3 className="font-black text-emerald-950">Ideas clave</h3><BulletList items={result.keyIdeas} /></section><section className="mt-5 rounded-2xl bg-amber-50 p-5"><h3 className="font-black text-amber-950">Para reflexionar</h3><p className="mt-2 text-sm leading-6 text-slate-700">{result.reflectionQuestion}</p></section><footer className="mt-8 border-t border-slate-200 pt-4 text-center text-xs font-semibold text-slate-400">Profe en Movimiento 5.0 · Recurso educativo estudiantil</footer></article>
        </div>

        <div className="student-traditional-controls flex flex-wrap items-center justify-center gap-3 rounded-3xl border border-emerald-100 bg-gradient-to-r from-emerald-50 to-cyan-50 p-6"><button type="button" onClick={() => window.print()} className="rounded-xl bg-emerald-700 px-5 py-3 text-sm font-black text-white shadow-sm hover:bg-emerald-800">🖨️ Imprimir o guardar en PDF</button><button type="button" onClick={() => { setResult(null); setCountry(""); setRegion(""); window.scrollTo({ top: 0, behavior: "smooth" }); }} className="rounded-xl border border-orange-300 bg-white px-5 py-3 text-sm font-black text-orange-700 hover:bg-orange-50">🪁 Explorar otro lugar</button><Link href="/estudiantes" className="rounded-xl border border-slate-300 bg-white px-5 py-3 text-sm font-black text-slate-700 hover:bg-slate-50">← Volver al espacio estudiantil</Link></div>
      </section> : null}
    </div>
  );
}
