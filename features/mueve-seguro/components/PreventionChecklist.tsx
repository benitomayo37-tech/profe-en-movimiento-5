"use client";

import { useMemo, useState } from "react";

type SpaceId = "cancha" | "gimnasio" | "aula" | "pista";

interface PreventionChecklistProps { onBack: () => void }

const spaces: Array<{ id: SpaceId; icon: string; title: string; description: string }> = [
  { id: "cancha", icon: "🏀", title: "Cancha exterior", description: "Superficie, clima, límites y materiales." },
  { id: "gimnasio", icon: "🏟️", title: "Gimnasio o coliseo", description: "Espacio cubierto, equipamiento y circulación." },
  { id: "aula", icon: "🏫", title: "Aula", description: "Pausas activas y movimiento en espacio reducido." },
  { id: "pista", icon: "🏃", title: "Pista atlética", description: "Carriles, zonas de salida y recorridos." },
];

const commonItems = [
  "El espacio está libre de objetos, líquidos u obstáculos peligrosos.",
  "Los materiales fueron revisados y no presentan daños visibles.",
  "Las zonas de trabajo, espera y circulación están claramente definidas.",
  "La actividad corresponde a la edad, experiencia y condición del grupo.",
  "Existen opciones de adaptación para estudiantes que las necesiten.",
  "El docente conoce el protocolo institucional y los contactos de emergencia.",
  "El botiquín y los medios de comunicación están localizables.",
];

const spaceItems: Record<SpaceId, string[]> = {
  cancha: [
    "La superficie no presenta huecos, desniveles ni zonas resbaladizas.",
    "Las condiciones de sol, temperatura, lluvia, viento y tormenta permiten la actividad.",
    "Se dispone de hidratación, sombra y pausas adecuadas.",
  ],
  gimnasio: [
    "Las porterías, tableros, colchonetas y estructuras están estables o aseguradas.",
    "Las salidas y rutas de evacuación permanecen despejadas.",
    "La ventilación, iluminación y temperatura son adecuadas.",
  ],
  aula: [
    "Mesas, sillas, mochilas y cables no invaden la zona de movimiento.",
    "Los movimientos seleccionados son de baja amplitud y sin desplazamientos peligrosos.",
    "Existe distancia suficiente entre estudiantes y elementos frágiles.",
  ],
  pista: [
    "Los carriles y zonas de llegada están libres de personas y materiales.",
    "El sentido de circulación y las señales de salida son conocidos por el grupo.",
    "Las zonas de lanzamiento o salto están separadas y bajo supervisión.",
  ],
};

