import Image from "next/image";

import MicrocyclePrintButton from "./MicrocyclePrintButton";
import MicrocyclePrintable from "./MicrocyclePrintable";

import type {
  GeneratedMicrocycle,
} from "@/features/trainer/types/trainer";
import {
  DAY_LABELS,
  FOCUS_LABELS,
  INTENSITY_LABELS,
} from "@/features/trainer/utils/microcycleLabels";

interface MicrocycleResultPanelProps {
  result: GeneratedMicrocycle | null;
  isGenerating: boolean;
  error: string;
}

export default function MicrocycleResultPanel({
  result,
  isGenerating,
  error,
}: MicrocycleResultPanelProps) {
  return (
    <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
      <div className="border-b border-slate-200 pb-6">
        <p className="text-sm font-bold uppercase tracking-[0.18em] text-emerald-700">
          Resultado semanal
        </p>
        <h2 className="mt-2 text-2xl font-black text-slate-950">
          Microciclo generado
        </h2>
      </div>

      {isGenerating ? (
        <div role="status" className="flex min-h-80 flex-col items-center justify-center px-4 text-center">
          <div className="relative h-28 w-28 animate-pulse overflow-hidden rounded-[2rem]">
            <Image
              src="/images/profe-ia-robot.png"
              alt=""
              width={220}
              height={280}
              className="absolute left-1/2 top-0 h-[180px] w-auto max-w-none -translate-x-1/2 object-contain"
            />
          </div>
          <h3 className="mt-6 text-xl font-black text-slate-950">
            Diseñando el microciclo
          </h3>
          <p className="mt-3 max-w-lg text-sm leading-6 text-slate-600">
            Entrenador IA está distribuyendo sesiones, carga, recuperación y progresión semanal.
          </p>
        </div>
      ) : error ? (
        <div role="alert" className="mt-6 rounded-2xl border border-red-200 bg-red-50 p-5">
          <h3 className="font-black text-red-900">
            No se pudo generar el microciclo
          </h3>
          <p className="mt-2 text-sm leading-6 text-red-800">{error}</p>
        </div>
      ) : !result ? (
        <div className="flex min-h-80 flex-col items-center justify-center px-4 text-center">
          <div className="relative h-28 w-28 overflow-hidden rounded-[2rem]">
            <Image
              src="/images/profe-ia-robot.png"
              alt=""
              width={220}
              height={280}
              className="absolute left-1/2 top-0 h-[180px] w-auto max-w-none -translate-x-1/2 object-contain"
            />
          </div>
          <h3 className="mt-6 text-xl font-black text-slate-950">
            Microciclo listo para configurar
          </h3>
          <p className="mt-3 max-w-lg text-sm leading-6 text-slate-600">
            Completa los datos semanales y selecciona los días de entrenamiento.
          </p>
        </div>
      ) : (
        <div className="mt-6 space-y-7">
          <div className="flex flex-col gap-4 rounded-2xl border border-emerald-200 bg-emerald-50 p-5 lg:flex-row lg:items-start lg:justify-between">
            <div>
              <p className="text-xs font-bold uppercase tracking-wide text-emerald-700">
                {result.totalSessions} sesiones · {result.totalMinutes} minutos
              </p>
              <h3 className="mt-2 text-2xl font-black text-slate-950">
                {result.title}
              </h3>
              <p className="mt-3 max-w-4xl text-sm leading-6 text-slate-700">
                {result.summary}
              </p>
              <p className="mt-3 text-sm font-semibold leading-6 text-slate-800">
                Objetivo semanal: {result.weeklyObjective}
              </p>
            </div>
            <MicrocyclePrintButton />
          </div>

          <div className="grid gap-4 lg:grid-cols-2">
            <div className="rounded-2xl bg-blue-50 p-5">
              <h4 className="font-black text-blue-950">Orientación de la fase</h4>
              <p className="mt-2 text-sm leading-6 text-blue-900">
                {result.phaseGuidance}
              </p>
            </div>
            <div className="rounded-2xl bg-violet-50 p-5">
              <h4 className="font-black text-violet-950">Distribución de la carga</h4>
              <p className="mt-2 text-sm leading-6 text-violet-900">
                {result.weeklyLoadSummary}
              </p>
            </div>
          </div>

          <div className="grid gap-5 xl:grid-cols-2">
            {result.days.map((day) => (
              <article key={day.day} className="rounded-2xl border border-slate-200 p-5">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-xs font-bold uppercase tracking-wide text-emerald-700">
                      Sesión {day.sessionNumber} · {DAY_LABELS[day.day]}
                    </p>
                    <h4 className="mt-1 text-lg font-black text-slate-950">
                      {day.title}
                    </h4>
                  </div>
                  <span className="rounded-xl bg-slate-100 px-3 py-1.5 text-sm font-black text-slate-700">
                    {day.minutes} min
                  </span>
                </div>

                <p className="mt-3 text-sm leading-6 text-slate-600">
                  {day.objective}
                </p>

                <div className="mt-4 flex flex-wrap gap-2 text-xs font-bold">
                  <span className="rounded-lg bg-blue-50 px-3 py-1.5 text-blue-800">
                    {FOCUS_LABELS[day.focus]}
                  </span>
                  <span className="rounded-lg bg-amber-50 px-3 py-1.5 text-amber-800">
                    {INTENSITY_LABELS[day.intensity]}
                  </span>
                  <span className="rounded-lg bg-violet-50 px-3 py-1.5 text-violet-800">
                    Carga {day.loadLevel}/5
                  </span>
                </div>

                <div className="mt-4 rounded-xl bg-slate-50 p-4">
                  <p className="text-sm font-black text-slate-900">Organización</p>
                  <p className="mt-1 text-sm leading-6 text-slate-600">
                    {day.organization}
                  </p>
                </div>

                <div className="mt-4 space-y-3">
                  {day.segments.map((segment) => (
                    <div key={`${day.day}-${segment.name}`} className="border-l-4 border-emerald-300 pl-4">
                      <div className="flex items-start justify-between gap-3">
                        <h5 className="text-sm font-black text-slate-900">{segment.name}</h5>
                        <span className="whitespace-nowrap text-xs font-black text-emerald-700">
                          {segment.minutes} min
                        </span>
                      </div>
                      <p className="mt-1 text-xs font-bold text-slate-700">{segment.objective}</p>
                      <p className="mt-1 text-sm leading-6 text-slate-600">{segment.content}</p>
                    </div>
                  ))}
                </div>

                <div className="mt-4 grid gap-3 sm:grid-cols-2">
                  <InfoBox title="Recuperación" content={day.recovery} color="emerald" />
                  <InfoBox title="Control" content={day.monitoring} color="blue" />
                  <InfoBox title="Seguridad" content={day.safety} color="amber" />
                  <div className="rounded-xl bg-slate-50 p-3 text-sm leading-6 text-slate-700">
                    <strong>Consignas:</strong>
                    <ul className="mt-1">
                      {day.coachingPoints.map((point) => (
                        <li key={point}>• {point}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              </article>
            ))}
          </div>

          <div className="grid gap-5 lg:grid-cols-3">
            <ResultList title="Evaluación observable" items={result.evaluationCriteria} color="blue" />
            <ResultList title="Medidas de seguridad" items={result.safetyMeasures} color="amber" />
            <ResultList title="Opciones de adaptación" items={result.adaptationNotes} color="emerald" />
          </div>

          <MicrocyclePrintable microcycle={result} />
        </div>
      )}
    </section>
  );
}

function InfoBox({
  title,
  content,
  color,
}: {
  title: string;
  content: string;
  color: "blue" | "amber" | "emerald";
}) {
  const styles = {
    blue: "bg-blue-50 text-blue-900",
    amber: "bg-amber-50 text-amber-900",
    emerald: "bg-emerald-50 text-emerald-900",
  } as const;

  return (
    <p className={`rounded-xl p-3 text-sm leading-6 ${styles[color]}`}>
      <strong>{title}:</strong> {content}
    </p>
  );
}

function ResultList({
  title,
  items,
  color,
}: {
  title: string;
  items: string[];
  color: "blue" | "amber" | "emerald";
}) {
  const styles = {
    blue: "border-blue-200 bg-blue-50 text-blue-950",
    amber: "border-amber-200 bg-amber-50 text-amber-950",
    emerald: "border-emerald-200 bg-emerald-50 text-emerald-950",
  } as const;

  return (
    <section className={`rounded-2xl border p-5 ${styles[color]}`}>
      <h4 className="font-black">{title}</h4>
      <ul className="mt-3 space-y-2 text-sm leading-6">
        {items.map((item) => (
          <li key={item}>• {item}</li>
        ))}
      </ul>
    </section>
  );
}
