import Link from "next/link";

import type { ActivityType, RecentActivityEntry } from "@/features/dashboard/server/activity";

const activityPresentation: Record<ActivityType, { icon: string; label: string }> = {
  "profe-ai": { icon: "✨", label: "Profe IA" },
  "training-session": { icon: "🏅", label: "Sesión" },
  microcycle: { icon: "📅", label: "Microciclo" },
  mesocycle: { icon: "📈", label: "Mesociclo" },
  macrocycle: { icon: "🏆", label: "Macrociclo" },
  "student-exam": { icon: "📝", label: "Examen" },
};

function formatActivityTime(value: string) {
  const date = new Date(value);
  const elapsed = Date.now() - date.getTime();
  const minutes = Math.max(0, Math.floor(elapsed / 60_000));

  if (minutes < 1) return "Ahora";
  if (minutes < 60) return `Hace ${minutes} min`;

  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `Hace ${hours} h`;

  return new Intl.DateTimeFormat("es-EC", {
    day: "numeric",
    month: "short",
    year: date.getFullYear() === new Date().getFullYear() ? undefined : "numeric",
  }).format(date);
}

export default function RecentActivity({ activities }: { activities: RecentActivityEntry[] }) {
  return (
    <section aria-labelledby="recent-activity-title">
      <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
        <p className="text-sm font-semibold uppercase tracking-[0.16em] text-blue-700">
          Tu trabajo
        </p>
        <h2 id="recent-activity-title" className="mt-1 text-2xl font-black text-slate-900">
          Actividad reciente
        </h2>
        <p className="mt-2 text-sm leading-6 text-slate-600">
          Retoma rápidamente tus últimas creaciones y evaluaciones.
        </p>
        </div>
        {activities.length > 0 ? (
          <Link href="/historial" className="shrink-0 text-sm font-bold text-blue-700 hover:underline">
            Ver historial completo →
          </Link>
        ) : null}
      </div>

      {activities.length === 0 ? (
        <div className="rounded-3xl border border-dashed border-blue-200 bg-blue-50/60 px-6 py-10 text-center">
          <div className="text-3xl" aria-hidden="true">🕘</div>
          <h3 className="mt-4 font-black text-slate-900">Aún no hay actividad reciente</h3>
          <p className="mx-auto mt-2 max-w-xl text-sm leading-6 text-slate-600">
            Las nuevas creaciones de Profe IA, Entrenador IA y Exámenes aparecerán aquí automáticamente.
          </p>
        </div>
      ) : (
        <div className="grid gap-4 lg:grid-cols-2">
          {activities.map((activity) => {
            const presentation = activityPresentation[activity.type];
            return (
              <Link
                key={activity.id}
                href={activity.href}
                className="group flex items-start gap-4 rounded-3xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:border-blue-200 hover:shadow-lg focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-blue-100"
              >
                <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-blue-50 text-2xl" aria-hidden="true">
                  {presentation.icon}
                </span>
                <span className="min-w-0 flex-1">
                  <span className="flex flex-wrap items-center gap-x-3 gap-y-1">
                    <span className="text-xs font-bold uppercase tracking-wide text-blue-700">
                      {presentation.label}
                    </span>
                    <span className="text-xs text-slate-400">{formatActivityTime(activity.createdAt)}</span>
                  </span>
                  <span className="mt-2 block truncate font-black text-slate-900">{activity.title}</span>
                  <span className="mt-1 block line-clamp-2 text-sm leading-6 text-slate-600">
                    {activity.description}
                  </span>
                </span>
                <span className="mt-4 text-blue-700 transition group-hover:translate-x-1" aria-hidden="true">→</span>
              </Link>
            );
          })}
        </div>
      )}
    </section>
  );
}