export default function PreventionChecklist({ onBack }: PreventionChecklistProps) {
  const [space, setSpace] = useState<SpaceId | null>(null);
  const [checked, setChecked] = useState<Record<string, boolean>>({});
  const [showSummary, setShowSummary] = useState(false);
  const items = useMemo(() => space ? [...commonItems, ...spaceItems[space]] : [], [space]);
  const completed = items.filter((item) => checked[item]).length;
  const pending = items.filter((item) => !checked[item]);
  const progress = items.length ? Math.round((completed / items.length) * 100) : 0;
  const selectedSpace = spaces.find((item) => item.id === space);

  function chooseSpace(id: SpaceId) { setSpace(id); setChecked({}); setShowSummary(false); }
  function reset() { setSpace(null); setChecked({}); setShowSummary(false); }

  return (
    <section className="overflow-hidden rounded-[2rem] border border-slate-200 bg-white shadow-xl">
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-200 bg-slate-50 px-6 py-5"><div><p className="text-xs font-black uppercase tracking-[.18em] text-emerald-700">Prevención</p><h2 className="mt-1 text-2xl font-black">Prepara el espacio antes de comenzar</h2></div><button onClick={onBack} className="rounded-xl border border-slate-300 bg-white px-4 py-2 text-sm font-black text-slate-600 hover:bg-slate-100">← Volver</button></div>
      <div className="p-6 sm:p-8">
        {!space ? (
          <div><h3 className="text-3xl font-black">¿Dónde realizarás la actividad?</h3><p className="mt-2 text-slate-600">Selecciona el espacio para cargar una revisión específica.</p><div className="mt-7 grid gap-4 md:grid-cols-2">{spaces.map(item => <button key={item.id} onClick={() => chooseSpace(item.id)} className="group rounded-2xl border border-slate-200 p-5 text-left transition hover:-translate-y-1 hover:border-emerald-300 hover:bg-emerald-50"><span className="text-3xl" aria-hidden="true">{item.icon}</span><p className="mt-4 text-xl font-black">{item.title}</p><p className="mt-2 text-sm leading-6 text-slate-500">{item.description}</p><span className="mt-4 inline-flex text-sm font-black text-emerald-700">Revisar espacio →</span></button>)}</div></div>
        ) : showSummary ? (
          <div>
            <div className={`rounded-3xl border-2 p-6 ${pending.length === 0 ? "border-emerald-200 bg-emerald-50" : "border-amber-200 bg-amber-50"}`}><span className={`inline-flex rounded-full px-4 py-2 text-xs font-black uppercase tracking-[.16em] ${pending.length === 0 ? "bg-emerald-600 text-white" : "bg-amber-400 text-slate-950"}`}>{pending.length === 0 ? "Espacio preparado" : "Revisión incompleta"}</span><h3 className="mt-5 text-3xl font-black">{selectedSpace?.title}</h3><p className="mt-3 leading-7 text-slate-700">{pending.length === 0 ? "Los criterios previstos fueron confirmados. Mantén supervisión activa y detén la actividad si las condiciones cambian." : `Confirmaste ${completed} de ${items.length} criterios. Resuelve o controla los elementos pendientes antes de comenzar.`}</p></div>
            {pending.length > 0 && <div className="mt-6 rounded-3xl border border-orange-200 bg-white p-6"><h4 className="text-xl font-black text-orange-800">Acciones pendientes</h4><ul className="mt-4 space-y-3">{pending.map(item => <li key={item} className="flex gap-3 text-sm leading-6 text-slate-700"><span className="mt-1 text-orange-600" aria-hidden="true">●</span><span>{item}</span></li>)}</ul></div>}
            <div className="mt-6 flex flex-wrap gap-3"><button onClick={() => setShowSummary(false)} className="rounded-xl bg-blue-700 px-5 py-3 text-sm font-black text-white hover:bg-blue-800">Editar revisión</button><button onClick={reset} className="rounded-xl border border-slate-300 px-5 py-3 text-sm font-black text-slate-700 hover:bg-slate-50">Revisar otro espacio</button></div>
          </div>
        ) : (
          <div>
            <div className="flex flex-wrap items-end justify-between gap-4"><div><p className="text-sm font-black text-emerald-700">{selectedSpace?.icon} {selectedSpace?.title}</p><h3 className="mt-2 text-3xl font-black">Lista de verificación</h3></div><button onClick={reset} className="text-sm font-black text-blue-700 hover:underline">Cambiar espacio</button></div>
            <div className="mt-6"><div className="flex justify-between text-sm font-bold text-slate-600"><span>{completed} de {items.length} confirmados</span><span>{progress}%</span></div><div className="mt-2 h-3 overflow-hidden rounded-full bg-slate-100"><div className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-blue-600 transition-all" style={{ width: `${progress}%` }} /></div></div>
            <div className="mt-7 space-y-3">{items.map((item, index) => <label key={item} className={`flex cursor-pointer items-start gap-4 rounded-2xl border p-4 transition ${checked[item] ? "border-emerald-200 bg-emerald-50" : "border-slate-200 hover:border-blue-200 hover:bg-blue-50/40"}`}><input type="checkbox" checked={Boolean(checked[item])} onChange={(event) => setChecked(current => ({ ...current, [item]: event.target.checked }))} className="mt-1 h-5 w-5 shrink-0 accent-emerald-600"/><span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-slate-900 text-xs font-black text-white">{index + 1}</span><span className="text-sm font-semibold leading-6 text-slate-700">{item}</span></label>)}</div>
            <div className="mt-7 flex flex-wrap items-center gap-4"><button onClick={() => setShowSummary(true)} className="rounded-xl bg-emerald-600 px-6 py-3 font-black text-white shadow-lg hover:bg-emerald-700">Ver resultado de la revisión</button><p className="text-xs text-slate-500">Los elementos no confirmados aparecerán como acciones pendientes.</p></div>
          </div>
        )}
      </div>
    </section>
  );
}
