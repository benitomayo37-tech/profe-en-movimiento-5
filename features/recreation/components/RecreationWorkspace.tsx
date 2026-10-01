"use client";

import { useEffect, useMemo, useState } from "react";

import {
  archiveRecreationActivityAction,
  createRecreationActivityAction,
  listRecreationActivitiesAction,
  publishRecreationActivityAction,
  restoreRecreationActivityAction,
  updateRecreationActivityAction,
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
  const [statusFilter, setStatusFilter] = useState("active");
  const [showForm, setShowForm] = useState(false);
  const [draft, setDraft] = useState<RecreationActivityDraft>(emptyRecreationActivity);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [savedActivities, setSavedActivities] = useState<RecreationActivityRecord[]>([]);
  const [loadingActivities, setLoadingActivities] = useState(true);
  const [saving, setSaving] = useState(false);
  const [feedback, setFeedback] = useState("");

  async function loadActivities() {
    const result = await listRecreationActivitiesAction();
    if (result.success) setSavedActivities(result.data);
    else setFeedback(result.message);
    setLoadingActivities(false);
  }

  useEffect(() => { void loadActivities(); }, []);

  const visibleActivities = useMemo(() => {
    return savedActivities.filter((item) => {
      const matchesType = selectedType === "todos" || item.type === selectedType;
      const matchesStatus =
        statusFilter === "active"
          ? item.status !== "archived"
          : statusFilter === "all"
            ? true
            : item.status === statusFilter;
      return matchesType && matchesStatus;
    });
  }, [savedActivities, selectedType, statusFilter]);

  function updateDraft(field: keyof RecreationActivityDraft, value: string) {
    setDraft((current) => ({ ...current, [field]: value }));
  }

  function startEdit(activity: RecreationActivityRecord) {
    setEditingId(activity.id);
    setDraft({ ...activity });
    setShowForm(true);
    setFeedback("");
  }

  function cancelForm() {
    setDraft(emptyRecreationActivity);
    setEditingId(null);
    setShowForm(false);
    setFeedback("");
  }

  async function saveDraft() {
    setFeedback("");
    setSaving(true);
    const result = editingId
      ? await updateRecreationActivityAction(editingId, draft)
      : await createRecreationActivityAction(draft);
    if (result.success) {
      await loadActivities();
      cancelForm();
      setFeedback(result.message);
    } else {
      setFeedback(result.message);
    }
    setSaving(false);
  }

  async function changeStatus(id: string, action: "publish" | "archive" | "restore") {
    setFeedback("");
    const result = action === "publish"
      ? await publishRecreationActivityAction(id)
      : action === "restore"
        ? await restoreRecreationActivityAction(id)
        : await archiveRecreationActivityAction(id);
    setFeedback(result.message);
    if (result.success) await loadActivities();
  }

  return (
    <div className="space-y-6">
      <section className="rounded-3xl bg-gradient-to-br from-slate-950 via-blue-950 to-blue-700 p-6 text-white shadow-xl sm:p-8">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div><h2 className="text-3xl font-black">Recreaci&oacute;n y Retos</h2><p className="mt-2 max-w-2xl text-sm font-semibold text-blue-100">Dise&ntilde;a juegos, yincanas y escape rooms inclusivos para clases, convivencias y jornadas recreativas.</p></div>
          <button type="button" onClick={() => setShowForm((value) => !value)} className="rounded-xl bg-orange-500 px-4 py-2.5 text-sm font-black text-white shadow-lg transition hover:bg-orange-400">{showForm ? "Cerrar formulario" : "+ Nueva actividad"}</button>
        </div>
      </section>

      <section className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {recreationActivityTypes.map((item) => <button key={item.value} type="button" onClick={() => { setSelectedType(item.value); setShowForm(true); setDraft((current) => ({ ...current, type: item.value })); }} className="rounded-2xl border border-blue-100 bg-white p-4 text-left shadow-sm transition hover:-translate-y-0.5 hover:border-blue-400 hover:shadow-md"><p className="text-sm font-black text-slate-950">{item.label}</p><p className="mt-1 text-xs font-semibold text-slate-500">{item.description}</p></button>)}
      </section>

      <div className="flex flex-wrap gap-2">{[{ value: "todos", label: "Todas" }, ...recreationActivityTypes].map((item) => <button key={item.value} type="button" onClick={() => setSelectedType(item.value)} className={selectedType === item.value ? "rounded-full bg-blue-700 px-3 py-1.5 text-xs font-black text-white" : "rounded-full border border-slate-300 bg-white px-3 py-1.5 text-xs font-black text-slate-600 hover:border-blue-400 hover:text-blue-700"}>{item.label}</button>)}</div>

      <div className="flex flex-wrap gap-2">
        {[{ value: "active", label: "Activas" }, { value: "all", label: "Todas" }, { value: "draft", label: "Borradores" }, { value: "published", label: "Publicadas" }, { value: "archived", label: "Archivadas" }].map((item) => <button key={item.value} type="button" onClick={() => setStatusFilter(item.value)} className={statusFilter === item.value ? "rounded-full bg-orange-500 px-3 py-1.5 text-xs font-black text-white" : "rounded-full border border-orange-200 bg-white px-3 py-1.5 text-xs font-black text-orange-700 hover:border-orange-400"}>{item.label}</button>)}
      </div>
      {showForm ? <section className="rounded-3xl border border-blue-100 bg-blue-50/70 p-5 shadow-sm sm:p-6"><div className="mb-4"><p className="text-xs font-black uppercase tracking-[0.18em] text-blue-700">Planificador</p><h3 className="mt-1 text-xl font-black text-slate-950">{editingId ? "Editar actividad recreativa" : "Crear actividad recreativa"}</h3><p className="mt-1 text-sm font-semibold text-slate-600">Completa los campos esenciales para guardar una propuesta segura e inclusiva.</p></div><div className="grid gap-4 md:grid-cols-2">
        <label className="text-sm font-black text-slate-700">Nombre<input className={fieldClass} value={draft.title} onChange={(event) => updateDraft("title", event.target.value)} placeholder="Ej. Mision de los cuatro equipos" /></label>
        <label className="text-sm font-black text-slate-700">Tipo<select className={fieldClass} value={draft.type} onChange={(event) => updateDraft("type", event.target.value as RecreationActivityDraft["type"])}>{recreationActivityTypes.map((item) => <option key={item.value} value={item.value}>{item.label}</option>)}</select></label>
        <label className="text-sm font-black text-slate-700 md:col-span-2">Objetivo<textarea className={fieldClass} rows={2} value={draft.objective} onChange={(event) => updateDraft("objective", event.target.value)} /></label>
        <label className="text-sm font-black text-slate-700">Nivel o edad<input className={fieldClass} value={draft.level} onChange={(event) => updateDraft("level", event.target.value)} /></label>
        <label className="text-sm font-black text-slate-700">Duraci&oacute;n<input className={fieldClass} value={draft.duration} onChange={(event) => updateDraft("duration", event.target.value)} /></label>
        <label className="text-sm font-black text-slate-700">Participantes<input className={fieldClass} value={draft.participants} onChange={(event) => updateDraft("participants", event.target.value)} /></label>
        <label className="text-sm font-black text-slate-700">Espacio<input className={fieldClass} value={draft.space} onChange={(event) => updateDraft("space", event.target.value)} /></label>
        <label className="text-sm font-black text-slate-700 md:col-span-2">Materiales<input className={fieldClass} value={draft.materials} onChange={(event) => updateDraft("materials", event.target.value)} /></label>
        <label className="text-sm font-black text-slate-700 md:col-span-2">Instrucciones<textarea className={fieldClass} rows={3} value={draft.instructions} onChange={(event) => updateDraft("instructions", event.target.value)} /></label>
        <label className="text-sm font-black text-slate-700 md:col-span-2">Adaptaciones DUA y NEE<textarea className={fieldClass} rows={3} value={draft.adaptations} onChange={(event) => updateDraft("adaptations", event.target.value)} /></label>
        <label className="text-sm font-black text-slate-700 md:col-span-2">Seguridad<textarea className={fieldClass} rows={3} value={draft.safety} onChange={(event) => updateDraft("safety", event.target.value)} /></label>
      </div><div className="mt-5 flex flex-wrap gap-2"><button type="button" onClick={saveDraft} disabled={saving || !draft.title.trim() || !draft.objective.trim() || !draft.instructions.trim() || !draft.safety.trim()} className="rounded-xl bg-blue-700 px-4 py-2.5 text-sm font-black text-white transition hover:bg-blue-600 disabled:cursor-not-allowed disabled:opacity-50">{saving ? "Guardando..." : editingId ? "Actualizar actividad" : "Guardar actividad"}</button><button type="button" onClick={cancelForm} className="rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm font-black text-slate-700">Cancelar</button></div>{feedback ? <p className="mt-3 text-sm font-black text-blue-700">{feedback}</p> : null}</section> : null}

      <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6"><div className="flex flex-wrap items-end justify-between gap-3"><div><p className="text-xs font-black uppercase tracking-[0.18em] text-blue-700">Mis actividades</p><h3 className="mt-1 text-xl font-black text-slate-950">Actividades guardadas</h3></div><span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-black text-slate-600">{visibleActivities.length} guardadas</span></div>
        {loadingActivities ? <p className="mt-5 rounded-2xl border border-dashed border-slate-300 p-6 text-center text-sm font-semibold text-slate-500">Cargando actividades...</p> : visibleActivities.length === 0 ? <p className="mt-5 rounded-2xl border border-dashed border-slate-300 p-6 text-center text-sm font-semibold text-slate-500">Todav&iacute;a no hay actividades en este filtro.</p> : <div className="mt-4 grid gap-3 md:grid-cols-2">{visibleActivities.map((activity) => <article key={activity.id} className="rounded-2xl border border-slate-200 bg-slate-50 p-4"><div className="flex items-start justify-between gap-3"><div><p className="text-xs font-black uppercase text-blue-700">{recreationActivityTypes.find((item) => item.value === activity.type)?.label}</p><h4 className="mt-1 font-black text-slate-950">{activity.title}</h4></div><span className="rounded-full bg-blue-100 px-2 py-1 text-[10px] font-black uppercase text-blue-700">{activity.status === "draft" ? "Borrador" : activity.status === "archived" ? "Archivada" : "Publicada"}</span></div><p className="mt-1 text-sm font-semibold text-slate-600">{activity.objective}</p><p className="mt-2 text-xs font-bold text-slate-500">{activity.duration || "Duraci&oacute;n no especificada"}</p><div className="mt-4 flex flex-wrap gap-2"><button type="button" onClick={() => startEdit(activity)} className="rounded-lg border border-blue-300 px-3 py-1.5 text-xs font-black text-blue-700 hover:bg-blue-50">Editar</button>{activity.status === "draft" ? <button type="button" onClick={() => void changeStatus(activity.id, "publish")} className="rounded-lg bg-emerald-600 px-3 py-1.5 text-xs font-black text-white hover:bg-emerald-500">Publicar</button> : null}<button type="button" onClick={() => void changeStatus(activity.id, activity.status === "archived" ? "restore" : "archive")} className="rounded-lg border border-red-300 px-3 py-1.5 text-xs font-black text-red-700 hover:bg-red-50">{activity.status === "archived" ? "Restaurar" : "Archivar"}</button></div></article>)}</div>}
      </section>
    </div>
  );
}