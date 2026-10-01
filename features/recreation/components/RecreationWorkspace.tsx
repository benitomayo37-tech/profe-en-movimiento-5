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
  const statusLabel = activity.status === "draft" ? "Borrador" : activity.status === "archived" ? "Archivada" : "Publicada";
  const field = (label: string, value: string, wide = false) => `<section class="field${wide ? " wide" : ""}"><div class="field-label">${label}</div><div class="field-value">${escapeHtml(value || "No especificado")}</div></section>`;
  const frame = document.createElement("iframe");
  frame.setAttribute("title", "ImpresiÃ³n de actividad recreativa");
  frame.style.position = "fixed";
  frame.style.width = "1px";
  frame.style.height = "1px";
  frame.style.opacity = "0";
  frame.style.pointerEvents = "none";
  frame.srcdoc = `<!doctype html><html><head><meta charset="utf-8"><title>${escapeHtml(activity.title)}</title><style>
@page{size:A4 portrait;margin:13mm}*{box-sizing:border-box}body{margin:0;background:#fff;color:#172554;font-family:Arial,sans-serif;font-size:11px;line-height:1.45}.sheet{border:1px solid #bfdbfe;border-radius:14px;padding:18px;background:linear-gradient(180deg,#f8fbff 0,#fff 170px)}.brand{display:flex;align-items:center;gap:13px;border-bottom:4px solid #2563eb;padding-bottom:11px;margin-bottom:18px}.brand img{width:58px;height:58px;object-fit:contain}.brand h1{margin:0;color:#1d4ed8;font-size:20px;letter-spacing:-.02em}.brand p{margin:3px 0 0;color:#64748b;font-size:10px}.kicker{margin:0;color:#2563eb;font-size:9px;font-weight:800;letter-spacing:.15em;text-transform:uppercase}.title{margin:4px 0 5px;color:#0f172a;font-size:24px;line-height:1.15}.meta{display:flex;flex-wrap:wrap;gap:7px;margin:0 0 17px}.pill{border-radius:999px;padding:4px 9px;background:#dbeafe;color:#1e40af;font-size:10px;font-weight:800}.pill.status{background:#dcfce7;color:#166534}.fields{display:grid;grid-template-columns:1fr 1fr;gap:10px}.field{min-width:0;border:1px solid #bfdbfe;border-left:4px solid #3b82f6;border-radius:9px;background:#f8fbff;padding:9px 11px;break-inside:avoid}.field.wide{grid-column:1/-1}.field-label{margin-bottom:4px;color:#1d4ed8;font-size:9px;font-weight:800;letter-spacing:.07em;text-transform:uppercase}.field-value{color:#334155;white-space:pre-wrap}.footer{margin-top:18px;border-top:1px solid #bfdbfe;padding-top:9px;color:#64748b;font-size:9px;text-align:center}.footer strong{color:#1d4ed8}@media print{.sheet{border:0;padding:0;background:#fff}}
</style></head><body><main class="sheet"><header class="brand"><img src="${window.location.origin}/logos/logo-profe-en-movimiento.png" alt="Profe en Movimiento"><div><h1>Profe en Movimiento 5.0</h1><p>RecreaciÃ³n y Retos Â· PlanificaciÃ³n de actividad</p></div></header><p class="kicker">Actividad recreativa</p><h2 class="title">${escapeHtml(activity.title)}</h2><div class="meta"><span class="pill">${escapeHtml(typeLabel)}</span><span class="pill status">${escapeHtml(statusLabel)}</span></div><div class="fields">${field("Objetivo", activity.objective, true)}${field("Nivel o edad", activity.level)}${field("DuraciÃ³n", activity.duration)}${field("Participantes", activity.participants)}${field("Espacio", activity.space)}${field("Materiales", activity.materials, true)}${field("Instrucciones", activity.instructions, true)}${field("Adaptaciones DUA y NEE", activity.adaptations, true)}${field("Seguridad", activity.safety, true)}</div><footer class="footer"><strong>Profe en Movimiento 5.0</strong> Â· RecreaciÃ³n y Retos Â· Documento generado desde la plataforma</footer></main></body></html>`;
  frame.onload = () => window.setTimeout(() => { frame.contentWindow?.focus(); frame.contentWindow?.print(); window.setTimeout(() => frame.remove(), 1200); }, 250);
  document.body.appendChild(frame);
}
function Detail({ label, value, full = false }: { label: string; value: string; full?: boolean }) {
  return <div className={full ? "sm:col-span-2" : ""}><p className="text-xs font-black uppercase text-blue-700">{label}</p><p className="mt-1 whitespace-pre-wrap text-sm font-semibold text-slate-700">{value || "No especificado"}</p></div>;
}
}
