"use client";

import { FormEvent, useState } from "react";
import Image from "next/image";
import Link from "next/link";

import type { StudentSportsApiResponse, StudentSportsFocus, StudentSportsResult } from "@/features/students/sports/types";

interface StudentSportsWorkspaceProps {
  initialRemaining: number;
  isTeacher: boolean;
  studentIdentification: {
    fullName: string;
    institution: string;
    educationLevel: string;
    gradeCourse: string;
    generatedAt: string;
  };
}

const focuses: Array<{ value: StudentSportsFocus; label: string }> = [
  { value: "auto", label: "Detectar automáticamente" },
  { value: "complete", label: "Deporte completo" },
  { value: "technique", label: "Técnica específica" },
  { value: "tactics", label: "Táctica" },
  { value: "rules", label: "Reglamento" },
];

const examples = [
  { label: "Baloncesto completo", topic: "Fundamentos del baloncesto", focus: "complete" as const },
  { label: "Tiro libre", topic: "Técnica del tiro libre en baloncesto", focus: "technique" as const },
  { label: "Fuera de juego en fútbol", topic: "Regla del fuera de juego en fútbol", focus: "rules" as const },
];

export default function StudentSportsWorkspace({ initialRemaining, isTeacher, studentIdentification }: StudentSportsWorkspaceProps) {
  const [topic, setTopic] = useState("");
  const [focus, setFocus] = useState<StudentSportsFocus>("auto");
  const [remaining, setRemaining] = useState(initialRemaining);
  const [result, setResult] = useState<StudentSportsResult | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [includeVisuals, setIncludeVisuals] = useState(true);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (loading) return;
    setError("");
    setResult(null);
    setLoading(true);
    try {
      const request = await fetch("/api/students/sports/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ topic, focus, includeVisuals }),
      });
      const data = await request.json() as StudentSportsApiResponse;
      if (!request.ok || !data.success || !data.result) throw new Error(data.error || "No pudimos crear el reporte deportivo.");
      setResult(data.result);
      if (typeof data.remaining === "number") setRemaining(data.remaining);
      window.setTimeout(() => document.getElementById("resultado-deportes")?.scrollIntoView({ behavior: "smooth" }), 80);
    } catch (caughtError) {
      setError(caughtError instanceof Error ? caughtError.message : "No pudimos crear el reporte deportivo.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-8">
      <section className="student-sports-controls rounded-[2rem] border border-blue-200 bg-white p-6 shadow-sm sm:p-8">
        <div className="flex flex-wrap items-start justify-between gap-4"><div><p className="text-xs font-black uppercase tracking-[0.18em] text-blue-700">Tu misión deportiva</p><h2 className="mt-2 text-3xl font-black tracking-tight">¿Qué deseas comprender?</h2><p className="mt-3 max-w-3xl leading-7 text-slate-600">Escribe un deporte, una técnica, una situación táctica o una regla. Recibirás un reporte de tres páginas adaptado a tu curso.</p></div><div className="rounded-2xl border border-cyan-100 bg-gradient-to-br from-blue-50 to-cyan-50 px-5 py-4 text-center text-blue-900 shadow-inner"><p className="text-xs font-black uppercase tracking-wider">{isTeacher ? "Vista docente" : "Energía disponible"}</p><p className="mt-1 text-2xl font-black">{isTeacher ? "Sin consumo" : `${remaining} de 10`}</p></div></div>
        <form onSubmit={handleSubmit} className="mt-7 space-y-5">
          <div><label htmlFor="sports-topic" className="text-sm font-black text-slate-900">Tema deportivo</label><textarea id="sports-topic" value={topic} onChange={(event) => setTopic(event.target.value)} minLength={5} maxLength={160} required rows={3} placeholder="Ejemplo: Técnica del tiro libre en baloncesto" className="mt-2 w-full resize-y rounded-2xl border border-slate-300 px-4 py-3 text-base outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100" /></div>
          <div><label htmlFor="sports-focus" className="text-sm font-black text-slate-900">Tipo de reporte</label><select id="sports-focus" value={focus} onChange={(event) => setFocus(event.target.value as StudentSportsFocus)} className="mt-2 w-full rounded-2xl border border-slate-300 bg-white px-4 py-3.5 text-base outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100">{focuses.map((item) => <option key={item.value} value={item.value}>{item.label}</option>)}</select></div>
          <label className="flex cursor-pointer items-start gap-3 rounded-2xl border border-cyan-200 bg-cyan-50 p-4"><input type="checkbox" checked={includeVisuals} onChange={(event) => setIncludeVisuals(event.target.checked)} className="mt-1 h-5 w-5 accent-blue-700" /><span><strong className="block text-sm text-blue-950">Incluir apoyo visual</strong><span className="mt-1 block text-sm leading-6 text-slate-600">Añade hasta dos imágenes educativas con explicación, autor, licencia y enlace a la fuente. Si no existe una imagen pertinente, el reporte se genera normalmente.</span></span></label>
          <div className="flex flex-wrap gap-2">{examples.map((example) => <button key={example.label} type="button" onClick={() => { setTopic(example.topic); setFocus(example.focus); }} className="rounded-full border border-blue-200 bg-blue-50 px-3 py-2 text-xs font-bold text-blue-900 hover:bg-blue-100">{example.label}</button>)}</div>
          {error ? <p role="alert" className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-800">{error}</p> : null}
          <div className="flex flex-wrap items-center gap-4"><button type="submit" disabled={loading || (!isTeacher && remaining <= 0)} className="rounded-2xl bg-gradient-to-r from-blue-700 to-cyan-500 px-6 py-3.5 font-black text-white shadow-lg transition hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-50">{loading ? "Preparando reporte…" : "¡Generar reporte deportivo!"}</button><p className="text-sm text-slate-500">{isTeacher ? "Las vistas docentes no descuentan investigaciones." : "Se descontará 1 investigación únicamente si el reporte se genera correctamente."}</p></div>
        </form>
      </section>

      {loading ? <section className="student-sports-controls relative overflow-hidden rounded-3xl border border-cyan-100 bg-gradient-to-br from-blue-50 via-white to-emerald-50 p-10 text-center shadow-sm" aria-live="polite"><div className="absolute left-10 top-8 h-3 w-3 animate-pulse rounded-full bg-orange-400" aria-hidden="true" /><div className="absolute right-12 top-16 h-4 w-4 animate-pulse rounded-full bg-cyan-400" aria-hidden="true" /><div className="relative mx-auto h-32 w-32 animate-pulse" aria-hidden="true"><div className="absolute inset-5 rounded-full bg-cyan-100" /><Image src="/images/profe-ia-robot.png" alt="" width={220} height={280} className="relative z-10 h-full w-full object-contain" /></div><p className="mt-4 text-xs font-black uppercase tracking-[0.18em] text-blue-700">Análisis en movimiento</p><h2 className="mt-2 text-2xl font-black">Deportes en Acción está preparando tu reporte…</h2><p className="mx-auto mt-2 max-w-xl text-sm leading-6 text-slate-600">El robot está organizando la técnica, la táctica y las reglas para explicarlas de forma clara y segura.</p></section> : null}

      {result ? <section id="resultado-deportes" className="space-y-5">
        <div className="student-sports-controls flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"><div><p className="text-xs font-black uppercase tracking-[0.18em] text-emerald-700">🏆 ¡Reporte completado!</p><p className="mt-1 text-sm text-slate-600">3 páginas · {result.detectedFocus} · adaptado a {result.studentLevel}</p></div><button type="button" onClick={() => window.print()} className="rounded-xl bg-blue-700 px-5 py-3 text-sm font-black text-white hover:bg-blue-800">Imprimir o guardar en PDF</button></div>
        <div className="student-sports-document space-y-6">{result.pages.map((page, pageIndex) => {
          const visual = result.visuals?.find((item) => item.pageNumber === page.pageNumber);
          return <article key={page.pageNumber} className="student-sports-page mx-auto min-h-[270mm] w-full max-w-[210mm] rounded-2xl border border-slate-200 bg-white p-8 shadow-sm sm:p-10"><header className="border-b-4 border-cyan-400 pb-5"><div className="student-sports-brand flex items-center justify-between gap-4"><div className="student-sports-brand-identity flex items-center gap-3"><Image src="/logos/logo-profe-en-movimiento.png" alt="Profe en Movimiento" width={92} height={92} priority={pageIndex === 0} className="h-14 w-14 object-contain" /><div><p className="student-sports-brand-primary text-xs font-black uppercase tracking-[0.2em] text-blue-700">Profe en Movimiento 5.0</p><p className="student-sports-brand-secondary mt-0.5 text-[10px] font-semibold uppercase tracking-wide text-slate-500">Deportes en Acción · Recurso educativo para estudiantes</p></div></div><p className="student-sports-page-number text-[10px] font-black uppercase tracking-[0.16em] text-blue-700">Página {page.pageNumber} de 3</p></div>{pageIndex === 0 ? <><h1 className="mt-4 text-4xl font-black tracking-tight text-slate-950">{result.title}</h1><p className="mt-3 text-lg font-semibold text-slate-600">{result.subtitle}</p><section className="student-sports-identification mt-4 rounded-xl border border-blue-100 bg-blue-50 p-4" aria-label="Datos del estudiante"><div><span>Estudiante</span><strong>{studentIdentification.fullName}</strong></div><div><span>Unidad Educativa</span><strong>{studentIdentification.institution}</strong></div><div><span>Nivel educativo</span><strong>{studentIdentification.educationLevel}</strong></div><div><span>Grado y curso</span><strong>{studentIdentification.gradeCourse}</strong></div><div><span>Tema investigado</span><strong>{topic}</strong></div><div><span>Fecha</span><strong>{studentIdentification.generatedAt}</strong></div></section><p className="student-sports-introduction mt-4 rounded-xl bg-blue-50 p-4 text-sm leading-6 text-slate-700">{result.introduction}</p></> : null}<h2 className={`${pageIndex === 0 ? "mt-5" : "mt-4"} text-2xl font-black text-slate-900`}>{page.heading}</h2></header>{visual ? <figure className="student-sports-visual mt-5 overflow-hidden rounded-2xl border border-cyan-100 bg-cyan-50"><div className="relative h-52 w-full"><Image src={`/api/students/sports/image?url=${encodeURIComponent(visual.imageUrl)}`} alt={visual.alt} fill unoptimized sizes="(max-width: 768px) 100vw, 760px" className="object-contain" /></div><figcaption className="px-4 py-3 text-xs leading-5 text-slate-600"><strong className="text-slate-800">Observa:</strong> {visual.caption} <a href={visual.sourcePage} target="_blank" rel="noreferrer" className="font-bold text-blue-700 underline">Fuente: Wikimedia Commons</a><span className="block text-[10px] text-slate-500">Autor: {visual.author} · Licencia: {visual.license}</span></figcaption></figure> : null}<div className="student-sports-blocks mt-6 space-y-5">{page.blocks.map((block) => <section key={block.title} className="break-inside-avoid"><h3 className="text-lg font-black text-blue-900">{block.title}</h3><p className="mt-2 text-sm leading-6 text-slate-700">{block.content}</p><ul className="mt-3 grid gap-2 text-sm leading-6 text-slate-700 sm:grid-cols-2">{block.points.map((point) => <li key={point} className="flex gap-2 rounded-xl bg-slate-50 p-3"><span className="font-black text-cyan-600">●</span><span>{point}</span></li>)}</ul></section>)}</div>{pageIndex === 2 ? <div className="student-sports-summary mt-6 grid gap-4 border-t border-slate-200 pt-5 md:grid-cols-2"><section className="rounded-2xl bg-cyan-50 p-4"><h3 className="font-black text-cyan-950">Vocabulario deportivo</h3><dl className="mt-3 space-y-2 text-xs leading-5 text-slate-700">{result.glossary.map((item) => <div key={item.term}><dt className="font-black">{item.term}</dt><dd>{item.definition}</dd></div>)}</dl></section><div className="space-y-4"><section className="rounded-2xl bg-blue-50 p-4"><h3 className="font-black text-blue-950">Ideas clave</h3><ul className="mt-2 space-y-1 text-xs leading-5 text-slate-700">{result.keyIdeas.map((idea) => <li key={idea}>✓ {idea}</li>)}</ul></section><section className="rounded-2xl bg-amber-50 p-4"><h3 className="font-black text-amber-950">Para reflexionar</h3><p className="mt-2 text-xs leading-5 text-slate-700">{result.reflectionQuestion}</p></section></div></div> : null}<footer className="mt-6 border-t border-slate-200 pt-3 text-center text-xs font-semibold text-slate-400">Profe en Movimiento 5.0 · Recurso educativo estudiantil</footer></article>;
        })}</div>
        <div className="student-sports-controls flex flex-wrap items-center justify-center gap-3 rounded-3xl border border-blue-100 bg-gradient-to-r from-blue-50 to-cyan-50 p-6"><button type="button" onClick={() => window.print()} className="rounded-xl bg-blue-700 px-5 py-3 text-sm font-black text-white shadow-sm hover:bg-blue-800">🖨️ Imprimir o guardar en PDF</button><button type="button" onClick={() => { setResult(null); setTopic(""); setFocus("auto"); window.scrollTo({ top: 0, behavior: "smooth" }); }} className="rounded-xl border border-orange-300 bg-white px-5 py-3 text-sm font-black text-orange-700 hover:bg-orange-50">🏀 Investigar otro tema</button><Link href="/estudiantes" className="rounded-xl border border-slate-300 bg-white px-5 py-3 text-sm font-black text-slate-700 hover:bg-slate-50">← Volver al espacio estudiantil</Link></div>
      </section> : null}
    </div>
  );
}
