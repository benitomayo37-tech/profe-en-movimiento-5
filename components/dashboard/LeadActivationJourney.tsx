import Link from "next/link";

import type { LeadActivationJourney as Journey } from "@/features/funnel/server/activation";

function Step({ complete, number, title, description, href, action }: { complete: boolean; number: number; title: string; description: string; href: string; action: string }) {
  return (
    <article className={`rounded-2xl border p-5 ${complete ? "border-emerald-200 bg-emerald-50" : "border-slate-200 bg-white"}`}>
      <div className="flex items-start gap-4">
        <span className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-sm font-black ${complete ? "bg-emerald-600 text-white" : "bg-blue-100 text-blue-800"}`} aria-hidden="true">{complete ? "✓" : number}</span>
        <div>
          <h3 className="font-black text-slate-950">{title}</h3>
          <p className="mt-1 text-sm leading-6 text-slate-600">{description}</p>
          {complete ? <p className="mt-3 text-xs font-black uppercase tracking-wide text-emerald-700">Completado</p> : <Link href={href} className="mt-3 inline-flex text-sm font-black text-blue-700 hover:underline">{action} →</Link>}
        </div>
      </div>
    </article>
  );
}

export default function LeadActivationJourney({ journey }: { journey: Journey }) {
  const percentage = Math.round((journey.completedSteps / journey.totalSteps) * 100);
  return (
    <section aria-labelledby="activation-title" className="rounded-3xl border border-blue-200 bg-gradient-to-br from-blue-50 to-violet-50 p-6 shadow-sm sm:p-8">
      <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="text-xs font-black uppercase tracking-[.18em] text-violet-700">Tu ruta de inicio</p>
          <h2 id="activation-title" className="mt-2 text-2xl font-black text-slate-950">Convierte el kit en una clase adaptada a tu realidad</h2>
          <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600">Completa estos pasos para conocer las herramientas principales de Profe en Movimiento.</p>
        </div>
        <div className="min-w-52">
          <div className="flex justify-between text-xs font-black text-slate-600"><span>{journey.completedSteps} de {journey.totalSteps} pasos</span><span>{percentage}%</span></div>
          <div className="mt-2 h-2 overflow-hidden rounded-full bg-white"><div className="h-full rounded-full bg-gradient-to-r from-blue-600 to-violet-600" style={{ width: `${percentage}%` }} /></div>
        </div>
      </div>
      {journey.completed ? <div className="mt-6 rounded-2xl bg-emerald-600 px-5 py-4 font-bold text-white">¡Ruta completada! Ya descargaste el kit, utilizaste Agentes IA e iniciaste tu formación en Academia.</div> : null}
      <div className="mt-6 grid gap-4 lg:grid-cols-3">
        <Step complete={journey.steps.kit} number={1} title="Descarga tu kit" description="Conserva la clase piloto y su rúbrica como punto de partida." href={journey.downloadUrl} action="Descargar PDF" />
        <Step complete={journey.steps.agents} number={2} title="Adáptalo con Agentes IA" description="Crea una versión ajustada al curso, materiales y objetivo que necesitas." href="/agentes" action="Abrir Agentes IA" />
        <Step complete={journey.steps.academy} number={3} title="Inicia el curso piloto" description="Explora la Academia y avanza en la primera formación disponible." href="/academia" action="Ir a Academia" />
      </div>
      <p className="mt-4 text-xs text-slate-500">El progreso se actualiza cuando vuelves a tu dashboard.</p>
    </section>
  );
}
