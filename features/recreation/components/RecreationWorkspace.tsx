"use client";

import { useEffect, useMemo, useState } from "react";

import {
  createRecreationActivityAction,
  listRecreationActivitiesAction,
} from "../server/recreationActions";
import {
  emptyRecreationActivity,
  recreationActivityTypes,
  type RecreationActivityDraft,
  type RecreationActivityRecord,
} from "../types";

const fieldClass = "w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-sm font-semibold text-slate-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100";

export default function RecreationWorkspace() {
  const [selectedType, setSelectedType] = useState("todos");
  const [showForm, setShowForm] = useState(false);
  const [draft, setDraft] = useState<RecreationActivityDraft>(emptyRecreationActivity);
  const [savedActivities, setSavedActivities] = useState<RecreationActivityRecord[]>([]);
  const [loadingActivities, setLoadingActivities] = useState(true);
  const [saving, setSaving] = useState(false);
  const [feedback, setFeedback] = useState("");

  useEffect(() => {
    let active = true;
    void listRecreationActivitiesAction().then((result) => {
      if (!active) return;
      if (result.success) setSavedActivities(result.data);
      else setFeedback(result.message);
      setLoadingActivities(false);
    });
    return () => { active = false; };
  }, []);

  const visibleTypes = useMemo(
    () => selectedType === "todos"
      ? recreationActivityTypes
      : recreationActivityTypes.filter((item) => item.value === selectedType),
    [selectedType],
  );

  function updateDraft(field: keyof RecreationActivityDraft, value: string) {
    setDraft((current) => ({ ...current, [field]: value }));
  }

  async function saveDraft() {
    setFeedback("");
    setSaving(true);
    const result = await createRecreationActivityAction(draft);
    if (result.success) {
      const refreshed = await listRecreationActivitiesAction();
      if (refreshed.success) setSavedActivities(refreshed.data);
      setDraft(emptyRecreationActivity);
      setShowForm(false);
    }
    setFeedback(result.message);
    setSaving(false);
  }

  return (
    <div className="space-y-6">
      <section className="rounded-3xl bg-gradient-to-br from-slate-950 via-blue-950 to-blue-700 p-6 text-white shadow-xl sm:p-8">
        <div className="mt-2 flex flex-wrap items-end justify-between gap-4">
          <div>
            <h2 className="text-3xl font-black">Recreaci&oacute;n y Retos</h2>
            <p className="mt-2 max-w-2xl text-sm font-semibold text-blue-100">Dise&ntilde;a juegos, yincanas y escape rooms inclusivos para clases, convivencias y jornadas recreativas.</p>
          </div>
          <button type="button" onClick={() => setShowForm((value) => !value)} className="rounded-xl bg-orange-500 px-4 py-2.5 text-sm font-black text-white shadow-lg transition hover:bg-orange-400">
            {showForm ? "Cerrar formulario" : "+ Nueva actividad"}
          </button>
        </div>
      </section>

      <section className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {visibleTypes.map((item) => (
          <button key={item.value} type="button" onClick={() => { setSelectedType(item.value); setShowForm(true); setDraft((current) => ({ ...current, type: item.value })); }} className="rounded-2xl border border-blue-100 bg-white p-4 text-left shadow-sm transition hover:-translate-y-0.5 hover:border-blue-400 hover:shadow-md">
            <p className="text-sm font-black text-slate-950">{item.label}</p>
            <p className="mt-1 text-xs font-semibold text-slate-500">{item.description}</p>
          </button>
        ))}
      </section>

      <div className="flex flex-wrap gap-2">
        {[{ value: "todos", label: "Todas" }, ...recreationActivityTypes].map((item) => (
          <button key={item.value} type="button" onClick={() => setSelectedType(item.value)} className={selectedType === item.value ? "rounded-full bg-blue-700 px-3 py-1.5 text-xs font-black text-white" : "rounded-full border border-slate-300 bg-white px-3 py-1.5 text-xs font-black text-slate-600 hover:border-blue-400 hover:text-blue-700"}>{item.label}</button>
        ))}
      </div>

      {showForm ? (
        <section className="rounded-3xl border border-blue-100 bg-blue-50/70 p-5 shadow-sm sm:p-6">
          <div className="mb-4"><p className="text-xs font-black uppercase tracking-[0.18em] text-blue-700">Planificador</p><h3 className="mt-1 text-xl font-black text-slate-950">Crear actividad recreativa</h3><p className="mt-1 text-sm font-semibold text-slate-600">La actividad se guardar&aacute; en tu cuenta y podr&aacute;s consultarla en futuras sesiones.</p></div>
          <div className="grid gap-4 md:grid-cols-2">
            <label className="text-sm font-black text-slate-700">Nombre<input className={fieldClass} value={draft.title} onChange={(event) => updateDraft("title", event.target.value)} placeholder="Ej. Mision de los cuatro equipos" /></label>
            <label className="text-sm font-black text-slate-700">Tipo<select className={fieldClass} value={draft.type} onChange={(event) => updateDraft("type", event.target.value as RecreationActivityDraft["type"])}>{recreationActivityTypes.map((item) => <option key={item.value} value={item.value}>{item.label}</option>)}</select></label>
            <label className="text-sm font-black text-slate-700 md:col-span-2">Objetivo<textarea className={fieldClass} rows={2} value={draft.objective} onChange={(event) => updateDraft("objective", event.target.value)} placeholder="Que aprenderan o viviran los participantes?" /></label>
            <label className="text-sm font-black text-slate-700">Nivel o edad<input className={fieldClass} value={draft.level} onChange={(event) => updateDraft("level", event.target.value)} placeholder="Ej. 8vo EGB" /></label>
            <label className="text-sm font-black text-slate-700">Duraci&oacute;n<input className={fieldClass} value={draft.duration} onChange={(event) => updateDraft("duration", event.target.value)} placeholder="Ej. 45 minutos" /></label>
            <label className="text-sm font-black text-slate-700">Participantes<input className={fieldClass} value={draft.participants} onChange={(event) => updateDraft("participants", event.target.value)} placeholder="Ej. 40 estudiantes" /></label>
            <label className="text-sm font-black text-slate-700">Espacio<input className={fieldClass} value={draft.space} onChange={(event) => updateDraft("space", event.target.value)} placeholder="Ej. patio escolar" /></label>
            <label className="text-sm font-black text-slate-700 md:col-span-2">Materiales<input className={fieldClass} value={draft.materials} onChange={(event) => updateDraft("materials", event.target.value)} placeholder="Ej. 4 balones, conos y tarjetas" /></label>
            <label className="text-sm font-black text-slate-700 md:col-span-2">Instrucciones<textarea className={fieldClass} rows={3} value={draft.instructions} onChange={(event) => updateDraft("instructions", event.target.value)} placeholder="Describe la preparacion y el desarrollo." /></label>
            <label className="text-sm font-black text-slate-700 md:col-span-2">Adaptaciones DUA y NEE<textarea className={fieldClass} rows={3} value={draft.adaptations} onChange={(event) => updateDraft("adaptations", event.target.value)} placeholder="Ritmo, espacio, apoyos, roles alternativos..." /></label>
            <label className="text-sm font-black text-slate-700 md:col-span-2">Seguridad<textarea className={fieldClass} rows={3} value={draft.safety} onChange={(event) => updateDraft("safety", event.target.value)} placeholder="Normas, limites y senal de suspension." /></label>
          </div>
          <div className="mt-5 flex flex-wrap gap-2"><button type="button" onClick={saveDraft} disabled={saving || !draft.title.trim() || !draft.objective.trim() || !draft.instructions.trim() || !draft.safety.trim()} className="rounded-xl bg-blue-700 px-4 py-2.5 text-sm font-black text-white transition hover:bg-blue-600 disabled:cursor-not-allowed disabled:opacity-50">{saving ? "Guardando..." : "Guardar actividad"}</button><button type="button" onClick={() => { setDraft(emptyRecreationActivity); setShowForm(false); }} className="rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm font-black text-slate-700">Cancelar</button></div>
          {feedback ? <p className="mt-3 text-sm font-black text-blue-700">{feedback}</p> : null}
        </section>
      ) : null}

      <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
        <div className="flex flex-wrap items-end justify-between gap-3"><div><p className="text-xs font-black uppercase tracking-[0.18em] text-blue-700">Mis actividades</p><h3 className="mt-1 text-xl font-black text-slate-950">Actividades guardadas</h3></div><span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-black text-slate-600">{savedActivities.length} guardadas</span></div>
        {loadingActivities ? <p className="mt-5 rounded-2xl border border-dashed border-slate-300 p-6 text-center text-sm font-semibold text-slate-500">Cargando actividades...</p> : savedActivities.length === 0 ? <p className="mt-5 rounded-2xl border border-dashed border-slate-300 p-6 text-center text-sm font-semibold text-slate-500">Todav&iacute;a no hay actividades. Crea el primer juego, yincana o escape room.</p> : <div className="mt-4 grid gap-3 md:grid-cols-2">{savedActivities.map((activity) => <article key={activity.id} className="rounded-2xl border border-slate-200 bg-slate-50 p-4"><p className="text-xs font-black uppercase text-blue-700">{recreationActivityTypes.find((item) => item.value === activity.type)?.label}</p><h4 className="mt-1 font-black text-slate-950">{activity.title}</h4><p className="mt-1 text-sm font-semibold text-slate-600">{activity.objective}</p><p className="mt-2 text-xs font-bold text-slate-500">{activity.duration || "Duraci&oacute;n no especificada"} - {activity.status === "draft" ? "Borrador" : "Publicada"}</p></article>)}</div>}
      </section>
    </div>
  );
}