"use client";

import Link from "next/link";
import { useMemo, useState, useTransition } from "react";

import { academyCourse, academyFinalQuiz, academyLessons } from "@/features/academy/data/courses";
import { saveCompletedLessons, submitAcademyQuiz } from "@/features/academy/server/actions";
import type { AcademyProgress } from "@/features/academy/types";

export function CourseWorkspace({ initialProgress }: { initialProgress: AcademyProgress }) {
  const [completed, setCompleted] = useState(initialProgress.completedLessons);
  const [selectedId, setSelectedId] = useState(() => academyLessons.find((lesson) => !initialProgress.completedLessons.includes(lesson.id))?.id || academyLessons[0].id);
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [quizScore, setQuizScore] = useState(initialProgress.quizScore);
  const [certificateAt, setCertificateAt] = useState(initialProgress.certificateEarnedAt);
  const [message, setMessage] = useState("");
  const [pending, startTransition] = useTransition();
  const lesson = academyLessons.find((item) => item.id === selectedId) || academyLessons[0];
  const index = academyLessons.findIndex((item) => item.id === lesson.id);
  const completeCourse = completed.length === academyLessons.length;
  const percent = Math.round((completed.length / academyLessons.length) * 100);
  const modules = useMemo(() => Array.from(new Set(academyLessons.map((item) => item.module))), []);

  function markComplete() {
    if (completed.includes(lesson.id)) return;
    const next = [...completed, lesson.id];
    setCompleted(next); setMessage("Guardando progreso…");
    startTransition(async () => {
      const result = await saveCompletedLessons(next);
      setMessage(result.ok ? "Lección completada y progreso guardado." : result.message);
      if (!result.ok) setCompleted(completed);
    });
  }

  function sendQuiz() {
    if (academyFinalQuiz.some((question) => answers[question.id] === undefined)) { setMessage("Responde todas las preguntas antes de enviar."); return; }
    setMessage("Comprobando evaluación…");
    startTransition(async () => {
      const result = await submitAcademyQuiz(answers);
      if (!result.ok) { setMessage(result.message); return; }
      setQuizScore(result.score ?? 0); setCertificateAt(result.certificateEarnedAt ?? null);
      setMessage((result.score ?? 0) >= academyCourse.passingScore ? `Resultado: ${result.score}%. Curso aprobado.` : `Resultado: ${result.score}%. Necesitas ${academyCourse.passingScore}% para aprobar; puedes intentarlo nuevamente.`);
    });
  }

  return <div className="grid gap-6 xl:grid-cols-[300px_minmax(0,1fr)]">
    <aside className="h-fit rounded-[1.5rem] border border-slate-200 bg-white p-5 shadow-sm xl:sticky xl:top-28">
      <Link href="/academia" className="text-sm font-black text-blue-700">← Volver a Academia</Link>
      <div className="mt-5">
        <div className="flex justify-between text-xs font-black"><span>Progreso</span><span>{percent}%</span></div>
        <div className="mt-2 h-2 overflow-hidden rounded-full bg-slate-100"><div className="h-full bg-violet-600" style={{ width: `${percent}%` }} /></div>
      </div>
      <nav className="mt-6 space-y-5" aria-label="Lecciones del curso">
        {modules.map((module) => (
          <div key={module}>
            <p className="text-[10px] font-black uppercase tracking-[.14em] text-violet-700">{module}</p>
            <div className="mt-2 space-y-1">
              {academyLessons.filter((item) => item.module === module).map((item) => (
                <button key={item.id} onClick={() => { setSelectedId(item.id); setMessage(""); }} className={`flex w-full items-start gap-2 rounded-xl p-3 text-left text-sm transition ${selectedId === item.id ? "bg-blue-50 font-black text-blue-800" : "text-slate-600 hover:bg-slate-100"}`}>
                  <span>{completed.includes(item.id) ? "✓" : `${academyLessons.findIndex((entry) => entry.id === item.id) + 1}.`}</span><span>{item.title}</span>
                </button>
              ))}
            </div>
          </div>
        ))}
      </nav>
      {completeCourse ? <button onClick={() => setSelectedId("quiz")} className={`mt-5 w-full rounded-xl px-4 py-3 font-black ${selectedId === "quiz" ? "bg-violet-700 text-white" : "bg-violet-50 text-violet-800"}`}>Evaluación final</button> : null}
    </aside>

    <main className="min-w-0">
      {selectedId !== "quiz" ? <article className="overflow-hidden rounded-[2rem] border border-slate-200 bg-white shadow-xl"><header className="bg-gradient-to-r from-[#0b2050] to-blue-800 p-7 text-white sm:p-9"><p className="text-xs font-black uppercase tracking-[.17em] text-orange-300">Lección {index + 1} de {academyLessons.length} · {lesson.duration}</p><div className="mt-3 flex items-start gap-4"><span className="text-4xl" aria-hidden>{lesson.icon}</span><div><h1 className="text-3xl font-black sm:text-4xl">{lesson.title}</h1><p className="mt-3 max-w-3xl leading-7 text-blue-100">{lesson.objective}</p></div></div></header><div className="p-6 sm:p-9"><div className="grid gap-5 lg:grid-cols-3">{lesson.content.map((section) => <section key={section.title} className="rounded-2xl border border-slate-200 bg-slate-50 p-5"><h2 className="text-lg font-black text-slate-950">{section.title}</h2><p className="mt-3 text-sm leading-7 text-slate-600">{section.text}</p></section>)}</div><section className="mt-6 rounded-2xl border border-orange-200 bg-orange-50 p-5 text-orange-950"><p className="text-xs font-black uppercase tracking-[.15em] text-orange-700">Aplicación a tu práctica</p><p className="mt-2 leading-7">{lesson.application}</p></section><section className="mt-5 rounded-2xl border border-violet-200 bg-violet-50 p-5 text-violet-950"><p className="text-xs font-black uppercase tracking-[.15em] text-violet-700">Pregunta de reflexión</p><p className="mt-2 leading-7">{lesson.reflection}</p></section><div className="mt-7 flex flex-wrap items-center justify-between gap-3"><button disabled={index === 0} onClick={() => setSelectedId(academyLessons[index - 1].id)} className="rounded-xl border border-slate-300 bg-white px-5 py-3 font-black text-slate-700 disabled:opacity-40">← Anterior</button><div className="flex flex-wrap gap-2"><button disabled={pending || completed.includes(lesson.id)} onClick={markComplete} className="rounded-xl bg-emerald-600 px-5 py-3 font-black text-white disabled:opacity-50">{completed.includes(lesson.id) ? "✓ Lección completada" : "Marcar como completada"}</button><button disabled={index === academyLessons.length - 1} onClick={() => setSelectedId(academyLessons[index + 1].id)} className="rounded-xl bg-blue-700 px-5 py-3 font-black text-white disabled:opacity-40">Siguiente →</button></div></div></div></article> : <section className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-xl sm:p-9"><p className="text-xs font-black uppercase tracking-[.17em] text-violet-700">Evaluación final</p><h1 className="mt-2 text-3xl font-black text-slate-950">Comprueba tus decisiones pedagógicas</h1><p className="mt-3 leading-7 text-slate-600">Responde las ocho preguntas. Necesitas {academyCourse.passingScore}% para obtener el certificado.</p><div className="mt-7 space-y-6">{academyFinalQuiz.map((question, questionIndex) => <fieldset key={question.id} className="rounded-2xl border border-slate-200 p-5"><legend className="px-2 font-black">{questionIndex + 1}. {question.prompt}</legend><div className="mt-3 grid gap-2">{question.options.map((option, optionIndex) => <label key={option} className={`flex cursor-pointer gap-3 rounded-xl border p-3 ${answers[question.id] === optionIndex ? "border-blue-500 bg-blue-50" : "border-slate-200"}`}><input type="radio" name={question.id} checked={answers[question.id] === optionIndex} onChange={() => { setAnswers((current) => ({ ...current, [question.id]: optionIndex })); setQuizScore(null); }} /><span>{option}</span></label>)}</div>{quizScore !== null ? <p className={`mt-3 rounded-xl p-3 text-sm font-bold ${answers[question.id] === question.correctIndex ? "bg-emerald-50 text-emerald-800" : "bg-orange-50 text-orange-900"}`}>{answers[question.id] === question.correctIndex ? "✓ Correcto. " : "Revisa esta idea. "}{question.feedback}</p> : null}</fieldset>)}</div><button disabled={pending} onClick={sendQuiz} className="mt-7 rounded-xl bg-violet-700 px-6 py-3 font-black text-white disabled:opacity-50">Enviar evaluación</button>{quizScore !== null ? <p className="mt-4 text-xl font-black">Último resultado: {quizScore}%</p> : null}{certificateAt ? <Link href={`/academia/${academyCourse.slug}/certificado`} className="mt-5 inline-flex rounded-xl bg-orange-500 px-6 py-3 font-black text-white">Abrir certificado →</Link> : null}</section>}
      {message ? <p role="status" className="mt-4 rounded-xl border border-blue-200 bg-blue-50 p-4 font-bold text-blue-900">{message}</p> : null}
    </main>
  </div>;
}
