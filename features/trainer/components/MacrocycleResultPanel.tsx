import Image from "next/image";

import MacrocyclePrintButton from "./MacrocyclePrintButton";
import MacrocyclePrintable from "./MacrocyclePrintable";

import type { GeneratedMacrocycle } from "@/features/trainer/types/trainer";
import {
  formatMacrocycleWeekLabel,
  MACROCYCLE_FOCUS_LABELS,
  MACROCYCLE_INTENSITY_LABELS,
  MACROCYCLE_PERIOD_LABELS,
} from "@/features/trainer/utils/macrocycleLabels";

interface Props {
  result: GeneratedMacrocycle | null;
  isGenerating: boolean;
  error: string;
}

export default function MacrocycleResultPanel({
  result,
  isGenerating,
  error,
}: Props) {
  return (
    <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
      <div className="border-b border-slate-200 pb-6">
        <p className="text-sm font-bold uppercase tracking-[0.18em] text-emerald-700">
          Resultado de temporada
        </p>
        <h2 className="mt-2 text-2xl font-black text-slate-950">
          Macrociclo generado
        </h2>
      </div>

      {isGenerating ? (
        <EmptyState
          title="Diseñando el macrociclo"
          text="Entrenador IA está comprobando periodización, progresión, competencia, recuperación y seguridad."
          pulse
        />
      ) : error ? (
        <div
          role="alert"
          className="mt-6 rounded-2xl border border-red-200 bg-red-50 p-5"
        >
          <h3 className="font-black text-red-900">
            No se pudo generar el macrociclo
          </h3>
          <p className="mt-2 text-sm leading-6 text-red-800">{error}</p>
        </div>
      ) : !result ? (
        <EmptyState
          title="Macrociclo listo para configurar"
          text="Define el objetivo de temporada y distribuye las semanas preparatorias, competitivas y de transición."
        />
      ) : (
        <div className="mt-6 space-y-7">
          <div className="flex flex-col gap-4 rounded-2xl border border-emerald-200 bg-emerald-50 p-5 lg:flex-row lg:items-start lg:justify-between">
            <div>
              <p className="text-xs font-bold uppercase tracking-wide text-emerald-700">
                {result.totalWeeks} semanas · {result.totalSessions} sesiones ·{" "}
                {result.totalMinutes} minutos
              </p>
              <h3 className="mt-2 text-2xl font-black text-slate-950">
                {result.title}
              </h3>
              <p className="mt-3 max-w-4xl text-sm leading-6 text-slate-700">
                {result.summary}
              </p>
              <p className="mt-3 text-sm font-semibold leading-6 text-slate-800">
                Objetivo: {result.seasonObjective}
              </p>
            </div>
            <MacrocyclePrintButton />
          </div>

          <div className="grid gap-4 lg:grid-cols-3">
            <InfoCard
              title="Justificación de la periodización"
              text={result.periodizationRationale}
            />
            <InfoCard
              title="Distribución global de la carga"
              text={result.annualLoadSummary}
            />
            <InfoCard
              title="Competencia principal"
              text={result.mainCompetitionGuidance}
            />
          </div>

          <div className="grid gap-5 xl:grid-cols-3">
            {result.periods.map((period) => (
              <article
                key={period.periodNumber}
                className="rounded-2xl border border-slate-200 p-5"
              >
                <p className="text-xs font-bold uppercase tracking-wide text-emerald-700">
                  Periodo {period.periodNumber} ·{" "}
                  {MACROCYCLE_PERIOD_LABELS[period.type]}
                </p>
                <h4 className="mt-2 text-lg font-black text-slate-950">
                  {period.title}
                </h4>
                <p className="mt-1 text-sm font-semibold text-slate-500">
                  {formatMacrocycleWeekLabel(
                    period.weekStart,
                    period.weekEnd,
                  )}
                </p>
                <p className="mt-3 text-sm leading-6 text-slate-600">
                  {period.objective}
                </p>

                <div className="mt-4 flex flex-wrap gap-2 text-xs font-bold">
                  <Badge>{MACROCYCLE_FOCUS_LABELS[period.focus]}</Badge>
                  <Badge>{MACROCYCLE_INTENSITY_LABELS[period.intensity]}</Badge>
                  <Badge>Carga {period.loadLevel}/5</Badge>
                  <Badge>{period.sessionCount} sesiones</Badge>
                </div>

                <SmallInfo title="Organización" text={period.organization} />

                <div className="mt-4">
                  <h5 className="text-sm font-black text-slate-900">
                    Contenidos clave
                  </h5>
                  <ul className="mt-2 space-y-2 text-sm leading-6 text-slate-600">
                    {period.keyContents.map((content) => (
                      <li key={content}>• {content}</li>
                    ))}
                  </ul>
                </div>

                <SmallInfo title="Progresión" text={period.progression} />
                <SmallInfo title="Recuperación" text={period.recovery} />
                <SmallInfo title="Control" text={period.monitoring} />
                <SmallInfo title="Seguridad" text={period.safety} />
              </article>
            ))}
          </div>

          <div className="grid gap-5 lg:grid-cols-3">
            <ResultList
              title="Evaluación observable"
              items={result.evaluationCriteria}
            />
            <ResultList
              title="Medidas de seguridad"
              items={result.safetyMeasures}
            />
            <ResultList
              title="Opciones de adaptación"
              items={result.adaptationNotes}
            />
          </div>

          <MacrocyclePrintable macrocycle={result} />
        </div>
      )}
    </section>
  );
}

function EmptyState({
  title,
  text,
  pulse = false,
}: {
  title: string;
  text: string;
  pulse?: boolean;
}) {
  return (
    <div
      role={pulse ? "status" : undefined}
      className="flex min-h-80 flex-col items-center justify-center px-4 text-center"
    >
      <div
        className={`relative h-28 w-28 overflow-hidden rounded-[2rem] ${pulse ? "animate-pulse" : ""}`}
      >
        <Image
          src="/images/profe-ia-robot.png"
          alt=""
          width={220}
          height={280}
          className="absolute left-1/2 top-0 h-[180px] w-auto max-w-none -translate-x-1/2 object-contain"
        />
      </div>
      <h3 className="mt-6 text-xl font-black text-slate-950">{title}</h3>
      <p className="mt-3 max-w-lg text-sm leading-6 text-slate-600">{text}</p>
    </div>
  );
}

function Badge({ children }: { children: React.ReactNode }) {
  return (
    <span className="rounded-lg bg-blue-50 px-3 py-1.5 text-blue-800">
      {children}
    </span>
  );
}

function SmallInfo({ title, text }: { title: string; text: string }) {
  return (
    <div className="mt-4 rounded-xl bg-slate-50 p-4">
      <h5 className="text-sm font-black text-slate-900">{title}</h5>
      <p className="mt-1 text-sm leading-6 text-slate-600">{text}</p>
    </div>
  );
}

function InfoCard({ title, text }: { title: string; text: string }) {
  return (
    <div className="rounded-2xl bg-blue-50 p-5 text-blue-950">
      <h4 className="font-black">{title}</h4>
      <p className="mt-2 text-sm leading-6">{text}</p>
    </div>
  );
}

function ResultList({ title, items }: { title: string; items: string[] }) {
  return (
    <section className="rounded-2xl border border-emerald-200 bg-emerald-50 p-5 text-emerald-950">
      <h4 className="font-black">{title}</h4>
      <ul className="mt-3 space-y-2 text-sm leading-6">
        {items.map((item) => (
          <li key={item}>• {item}</li>
        ))}
      </ul>
    </section>
  );
}
