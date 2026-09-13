"use client";
import { useState, useTransition } from "react";
import { updateGradingWeightsAction } from "../server/gradingSettingsActions";
import type { GradingSettings } from "../types";

export default function GradingWeightsPanel({ courseId, settings }: { courseId: string; settings: GradingSettings | null }) {
  const [formative, setFormative] = useState(Math.round((settings?.formativeWeight ?? 0.7) * 100));
  const [project, setProject] = useState(Math.round((settings?.projectWeight ?? 0.15) * 100));
  const [exam, setExam] = useState(Math.round((settings?.examWeight ?? 0.15) * 100));
  const [message, setMessage] = useState("");
  const [pending, startTransition] = useTransition();
  const total = formative + project + exam;
  function save() { startTransition(async () => { const result = await updateGradingWeightsAction({ courseId, formativeWeight: formative / 100, projectWeight: project / 100, examWeight: exam / 100 }); setMessage(result.message); }); }
  return (
    <section className="rounded-3xl border-2 border-blue-200 bg-blue-50 p-5 text-slate-950 shadow-sm">
      <p className="text-xs font-black uppercase tracking-[0.16em] text-blue-700">Configuracion de evaluacion</p>
      <h3 className="mt-1 text-xl font-black">Pesos de calificacion</h3>
      <p className="mt-1 text-sm font-bold text-slate-600">Ajusta la ponderacion de cada componente. Deben sumar 100 %.</p>
      <div className="mt-4 grid gap-3 sm:grid-cols-3">
        <label className="text-sm font-black">Formativa (%)<input type="number" min="0" max="100" value={formative} onChange={(event) => setFormative(Number(event.target.value))} className="mt-1 min-h-11 w-full rounded-xl border-2 border-slate-300 bg-white px-3 text-slate-950" /></label>
        <label className="text-sm font-black">Proyecto (%)<input type="number" min="0" max="100" value={project} onChange={(event) => setProject(Number(event.target.value))} className="mt-1 min-h-11 w-full rounded-xl border-2 border-slate-300 bg-white px-3 text-slate-950" /></label>
        <label className="text-sm font-black">Examen (%)<input type="number" min="0" max="100" value={exam} onChange={(event) => setExam(Number(event.target.value))} className="mt-1 min-h-11 w-full rounded-xl border-2 border-slate-300 bg-white px-3 text-slate-950" /></label>
      </div>
      <div className="mt-3 flex flex-wrap items-center gap-3"><span className={total === 100 ? "font-black text-emerald-700" : "font-black text-red-700"}>Total: {total} %</span><button type="button" onClick={save} disabled={pending || total !== 100} className="min-h-11 rounded-xl bg-blue-700 px-5 py-2 text-sm font-black text-white hover:bg-blue-800 disabled:cursor-not-allowed disabled:opacity-50">{pending ? "Guardando..." : "Guardar pesos"}</button>{message ? <span className="text-sm font-bold text-blue-900">{message}</span> : null}</div>
    </section>
  );
}
