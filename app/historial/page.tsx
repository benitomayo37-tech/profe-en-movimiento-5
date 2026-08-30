import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";

import { AccountBadge, AppLayout, Sidebar } from "@/components/layout";
import Container from "@/components/ui/Container";
import { getAuthAccess } from "@/features/auth/server/access";
import { getRecentActivity, type ActivityType } from "@/features/dashboard/server/activity";
import { deleteActivityAction } from "@/features/dashboard/server/historyActions";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Historial | Profe en Movimiento",
  description: "Historial de creaciones y evaluaciones del docente.",
};

type HistoryFilter = "all" | "profe-ai" | "trainer" | "student-exam";

const filters: Array<{ id: HistoryFilter; label: string }> = [
  { id: "all", label: "Todo" },
  { id: "profe-ai", label: "Profe IA" },
  { id: "trainer", label: "Entrenador IA" },
  { id: "student-exam", label: "Exámenes" },
];

const presentation: Record<ActivityType, { icon: string; label: string }> = {
  "profe-ai": { icon: "✨", label: "Profe IA" },
  "training-session": { icon: "🏅", label: "Sesión" },
  microcycle: { icon: "📅", label: "Microciclo" },
  mesocycle: { icon: "📈", label: "Mesociclo" },
  macrocycle: { icon: "🏆", label: "Macrociclo" },
  "student-exam": { icon: "📝", label: "Examen" },
};

function isHistoryFilter(value: string | undefined): value is HistoryFilter {
  return filters.some((filter) => filter.id === value);
}

function matchesFilter(type: ActivityType, filter: HistoryFilter) {
  if (filter === "all") return true;
  if (filter === "trainer") return ["training-session", "microcycle", "mesocycle", "macrocycle"].includes(type);
  return type === filter;
}

function fullDate(value: string) {
  return new Intl.DateTimeFormat("es-EC", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

export default async function HistoryPage({
  searchParams,
}: {
  searchParams: Promise<{ tipo?: string }>;
}) {
  const access = await getAuthAccess();
  if (!access.authenticated || !access.userId) redirect("/login?next=/historial");

  const params = await searchParams;
  const activeFilter = isHistoryFilter(params.tipo) ? params.tipo : "all";
  const history = (await getRecentActivity(access.userId, 100)).filter((item) =>
    matchesFilter(item.type, activeFilter),
  );

  return (
    <AppLayout
      sidebar={<Sidebar />}
      header={(
        <div className="flex min-h-20 items-center justify-between gap-4 px-6">
          <div>
            <h1 className="text-lg font-bold text-slate-950">Historial</h1>
            <p className="text-sm text-slate-500">Tus creaciones y evaluaciones</p>
          </div>
          <AccountBadge authenticated email={access.email} fullName={access.fullName} className="bg-blue-700" />
        </div>
      )}
      footer={<div className="px-6 py-4 text-center text-xs text-slate-500">Profe en Movimiento 5.0 · Historial docente</div>}
    >
      <Container size="wide" className="space-y-8 py-8">
        <section className="overflow-hidden rounded-3xl bg-gradient-to-br from-blue-950 via-blue-800 to-blue-600 p-8 text-white shadow-xl sm:p-10">
          <p className="text-xs font-black uppercase tracking-[0.18em] text-blue-200">Tu trabajo</p>
          <h2 className="mt-3 text-3xl font-black sm:text-4xl">Historial completo</h2>
          <p className="mt-3 max-w-2xl leading-7 text-blue-100">
            Consulta las últimas 100 actividades registradas y vuelve rápidamente a cada herramienta.
          </p>
        </section>

        <nav aria-label="Filtros del historial" className="flex flex-wrap gap-2">
          {filters.map((filter) => (
            <Link
              key={filter.id}
              href={filter.id === "all" ? "/historial" : `/historial?tipo=${filter.id}`}
              aria-current={activeFilter === filter.id ? "page" : undefined}
              className={`rounded-full px-5 py-2.5 text-sm font-bold transition ${
                activeFilter === filter.id
                  ? "bg-blue-700 text-white shadow-md"
                  : "border border-slate-200 bg-white text-slate-600 hover:border-blue-200 hover:text-blue-700"
              }`}
            >
              {filter.label}
            </Link>
          ))}
        </nav>

        {history.length === 0 ? (
          <section className="rounded-3xl border border-dashed border-blue-200 bg-blue-50/60 px-6 py-12 text-center">
            <p className="text-4xl" aria-hidden="true">🕘</p>
            <h2 className="mt-4 text-xl font-black text-slate-900">No hay actividades en este filtro</h2>
            <p className="mt-2 text-sm text-slate-600">Las nuevas creaciones aparecerán aquí automáticamente.</p>
          </section>
        ) : (
          <section className="space-y-4" aria-label="Actividades guardadas">
            {history.map((activity) => {
              const itemPresentation = presentation[activity.type];
              const generatedActivityId = activity.id.startsWith("activity-")
                ? activity.id.slice("activity-".length)
                : null;

              return (
                <article key={activity.id} className="flex flex-col gap-4 rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:flex-row sm:items-center">
                  <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-blue-50 text-2xl" aria-hidden="true">
                    {itemPresentation.icon}
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
                      <span className="text-xs font-black uppercase tracking-wide text-blue-700">{itemPresentation.label}</span>
                      <time className="text-xs text-slate-400" dateTime={activity.createdAt}>{fullDate(activity.createdAt)}</time>
                    </div>
                    <h3 className="mt-2 font-black text-slate-950">{activity.title}</h3>
                    <p className="mt-1 text-sm leading-6 text-slate-600">{activity.description}</p>
                  </div>
                  <div className="flex shrink-0 flex-wrap gap-2">
                    <Link href={activity.href} className="rounded-xl bg-blue-700 px-4 py-2.5 text-sm font-bold text-white hover:bg-blue-800">
                      Abrir
                    </Link>
                    {generatedActivityId ? (
                      <form action={deleteActivityAction}>
                        <input type="hidden" name="activityId" value={generatedActivityId} />
                        <button type="submit" className="rounded-xl border border-slate-300 px-4 py-2.5 text-sm font-bold text-slate-600 hover:border-red-200 hover:bg-red-50 hover:text-red-700">
                          Retirar
                        </button>
                      </form>
                    ) : null}
                  </div>
                </article>
              );
            })}
          </section>
        )}
      </Container>
    </AppLayout>
  );
}
