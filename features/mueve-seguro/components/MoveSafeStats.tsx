import { useMemo } from "react";

type MoveSafeStatsRecord = {
  status: "pendiente" | "en_seguimiento" | "cerrado";
  situation: string;
  location: string;
  activity: string;
  incident_date: string;
};

type MoveSafeStatsProps = {
  records: MoveSafeStatsRecord[];
};

type CountItem = {
  label: string;
  count: number;
};

function sortDescending(items: CountItem[]) {
  return [...items].sort(
    (a, b) => b.count - a.count || a.label.localeCompare(b.label, "es"),
  );
}

function BarList({
  items,
  emptyMessage,
}: {
  items: CountItem[];
  emptyMessage: string;
}) {
  if (items.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 p-5 text-sm text-slate-500">
        {emptyMessage}
      </div>
    );
  }

  const max = Math.max(...items.map((item) => item.count), 1);

  return (
    <div className="space-y-4">
      {items.map((item) => (
        <div key={item.label}>
          <div className="mb-1.5 flex items-center justify-between gap-3 text-sm">
            <span
              className="min-w-0 truncate font-bold text-slate-700"
              title={item.label}
            >
              {item.label}
            </span>

            <span className="shrink-0 font-black text-slate-950">
              {item.count}
            </span>
          </div>

          <div className="h-2.5 overflow-hidden rounded-full bg-slate-100">
            <div
              className="h-full rounded-full bg-indigo-600 transition-all"
              style={{
                width: `${Math.max((item.count / max) * 100, 8)}%`,
              }}
            />
          </div>
        </div>
      ))}
    </div>
  );
}

