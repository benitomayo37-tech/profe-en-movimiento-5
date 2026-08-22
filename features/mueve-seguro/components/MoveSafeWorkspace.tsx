"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { createClient } from "@/lib/supabase/client";

import PreventionChecklist from "@/features/mueve-seguro/components/PreventionChecklist";
import ProtocolLibrary from "@/features/mueve-seguro/components/ProtocolLibrary";
import MoveSafeStats from "@/features/mueve-seguro/components/MoveSafeStats";

type Situation = "golpe" | "respiracion" | "calor" | "sangrado" | "articulacion" | "emocional" | "ambiente" | "otra";
type CriticalAnswer = "yes" | "no" | "unsure";
type Severity = "mild" | "priority" | "worsening";
type GuidanceLevel = "yellow" | "orange" | "red";

const situations: Array<{ id: Situation; icon: string; label: string; detail: string }> = [
  { id: "golpe", icon: "🤕", label: "Golpe o caída", detail: "Impacto, caída o choque durante la actividad." },
  { id: "articulacion", icon: "🦵", label: "Dolor o articulación", detail: "Torcedura, dolor intenso o dificultad para moverse." },
  { id: "respiracion", icon: "🫁", label: "Dificultad respiratoria", detail: "Falta de aire o respiración diferente a lo habitual." },
  { id: "calor", icon: "☀️", label: "Calor o agotamiento", detail: "Mareo, debilidad, deshidratación o exposición al calor." },
  { id: "sangrado", icon: "🩹", label: "Sangrado", detail: "Herida o sangrado visible." },
  { id: "emocional", icon: "💬", label: "Situación emocional", detail: "Ansiedad, angustia o bloqueo emocional." },
  { id: "ambiente", icon: "⚠️", label: "Riesgo del entorno", detail: "Clima, instalación, material o espacio inseguro." },
  { id: "otra", icon: "➕", label: "Otra situación", detail: "La situación no aparece en esta lista." },
];

const levelStyles: Record<GuidanceLevel, { label: string; shell: string; badge: string }> = {
  yellow: { label: "Precaución", shell: "border-amber-200 bg-amber-50", badge: "bg-amber-500 text-slate-950" },
  orange: { label: "Atención prioritaria", shell: "border-orange-200 bg-orange-50", badge: "bg-orange-600 text-white" },
  red: { label: "Emergencia", shell: "border-red-300 bg-red-50", badge: "bg-red-700 text-white" },
};

function determineLevel(critical: CriticalAnswer | null, severity: Severity | null, situation: Situation | null): GuidanceLevel {
  if (critical === "yes" || critical === "unsure") return "red";
  if (severity === "worsening") return "red";
  if (severity === "priority" || situation === "respiracion" || situation === "sangrado") return "orange";
  return "yellow";
}

export default function MoveSafeWorkspace() {
  const [mode, setMode] = useState<"home" | "guidance" | "prevention" | "protocols" | "incident" | "history">("home");
  const [step, setStep] = useState(0);
  const [situation, setSituation] = useState<Situation | null>(null);
  const [critical, setCritical] = useState<CriticalAnswer | null>(null);
  const [severity, setSeverity] = useState<Severity | null>(null);

  const result = useMemo(() => determineLevel(critical, severity, situation), [critical, severity, situation]);
  const selectedSituation = situations.find((item) => item.id === situation);

  function reset() {
    setMode("home"); setStep(0); setSituation(null); setCritical(null); setSeverity(null);
  }

  function startGuidance() { setMode("guidance"); setStep(1); }

  return (
    <div className="space-y-8">
      <section className="relative overflow-hidden rounded-[2rem] bg-gradient-to-br from-[#071532] via-[#0b3c67] to-emerald-700 px-6 py-10 text-white shadow-2xl sm:px-10 lg:px-12">
        <div className="absolute -right-16 -top-20 h-72 w-72 rounded-full border-[48px] border-white/5" />
        <div className="relative flex flex-col gap-8 lg:flex-row lg:items-center lg:justify-between">
          <div className="max-w-3xl"><span className="inline-flex rounded-full border border-emerald-200/30 bg-emerald-300/10 px-4 py-2 text-xs font-black uppercase tracking-[.2em] text-emerald-200">Seguridad educativa</span><h1 className="mt-5 text-4xl font-black tracking-tight sm:text-5xl">MueveSeguro</h1><p className="mt-3 text-xl font-black text-orange-300">Educa, previene y protege.</p><p className="mt-5 max-w-2xl leading-8 text-blue-100">Orientación clara para actuar con calma, identificar señales de alerta y aplicar los protocolos de tu institución.</p></div>
          <div className="flex h-28 w-28 shrink-0 items-center justify-center rounded-[2rem] border border-white/15 bg-white/10 text-6xl shadow-inner" aria-hidden="true">🛡️</div>
        </div>
      </section>

      <section className="rounded-3xl border-2 border-red-200 bg-red-50 p-5 sm:p-6" aria-label="Aviso de emergencia">
        <div className="flex items-start gap-4"><span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-red-700 text-xl text-white" aria-hidden="true">!</span><div><h2 className="font-black text-red-950">¿Existe peligro inmediato?</h2><p className="mt-1 text-sm leading-6 text-red-900">Si una persona no responde, no respira normalmente, presenta sangrado abundante o está en peligro, activa ahora el protocolo institucional y contacta los servicios de emergencia de tu localidad. No esperes a completar este orientador.</p></div></div>
      </section>

      {mode === "home" ? (
        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
          <button onClick={startGuidance} className="group rounded-3xl border border-orange-200 bg-gradient-to-br from-orange-50 to-white p-6 text-left shadow-sm transition hover:-translate-y-1 hover:shadow-xl"><span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-orange-600 text-2xl text-white" aria-hidden="true">⚡</span><h2 className="mt-5 text-xl font-black">Necesito orientación ahora</h2><p className="mt-3 text-sm leading-6 text-slate-600">Responde preguntas breves y recibe pasos conservadores de actuación.</p><span className="mt-5 inline-flex font-black text-orange-700">Comenzar →</span></button>
          <button onClick={() => setMode("prevention")} className="group rounded-3xl border border-emerald-200 bg-gradient-to-br from-emerald-50 to-white p-6 text-left shadow-sm transition hover:-translate-y-1 hover:shadow-xl"><span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-600 text-2xl text-white" aria-hidden="true">✓</span><h2 className="mt-5 text-xl font-black">Prevenir riesgos</h2><p className="mt-3 text-sm leading-6 text-slate-600">Listas de verificación para espacios, clima y materiales.</p><span className="mt-5 inline-flex text-sm font-black text-emerald-700">Comenzar revisión →</span></button>
          <button onClick={() => setMode("protocols")} className="group rounded-3xl border border-blue-200 bg-gradient-to-br from-blue-50 to-white p-6 text-left shadow-sm transition hover:-translate-y-1 hover:shadow-xl"><span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-700 text-2xl text-white" aria-hidden="true">📘</span><h2 className="mt-5 text-xl font-black">Consultar protocolos</h2><p className="mt-3 text-sm leading-6 text-slate-600">Guías rápidas, revisadas y organizadas por situación.</p><span className="mt-5 inline-flex text-sm font-black text-blue-700">Consultar guía →</span></button>
          <button onClick={() => setMode("incident")} className="group rounded-3xl border border-violet-200 bg-gradient-to-br from-violet-50 to-white p-6 text-left shadow-sm transition hover:-translate-y-1 hover:shadow-xl"><span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-violet-700 text-2xl text-white" aria-hidden="true">📝</span><h2 className="mt-5 text-xl font-black">Registrar incidente</h2><p className="mt-3 text-sm leading-6 text-slate-600">Documenta objetivamente lo ocurrido, las acciones realizadas y el seguimiento.</p><span className="mt-5 inline-flex text-sm font-black text-violet-700">Crear registro →</span></button>
          <button onClick={() => setMode("history")} className="group rounded-3xl border border-indigo-200 bg-gradient-to-br from-indigo-50 to-white p-6 text-left shadow-sm transition hover:-translate-y-1 hover:shadow-xl"><span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-indigo-700 text-2xl text-white" aria-hidden="true">📚</span><h2 className="mt-5 text-xl font-black">Historial y seguimiento</h2><p className="mt-3 text-sm leading-6 text-slate-600">Consulta tus incidentes guardados, revisa su estado y abre cada registro.</p><span className="mt-5 inline-flex text-sm font-black text-indigo-700">Ver historial →</span></button>
        </div>
      ) : mode === "prevention" ? (
        <PreventionChecklist onBack={reset} />
      ) : mode === "protocols" ? (
        <ProtocolLibrary onBack={reset} />
      ) : mode === "incident" ? (
        <IncidentRegister onBack={reset} />
      ) : mode === "history" ? (
        <IncidentHistory onBack={reset} />
      ) : (
        <section className="overflow-hidden rounded-[2rem] border border-slate-200 bg-white shadow-xl">
          <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-200 bg-slate-50 px-6 py-5"><div><p className="text-xs font-black uppercase tracking-[.18em] text-emerald-700">Orientación inmediata</p><h2 className="mt-1 text-2xl font-black">Actúa con calma y seguridad</h2></div><button onClick={reset} className="rounded-xl border border-slate-300 bg-white px-4 py-2 text-sm font-black text-slate-600 hover:bg-slate-100">← Volver</button></div>
          <div className="p-6 sm:p-8">
            {step === 1 && <div><p className="text-sm font-black text-blue-700">Paso 1 de 3</p><h3 className="mt-2 text-3xl font-black">¿Qué está ocurriendo?</h3><p className="mt-2 text-slate-600">Selecciona la opción que más se aproxima. Esto no constituye un diagnóstico.</p><div className="mt-7 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">{situations.map(item => <button key={item.id} onClick={() => { setSituation(item.id); setStep(2); }} className="rounded-2xl border border-slate-200 p-4 text-left transition hover:border-blue-300 hover:bg-blue-50"><span className="text-2xl" aria-hidden="true">{item.icon}</span><p className="mt-3 font-black">{item.label}</p><p className="mt-1 text-xs leading-5 text-slate-500">{item.detail}</p></button>)}</div></div>}

            {step === 2 && <div><p className="text-sm font-black text-blue-700">Paso 2 de 3 · {selectedSituation?.label}</p><h3 className="mt-2 text-3xl font-black">¿Hay alguna señal crítica?</h3><p className="mt-3 max-w-3xl leading-7 text-slate-600">La persona no responde, no respira normalmente, presenta sangrado abundante, convulsiona, tiene dolor intenso en pecho o existe peligro inmediato.</p><div className="mt-7 grid gap-3 sm:grid-cols-3">{[["yes", "Sí", "Existe una señal crítica"], ["unsure", "No estoy seguro", "No puedo descartarla"], ["no", "No", "Ninguna de esas señales"]].map(([value, label, detail]) => <button key={value} onClick={() => { const answer = value as CriticalAnswer; setCritical(answer); if (answer === "no") setStep(3); else setStep(4); }} className="rounded-2xl border border-slate-200 p-5 text-left hover:border-orange-300 hover:bg-orange-50"><p className="font-black">{label}</p><p className="mt-1 text-sm text-slate-500">{detail}</p></button>)}</div></div>}

            {step === 3 && <div><p className="text-sm font-black text-blue-700">Paso 3 de 3 · {selectedSituation?.label}</p><h3 className="mt-2 text-3xl font-black">¿Cómo evoluciona la situación?</h3><div className="mt-7 grid gap-3 sm:grid-cols-3">{[["mild", "Leve y estable", "La persona responde y la situación no empeora"], ["priority", "Limita la actividad", "Hay dolor importante, incapacidad o malestar persistente"], ["worsening", "Está empeorando", "Aumentan rápidamente los síntomas o la preocupación"]].map(([value, label, detail]) => <button key={value} onClick={() => { setSeverity(value as Severity); setStep(4); }} className="rounded-2xl border border-slate-200 p-5 text-left hover:border-orange-300 hover:bg-orange-50"><p className="font-black">{label}</p><p className="mt-1 text-sm text-slate-500">{detail}</p></button>)}</div></div>}

            {step === 4 && <GuidanceResult level={result} situation={selectedSituation?.label ?? "Situación reportada"} onReset={() => { setStep(1); setSituation(null); setCritical(null); setSeverity(null); }} />}
          </div>
        </section>
      )}

      <p className="rounded-2xl border border-slate-200 bg-white p-5 text-center text-xs leading-6 text-slate-500">MueveSeguro ofrece orientación educativa general. No diagnostica, no prescribe medicamentos y no sustituye la valoración sanitaria, los servicios de emergencia ni los protocolos de tu institución.</p>
    </div>
  );
}

