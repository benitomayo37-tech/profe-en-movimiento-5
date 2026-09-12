"use client";

import { useRouter } from "next/navigation";
import { type FormEvent, useState, useTransition } from "react";

import { createGradingActivityAction } from "../server/gradingActivityActions";
import type { CreateGradingActivityInput, GradingComponent, FormativeDimension, GradingActivityModality } from "../types";

interface GradingActivityFormProps {
  courseId: string;
  gradingPeriodId: string;
  displayOrder: number;
  onCancel: () => void;
}

export default function GradingActivityForm({
  courseId,
  gradingPeriodId,
  displayOrder,
  onCancel,
}: GradingActivityFormProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [name, setName] = useState("");
  const [component, setComponent] = useState<GradingComponent>("formative");
  const [dimension, setDimension] = useState<FormativeDimension>("cognitive");
  const [modality, setModality] = useState<GradingActivityModality>("individual");
  const [activityDate, setActivityDate] = useState("");
  const [instrument, setInstrument] = useState("");
  const [notes, setNotes] = useState("");
  const [error, setError] = useState("");

  function changeComponent(value: GradingComponent) {
    setComponent(value);
    if (value === "formative") {
      setDimension("cognitive");
      setModality("individual");
    } else if (value === "interdisciplinary_project") {
      setModality("group");
    } else {
      setModality("individual");
    }
  }

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");

    const input: CreateGradingActivityInput = {
      courseId,
      gradingPeriodId,
      name,
      activityDate: activityDate || null,
      component,
      dimension: component === "formative" ? dimension : null,
      modality,
      instrument: instrument || null,
      maxScore: 10,
      displayOrder,
      notes: notes || null,
    };

    startTransition(async () => {
      const result = await createGradingActivityAction(input);
      if (!result.success) {
        setError(result.message);
        return;
      }
      router.refresh();
      onCancel();
    });
  }

  return (
    <form onSubmit={submit} className="rounded-3xl border-2 border-blue-300 bg-white p-5 text-left shadow-lg sm:p-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-xs font-black uppercase tracking-[0.16em] text-blue-700">Nueva actividad</p>
          <h3 className="mt-1 text-xl font-black text-slate-950">Configura la evaluaci&oacute;n</h3>
        </div>
        <button type="button" onClick={onCancel} className="rounded-lg px-3 py-2 text-sm font-black text-slate-700 hover:bg-slate-100">Cancelar</button>
      </div>

      <div className="mt-5 grid gap-4 sm:grid-cols-2">
        <label className="sm:col-span-2">
          <span className="text-sm font-black text-slate-800">Nombre de la actividad</span>
          <input required maxLength={120} value={name} onChange={(event) => setName(event.target.value)} placeholder="Ej. R&uacute;brica de dribling" className="mt-2 min-h-12 w-full rounded-xl border-2 border-slate-300 px-4 text-sm text-slate-950 outline-none focus:border-blue-600" />
        </label>

        <label>
          <span className="text-sm font-black text-slate-800">Componente</span>
          <select value={component} onChange={(event) => changeComponent(event.target.value as GradingComponent)} className="mt-2 min-h-12 w-full rounded-xl border-2 border-slate-300 bg-white px-3 text-sm text-slate-950">
            <option value="formative">Evaluaci&oacute;n formativa</option>
            <option value="interdisciplinary_project">Proyecto interdisciplinario</option>
            <option value="exam">Examen</option>
          </select>
        </label>

        <label>
          <span className="text-sm font-black text-slate-800">Modalidad</span>
          <select value={modality} onChange={(event) => setModality(event.target.value as GradingActivityModality)} className="mt-2 min-h-12 w-full rounded-xl border-2 border-slate-300 bg-white px-3 text-sm text-slate-950">
            <option value="individual">Individual</option>
            <option value="group">Grupal</option>
            <option value="mixed">Mixta</option>
          </select>
        </label>

        {component === "formative" ? (
          <label>
            <span className="text-sm font-black text-slate-800">Dimensi&oacute;n</span>
            <select value={dimension} onChange={(event) => setDimension(event.target.value as FormativeDimension)} className="mt-2 min-h-12 w-full rounded-xl border-2 border-slate-300 bg-white px-3 text-sm text-slate-950">
              <option value="cognitive">Cognitiva</option>
              <option value="affective_social">Afectivo-social</option>
              <option value="motor">Motriz</option>
            </select>
          </label>
        ) : <div />}

        <label>
          <span className="text-sm font-black text-slate-800">Fecha</span>
          <input type="date" value={activityDate} onChange={(event) => setActivityDate(event.target.value)} className="mt-2 min-h-12 w-full rounded-xl border-2 border-slate-300 px-3 text-sm text-slate-950" />
        </label>

        <label>
          <span className="text-sm font-black text-slate-800">Instrumento</span>
          <input maxLength={100} value={instrument} onChange={(event) => setInstrument(event.target.value)} placeholder="R&uacute;brica, lista de cotejo..." className="mt-2 min-h-12 w-full rounded-xl border-2 border-slate-300 px-4 text-sm text-slate-950" />
        </label>

        <label className="sm:col-span-2">
          <span className="text-sm font-black text-slate-800">Notas u observaciones</span>
          <textarea rows={3} maxLength={500} value={notes} onChange={(event) => setNotes(event.target.value)} className="mt-2 w-full rounded-xl border-2 border-slate-300 px-4 py-3 text-sm text-slate-950" />
        </label>
      </div>

      {error ? <p role="alert" className="mt-4 rounded-xl border-2 border-red-300 bg-red-50 p-3 text-sm font-bold text-red-900">{error}</p> : null}

      <button type="submit" disabled={isPending} className="mt-5 min-h-12 rounded-xl border-2 border-blue-700 bg-blue-700 px-6 py-3 text-sm font-black text-white shadow-lg hover:bg-blue-800 disabled:opacity-60">
        {isPending ? "Guardando..." : "Guardar actividad"}
      </button>
    </form>
  );
}