export default function MoveSafeStats({
  records,
}: MoveSafeStatsProps) {
  const stats = useMemo(() => {
    const bySituation = new Map<string, number>();
    const byLocation = new Map<string, number>();
    const byActivity = new Map<string, number>();
    const byDate = new Map<string, number>();

    for (const record of records) {
      const situation =
        record.situation?.trim() || "Sin especificar";

      const location =
        record.location?.trim() || "Sin especificar";

      const activity =
        record.activity?.trim() || "Sin especificar";

      const date =
        record.incident_date || "Sin fecha";

      bySituation.set(
        situation,
        (bySituation.get(situation) ?? 0) + 1,
      );

      byLocation.set(
        location,
        (byLocation.get(location) ?? 0) + 1,
      );

      byActivity.set(
        activity,
        (byActivity.get(activity) ?? 0) + 1,
      );

      byDate.set(
        date,
        (byDate.get(date) ?? 0) + 1,
      );
    }

    const toItems = (map: Map<string, number>) =>
      sortDescending(
        Array.from(map.entries()).map(([label, count]) => ({
          label,
          count,
        })),
      );

    const temporal = Array.from(byDate.entries())
      .filter(([date]) => date !== "Sin fecha")
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([date, count]) => ({
        label: new Date(`${date}T12:00:00`).toLocaleDateString(
          "es-EC",
          {
            day: "2-digit",
            month: "short",
          },
        ),
        count,
      }));

    return {
      total: records.length,

      pending: records.filter(
        (record) => record.status === "pendiente",
      ).length,

      followup: records.filter(
        (record) => record.status === "en_seguimiento",
      ).length,

      closed: records.filter(
        (record) => record.status === "cerrado",
      ).length,

      closureRate: records.length
        ? Math.round(
            (records.filter(
              (record) => record.status === "cerrado",
            ).length /
              records.length) *
              100,
          )
        : 0,

      situations: toItems(bySituation),
      locations: toItems(byLocation),
      activities: toItems(byActivity),
      temporal,
    };
  }, [records]);

  const temporalMax = Math.max(
    ...stats.temporal.map((item) => item.count),
    1,
  );

  return (
    <section className="mt-8 rounded-[2rem] border border-indigo-100 bg-gradient-to-br from-indigo-50/70 via-white to-slate-50 p-5 sm:p-7">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-xs font-black uppercase tracking-[.18em] text-indigo-700">
            Análisis de MueveSeguro
          </p>

          <h3 className="mt-1 text-2xl font-black text-slate-950">
            Estadísticas de tus incidentes
          </h3>

          <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600">
            Resumen generado a partir de los registros asociados a tu
            cuenta. Estos datos sirven para identificar patrones
            preventivos y apoyar la gestión institucional.
          </p>
        </div>
      </div>

      <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {[
          [
            "Total",
            stats.total,
            "bg-white border-slate-200",
          ],
          [
            "En seguimiento",
            stats.followup,
            "bg-violet-50 border-violet-200",
          ],
          [
            "Cerrados",
            stats.closed,
            "bg-emerald-50 border-emerald-200",
          ],
          [
            "Tasa de cierre",
            `${stats.closureRate}%`,
            "bg-blue-50 border-blue-200",
          ],
        ].map(([label, value, style]) => (
          <div
            key={String(label)}
            className={`rounded-2xl border p-4 ${style}`}
          >
            <p className="text-xs font-black uppercase tracking-wide text-slate-500">
              {label}
            </p>

            <p className="mt-1 text-2xl font-black text-slate-950">
              {value}
            </p>
          </div>
        ))}
      </div>

      <div className="mt-5 grid gap-5 lg:grid-cols-2">
        <div className="rounded-2xl border border-slate-200 bg-white p-5">
          <div className="mb-5">
            <p className="text-xs font-black uppercase tracking-wide text-indigo-700">
              Frecuencia
            </p>

            <h4 className="mt-1 text-lg font-black text-slate-950">
              Incidentes por tipo
            </h4>
          </div>

          <BarList
            items={stats.situations.slice(0, 6)}
            emptyMessage="Todavía no hay datos suficientes para mostrar este análisis."
          />
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5">
          <div className="mb-5">
            <p className="text-xs font-black uppercase tracking-wide text-indigo-700">
              Espacios
            </p>

            <h4 className="mt-1 text-lg font-black text-slate-950">
              Incidentes por lugar
            </h4>
          </div>

          <BarList
            items={stats.locations.slice(0, 6)}
            emptyMessage="Todavía no hay datos suficientes para mostrar este análisis."
          />
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5">
          <div className="mb-5">
            <p className="text-xs font-black uppercase tracking-wide text-indigo-700">
              Actividad
            </p>

            <h4 className="mt-1 text-lg font-black text-slate-950">
              Incidentes por actividad
            </h4>
          </div>

          <BarList
            items={stats.activities.slice(0, 6)}
            emptyMessage="Todavía no hay datos suficientes para mostrar este análisis."
          />
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5">
          <div className="mb-5">
            <p className="text-xs font-black uppercase tracking-wide text-indigo-700">
              Evolución
            </p>

            <h4 className="mt-1 text-lg font-black text-slate-950">
              Incidentes registrados por fecha
            </h4>
          </div>

          {stats.temporal.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 p-5 text-sm text-slate-500">
              Todavía no hay fechas disponibles para mostrar la
              evolución.
            </div>
          ) : (
            <div className="space-y-4">
              {stats.temporal.slice(-8).map((item) => (
                <div key={item.label}>
                  <div className="mb-1.5 flex items-center justify-between text-sm">
                    <span className="font-bold text-slate-700">
                      {item.label}
                    </span>

                    <span className="font-black text-slate-950">
                      {item.count}
                    </span>
                  </div>

                  <div className="h-2.5 overflow-hidden rounded-full bg-slate-100">
                    <div
                      className="h-full rounded-full bg-emerald-600 transition-all"
                      style={{
                        width: `${Math.max(
                          (item.count / temporalMax) * 100,
                          8,
                        )}%`,
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <p className="mt-5 text-xs leading-5 text-slate-500">
        MueveSeguro utiliza estas estadísticas con fines preventivos y
        de gestión. No constituyen diagnóstico, valoración médica ni
        evaluación individual de estudiantes.
      </p>
    </section>
  );
}