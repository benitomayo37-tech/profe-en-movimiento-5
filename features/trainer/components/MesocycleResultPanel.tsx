import Image from "next/image";

import MesocyclePrintButton from "./MesocyclePrintButton";
import MesocyclePrintable from "./MesocyclePrintable";

import type { GeneratedMesocycle } from "@/features/trainer/types/trainer";
import {
  MESOCYCLE_FOCUS_LABELS,
  MESOCYCLE_INTENSITY_LABELS,
} from "@/features/trainer/utils/mesocycleLabels";

interface Props {
  result: GeneratedMesocycle | null;
  isGenerating: boolean;
  error: string;
}

export default function MesocycleResultPanel({ result, isGenerating, error }: Props) {
  return (
    <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
      <div className="border-b border-slate-200 pb-6">
        <p className="text-sm font-bold uppercase tracking-[0.18em] text-emerald-700">Resultado por etapas</p>
        <h2 className="mt-2 text-2xl font-black text-slate-950">Mesociclo generado</h2>
      </div>

      {isGenerating ? (
        <EmptyState title="Diseñando el mesociclo" text="Entrenador IA está comprobando progresión, carga, recuperación, participación y seguridad." pulse />
      ) : error ? (
        <div role="alert" className="mt-6 rounded-2xl border border-red-200 bg-red-50 p-5">
          <h3 className="font-black text-red-900">No se pudo generar el mesociclo</h3>
          <p className="mt-2 text-sm leading-6 text-red-800">{error}</p>
        </div>
      ) : !result ? (
        <EmptyState title="Mesociclo listo para configurar" text="Define el objetivo, la cantidad de semanas y la frecuencia de entrenamiento." />
      ) : (
        <div className="mt-6 space-y-7">
          <div className="flex flex-col gap-4 rounded-2xl border border-emerald-200 bg-emerald-50 p-5 lg:flex-row lg:items-start lg:justify-between">
            <div>
              <p className="text-xs font-bold uppercase tracking-wide text-emerald-700">
                {result.totalWeeks} semanas · {result.totalSessions} sesiones · {result.totalMinutes} minutos
              </p>
              <h3 className="mt-2 text-2xl font-black text-slate-950">{result.title}</h3>
              <p className="mt-3 max-w-4xl text-sm leading-6 text-slate-700">{result.summary}</p>
              <p className="mt-3 text-sm font-semibold leading-6 text-slate-800">Objetivo: {result.mainObjective}</p>
            </div>
            <MesocyclePrintButton />
          </div>

          <div className="grid gap-4 lg:grid-cols-2">
            <InfoCard title="Orientación de la fase" text={result.phaseGuidance} color="blue" />
            <InfoCard title="Distribución general de la carga" text={result.overallLoadSummary} color="violet" />
          </div>

          <div className="grid gap-5 xl:grid-cols-2">
            {result.weeks.map((week) => (
              <article key={week.weekNumber} className="rounded-2xl border border-slate-200 p-5">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-xs font-bold uppercase tracking-wide text-emerald-700">Semana {week.weekNumber}</p>
                    <h4 className="mt-1 text-lg font-black text-slate-950">{week.title}</h4>
                  </div>
                  <span className="rounded-xl bg-slate-100 px-3 py-1.5 text-sm font-black text-slate-700">{week.totalMinutes} min</span>
                </div>
                <p className="mt-3 text-sm leading-6 text-slate-600">{week.objective}</p>
                <div className="mt-4 flex flex-wrap gap-2 text-xs font-bold">
                  <Badge>{MESOCYCLE_FOCUS_LABELS[week.focus]}</Badge>
                  <Badge>{MESOCYCLE_INTENSITY_LABELS[week.intensity]}</Badge>
                  <Badge>Carga {week.loadLevel}/5</Badge>
                  <Badge>{week.sessionCount} sesiones</Badge>
                </div>
                <div className="mt-4 rounded-xl bg-slate-50 p-4">
                  <h5 className="text-sm font-black text-slate-900">Organización</h5>
                  <p className="mt-1 text-sm leading-6 text-slate-600">{week.organization}</p>
                </div>
                <div className="mt-4">
                  <h5 className="text-sm font-black text-slate-900">Contenidos clave</h5>
                  <ul className="mt-2 space-y-2 text-sm leading-6 text-slate-600">
                    {week.keyContents.map((content) => <li key={content}>• {content}</li>)}
                  </ul>
                </div>
                <div className="mt-4 grid gap-3 sm:grid-cols-2">
                  <SmallInfo title="Carga" text={week.loadGuidance} />
                  <SmallInfo title="Recuperación" text={week.recovery} />
                  <SmallInfo title="Control" text={week.monitoring} />
                  <SmallInfo title="Seguridad" text={week.safety} />
                </div>
              </article>
            ))}
          </div>

          <div className="grid gap-5 lg:grid-cols-3">
            <ResultList title="Evaluación observable" items={result.evaluationCriteria} />
            <ResultList title="Medidas de seguridad" items={result.safetyMeasures} />
            <ResultList title="Opciones de adaptación" items={result.adaptationNotes} />
          </div>
          <MesocyclePrintable mesocycle={result} />
        </div>
      )}
    </section>
  );
}

function EmptyState({ title, text, pulse = false }: { title: string; text: string; pulse?: boolean }) {
  return <div role={pulse ? "status" : undefined} className="flex min-h-80 flex-col items-center justify-center px-4 text-center"><div className={`relative h-28 w-28 overflow-hidden rounded-[2rem] ${pulse ? "animate-pulse" : ""}`}><Image src="/images/profe-ia-robot.png" alt="" width={220} height={280} className="absolute left-1/2 top-0 h-[180px] w-auto max-w-none -translate-x-1/2 object-contain" /></div><h3 className="mt-6 text-xl font-black text-slate-950">{title}</h3><p className="mt-3 max-w-lg text-sm leading-6 text-slate-600">{text}</p></div>;
}

function Badge({ children }: { children: React.ReactNode }) { return <span className="rounded-lg bg-blue-50 px-3 py-1.5 text-blue-800">{children}</span>; }
function SmallInfo({ title, text }: { title: string; text: string }) { return <p className="rounded-xl bg-slate-50 p-3 text-sm leading-6 text-slate-700"><strong>{title}:</strong> {text}</p>; }
function InfoCard({ title, text, color }: { title: string; text: string; color: "blue" | "violet" }) { return <div className={`rounded-2xl p-5 ${color === "blue" ? "bg-blue-50 text-blue-950" : "bg-violet-50 text-violet-950"}`}><h4 className="font-black">{title}</h4><p className="mt-2 text-sm leading-6">{text}</p></div>; }
function ResultList({ title, items }: { title: string; items: string[] }) { return <section className="rounded-2xl border border-emerald-200 bg-emerald-50 p-5 text-emerald-950"><h4 className="font-black">{title}</h4><ul className="mt-3 space-y-2 text-sm leading-6">{items.map((item) => <li key={item}>• {item}</li>)}</ul></section>; }
