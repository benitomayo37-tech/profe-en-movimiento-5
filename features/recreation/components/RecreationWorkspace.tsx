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
  const [viewingActivity, setViewingActivity] = useState<RecreationActivityRecord | null>(null);

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

  function printViewingActivity() {
  if (!viewingActivity) return;
  const activity = viewingActivity;
  const escapeHtml = (value: string) => value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
  const typeLabel = recreationActivityTypes.find((item) => item.value === activity.type)?.label ?? activity.type;
  const field = (label: string, value: string, wide = false) => `<section class="field${wide ? " wide" : ""}"><div class="field-label">${label}</div><div class="field-value">${escapeHtml(value || "No especificado")}</div></section>`;
  const frame = document.createElement("iframe");
  frame.setAttribute("title", "Impresi&oacute;n de actividad recreativa");
  frame.style.position = "fixed";
  frame.style.width = "1px";
  frame.style.height = "1px";
  frame.style.opacity = "0";
  frame.style.pointerEvents = "none";
  frame.srcdoc = `<!doctype html><html><head><meta charset="utf-8"><title>${escapeHtml(activity.title)}</title><style>
@page{size:A4 portrait;margin:13mm}*{box-sizing:border-box}body{margin:0;background:#fff;color:#172554;font-family:Arial,sans-serif;font-size:11px;line-height:1.45}.sheet{border:1px solid #bfdbfe;border-radius:14px;padding:18px;background:linear-gradient(180deg,#f8fbff 0,#fff 170px)}.brand{display:flex;align-items:center;gap:13px;border-bottom:4px solid #2563eb;padding-bottom:11px;margin-bottom:18px}.brand img{width:58px;height:58px;object-fit:contain}.brand h1{margin:0;color:#1d4ed8;font-size:20px;letter-spacing:-.02em}.brand p{margin:3px 0 0;color:#64748b;font-size:10px}.kicker{margin:0;color:#2563eb;font-size:9px;font-weight:800;letter-spacing:.15em;text-transform:uppercase}.title{margin:4px 0 5px;color:#0f172a;font-size:24px;line-height:1.15}.meta{display:flex;flex-wrap:wrap;gap:7px;margin:0 0 17px}.pill{border-radius:999px;padding:4px 9px;background:#dbeafe;color:#1e40af;font-size:10px;font-weight:800}.pill.status{background:#dcfce7;color:#166534}.fields{display:grid;grid-template-columns:1fr 1fr;gap:10px}.field{min-width:0;border:1px solid #bfdbfe;border-left:4px solid #3b82f6;border-radius:9px;background:#f8fbff;padding:9px 11px;break-inside:avoid}.field.wide{grid-column:1/-1}.field-label{margin-bottom:4px;color:#1d4ed8;font-size:9px;font-weight:800;letter-spacing:.07em;text-transform:uppercase}.field-value{color:#334155;white-space:pre-wrap}.footer{margin-top:18px;border-top:1px solid #bfdbfe;padding-top:9px;color:#64748b;font-size:9px;text-align:center}.footer strong{color:#1d4ed8}@media print{.sheet{border:0;padding:0;background:#fff}}
</style></head><body><main class="sheet"><header class="brand"><img src="${window.location.origin}/logos/logo-profe-en-movimiento.png" alt="Profe en Movimiento"><div><h1>Profe en Movimiento 5.0</h1><p>Recreaci&oacute;n y Retos &middot; Planificaci&oacute;n de actividad</p></div></header><p class="kicker">Actividad recreativa</p><h2 class="title">${escapeHtml(activity.title)}</h2><div class="meta"><span class="pill">${escapeHtml(typeLabel)}</span></div><div class="fields">${field("Objetivo", activity.objective, true)}${field("Nivel o edad", activity.level)}${field("Duraci&oacute;n", activity.duration)}${field("Participantes", activity.participants)}${field("Espacio", activity.space)}${field("Materiales", activity.materials, true)}${field("Instrucciones", activity.instructions, true)}${field("Adaptaciones DUA y NEE", activity.adaptations, true)}${field("Seguridad", activity.safety, true)}</div><footer class="footer"><strong>Profe en Movimiento 5.0</strong> &middot; Recreaci&oacute;n y Retos &middot; Documento generado desde la plataforma</footer></main></body></html>`;
  frame.onload = () => window.setTimeout(() => { frame.contentWindow?.focus(); frame.contentWindow?.print(); window.setTimeout(() => frame.remove(), 1200); }, 250);
  document.body.appendChild(frame);
}
  return (
    <section className="recreation-workspace space-y-6">
      <header className="rounded-3xl bg-gradient-to-r from-blue-950 via-blue-800 to-blue-600 p-6 text-white shadow-lg">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.22em] text-orange-300">Planificador recreativo</p>
            <h1 className="mt-2 text-3xl font-black">Recreaci&oacute;n y Retos</h1>
            <p className="mt-2 max-w-2xl text-sm font-semibold text-blue-100"> juegos, yincanas y escape rooms inclusivos para clases, convivencias y jornadas recreativas.</p>
          </div>Diseña
          <button type="button" onClick={() => { setEditingId(null); setDraft(emptyRecreationActivity); setFeedback(""); setShowForm(true); }} className="rounded-xl bg-orange-500 px-5 py-3 text-sm font-black text-white shadow-md transition hover:bg-orange-400">+ Nueva actividad</button>
        </div>
      </header>

      {feedback ? <p className="rounded-xl border border-blue-200 bg-blue-50 px-4 py-3 text-sm font-bold text-blue-800">{feedback}</p> : null}

      <div className="flex flex-wrap items-center gap-2">
        <select value={selectedType} onChange={(event) => setSelectedType(event.target.value)} className={fieldClass + " max-w-xs"} aria-label="Filtrar por tipo">
          <option value="todos">Todos los tipos</option>
          {recreationActivityTypes.map((item) => <option key={item.value} value={item.value}>{item.label}</option>)}
        </select>
        {(["active", "published", "draft", "archived", "all"] as const).map((status) => (
          <button key={status} type="button" onClick={() => setStatusFilter(status)} className={statusFilter === status ? "rounded-full bg-blue-700 px-4 py-2 text-xs font-black text-white" : "rounded-full border border-slate-300 bg-white px-4 py-2 text-xs font-black text-slate-700 hover:bg-slate-50"}>
            {status === "active" ? "Activas" : status === "published" ? "Publicadas" : status === "draft" ? "Borradores" : status === "archived" ? "Archivadas" : "Todas"}
          </button>
        ))}
      </div>

      {showForm ? <form onSubmit={(event) => { event.preventDefault(); void saveDraft(); }} className="rounded-3xl border border-blue-200 bg-blue-50/60 p-5 shadow-sm">
        <div className="mb-4 flex items-center justify-between gap-3"><div><p className="text-xs font-black uppercase tracking-[0.18em] text-blue-700">{editingId ? "Editar actividad" : "Nueva actividad"}</p><h2 className="text-2xl font-black text-slate-900">Datos de la propuesta</h2></div><button type="button" onClick={cancelForm} className="rounded-xl border border-slate-300 bg-white px-4 py-2 text-sm font-black text-slate-700">Cancelar</button></div>
        <div className="grid gap-4 md:grid-cols-2">
          <label className="md:col-span-2 text-sm font-black text-slate-800">Nombre<input required value={draft.title} onChange={(event) => updateDraft("title", event.target.value)} className={fieldClass + " mt-1"} placeholder="Ej. Misión de los cuatro equipos" /></label>
          <label className="text-sm font-black text-slate-800">Tipo<select value={draft.type} onChange={(event) => updateDraft("type", event.target.value)} className={fieldClass + " mt-1"}>{recreationActivityTypes.map((item) => <option key={item.value} value={item.value}>{item.label}</option>)}</select></label>
          <label className="text-sm font-black text-slate-800">Nivel o edad<input required value={draft.level} onChange={(event) => updateDraft("level", event.target.value)} className={fieldClass + " mt-1"} placeholder="Ej. 9no EGB" /></label>
          <label className="text-sm font-black text-slate-800">Duraci&oacute;n<input required value={draft.duration} onChange={(event) => updateDraft("duration", event.target.value)} className={fieldClass + " mt-1"} placeholder="Ej. 45 minutos" /></label>
          <label className="text-sm font-black text-slate-800">Participantes<input required value={draft.participants} onChange={(event) => updateDraft("participants", event.target.value)} className={fieldClass + " mt-1"} placeholder="Ej. 40 estudiantes" /></label>
          <label className="text-sm font-black text-slate-800">Espacio<input required value={draft.space} onChange={(event) => updateDraft("space", event.target.value)} className={fieldClass + " mt-1"} placeholder="Ej. patio escolar" /></label>
          <label className="md:col-span-2 text-sm font-black text-slate-800">Objetivo<textarea required value={draft.objective} onChange={(event) => updateDraft("objective", event.target.value)} className={fieldClass + " mt-1 min-h-24"} /></label>
          <label className="md:col-span-2 text-sm font-black text-slate-800">Materiales<textarea required value={draft.materials} onChange={(event) => updateDraft("materials", event.target.value)} className={fieldClass + " mt-1 min-h-24"} /></label>
          <label className="md:col-span-2 text-sm font-black text-slate-800">Instrucciones<textarea required value={draft.instructions} onChange={(event) => updateDraft("instructions", event.target.value)} className={fieldClass + " mt-1 min-h-28"} /></label>
          <label className="text-sm font-black text-slate-800">Adaptaciones DUA y NEE<textarea required value={draft.adaptations} onChange={(event) => updateDraft("adaptations", event.target.value)} className={fieldClass + " mt-1 min-h-24"} /></label>
          <label className="text-sm font-black text-slate-800">Seguridad<textarea required value={draft.safety} onChange={(event) => updateDraft("safety", event.target.value)} className={fieldClass + " mt-1 min-h-24"} /></label>
        </div>
        <button disabled={saving} type="submit" className="mt-5 rounded-xl bg-blue-700 px-5 py-3 text-sm font-black text-white shadow-sm hover:bg-blue-800 disabled:opacity-60">{saving ? "Guardando..." : editingId ? "Actualizar actividad" : "Guardar actividad"}</button>
      </form> : null}

      <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="mb-4 flex items-center justify-between gap-3"><div><p className="text-xs font-black uppercase tracking-[0.18em] text-blue-700">Mis actividades</p><h2 className="text-2xl font-black text-slate-900">Actividades guardadas</h2></div><span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-black text-slate-600">{visibleActivities.length} visibles</span></div>
        {loadingActivities ? <p className="py-10 text-center text-sm font-bold text-slate-500">Cargando actividades...</p> : visibleActivities.length === 0 ? <p className="rounded-2xl border border-dashed border-slate-300 px-5 py-10 text-center text-sm font-bold text-slate-500">No hay actividades en este filtro.</p> : <div className="grid gap-4 lg:grid-cols-2">{visibleActivities.map((activity) => { const typeLabel = recreationActivityTypes.find((item) => item.value === activity.type)?.label ?? activity.type; return <article key={activity.id} className="rounded-2xl border border-slate-200 bg-slate-50 p-4"><div className="flex items-start justify-between gap-3"><div><p className="text-xs font-black uppercase tracking-wide text-blue-700">{typeLabel}</p><h3 className="mt-1 text-lg font-black text-slate-900">{activity.title}</h3></div><span className="rounded-full bg-blue-100 px-3 py-1 text-[11px] font-black text-blue-800">{activity.status === "draft" ? "Borrador" : activity.status === "archived" ? "Archivada" : "Publicada"}</span></div><p className="mt-2 line-clamp-2 text-sm font-semibold text-slate-600">{activity.objective}</p><div className="mt-4 flex flex-wrap gap-2"><button type="button" onClick={() => setViewingActivity(activity)} className="rounded-lg bg-blue-700 px-3 py-2 text-xs font-black text-white">Ver actividad</button><button type="button" onClick={() => startEdit(activity)} className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs font-black text-slate-700">Editar</button>{activity.status === "draft" ? <button type="button" onClick={() => void changeStatus(activity.id, "publish")} className="rounded-lg border border-emerald-300 bg-emerald-50 px-3 py-2 text-xs font-black text-emerald-700">Publicar</button> : null}{activity.status === "archived" ? <button type="button" onClick={() => void changeStatus(activity.id, "restore")} className="rounded-lg border border-blue-300 bg-blue-50 px-3 py-2 text-xs font-black text-blue-700">Restaurar</button> : <button type="button" onClick={() => void changeStatus(activity.id, "archive")} className="rounded-lg border border-amber-300 bg-amber-50 px-3 py-2 text-xs font-black text-amber-700">Archivar</button>}</div></article>; })}</div>}
      </section>

      {viewingActivity ? <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4"><div className="recreation-print-detail max-h-[90vh] w-full max-w-3xl overflow-y-auto rounded-3xl bg-white p-6 shadow-2xl"><div className="flex items-start justify-between gap-4"><div><p className="text-xs font-black uppercase tracking-[0.18em] text-blue-700">Actividad recreativa</p><h2 className="mt-1 text-3xl font-black text-slate-950">{viewingActivity.title}</h2><p className="mt-1 text-sm font-bold text-slate-500">{recreationActivityTypes.find((item) => item.value === viewingActivity.type)?.label ?? viewingActivity.type}</p></div><button type="button" onClick={() => setViewingActivity(null)} className="no-print rounded-full border border-slate-300 px-3 py-1 text-lg font-black text-slate-600">&times;</button></div><div className="mt-6 grid gap-5 sm:grid-cols-2"><Detail label="Objetivo" value={viewingActivity.objective} full /><Detail label="Nivel o edad" value={viewingActivity.level} /><Detail label="Duraci&oacute;n" value={viewingActivity.duration} /><Detail label="Participantes" value={viewingActivity.participants} /><Detail label="Espacio" value={viewingActivity.space} /><Detail label="Materiales" value={viewingActivity.materials} full /><Detail label="Instrucciones" value={viewingActivity.instructions} full /><Detail label="Adaptaciones DUA y NEE" value={viewingActivity.adaptations} full /><Detail label="Seguridad" value={viewingActivity.safety} full /></div><div className="no-print mt-6 flex flex-wrap justify-end gap-2"><button type="button" onClick={printViewingActivity} className="rounded-xl border border-blue-300 bg-blue-50 px-4 py-2.5 text-sm font-black text-blue-700">Imprimir / Guardar</button><button type="button" onClick={() => setViewingActivity(null)} className="rounded-xl bg-blue-700 px-4 py-2.5 text-sm font-black text-white">Cerrar</button></div><div className="recreation-print-footer mt-8 border-t border-slate-300 pt-3 text-center text-xs font-semibold text-slate-500">Profe en Movimiento 5.0 &middot; Recreaci&oacute;n y Retos &middot; Documento generado desde la plataforma</div></div></div> : null}
    </section>
  );
function Detail({ label, value, full = false }: { label: string; value: string; full?: boolean }) {
  return <div className={full ? "sm:col-span-2" : ""}><p className="text-xs font-black uppercase text-blue-700">{label}</p><p className="mt-1 whitespace-pre-wrap text-sm font-semibold text-slate-700">{value || "No especificado"}</p></div>;
}
}