function GuidanceResult({ level, situation, onReset }: { level: GuidanceLevel; situation: string; onReset: () => void }) {
  const style = levelStyles[level];
  const actions = level === "red"
    ? ["Detén la actividad y asegura el entorno.", "Activa inmediatamente el protocolo institucional y contacta los servicios de emergencia locales.", "No dejes sola a la persona. Si estás capacitado, aplica únicamente las maniobras de primeros auxilios correspondientes.", "Solicita que otra persona reciba y guíe al personal de emergencia."]
    : level === "orange"
      ? ["Suspende la participación y lleva a la persona a un lugar seguro.", "Mantén supervisión directa y solicita valoración del personal responsable o sanitario.", "Informa a la autoridad institucional y a la familia según el protocolo.", "No autorices el retorno a la actividad mientras persista el malestar."]
      : ["Detén temporalmente la participación y observa en un lugar seguro.", "Revisa si aparecen nuevas señales de alerta o si el malestar aumenta.", "Aplica solo medidas básicas para las que estés capacitado y sigue el protocolo institucional.", "Si no mejora, cambia a atención prioritaria y solicita valoración profesional."];

  return <div><div className={`rounded-3xl border-2 p-6 ${style.shell}`}><div className="flex flex-wrap items-center gap-3"><span className={`rounded-full px-4 py-2 text-xs font-black uppercase tracking-[.16em] ${style.badge}`}>{style.label}</span><span className="text-sm font-bold text-slate-600">{situation}</span></div><h3 className="mt-5 text-3xl font-black text-slate-950">Qué hacer ahora</h3><ol className="mt-5 space-y-3">{actions.map((action, index) => <li key={action} className="flex gap-3 rounded-2xl bg-white/80 p-4"><span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-slate-950 text-xs font-black text-white">{index + 1}</span><span className="text-sm font-semibold leading-6 text-slate-700">{action}</span></li>)}</ol></div><div className="mt-5 grid gap-4 md:grid-cols-2"><div className="rounded-2xl border border-red-200 bg-white p-5"><h4 className="font-black text-red-800">Evita</h4><ul className="mt-3 space-y-2 text-sm leading-6 text-slate-600"><li>• No minimices señales inciertas.</li><li>• No administres medicamentos.</li><li>• No fuerces movimientos ni el retorno a la actividad.</li></ul></div><div className="rounded-2xl border border-blue-200 bg-white p-5"><h4 className="font-black text-blue-800">Comunica</h4><p className="mt-3 text-sm leading-6 text-slate-600">Describe hechos observables: qué ocurrió, cuándo, señales presentes, acciones realizadas y cambios observados.</p></div></div><div className="mt-6 flex flex-wrap gap-3"><button onClick={onReset} className="rounded-xl bg-blue-700 px-5 py-3 text-sm font-black text-white hover:bg-blue-800">Realizar otra consulta</button><Link href="/dashboard" className="rounded-xl border border-slate-300 px-5 py-3 text-sm font-black text-slate-700 hover:bg-slate-50">Volver al Dashboard</Link></div></div>;
}


type IncidentRecord = {
  date: string;
  time: string;
  place: string;
  activity: string;
  type: string;
  description: string;
  actions: string;
  notified: string;
  externalHelp: string;
  followUp: string;
  status: "Pendiente" | "En seguimiento" | "Cerrado";
  observations: string;
  reportNumber: string;
  institution: string;
  addressedTo: string;
  teacherName: string;
  teacherRole: string;
  studentName: string;
  courseGroup: string;
  witnesses: string;
  representativeNotified: string;
  institutionalProtocol: string;
};

const incidentTypes = [
  "Golpe o caída",
  "Torcedura o dolor articular",
  "Dificultad respiratoria",
  "Sangrado",
  "Calor, deshidratación o agotamiento",
  "Convulsión",
  "Crisis emocional",
  "Riesgo del entorno",
  "Otra situación",
];


type IncidentStatusDb = "pendiente" | "en_seguimiento" | "cerrado";

type HistoryIncident = {
  id: string; code: string; institution: string; recipient: string; teacher_name: string; teacher_role: string;
  student_name: string | null; student_class: string | null; incident_date: string; incident_time: string | null;
  location: string; activity: string; situation: string; external_help: boolean; description: string; actions_taken: string;
  people_notified: string | null; family_notified: string | null; witnesses: string | null; institutional_protocol: string | null;
  follow_up_required: string | null; observations: string | null; status: IncidentStatusDb; created_at: string; updated_at: string;
};

type IncidentFollowup = {
  id: string;
  incident_id: string;
  user_id: string;
  follow_up_date: string;
  responsible: string;
  status: IncidentStatusDb;
  evolution: string;
  action_required: boolean;
  pending_action: string | null;
  next_review_date: string | null;
  created_at: string;
};

const statusLabels: Record<IncidentStatusDb, string> = { pendiente: "Pendiente", en_seguimiento: "En seguimiento", cerrado: "Cerrado" };
const statusStyles: Record<IncidentStatusDb, string> = {
  pendiente: "bg-amber-100 text-amber-800 border-amber-200",
  en_seguimiento: "bg-violet-100 text-violet-800 border-violet-200",
  cerrado: "bg-emerald-100 text-emerald-800 border-emerald-200",
};

function dbToIncidentRecord(row: HistoryIncident): IncidentRecord {
  return {
    reportNumber: row.code, date: row.incident_date, time: row.incident_time ?? "", place: row.location, activity: row.activity,
    type: row.situation, description: row.description, actions: row.actions_taken, notified: row.people_notified ?? "",
    externalHelp: row.external_help ? "Sí" : "No", followUp: row.follow_up_required ?? "",
    status: row.status === "pendiente" ? "Pendiente" : row.status === "en_seguimiento" ? "En seguimiento" : "Cerrado",
    observations: row.observations ?? "", institution: row.institution, addressedTo: row.recipient, teacherName: row.teacher_name,
    teacherRole: row.teacher_role, studentName: row.student_name ?? "", courseGroup: row.student_class ?? "",
    witnesses: row.witnesses ?? "", representativeNotified: row.family_notified ?? "", institutionalProtocol: row.institutional_protocol ?? "",
  };
}

function IncidentHistory({ onBack }: { onBack: () => void }) {
  const [records, setRecords] = useState<HistoryIncident[]>([]);
  const [selected, setSelected] = useState<HistoryIncident | null>(null);
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | IncidentStatusDb>("all");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  async function loadHistory() {
    setLoading(true); setError(null);
    try {
      const supabase = createClient();
      if (!supabase) {
  throw new Error("No se pudo inicializar Supabase.");
}
      const { data: authData, error: authError } = await supabase.auth.getUser();
      if (authError) throw authError;
      if (!authData.user) throw new Error("Tu sesión no está disponible. Inicia sesión nuevamente.");
      const { data, error: queryError } = await supabase
        .from("incident_reports")
        .select("id, code, institution, recipient, teacher_name, teacher_role, student_name, student_class, incident_date, incident_time, location, activity, situation, external_help, description, actions_taken, people_notified, family_notified, witnesses, institutional_protocol, follow_up_required, observations, status, created_at, updated_at")
        .eq("user_id", authData.user.id)
        .order("created_at", { ascending: false });
      if (queryError) throw queryError;
      setRecords((data ?? []) as HistoryIncident[]);
    } catch (err) {
      console.error("MueveSeguro: error al cargar historial", err);
      setError(err instanceof Error ? err.message : "No fue posible cargar el historial.");
    } finally { setLoading(false); }
  }

  useEffect(() => { void loadHistory(); }, []);

  const filtered = records.filter((record) => {
    const q = query.trim().toLowerCase();
    const matchesQuery = !q || [record.code, record.student_name ?? "", record.situation, record.location, record.activity, record.institution].join(" ").toLowerCase().includes(q);
    return matchesQuery && (statusFilter === "all" || record.status === statusFilter);
  });
  const counts = {
    all: records.length,
    pendiente: records.filter((r) => r.status === "pendiente").length,
    en_seguimiento: records.filter((r) => r.status === "en_seguimiento").length,
    cerrado: records.filter((r) => r.status === "cerrado").length,
  };

  if (selected) return <IncidentDetail record={selected} onBack={() => setSelected(null)} />;

  return (
    <section className="overflow-hidden rounded-[2rem] border border-slate-200 bg-white shadow-xl">
      <div className="border-b border-slate-200 bg-slate-50 px-6 py-6 sm:px-8">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div><p className="text-xs font-black uppercase tracking-[.18em] text-indigo-700">Historial y seguimiento</p><h2 className="mt-1 text-2xl font-black text-slate-950">Tus incidentes registrados</h2><p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">Consulta los registros asociados a tu cuenta. El incidente original se conserva y los seguimientos se añadirán en la siguiente etapa.</p></div>
          <button onClick={onBack} className="rounded-xl border border-slate-300 bg-white px-4 py-2 text-sm font-black text-slate-600 hover:bg-slate-100">← Volver</button>
        </div>
      </div>
      <div className="p-6 sm:p-8">
        <div className="grid gap-3 sm:grid-cols-4">
          {([["all", "Total", counts.all, "border-slate-200 bg-slate-50"],["pendiente", "Pendientes", counts.pendiente, "border-amber-200 bg-amber-50"],["en_seguimiento", "En seguimiento", counts.en_seguimiento, "border-violet-200 bg-violet-50"],["cerrado", "Cerrados", counts.cerrado, "border-emerald-200 bg-emerald-50"]] as const).map(([id,label,count,style]) => (
            <button key={id} onClick={() => setStatusFilter(id as typeof statusFilter)} className={`rounded-2xl border p-4 text-left transition hover:-translate-y-0.5 hover:shadow-sm ${style} ${statusFilter === id ? "ring-2 ring-indigo-500 ring-offset-1" : ""}`}><p className="text-xs font-black uppercase tracking-wide text-slate-500">{label}</p><p className="mt-1 text-2xl font-black text-slate-950">{count}</p></button>
          ))}
        </div>

        <MoveSafeStats records={records} />
        
        <div className="mt-6 flex flex-col gap-3 sm:flex-row">
          <input aria-label="Buscar incidente" value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Buscar por código, estudiante, situación, lugar o actividad..." className="flex-1 rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm font-semibold outline-none focus:border-indigo-500" />
          <select aria-label="Filtrar por estado" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value as typeof statusFilter)} className="rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm font-black outline-none focus:border-indigo-500"><option value="all">Todos los estados</option><option value="pendiente">Pendientes</option><option value="en_seguimiento">En seguimiento</option><option value="cerrado">Cerrados</option></select>
          <button onClick={() => void loadHistory()} disabled={loading} className="rounded-xl border border-indigo-200 bg-indigo-50 px-5 py-3 text-sm font-black text-indigo-700 hover:bg-indigo-100 disabled:opacity-50">↻ Actualizar</button>
        </div>
        {error && <div role="alert" className="mt-5 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm font-semibold leading-6 text-red-800"><strong>No se pudo cargar el historial.</strong> {error}</div>}
        {loading ? <div className="mt-6 rounded-2xl border border-slate-200 bg-slate-50 p-8 text-center text-sm font-bold text-slate-500">Cargando tus incidentes...</div> : filtered.length === 0 ? (
          <div className="mt-6 rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-10 text-center"><div className="text-4xl">📚</div><h3 className="mt-3 text-lg font-black text-slate-900">No hay incidentes que mostrar</h3><p className="mt-2 text-sm leading-6 text-slate-600">{records.length === 0 ? "Cuando guardes tu primer incidente aparecerá aquí." : "Prueba con otro término de búsqueda o cambia el filtro de estado."}</p></div>
        ) : (
          <div className="mt-6 grid gap-4 lg:grid-cols-2">{filtered.map((record) => (
            <article key={record.id} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
              <div className="flex items-start justify-between gap-3"><div><p className="text-xs font-black tracking-wide text-indigo-700">{record.code}</p><h3 className="mt-1 text-lg font-black text-slate-950">{record.situation}</h3></div><span className={`rounded-full border px-3 py-1 text-xs font-black ${statusStyles[record.status]}`}>{statusLabels[record.status]}</span></div>
              <div className="mt-4 grid gap-2 text-sm text-slate-600 sm:grid-cols-2"><p><strong className="text-slate-900">Estudiante:</strong> {record.student_name || "No indicado"}</p><p><strong className="text-slate-900">Fecha:</strong> {record.incident_date}</p><p><strong className="text-slate-900">Lugar:</strong> {record.location}</p><p><strong className="text-slate-900">Actividad:</strong> {record.activity}</p></div>
              <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 pt-4"><span className="text-xs font-semibold text-slate-500">Registrado {new Date(record.created_at).toLocaleString("es-EC", { dateStyle: "medium", timeStyle: "short" })}</span><button onClick={() => setSelected(record)} className="rounded-xl bg-indigo-700 px-4 py-2 text-sm font-black text-white hover:bg-indigo-800">Ver incidente →</button></div>
            </article>
          ))}</div>
        )}
      </div>
    </section>
  );
}

