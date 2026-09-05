import PhysicalPlanPrintButton from "@/features/physical-planner/components/PhysicalPlanPrintButton";

import type {
  GeneratedPhysicalPlan,
  PhysicalPlannerContext,
  PhysicalPlannerUsage,
} from "@/features/physical-planner/types/physicalPlanner";

interface PhysicalPlanResultPanelProps {
  result: GeneratedPhysicalPlan | null;
  context: PhysicalPlannerContext;
  usage: PhysicalPlannerUsage | null;
  isGenerating: boolean;
  error: string;
}

function formatSeconds(seconds: number) {
  if (seconds < 60) {
    return `${seconds} s`;
  }

  const minutes = Math.floor(seconds / 60);
  const remaining = seconds % 60;

  return remaining === 0
    ? `${minutes} min`
    : `${minutes} min ${remaining} s`;
}

export default function PhysicalPlanResultPanel({
  result,
  context,
  usage,
  isGenerating,
  error,
}: PhysicalPlanResultPanelProps) {
  if (isGenerating) {
    return (
      <section
        aria-live="polite"
        className="rounded-3xl border border-orange-200 bg-orange-50 p-8 text-center shadow-sm"
      >
        <div className="mx-auto h-12 w-12 animate-spin rounded-full border-4 border-orange-200 border-t-orange-600" />

        <h2 className="mt-5 text-xl font-black text-slate-950">
          Construyendo la sesión
        </h2>

        <p className="mt-2 text-sm leading-6 text-slate-600">
          Estamos verificando carga, intervalos,
          recuperación, organización y seguridad.
        </p>
      </section>
    );
  }

  if (error) {
    return (
      <section
        role="alert"
        className="rounded-3xl border border-red-200 bg-red-50 p-6 shadow-sm"
      >
        <p className="text-xs font-black uppercase tracking-[0.18em] text-red-700">
          No se pudo completar
        </p>

        <h2 className="mt-2 text-xl font-black text-red-950">
          Revisa la solicitud
        </h2>

        <p className="mt-3 text-sm leading-6 text-red-900">
          {error}
        </p>
      </section>
    );
  }

  if (!result) {
    return (
      <section className="rounded-3xl border border-dashed border-slate-300 bg-slate-50 p-8 text-center">
        <div
          aria-hidden="true"
          className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-white text-2xl shadow-sm"
        >
          📋
        </div>

        <h2 className="mt-5 text-xl font-black text-slate-950">
          Tu planificación aparecerá aquí
        </h2>

        <p className="mx-auto mt-2 max-w-2xl text-sm leading-6 text-slate-600">
          Completa las condiciones reales de trabajo para
          generar una sesión con tiempos y carga comprobados.
        </p>
      </section>
    );
  }

  const isPhysicalEducation =
    context === "physical_education";

  return (
    <section
      id="physical-plan-result"
      className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-8"
    >
      <header className="border-b border-slate-200 pb-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.18em] text-orange-600">
              Planificación completada
            </p>

            <h2 className="mt-2 text-2xl font-black tracking-tight text-slate-950 sm:text-3xl">
              {result.title}
            </h2>

            <p className="mt-3 max-w-4xl text-sm leading-7 text-slate-600">
              {result.summary}
            </p>
          </div>

          <span className="w-fit rounded-full bg-emerald-600 px-4 py-2 text-xs font-black uppercase tracking-wide text-white shadow-sm">
            Guardada automáticamente
          </span>
        </div>

        <div className="mt-6 grid gap-3 sm:grid-cols-3">
          <article className="rounded-2xl bg-blue-50 p-4">
            <p className="text-xs font-bold uppercase tracking-wide text-blue-700">
              Duración
            </p>
            <p className="mt-1 text-2xl font-black text-blue-950">
              {result.totalMinutes} min
            </p>
          </article>

          <article className="rounded-2xl bg-orange-50 p-4">
            <p className="text-xs font-bold uppercase tracking-wide text-orange-700">
              RPE de sesión
            </p>
            <p className="mt-1 text-2xl font-black text-orange-950">
              {result.sessionRpe}/10
            </p>
          </article>

          <article className="rounded-2xl bg-violet-50 p-4">
            <p className="text-xs font-bold uppercase tracking-wide text-violet-700">
              Carga estimada
            </p>
            <p className="mt-1 text-2xl font-black text-violet-950">
              {result.estimatedLoad} UA
            </p>
          </article>
        </div>

        <div className="mt-5 rounded-2xl bg-slate-950 p-5 text-white">
          <p className="text-xs font-black uppercase tracking-[0.16em] text-orange-300">
            Objetivo operativo
          </p>
          <p className="mt-2 text-sm font-semibold leading-7">
            {result.objective}
          </p>
        </div>
        <PhysicalPlanPrintButton
          plan={result}
          context={context}
        />
      </header>

      <div className="mt-6 grid gap-5 lg:grid-cols-2">
        <InformationCard
          title="Orientación de la carga"
          content={result.loadGuidance}
          color="orange"
        />

        <InformationCard
          title="Organización general"
          content={result.organizationSummary}
          color="blue"
        />
      </div>

      <div className="mt-8 space-y-6">
        {result.blocks.map((block, blockIndex) => (
          <article
            key={`${block.name}-${blockIndex}`}
            className="overflow-hidden rounded-3xl border border-slate-200"
          >
            <div className="flex flex-col gap-3 bg-slate-950 px-5 py-5 text-white sm:flex-row sm:items-start sm:justify-between">
              <div>
                <p className="text-xs font-black uppercase tracking-[0.16em] text-orange-300">
                  Bloque {blockIndex + 1}
                </p>
                <h3 className="mt-1 text-xl font-black">
                  {block.name}
                </h3>
                <p className="mt-2 text-sm leading-6 text-slate-300">
                  {block.objective}
                </p>
              </div>

              <span className="w-fit rounded-xl bg-white/10 px-4 py-2 text-sm font-black">
                {block.minutes} min
              </span>
            </div>

            <div className="space-y-4 p-4 sm:p-5">
              {block.activities.map(
                (activity, activityIndex) => (
                  <section
                    key={`${activity.name}-${activityIndex}`}
                    className="rounded-2xl border border-slate-200 bg-slate-50 p-4 sm:p-5"
                  >
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                      <div>
                        <p className="text-xs font-black uppercase tracking-wide text-orange-600">
                          Actividad {activityIndex + 1}
                        </p>
                        <h4 className="mt-1 text-lg font-black text-slate-950">
                          {activity.name}
                        </h4>
                      </div>

                      <span className="w-fit rounded-xl bg-white px-3 py-2 text-sm font-black text-slate-800 shadow-sm">
                        {formatSeconds(activity.totalSeconds)}
                      </span>
                    </div>

                    <p className="mt-3 text-sm leading-6 text-slate-700">
                      {activity.description}
                    </p>

                    <dl className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                      <Metric
                        label="Series"
                        value={String(activity.series)}
                      />
                      <Metric
                        label="Repeticiones"
                        value={activity.repetitions}
                      />
                      <Metric
                        label="Rondas"
                        value={String(activity.rounds)}
                      />
                      <Metric
                        label="Intensidad"
                        value={activity.intensity}
                      />
                      <Metric
                        label="Trabajo"
                        value={formatSeconds(
                          activity.workSeconds,
                        )}
                      />
                      <Metric
                        label="Recuperación"
                        value={formatSeconds(
                          activity.recoverySeconds,
                        )}
                      />
                      <Metric
                        label="Transición"
                        value={formatSeconds(
                          activity.transitionSeconds,
                        )}
                      />
                      <Metric
                        label="Tiempo total"
                        value={formatSeconds(
                          activity.totalSeconds,
                        )}
                      />
                    </dl>

                    <div className="mt-4 grid gap-4 lg:grid-cols-2">
                      <div className="rounded-xl bg-blue-50 p-4">
                        <h5 className="text-sm font-black text-blue-950">
                          Organización
                        </h5>
                        <p className="mt-2 text-sm leading-6 text-blue-900">
                          {activity.organization}
                        </p>
                      </div>

                      <div className="rounded-xl bg-white p-4">
                        <h5 className="text-sm font-black text-slate-950">
                          Consignas
                        </h5>
                        <ul className="mt-2 space-y-2 text-sm leading-6 text-slate-700">
                          {activity.coachingPoints.map(
                            (point) => (
                              <li key={point}>• {point}</li>
                            ),
                          )}
                        </ul>
                      </div>
                    </div>

                    <p className="mt-4 rounded-xl bg-amber-50 p-4 text-sm leading-6 text-amber-950">
                      <strong>Seguridad:</strong>{" "}
                      {activity.safety}
                    </p>
                  </section>
                ),
              )}
            </div>
          </article>
        ))}
      </div>

      <div className="mt-8 grid gap-5 lg:grid-cols-2">
        <InformationCard
          title="Hidratación y recuperación"
          content={result.hydrationGuidance}
          color="blue"
        />

        <ListCard
          title="Medidas de seguridad"
          items={result.safetyMeasures}
          color="amber"
        />

        <ListCard
          title="Indicadores observables"
          items={result.observableIndicators}
          color="emerald"
        />

        <ListCard
          title="Adaptaciones"
          items={result.adaptationNotes}
          color="violet"
        />
      </div>

      {isPhysicalEducation ? (
        <section className="mt-8">
          <p className="text-xs font-black uppercase tracking-[0.18em] text-violet-700">
            Diseño Universal para el Aprendizaje
          </p>

          <h3 className="mt-2 text-xl font-black text-slate-950">
            DUA integrado
          </h3>

          <div className="mt-4 grid gap-4">
            <DuaCard
              title="🟢 Compromiso"
              items={result.dua.commitment}
              className="border-emerald-400 bg-emerald-50 text-emerald-950"
            />
            <DuaCard
              title="🟣 Representación"
              items={result.dua.representation}
              className="border-fuchsia-400 bg-fuchsia-50 text-fuchsia-950"
            />
            <DuaCard
              title="🔵 Acción y Expresión"
              items={result.dua.actionExpression}
              className="border-blue-400 bg-blue-50 text-blue-950"
            />
          </div>
        </section>
      ) : null}

      <section className="mt-8 rounded-2xl border border-slate-200 p-5">
        <h3 className="font-black text-slate-950">
          {isPhysicalEducation
            ? "Revisión del docente"
            : "Revisión del entrenador"}
        </h3>

        <ul className="mt-3 space-y-2 text-sm leading-6 text-slate-700">
          {result.teacherReview.map((item) => (
            <li key={item}>• {item}</li>
          ))}
        </ul>
      </section>

      {usage ? (
        <div className="mt-6 rounded-2xl bg-slate-100 px-5 py-4 text-sm text-slate-700">
          <strong>
            {usage.tier === "free"
              ? "Plan Free"
              : usage.tier === "pro"
                ? "Plan Pro"
                : "Administrador"}
          </strong>
          {" · "}
          {usage.remaining} de {usage.limit} ejecuciones
          disponibles este mes.
        </div>
      ) : null}
    </section>
  );
}

