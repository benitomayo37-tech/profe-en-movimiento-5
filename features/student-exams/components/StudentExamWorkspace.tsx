"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";

import type { ExamFeedback, PublicExamQuestion } from "@/features/student-exams/types";

interface StartedExam { attemptId: string; title: string; topic: string; questions: PublicExamQuestion[]; }
interface Result { score: number; total: number; submittedAt: string; feedback: ExamFeedback[]; student: { fullName: string; institution: string; gradeCourse: string }; exam: { title: string; topic: string }; }

const typeLabels = { multiple_choice: "Selección múltiple", structured_base: "Base estructurada", metacognition: "Metacognición" } as const;

export default function StudentExamWorkspace({ defaultName, defaultGradeCourse, teacherView = false }: { defaultName: string; defaultGradeCourse: string; teacherView?: boolean }) {
  const [exam, setExam] = useState<StartedExam | null>(null);
  const [result, setResult] = useState<Result | null>(null);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function start(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault(); setLoading(true); setError("");
    const form = new FormData(event.currentTarget);
    try {
      const response = await fetch("/api/students/exams/start", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ code: form.get("code"), studentName: form.get("studentName"), institution: form.get("institution"), gradeCourse: form.get("gradeCourse") }) });
      const payload = await response.json() as StartedExam & { error?: string };
      if (!response.ok) throw new Error(payload.error || "No se pudo iniciar el examen.");
      setExam(payload); setAnswers({});
    } catch (reason) { setError(reason instanceof Error ? reason.message : "No se pudo iniciar el examen."); }
    finally { setLoading(false); }
  }

  async function submit() {
    if (!exam) return;
    if (Object.keys(answers).length !== exam.questions.length && !window.confirm("Hay preguntas sin responder. ¿Deseas entregar el examen?")) return;
    setLoading(true); setError("");
    try {
      const response = await fetch("/api/students/exams/submit", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ attemptId: exam.attemptId, answers }) });
      const payload = await response.json() as Result & { error?: string };
      if (!response.ok) throw new Error(payload.error || "No se pudo calificar el examen.");
      setResult(payload);
    } catch (reason) { setError(reason instanceof Error ? reason.message : "No se pudo calificar el examen."); }
    finally { setLoading(false); }
  }

  if (result) return (
    <section className="exam-print-area rounded-3xl border border-blue-100 bg-white p-6 shadow-lg sm:p-9">
      <style>{`@media print { body * { visibility: hidden !important; } .exam-print-area, .exam-print-area * { visibility: visible !important; } .exam-print-area { position: absolute; inset: 0; width: 100%; box-shadow: none !important; border: 0 !important; } .no-print { display: none !important; } @page { size: A4; margin: 14mm; } }`}</style>
      <header className="flex items-center gap-4 border-b-2 border-blue-700 pb-4"><Image src="/logos/logo-profe-en-movimiento.png" alt="Profe en Movimiento" width={58} height={58} className="h-14 w-14 object-contain" /><div><p className="font-black uppercase tracking-[0.14em] text-blue-700">Profe en Movimiento 5.0</p><p className="text-xs font-bold uppercase text-slate-500">Recursos educativos para estudiantes</p></div></header>
      <div className="mt-6 grid gap-3 rounded-2xl bg-slate-50 p-5 text-sm sm:grid-cols-2"><p><b>Estudiante:</b> {result.student.fullName}</p><p><b>Unidad Educativa:</b> {result.student.institution}</p><p><b>Grado y curso:</b> {result.student.gradeCourse}</p><p><b>Fecha:</b> {new Date(result.submittedAt).toLocaleString("es-EC")}</p></div>
      <div className="mt-6 flex flex-wrap items-center justify-between gap-4"><div><p className="text-xs font-black uppercase tracking-[0.15em] text-blue-700">{result.exam.title}</p><h2 className="mt-1 text-3xl font-black">Resultado del examen</h2></div><div className="rounded-2xl bg-gradient-to-br from-blue-700 to-cyan-500 px-7 py-4 text-center text-white"><p className="text-4xl font-black">{result.score}/{result.total}</p><p className="text-xs font-black uppercase">Calificación</p></div></div>
      <div className="mt-7 space-y-4">{result.feedback.map((item, index) => <article key={item.questionId} className={`break-inside-avoid rounded-2xl border p-5 ${item.isCorrect ? "border-emerald-200 bg-emerald-50" : "border-red-200 bg-red-50"}`}><p className="font-black">{index + 1}. {item.prompt}</p><p className="mt-2 text-sm"><b>Tu respuesta:</b> {item.selectedAnswer} {item.isCorrect ? "✓" : "✗"}</p>{!item.isCorrect ? <p className="mt-1 text-sm"><b>Respuesta correcta:</b> {item.correctAnswer}</p> : null}<p className="mt-2 text-sm text-slate-700">{item.explanation}</p></article>)}</div>
      <div className="no-print mt-7 flex flex-wrap gap-3"><button type="button" onClick={() => window.print()} className="rounded-xl bg-orange-500 px-5 py-3 font-black text-white">Imprimir o guardar PDF</button><Link href="/estudiantes" className="rounded-xl border border-slate-300 px-5 py-3 font-black">Volver al inicio</Link></div>
    </section>
  );

  if (!exam) return (
    <form onSubmit={start} className="rounded-3xl border border-blue-100 bg-white p-6 shadow-lg sm:p-9">
      <div className="grid gap-7 lg:grid-cols-[1fr_220px] lg:items-center"><div><p className="text-xs font-black uppercase tracking-[0.18em] text-blue-700">Acceso autorizado por tu docente</p><h2 className="mt-2 text-3xl font-black">Ingresa el código del examen</h2><p className="mt-3 text-sm leading-7 text-slate-600">Completa tus datos exactamente como deben aparecer en el documento que entregarás.</p></div><Image src="/images/profe-ia-robot.png" alt="Robot de Profe en Movimiento" width={180} height={220} className="mx-auto h-40 w-40 object-contain" /></div>
      {teacherView ? <p className="mt-5 rounded-2xl border border-blue-200 bg-blue-50 p-4 text-sm font-bold text-blue-900">Estás probando como docente. Puedes <Link href="/examenes" className="underline">crear un examen y obtener el código aquí</Link>.</p> : null}
      <div className="mt-7 grid gap-5 sm:grid-cols-2"><label className="sm:col-span-2"><span className="text-sm font-black">Código entregado por el docente</span><input name="code" required maxLength={20} placeholder="PEM-XXXXXX" className="mt-2 w-full rounded-2xl border-2 border-blue-200 px-4 py-4 text-center text-2xl font-black uppercase tracking-widest outline-none focus:border-blue-600" /></label><label><span className="text-sm font-black">Nombre completo</span><input name="studentName" defaultValue={defaultName} required minLength={3} maxLength={160} className="mt-2 w-full rounded-2xl border border-slate-300 px-4 py-3" /></label><label><span className="text-sm font-black">Unidad Educativa</span><input name="institution" required maxLength={160} className="mt-2 w-full rounded-2xl border border-slate-300 px-4 py-3" /></label><label><span className="text-sm font-black">Grado y curso</span><input name="gradeCourse" defaultValue={defaultGradeCourse} required maxLength={80} className="mt-2 w-full rounded-2xl border border-slate-300 px-4 py-3" /></label></div>
      {error ? <p role="alert" className="mt-5 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm font-bold text-red-700">{error}</p> : null}<button disabled={loading} className="mt-6 rounded-2xl bg-gradient-to-r from-orange-500 to-amber-400 px-6 py-4 font-black text-slate-950 shadow-lg disabled:opacity-60">{loading ? "Preparando tu versión…" : "Ingresar al examen"}</button>
    </form>
  );

  return (
    <section className="rounded-3xl border border-blue-100 bg-white p-6 shadow-lg sm:p-9"><div className="flex flex-wrap items-start justify-between gap-4 border-b border-slate-200 pb-5"><div><p className="text-xs font-black uppercase tracking-[0.16em] text-blue-700">Examen en curso</p><h2 className="mt-1 text-3xl font-black">{exam.title}</h2><p className="mt-2 text-sm text-slate-600">{exam.topic}</p></div><span className="rounded-full bg-blue-100 px-4 py-2 text-sm font-black text-blue-800">10 preguntas · 10 puntos</span></div>
      <div className="mt-7 space-y-6">{exam.questions.map((question, index) => <fieldset key={question.id} className="rounded-2xl border border-slate-200 p-5"><legend className="px-2 text-xs font-black uppercase tracking-[0.12em] text-orange-600">Pregunta {index + 1} · {typeLabels[question.type]}</legend>{question.context ? <p className="mt-2 rounded-xl bg-blue-50 p-4 text-sm leading-6 text-blue-950">{question.context}</p> : null}<p className="mt-4 font-black leading-7">{question.prompt}</p><div className="mt-4 grid gap-3">{question.options.map((option) => <label key={option.id} className={`flex cursor-pointer gap-3 rounded-xl border p-4 transition ${answers[question.id] === option.id ? "border-blue-600 bg-blue-50" : "border-slate-200 hover:bg-slate-50"}`}><input type="radio" name={question.id} value={option.id} checked={answers[question.id] === option.id} onChange={() => setAnswers((current) => ({ ...current, [question.id]: option.id }))} /><span className="text-sm font-semibold">{option.text}</span></label>)}</div></fieldset>)}</div>
      {error ? <p role="alert" className="mt-5 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm font-bold text-red-700">{error}</p> : null}<button type="button" onClick={submit} disabled={loading} className="mt-7 rounded-2xl bg-gradient-to-r from-blue-700 to-cyan-500 px-7 py-4 font-black text-white shadow-lg disabled:opacity-60">{loading ? "Calificando…" : "Finalizar y ver mi nota"}</button>
    </section>
  );
}
