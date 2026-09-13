"use client";

import { useState, useTransition } from "react";
import { updateGradingPeriodAction } from "../server/gradingPeriodActions";
import type { GradingPeriod, GradingPeriodStatus } from "../types";

export default function GradingPeriodManager({ courseId, periods }: { courseId: string; periods: GradingPeriod[] }) {
  const [selectedId, setSelectedId] = useState(periods[0]?.id ?? "");
  const selected = periods.find((period) => period.id === selectedId);
  const [name, setName] = useState(selected?.name ?? "");
  const [startDate, setStartDate] = useState(selected?.startDate ?? "");
  const [endDate, setEndDate] = useState(selected?.endDate ?? "");
  const [status, setStatus] = useState<GradingPeriodStatus>(selected?.status ?? "draft");
  const [message, setMessage] = useState("");
  const [pending, startTransition] = useTransition();

  function select(id: string) {
    const period = periods.find((item) => item.id === id);
    setSelectedId(id); setName(period?.name ?? ""); setStartDate(period?.startDate ?? ""); setEndDate(period?.endDate ?? ""); setStatus(period?.status ?? "draft"); setMessage("");
  }
  function save() {
    if (!selected) return;
    startTransition(async () => { const result = await updateGradingPeriodAction({ courseId, id: selected.id, name, startDate: startDate || null, endDate: endDate || null, status }); setMessage(result.message); });
  }
  if (!periods.length) return null;
  return (
    <section className="rounded-3xl border-2 border-blue-200 bg-blue-50 p-5 text-slate-950 shadow-sm">
      <p className="text-xs font-black uppercase tracking-[0.16em] text-blue-700">Administracion academica</p>
      <h3 className="mt-1 text-xl font-black">Gestiona los periodos</h3>
      <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <select value={selectedId} onChange={(event) => select(event.target.value)} className="min-h-11 rounded-xl border-2 border-slate-300 bg-white px-3 text-sm font-bold"><option value="" disabled>Selecciona un periodo</option>{periods.map((period) => <option key={period.id} value={period.id}>{period.name}</option>)}</select>
        <input value={name} onChange={(event) => setName(event.target.value)} placeholder="Nombre del periodo" className="min-h-11 rounded-xl border-2 border-slate-300 bg-white px-3 text-sm" />
        <input type="date" value={startDate} onChange={(event) => setStartDate(event.target.value)} className="min-h-11 rounded-xl border-2 border-slate-300 bg-white px-3 text-sm" />
        <input type="date" value={endDate} onChange={(event) => setEndDate(event.target.value)} className="min-h-11 rounded-xl border-2 border-slate-300 bg-white px-3 text-sm" />
      </div>
      <div className="mt-3 flex flex-wrap items-center gap-3"><select value={status} onChange={(event) => setStatus(event.target.value as GradingPeriodStatus)} className="min-h-11 rounded-xl border-2 border-slate-300 bg-white px-3 text-sm font-bold"><option value="draft">Borrador</option><option value="open">Abierto</option><option value="closed">Cerrado</option></select><button type="button" onClick={save} disabled={pending || !selected} className="min-h-11 rounded-xl bg-blue-700 px-5 py-2 text-sm font-black text-white hover:bg-blue-800 disabled:opacity-50">{pending ? "Guardando..." : "Guardar periodo"}</button>{message ? <span className="text-sm font-bold text-blue-900">{message}</span> : null}</div>
    </section>
  );
}