function Metric({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-xl bg-white p-3 shadow-sm">
      <dt className="text-[10px] font-black uppercase tracking-wide text-slate-500">
        {label}
      </dt>
      <dd className="mt-1 text-sm font-bold leading-5 text-slate-900">
        {value}
      </dd>
    </div>
  );
}

function InformationCard({
  title,
  content,
  color,
}: {
  title: string;
  content: string;
  color: "orange" | "blue";
}) {
  const styles =
    color === "orange"
      ? "border-orange-200 bg-orange-50 text-orange-950"
      : "border-blue-200 bg-blue-50 text-blue-950";

  return (
    <article className={`rounded-2xl border p-5 ${styles}`}>
      <h3 className="font-black">{title}</h3>
      <p className="mt-2 text-sm leading-6">
        {content}
      </p>
    </article>
  );
}

function ListCard({
  title,
  items,
  color,
}: {
  title: string;
  items: string[];
  color: "amber" | "emerald" | "violet";
}) {
  const styles = {
    amber:
      "border-amber-200 bg-amber-50 text-amber-950",
    emerald:
      "border-emerald-200 bg-emerald-50 text-emerald-950",
    violet:
      "border-violet-200 bg-violet-50 text-violet-950",
  } as const;

  return (
    <article
      className={`rounded-2xl border p-5 ${styles[color]}`}
    >
      <h3 className="font-black">{title}</h3>
      <ul className="mt-3 space-y-2 text-sm leading-6">
        {items.map((item) => (
          <li key={item}>• {item}</li>
        ))}
      </ul>
    </article>
  );
}

function DuaCard({
  title,
  items,
  className,
}: {
  title: string;
  items: string[];
  className: string;
}) {
  return (
    <article
      className={`rounded-2xl border p-5 ${className}`}
    >
      <h4 className="font-black">{title}</h4>
      <ul className="mt-3 space-y-2 text-sm leading-6">
        {items.map((item) => (
          <li key={item}>• {item}</li>
        ))}
      </ul>
    </article>
  );
}