function IncidentDetail({ record, onBack }: { record: HistoryIncident; onBack: () => void }) {
  const [showReport, setShowReport] = useState(false);
  const [currentStatus, setCurrentStatus] = useState<IncidentStatusDb>(record.status);
  const [followups, setFollowups] = useState<IncidentFollowup[]>([]);
  const [loadingFollowups, setLoadingFollowups] = useState(true);
  const [followupError, setFollowupError] = useState<string | null>(null);
  const [showFollowupForm, setShowFollowupForm] = useState(false);
  const [savingFollowup, setSavingFollowup] = useState(false);
  const [followupSuccess, setFollowupSuccess] = useState<string | null>(null);
  const [closureForm, setClosureForm] = useState({
    finalActions: "",
    finalObservation: "",
  });
  const [followupForm, setFollowupForm] = useState({
    date: new Date().toISOString().slice(0, 10),
    responsible: record.teacher_name,
    status: record.status,
    evolution: "",
    actionRequired: false,
    pendingAction: "",
    nextReviewDate: "",
  });

  const displayRecord = { ...record, status: currentStatus };
  const original = dbToIncidentRecord(displayRecord);

  async function loadFollowups() {
    setLoadingFollowups(true);
    setFollowupError(null);
    try {
      const supabase = createClient();

if (!supabase) {
  throw new Error("No se pudo inicializar Supabase.");
}

if (!supabase) {
  throw new Error("No se pudo inicializar Supabase.");
}

const { data: authData, error: authError } =
  await supabase.auth.getUser();
      if (authError) throw authError;
      if (!authData.user) throw new Error("Tu sesión no está disponible. Inicia sesión nuevamente.");

      const { data, error } = await supabase
        .from("incident_followups")
        .select("id, incident_id, user_id, follow_up_date, responsible, status, evolution, action_required, pending_action, next_review_date, created_at")
        .eq("incident_id", record.id)
        .eq("user_id", authData.user.id)
        .order("follow_up_date", { ascending: false })
        .order("created_at", { ascending: false });

      if (error) throw error;
      setFollowups((data ?? []) as IncidentFollowup[]);
    } catch (error) {
      console.error("MueveSeguro: error al cargar seguimientos", error);
      setFollowupError(error instanceof Error ? error.message : "No fue posible cargar los seguimientos.");
    } finally {
      setLoadingFollowups(false);
    }
  }

  useEffect(() => { void loadFollowups(); }, [record.id]);

  async function saveFollowup() {
    if (savingFollowup) return;

    const isClosing = followupForm.status === "cerrado";

    if (!followupForm.responsible.trim() || !followupForm.evolution.trim()) {
      setFollowupError(isClosing
        ? "Completa el responsable y la evolución o situación final."
        : "Completa el responsable y la evolución o situación actual.");
      return;
    }

    if (isClosing && !closureForm.finalActions.trim()) {
      setFollowupError("Describe las acciones realizadas para el cierre del incidente.");
      return;
    }

    if (isClosing && !closureForm.finalObservation.trim()) {
      setFollowupError("Añade una observación final para dejar constancia del cierre.");
      return;
    }

    if (!isClosing && followupForm.actionRequired && !followupForm.pendingAction.trim()) {
      setFollowupError("Indica la acción pendiente cuando marques que requiere una nueva acción.");
      return;
    }

    if (isClosing) {
      const confirmed = window.confirm(
        "¿Confirmas el cierre de este incidente?\n\nEl cierre quedará registrado como una actuación independiente. El registro original no se modificará y el incidente pasará a estado «Cerrado»."
      );
      if (!confirmed) return;
    }

    setSavingFollowup(true);
    setFollowupError(null);
    setFollowupSuccess(null);

    try {
      const supabase = createClient();

if (!supabase) {
  throw new Error("No se pudo inicializar Supabase.");
}
      const { data: authData, error: authError } = await supabase.auth.getUser();
      if (authError) throw authError;
      if (!authData.user) throw new Error("Tu sesión no está disponible. Inicia sesión nuevamente.");

      const evolutionToSave = isClosing
        ? [
            "Evolución / situación final:",
            followupForm.evolution.trim(),
            "",
            "Acciones realizadas para el cierre:",
            closureForm.finalActions.trim(),
            "",
            "Observación de cierre:",
            closureForm.finalObservation.trim(),
          ].join("\n")
        : followupForm.evolution.trim();

      const { error: insertError } = await supabase
        .from("incident_followups")
        .insert({
          incident_id: record.id,
          user_id: authData.user.id,
          follow_up_date: followupForm.date,
          responsible: followupForm.responsible.trim(),
          status: followupForm.status,
          evolution: evolutionToSave,
          action_required: isClosing ? false : followupForm.actionRequired,
          pending_action: isClosing ? null : (followupForm.actionRequired ? followupForm.pendingAction.trim() : null),
          next_review_date: isClosing ? null : (followupForm.nextReviewDate || null),
        });

      if (insertError) throw insertError;

      const { error: statusError } = await supabase
        .from("incident_reports")
        .update({ status: followupForm.status })
        .eq("id", record.id)
        .eq("user_id", authData.user.id);

      if (statusError) throw statusError;

      setCurrentStatus(followupForm.status);
      await loadFollowups();
      setFollowupSuccess(
        isClosing
          ? "Incidente cerrado correctamente. El cierre quedó registrado y el registro original no fue modificado."
          : "Seguimiento guardado correctamente. El registro original no fue modificado."
      );
      setShowFollowupForm(false);
      setClosureForm({ finalActions: "", finalObservation: "" });
      setFollowupForm((current) => ({
        ...current,
        date: new Date().toISOString().slice(0, 10),
        status: followupForm.status,
        evolution: "",
        actionRequired: false,
        pendingAction: "",
        nextReviewDate: "",
      }));
    } catch (error) {
      console.error("MueveSeguro: error al guardar seguimiento", error);
      setFollowupError(error instanceof Error ? error.message : "No fue posible guardar el seguimiento.");
    } finally {
      setSavingFollowup(false);
    }
  }

  if (showReport) {
    return <IncidentReport record={original} followups={followups} onBack={() => setShowReport(false)} onEdit={() => setShowReport(false)} />;
  }

  const dateLabel = new Date(`${record.incident_date}T${record.incident_time || "12:00"}`).toLocaleString("es-EC", {
    dateStyle: "long",
    ...(record.incident_time ? { timeStyle: "short" } : {}),
  });

  const blocks = [
    ["Descripción objetiva", record.description],
    ["Acciones realizadas", record.actions_taken],
    ["Personas notificadas", record.people_notified || "No indicado"],
    ["Representante / familia notificada", record.family_notified || "No indicado"],
    ["Testigos / acompañantes", record.witnesses || "No indicado"],
    ["Protocolo institucional aplicado", record.institutional_protocol || "No indicado"],
    ["Seguimiento necesario", record.follow_up_required || "No indicado"],
    ["Observaciones", record.observations || "No indicado"],
  ] as const;

  return (
    <section className="overflow-hidden rounded-[2rem] border border-slate-200 bg-white shadow-xl">
      <div className="border-b border-slate-200 bg-slate-50 px-6 py-6 sm:px-8">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="text-xs font-black uppercase tracking-[.18em] text-indigo-700">Detalle del incidente</p>
            <h2 className="mt-1 text-2xl font-black text-slate-950">{record.situation}</h2>
            <p className="mt-2 text-sm font-semibold text-slate-500">Código {record.code}</p>
          </div>
          <span className={`rounded-full border px-4 py-2 text-xs font-black ${statusStyles[currentStatus]}`}>{statusLabels[currentStatus]}</span>
        </div>
      </div>

      <div className="p-6 sm:p-8">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[
            ["Institución", record.institution],
            ["Dirigido a", record.recipient],
            ["Docente responsable", record.teacher_name],
            ["Cargo / área", record.teacher_role],
            ["Estudiante", record.student_name || "No indicado"],
            ["Curso / paralelo", record.student_class || "No indicado"],
            ["Fecha y hora", dateLabel],
            ["Lugar", record.location],
            ["Actividad", record.activity],
            ["Ayuda externa", record.external_help ? "Sí" : "No"],
          ].map(([label, value]) => (
            <div key={label} className="rounded-2xl bg-slate-50 p-4">
              <p className="text-xs font-black uppercase tracking-wide text-slate-500">{label}</p>
              <p className="mt-1 text-sm font-bold leading-5 text-slate-900">{value}</p>
            </div>
          ))}
        </div>

        <div className="mt-7 rounded-2xl border border-indigo-100 bg-indigo-50 p-5">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-xs font-black uppercase tracking-[.16em] text-indigo-700">Registro original</p>
              <h3 className="mt-1 text-lg font-black text-slate-950">La información inicial se conserva</h3>
            </div>
            <span className="text-xs font-bold text-slate-500">Registrado {new Date(record.created_at).toLocaleString("es-EC", { dateStyle: "medium", timeStyle: "short" })}</span>
          </div>
          <p className="mt-3 text-sm leading-6 text-slate-600">Este detalle muestra el contenido guardado en el registro original. Las actuaciones posteriores se incorporan como seguimientos independientes, sin sobrescribir esta información.</p>
        </div>

        <div className="mt-7 grid gap-4 lg:grid-cols-2">
          {blocks.map(([title, text]) => (
            <div key={title} className="rounded-2xl border border-slate-200 p-5">
              <h3 className="font-black text-slate-900">{title}</h3>
              <p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-slate-600">{text}</p>
            </div>
          ))}
        </div>

        <div className="mt-7 rounded-2xl border border-violet-200 bg-violet-50 p-5">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <p className="text-xs font-black uppercase tracking-[.16em] text-violet-700">Seguimiento</p>
              <h3 className="mt-1 text-lg font-black text-slate-950">Historial de actuaciones</h3>
              <p className="mt-2 text-sm leading-6 text-slate-600">Cada actuación queda registrada por separado. El registro original no se modifica.</p>
            </div>
            <button
              onClick={() => {
                if (currentStatus === "cerrado") return;
                setShowFollowupForm((current) => !current);
                setFollowupError(null);
                setFollowupSuccess(null);
                if (!showFollowupForm) {
                  setFollowupForm((current) => ({
                    ...current,
                    date: new Date().toISOString().slice(0, 10),
                    responsible: current.responsible || record.teacher_name,
                    status: currentStatus,
                  }));
                }
              }}
              disabled={currentStatus === "cerrado"}
              className="rounded-xl bg-violet-700 px-4 py-2 text-sm font-black text-white hover:bg-violet-800 disabled:cursor-not-allowed disabled:bg-emerald-600"
            >
              {currentStatus === "cerrado" ? "✓ Incidente cerrado" : showFollowupForm ? "Cerrar formulario" : "＋ Añadir seguimiento"}
            </button>
          </div>

          {followupSuccess && (
            <div role="status" className="mt-4 rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-sm font-semibold leading-6 text-emerald-800">
              {followupSuccess}
            </div>
          )}

          {followupError && (
            <div role="alert" className="mt-4 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm font-semibold leading-6 text-red-800">
              <strong>No se pudo completar la operación.</strong> {followupError}
            </div>
          )}

          {currentStatus === "cerrado" && (
            <div className="mt-5 rounded-2xl border border-emerald-200 bg-emerald-50 p-4">
              <p className="font-black text-emerald-900">Incidente cerrado</p>
              <p className="mt-1 text-sm leading-6 text-emerald-800">Este registro conserva el historial completo y no permite nuevas actuaciones posteriores para evitar modificar la trazabilidad del cierre.</p>
            </div>
          )}

          {showFollowupForm && (
            <div className="mt-5 rounded-2xl border border-white bg-white p-5 shadow-sm">
              <p className="text-sm font-black text-slate-950">
                {followupForm.status === "cerrado" ? "Cierre del incidente" : "Nueva actuación de seguimiento"}
              </p>
              <p className="mt-1 text-xs leading-5 text-slate-500">
                {followupForm.status === "cerrado"
                  ? "Completa la evolución final, las acciones realizadas y la observación de cierre. El sistema solicitará confirmación antes de cerrar."
                  : "Registra hechos observables, evolución y acciones realizadas. No incluyas diagnósticos ni datos médicos innecesarios."}
              </p>
              <div className="mt-5 grid gap-4 md:grid-cols-2">
                <label className="block text-sm font-bold text-slate-700">
                  {followupForm.status === "cerrado" ? "Fecha de cierre" : "Fecha de seguimiento"}
                  <input type="date" value={followupForm.date} onChange={(e) => setFollowupForm((f) => ({ ...f, date: e.target.value }))} className="mt-2 w-full rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-violet-500" />
                </label>
                <label className="block text-sm font-bold text-slate-700">
                  Responsable
                  <input value={followupForm.responsible} onChange={(e) => setFollowupForm((f) => ({ ...f, responsible: e.target.value }))} placeholder="Nombre del responsable" className="mt-2 w-full rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-violet-500" />
                </label>
                <label className="block text-sm font-bold text-slate-700">
                  Estado
                  <select
                    value={followupForm.status}
                    onChange={(e) => {
                      const nextStatus = e.target.value as IncidentStatusDb;
                      setFollowupForm((f) => ({
                        ...f,
                        status: nextStatus,
                        nextReviewDate: nextStatus === "cerrado" ? "" : f.nextReviewDate,
                        actionRequired: nextStatus === "cerrado" ? false : f.actionRequired,
                        pendingAction: nextStatus === "cerrado" ? "" : f.pendingAction,
                      }));
                      setFollowupError(null);
                    }}
                    className="mt-2 w-full rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-violet-500"
                  >
                    <option value="pendiente">Pendiente</option>
                    <option value="en_seguimiento">En seguimiento</option>
                    <option value="cerrado">Cerrado</option>
                  </select>
                </label>

                {followupForm.status !== "cerrado" ? (
                  <label className="block text-sm font-bold text-slate-700">
                    Próxima revisión
                    <input
                      type="date"
                      value={followupForm.nextReviewDate}
                      onChange={(e) => setFollowupForm((f) => ({ ...f, nextReviewDate: e.target.value }))}
                      className="mt-2 w-full rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-violet-500"
                    />
                  </label>
                ) : (
                  <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-sm leading-6 text-emerald-900">
                    <p className="font-black">Cierre del incidente</p>
                    <p className="mt-1">Al confirmar el cierre, el incidente pasará a estado <strong>Cerrado</strong> y no se programará una nueva revisión.</p>
                  </div>
                )}

                <label className="block text-sm font-bold text-slate-700 md:col-span-2">
                  {followupForm.status === "cerrado" ? "Evolución / situación final" : "Evolución / situación actual"}
                  <textarea
                    rows={4}
                    value={followupForm.evolution}
                    onChange={(e) => setFollowupForm((f) => ({ ...f, evolution: e.target.value }))}
                    placeholder={followupForm.status === "cerrado"
                      ? "Describe objetivamente la situación final y la evolución observada..."
                      : "Describe objetivamente qué ocurrió después..."}
                    className="mt-2 w-full resize-y rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-violet-500"
                  />
                </label>

                {followupForm.status === "cerrado" && (
                  <>
                    <label className="block text-sm font-bold text-slate-700 md:col-span-2">
                      Acciones realizadas para el cierre
                      <textarea
                        rows={3}
                        value={closureForm.finalActions}
                        onChange={(e) => setClosureForm((f) => ({ ...f, finalActions: e.target.value }))}
                        placeholder="Describe las acciones realizadas para completar y cerrar el seguimiento..."
                        className="mt-2 w-full resize-y rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-emerald-500"
                      />
                    </label>
                    <label className="block text-sm font-bold text-slate-700 md:col-span-2">
                      Observación de cierre
                      <textarea
                        rows={3}
                        value={closureForm.finalObservation}
                        onChange={(e) => setClosureForm((f) => ({ ...f, finalObservation: e.target.value }))}
                        placeholder="Deja constancia objetiva de por qué el caso puede considerarse cerrado..."
                        className="mt-2 w-full resize-y rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-emerald-500"
                      />
                    </label>
                  </>
                )}
              </div>

              {followupForm.status !== "cerrado" && (
                <>
                  <label className="mt-4 flex items-center gap-3 text-sm font-bold text-slate-700">
                    <input type="checkbox" checked={followupForm.actionRequired} onChange={(e) => setFollowupForm((f) => ({ ...f, actionRequired: e.target.checked, pendingAction: e.target.checked ? f.pendingAction : "" }))} className="h-4 w-4" />
                    Requiere una nueva acción
                  </label>
                  {followupForm.actionRequired && (
                    <label className="mt-4 block text-sm font-bold text-slate-700">
                      Acción pendiente
                      <textarea rows={3} value={followupForm.pendingAction} onChange={(e) => setFollowupForm((f) => ({ ...f, pendingAction: e.target.value }))} placeholder="Describe la acción pendiente..." className="mt-2 w-full resize-y rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-violet-500" />
                    </label>
                  )}
                </>
              )}

              <div className="mt-5 flex flex-wrap gap-3">
                <button onClick={() => void saveFollowup()} disabled={savingFollowup} className={`rounded-xl px-5 py-3 text-sm font-black text-white disabled:cursor-not-allowed disabled:opacity-50 ${followupForm.status === "cerrado" ? "bg-emerald-700 hover:bg-emerald-800" : "bg-violet-700 hover:bg-violet-800"}`}>
                  {savingFollowup
                    ? (followupForm.status === "cerrado" ? "Cerrando incidente..." : "Guardando seguimiento...")
                    : (followupForm.status === "cerrado" ? "✓ Confirmar cierre del incidente" : "Guardar seguimiento")}
                </button>
                <button onClick={() => setShowFollowupForm(false)} disabled={savingFollowup} className="rounded-xl border border-slate-300 px-5 py-3 text-sm font-black text-slate-700 hover:bg-slate-50 disabled:opacity-50">
                  Cancelar
                </button>
              </div>
            </div>
          )}

          <div className="mt-5">
            {loadingFollowups ? (
              <div className="rounded-2xl border border-white bg-white p-6 text-center text-sm font-bold text-slate-500">Cargando seguimientos...</div>
            ) : followups.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-violet-200 bg-white p-6 text-sm leading-6 text-slate-600">
                Aún no hay actuaciones posteriores registradas. El primer seguimiento que guardes aparecerá aquí.
              </div>
            ) : (
              <div className="space-y-3">
                {followups.map((item) => (
                  <article key={item.id} className="rounded-2xl border border-white bg-white p-5 shadow-sm">
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div>
                        <p className="text-xs font-black uppercase tracking-wide text-violet-700">Actuación de seguimiento</p>
                        <h4 className="mt-1 font-black text-slate-950">{new Date(`${item.follow_up_date}T12:00`).toLocaleDateString("es-EC", { dateStyle: "long" })}</h4>
                      </div>
                      <span className={`rounded-full border px-3 py-1 text-xs font-black ${statusStyles[item.status]}`}>{statusLabels[item.status]}</span>
                    </div>
                    <div className="mt-4 grid gap-3 md:grid-cols-3">
                      <div><p className="text-xs font-black uppercase text-slate-500">Responsable</p><p className="mt-1 text-sm font-bold text-slate-900">{item.responsible}</p></div>
                      <div><p className="text-xs font-black uppercase text-slate-500">Próxima revisión</p><p className="mt-1 text-sm font-bold text-slate-900">{item.next_review_date ? new Date(`${item.next_review_date}T12:00`).toLocaleDateString("es-EC") : "No indicada"}</p></div>
                      <div><p className="text-xs font-black uppercase text-slate-500">Nueva acción</p><p className="mt-1 text-sm font-bold text-slate-900">{item.action_required ? "Sí" : "No"}</p></div>
                    </div>
                    <div className="mt-4 grid gap-3 md:grid-cols-2">
                      <div className="rounded-xl bg-slate-50 p-4"><p className="text-xs font-black uppercase text-slate-500">Evolución / situación actual</p><p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-slate-700">{item.evolution}</p></div>
                      <div className="rounded-xl bg-slate-50 p-4"><p className="text-xs font-black uppercase text-slate-500">Acción pendiente</p><p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-slate-700">{item.pending_action || "No indicada"}</p></div>
                    </div>
                  </article>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="mt-7 flex flex-wrap gap-3">
          <button onClick={() => setShowReport(true)} className="rounded-xl bg-violet-700 px-5 py-3 text-sm font-black text-white hover:bg-violet-800">Ver informe / Guardar PDF</button>
          <button onClick={onBack} className="rounded-xl border border-slate-300 px-5 py-3 text-sm font-black text-slate-700 hover:bg-slate-50">← Volver al historial</button>
        </div>
      </div>
    </section>
  );
}

function IncidentRegister({ onBack }: { onBack: () => void }) {
  const [saved, setSaved] = useState<IncidentRecord | null>(null);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [form, setForm] = useState<IncidentRecord>(() => ({
    date: new Date().toISOString().slice(0, 10),
    time: new Date().toTimeString().slice(0, 5),
    place: "", activity: "", type: incidentTypes[0], description: "", actions: "",
    notified: "", externalHelp: "No", followUp: "", status: "Pendiente", observations: "",
    reportNumber: `MS-${new Date().toISOString().replace(/[-:TZ.]/g, "").slice(0, 12)}`,
    institution: "", addressedTo: "", teacherName: "", teacherRole: "Docente de Educación Física",
    studentName: "", courseGroup: "", witnesses: "", representativeNotified: "", institutionalProtocol: "",
  }));

  const update = (key: keyof IncidentRecord, value: string) => {
    setSaveError(null);
    setForm((current) => ({ ...current, [key]: value } as IncidentRecord));
  };

  async function saveIncident() {
    if (saving) return;

    setSaving(true);
    setSaveError(null);

    try {
      const supabase = createClient();

if (!supabase) {
  throw new Error("No se pudo inicializar Supabase.");
}
      const { data: authData, error: authError } = await supabase.auth.getUser();

      if (authError) throw authError;
      if (!authData.user) {
        throw new Error("Tu sesión no está disponible. Inicia sesión nuevamente para guardar el incidente.");
      }

      const statusMap: Record<IncidentRecord["status"], "pendiente" | "en_seguimiento" | "cerrado"> = {
        Pendiente: "pendiente",
        "En seguimiento": "en_seguimiento",
        Cerrado: "cerrado",
      };

      const { data, error } = await supabase
        .from("incident_reports")
        .insert({
          user_id: authData.user.id,
          institution: form.institution.trim(),
          recipient: form.addressedTo.trim(),
          teacher_name: form.teacherName.trim(),
          teacher_role: form.teacherRole.trim(),
          student_name: form.studentName.trim() || null,
          student_class: form.courseGroup.trim() || null,
          incident_date: form.date,
          incident_time: form.time || null,
          location: form.place.trim(),
          activity: form.activity.trim(),
          situation: form.type,
          external_help: form.externalHelp === "Sí",
          description: form.description.trim(),
          actions_taken: form.actions.trim(),
          people_notified: form.notified.trim() || null,
          family_notified: form.representativeNotified.trim() || null,
          witnesses: form.witnesses.trim() || null,
          institutional_protocol: form.institutionalProtocol.trim() || null,
          follow_up_required: form.followUp.trim() || null,
          observations: form.observations.trim() || null,
          status: statusMap[form.status],
        })
        .select("id, code")
        .single();

      if (error) throw error;

      setForm((current) => ({
        ...current,
        reportNumber: data.code,
      }));
      setSaved({
        ...form,
        reportNumber: data.code,
      });
    } catch (error) {
      console.error("MueveSeguro: error al guardar incidente", error);
      setSaveError(
        error instanceof Error
          ? error.message
          : "No fue posible guardar el incidente. Revisa tu conexión y vuelve a intentarlo."
      );
    } finally {
      setSaving(false);
    }
  }

  if (saved) {
    return <IncidentReport record={saved} onBack={onBack} onEdit={() => setSaved(null)} />;
  }

  return (
    <section className="overflow-hidden rounded-[2rem] border border-slate-200 bg-white shadow-xl">
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-200 bg-slate-50 px-6 py-5">
        <div><p className="text-xs font-black uppercase tracking-[.18em] text-violet-700">Registro y seguimiento</p><h2 className="mt-1 text-2xl font-black">Informe de incidente educativo</h2></div>
        <button onClick={onBack} className="rounded-xl border border-slate-300 bg-white px-4 py-2 text-sm font-black text-slate-600 hover:bg-slate-100">← Volver</button>
      </div>
      <div className="p-6 sm:p-8">
        <div className="rounded-2xl border border-violet-200 bg-violet-50 p-4 text-sm leading-6 text-violet-950">Registra únicamente hechos observables y acciones realizadas. No incluyas diagnósticos, tratamientos ni datos médicos innecesarios.</div>
        <div className="mt-7 grid gap-5 md:grid-cols-2">
          <Field label="Institución educativa" value={form.institution} onChange={(v) => update("institution", v)} placeholder="Nombre de la institución" />
          <Field label="Dirigido a" value={form.addressedTo} onChange={(v) => update("addressedTo", v)} placeholder="Autoridad / coordinación / inspectoría" />
          <Field label="Docente responsable" value={form.teacherName} onChange={(v) => update("teacherName", v)} placeholder="Nombre y apellido" />
          <Field label="Cargo / área" value={form.teacherRole} onChange={(v) => update("teacherRole", v)} placeholder="Ej.: Docente de Educación Física" />
          <Field label="Estudiante involucrado" value={form.studentName} onChange={(v) => update("studentName", v)} placeholder="Nombre y apellido (solo si es necesario)" />
          <Field label="Curso / paralelo" value={form.courseGroup} onChange={(v) => update("courseGroup", v)} placeholder="Ej.: 3ro BGU B" />
          <Field label="Fecha" value={form.date} onChange={(v) => update("date", v)} type="date" />
          <Field label="Hora" value={form.time} onChange={(v) => update("time", v)} type="time" />
          <Field label="Lugar" value={form.place} onChange={(v) => update("place", v)} placeholder="Ej.: cancha principal" />
          <Field label="Actividad" value={form.activity} onChange={(v) => update("activity", v)} placeholder="Ej.: baloncesto, circuito, recreo..." />
          <label className="md:col-span-2"><span className="text-sm font-black text-slate-800">Tipo de situación</span><select value={form.type} onChange={(e) => update("type", e.target.value)} className="mt-2 w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm font-semibold outline-none focus:border-violet-500">{incidentTypes.map((item) => <option key={item}>{item}</option>)}</select></label>
          <Field label="Protocolo institucional aplicado" value={form.institutionalProtocol} onChange={(v) => update("institutionalProtocol", v)} placeholder="Nombre o referencia del protocolo, si corresponde" />
          <Field label="Testigos / acompañantes" value={form.witnesses} onChange={(v) => update("witnesses", v)} placeholder="Nombres o cargos, si corresponde" />
          <TextArea label="Descripción objetiva de lo ocurrido" value={form.description} onChange={(v) => update("description", v)} placeholder="Describe hechos observables, secuencia, lugar y señales observadas. Evita diagnósticos." />
          <TextArea label="Acciones realizadas" value={form.actions} onChange={(v) => update("actions", v)} placeholder="Describe las medidas adoptadas y a quién se informó." />
          <Field label="Personas notificadas" value={form.notified} onChange={(v) => update("notified", v)} placeholder="Ej.: inspector, coordinación..." />
          <Field label="Representante / familia notificada" value={form.representativeNotified} onChange={(v) => update("representativeNotified", v)} placeholder="Nombre, cargo o medio, según corresponda" />
          <label><span className="text-sm font-black text-slate-800">¿Se solicitó ayuda externa?</span><select value={form.externalHelp} onChange={(e) => update("externalHelp", e.target.value)} className="mt-2 w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm font-semibold outline-none focus:border-violet-500"><option>No</option><option>Sí</option><option>No se sabe</option></select></label>
          <label><span className="text-sm font-black text-slate-800">Estado</span><select value={form.status} onChange={(e) => update("status", e.target.value as IncidentRecord["status"])} className="mt-2 w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm font-semibold outline-none focus:border-violet-500"><option>Pendiente</option><option>En seguimiento</option><option>Cerrado</option></select></label>
          <TextArea label="Seguimiento necesario" value={form.followUp} onChange={(v) => update("followUp", v)} placeholder="Indica qué debe revisarse después del incidente." />
          <TextArea label="Observaciones" value={form.observations} onChange={(v) => update("observations", v)} placeholder="Información adicional estrictamente necesaria." />
        </div>
        <div className="mt-7 flex flex-wrap gap-3">
          <button onClick={saveIncident} disabled={saving || !form.institution || !form.addressedTo || !form.teacherName || !form.place || !form.activity || !form.description || !form.actions} className="rounded-xl bg-violet-700 px-5 py-3 text-sm font-black text-white disabled:cursor-not-allowed disabled:opacity-40 hover:bg-violet-800">
            {saving ? "Guardando registro..." : "Guardar registro"}
          </button>
          <button onClick={onBack} disabled={saving} className="rounded-xl border border-slate-300 px-5 py-3 text-sm font-black text-slate-700 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50">Cancelar</button>
        </div>
        {saveError && (
          <div role="alert" className="mt-4 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm font-semibold leading-6 text-red-800">
            <strong>No se pudo guardar el incidente.</strong> {saveError}
          </div>
        )}
        <p className="mt-4 text-xs leading-5 text-slate-500">Al guardar, el incidente queda asociado a tu cuenta y protegido por las políticas de acceso de Supabase. El código definitivo del registro se genera al guardar.</p>
      </div>
    </section>
  );
}

function Field({ label, value, onChange, placeholder, type = "text" }: { label: string; value: string; onChange: (value: string) => void; placeholder?: string; type?: string }) {
  return <label><span className="text-sm font-black text-slate-800">{label}</span><input type={type} value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} className="mt-2 w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm font-semibold outline-none focus:border-violet-500" /></label>;
}

function TextArea({ label, value, onChange, placeholder }: { label: string; value: string; onChange: (value: string) => void; placeholder?: string }) {
  return <label className="md:col-span-2"><span className="text-sm font-black text-slate-800">{label}</span><textarea value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} rows={4} className="mt-2 w-full resize-y rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm leading-6 outline-none focus:border-violet-500" /></label>;
}

function IncidentReport({
  record,
  followups = [],
  onBack,
  onEdit,
}: {
  record: IncidentRecord;
  followups?: IncidentFollowup[];
  onBack: () => void;
  onEdit: () => void;
}) {
  const closureFollowup = [...followups]
    .filter((item) => item.status === "cerrado")
    .sort((a, b) => {
      const dateA = `${a.follow_up_date}T${a.created_at}`;
      const dateB = `${b.follow_up_date}T${b.created_at}`;
      return dateB.localeCompare(dateA);
    })[0];

  return (
    <>
      <style jsx global>{`
        @media print {
          @page { size: A4 portrait; margin: 8mm; }
          html, body { background: #fff !important; margin: 0 !important; padding: 0 !important; }
          body * { visibility: hidden !important; }
          .mueve-print-report, .mueve-print-report * { visibility: visible !important; }
          .mueve-print-report { position: absolute !important; inset: 0 !important; width: 100% !important; max-width: none !important; margin: 0 !important; padding: 0 !important; border: 0 !important; border-radius: 0 !important; box-shadow: none !important; overflow: visible !important; background: #fff !important; color: #0f172a !important; font-size: 9.2pt !important; }
          .mueve-print-report .print-report-header { padding: 8px 0 9px !important; margin: 0 !important; break-after: avoid-page; page-break-after: avoid; }
          .mueve-print-report .print-report-header h2 { font-size: 18pt !important; line-height: 1.05 !important; }
          .mueve-print-report .print-report-header p { font-size: 8.5pt !important; }
          .mueve-print-report .print-report-body { padding: 8px 0 0 !important; }
          .mueve-print-report .print-summary { gap: 5px !important; break-inside: avoid; page-break-inside: avoid; }
          .mueve-print-report .print-summary > div { padding: 7px 9px !important; border-radius: 8px !important; break-inside: avoid; page-break-inside: avoid; }
          .mueve-print-report .print-summary p { margin: 0 !important; line-height: 1.2 !important; }
          .mueve-print-report .print-summary .print-label { font-size: 6.5pt !important; }
          .mueve-print-report .print-summary .print-value { font-size: 8.2pt !important; }
          .mueve-print-report .print-report-block { margin-top: 6px !important; padding: 8px 10px !important; border-radius: 8px !important; break-inside: avoid; page-break-inside: avoid; }
          .mueve-print-report .print-report-block h3 { font-size: 9pt !important; margin: 0 !important; }
          .mueve-print-report .print-report-block p { font-size: 8.2pt !important; line-height: 1.35 !important; margin-top: 3px !important; }
          .mueve-print-report .print-legal { margin-top: 7px !important; padding: 7px 9px !important; font-size: 6.8pt !important; line-height: 1.3 !important; break-inside: avoid; page-break-inside: avoid; }
          .mueve-print-report .print-signatures { margin-top: 13px !important; padding-top: 9px !important; padding-bottom: 9px !important; border-top: 1px dashed #8b5cf6 !important; border-bottom: 1px dashed #8b5cf6 !important; break-inside: avoid; page-break-inside: avoid; }
          .mueve-print-report .print-signature { padding-top: 12px !important; border-top: 1px solid #94a3b8 !important; font-size: 7pt !important; }
          .mueve-print-report .print-legal { margin-top: 9px !important; }
          .mueve-print-report .print-actions, .mueve-print-report .print-note { display: none !important; }
        }
      `}</style>
      <section className="mueve-print-report overflow-hidden rounded-[2rem] border border-slate-200 bg-white shadow-xl">
        <div className="print-report-header flex flex-wrap items-center justify-between gap-4 border-b border-slate-200 bg-slate-50 px-6 py-5">
          <div>
            <p className="text-xs font-black uppercase tracking-[.18em] text-violet-700">Registro generado · {record.reportNumber}</p>
            <h2 className="mt-1 text-2xl font-black">Informe de incidente educativo</h2>
            <p className="mt-1 text-sm text-slate-500">MueveSeguro · Educa, previene y protege.</p>
          </div>
          <span className="rounded-full bg-violet-100 px-4 py-2 text-xs font-black text-violet-800">{record.status}</span>
        </div>
        <div className="print-report-body p-6 sm:p-8">
          <div className="print-summary grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {[["Institución", record.institution || "No indicado"], ["Dirigido a", record.addressedTo || "No indicado"], ["Docente responsable", record.teacherName || "No indicado"], ["Cargo / área", record.teacherRole || "No indicado"], ["Estudiante", record.studentName || "No indicado"], ["Curso / paralelo", record.courseGroup || "No indicado"], ["Fecha", record.date], ["Hora", record.time], ["Lugar", record.place], ["Actividad", record.activity], ["Situación", record.type], ["Ayuda externa", record.externalHelp]].map(([label, value]) => (
              <div key={label} className="rounded-2xl bg-slate-50 p-4"><p className="print-label text-xs font-black uppercase tracking-wide text-slate-500">{label}</p><p className="print-value mt-1 text-sm font-bold text-slate-900">{value}</p></div>
            ))}
          </div>
          <ReportBlock title="Descripción objetiva" text={record.description} />
          <ReportBlock title="Acciones realizadas" text={record.actions} />
          <div className="grid gap-3 sm:grid-cols-2">
            <ReportBlock title="Personas notificadas" text={record.notified || "No indicado"} />
            <ReportBlock title="Representante / familia notificada" text={record.representativeNotified || "No indicado"} />
            <ReportBlock title="Testigos / acompañantes" text={record.witnesses || "No indicado"} />
            <ReportBlock title="Protocolo institucional aplicado" text={record.institutionalProtocol || "No indicado"} />
            <ReportBlock title="Seguimiento necesario" text={record.followUp || "No indicado"} />
            <ReportBlock title="Observaciones" text={record.observations || "No indicado"} />
          </div>
          {closureFollowup && (
            <div className="print-report-block mt-5 rounded-2xl border border-emerald-200 bg-emerald-50 p-5">
              <h3 className="font-black text-emerald-900">Cierre del incidente</h3>
              <p className="mt-2 text-sm font-semibold text-emerald-900">
                Fecha de cierre: {closureFollowup.follow_up_date} · Responsable: {closureFollowup.responsible}
              </p>
              <p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-emerald-900">{closureFollowup.evolution}</p>
            </div>
          )}
          <div className="print-signatures grid gap-8 sm:grid-cols-3">
            <div className="print-signature"><strong>{record.teacherName || "Docente responsable"}</strong><br />Elaboró el registro</div>
            <div className="print-signature"><strong>{record.addressedTo || "Autoridad / destinatario"}</strong><br />Recibido / revisado</div>
            <div className="print-signature"><strong>Fecha de recepción: __________________</strong><br />Firma / constancia</div>
          </div>
          <div className="print-legal rounded-xl border border-slate-200 bg-slate-50 text-slate-600">
            <strong className="text-slate-800">Constancia de registro:</strong> La información consignada corresponde a hechos observables, comunicaciones y acciones registradas por el responsable. Este documento es un registro educativo interno; no constituye diagnóstico, informe médico ni peritaje. Su uso, comunicación y conservación deberán ajustarse a los protocolos de la institución y a las normas aplicables de protección de datos personales.
          </div>
          <div className="print-actions mt-7 flex flex-wrap gap-3"><button onClick={() => window.print()} className="rounded-xl bg-violet-700 px-5 py-3 text-sm font-black text-white hover:bg-violet-800">Imprimir / Guardar PDF</button><button onClick={onEdit} className="rounded-xl border border-slate-300 px-5 py-3 text-sm font-black text-slate-700 hover:bg-slate-50">Editar registro</button><button onClick={onBack} className="rounded-xl border border-slate-300 px-5 py-3 text-sm font-black text-slate-700 hover:bg-slate-50">Volver a MueveSeguro</button></div>
          <p className="print-note mt-4 text-xs leading-5 text-slate-500">Al imprimir, selecciona «Guardar como PDF». Para incidentes que requieran actuación institucional, conserva y remite el registro según el protocolo vigente de tu institución.</p>
        </div>
      </section>
    </>
  );
}

function ReportBlock({ title, text }: { title: string; text: string }) { return <div className="print-report-block mt-5 rounded-2xl border border-slate-200 p-5"><h3 className="font-black text-slate-900">{title}</h3><p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-slate-600">{text}</p></div>; }
