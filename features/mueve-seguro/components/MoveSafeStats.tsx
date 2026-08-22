import { useMemo } from "react";
import {
  analyzeMoveSafePatterns,
} from "../utils/moveSafePatternEngine";

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
  return [...items].sort((a, b) => b.count - a.count || a.label.localeCompare(b.label, "es"));
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
            <span className="min-w-0 truncate font-bold text-slate-700" title={item.label}>
              {item.label}
            </span>
            <span className="shrink-0 font-black text-slate-950">{item.count}</span>
          </div>
          <div className="h-2.5 overflow-hidden rounded-full bg-slate-100">
            <div
              className="h-full rounded-full bg-indigo-600 transition-all"
              style={{ width: `${Math.max((item.count / max) * 100, 8)}%` }}
            />
          </div>
        </div>
      ))}
    </div>
  );
}

export default function MoveSafeStats({ records }: MoveSafeStatsProps) {
  const stats = useMemo(() => {
    const bySituation = new Map<string, number>();
    const byLocation = new Map<string, number>();
    const byActivity = new Map<string, number>();
    const byDate = new Map<string, number>();

    for (const record of records) {
      const situation = record.situation?.trim() || "Sin especificar";
      const location = record.location?.trim() || "Sin especificar";
      const activity = record.activity?.trim() || "Sin especificar";
      const date = record.incident_date || "Sin fecha";

      bySituation.set(situation, (bySituation.get(situation) ?? 0) + 1);
      byLocation.set(location, (byLocation.get(location) ?? 0) + 1);
      byActivity.set(activity, (byActivity.get(activity) ?? 0) + 1);
      byDate.set(date, (byDate.get(date) ?? 0) + 1);
    }

    const toItems = (map: Map<string, number>) =>
      sortDescending(
        Array.from(map.entries()).map(([label, count]) => ({ label, count })),
      );

    const temporal = Array.from(byDate.entries())
      .filter(([date]) => date !== "Sin fecha")
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([date, count]) => ({
        label: new Date(`${date}T12:00:00`).toLocaleDateString("es-EC", {
          day: "2-digit",
          month: "short",
        }),
        count,
      }));

    const situations = toItems(bySituation);
    const locations = toItems(byLocation);
    const activities = toItems(byActivity);
    const patternAnalysis = analyzeMoveSafePatterns(records);

    const followup = records.filter(
      (record) => record.status === "en_seguimiento",
    ).length;

    const repeatedSituations = situations.filter((item) => item.count >= 2).slice(0, 3);
    const repeatedLocations = locations.filter((item) => item.count >= 2).slice(0, 3);
    const repeatedActivities = activities.filter((item) => item.count >= 2).slice(0, 3);

    let preventiveLevel: "bajo" | "moderado" | "alto" = "bajo";

    if (
      followup >= 2 ||
      repeatedSituations.length >= 2 ||
      repeatedLocations.length >= 2 ||
      repeatedActivities.length >= 2
    ) {
      preventiveLevel = "alto";
    } else if (
      followup >= 1 ||
      repeatedSituations.length > 0 ||
      repeatedLocations.length > 0 ||
      repeatedActivities.length > 0
    ) {
      preventiveLevel = "moderado";
    }

    const signals: string[] = [];
    const recommendations: string[] = [];

    if (followup > 0) {
      signals.push(
        `${followup} incidente${followup === 1 ? "" : "s"} permanece${
          followup === 1 ? "" : "n"
        } en seguimiento.`,
      );
      recommendations.push(
        "Mantener el seguimiento pendiente y registrar cada nueva actuación por separado.",
      );
    }

    if (repeatedLocations.length > 0) {
      const item = repeatedLocations[0];
      signals.push(`Se observa recurrencia en ${item.label} (${item.count} incidentes).`);
      recommendations.push(
        `Revisar las condiciones preventivas y la organización de las actividades en ${item.label}.`,
      );
    }

    if (repeatedActivities.length > 0) {
      const item = repeatedActivities[0];
      signals.push(`La actividad "${item.label}" concentra ${item.count} incidentes.`);
      recommendations.push(
        `Revisar las medidas preventivas aplicadas durante "${item.label}".`,
      );
    }

    if (repeatedSituations.length > 0) {
      const item = repeatedSituations[0];
      signals.push(`El tipo "${item.label}" aparece ${item.count} veces.`);
      recommendations.push(
        "Revisar si existen factores organizativos o preventivos relacionados con esta recurrencia.",
      );
    }

    if (signals.length === 0) {
      signals.push("No se observan recurrencias en los registros disponibles.");
      recommendations.push(
        "Continuar registrando los incidentes y mantener las medidas preventivas institucionales.",
      );
    }

    return {
      total: records.length,
      pending: records.filter((record) => record.status === "pendiente").length,
      followup: records.filter((record) => record.status === "en_seguimiento").length,
      closed: records.filter((record) => record.status === "cerrado").length,
      closureRate: records.length
        ? Math.round((records.filter((record) => record.status === "cerrado").length / records.length) * 100)
        : 0,
      situations,
      locations,
      activities,
      temporal,
      patterns: patternAnalysis.patterns,
      patternLevel: patternAnalysis.level,
      patternScore: patternAnalysis.score,
      preventiveLevel,
      signals: signals.slice(0, 4),
      recommendations: Array.from(new Set(recommendations)).slice(0, 4),
    };
  }, [records]);

  const temporalMax = Math.max(...stats.temporal.map((item) => item.count), 1);

  const preventiveConfig = {
    bajo: {
      label: "Bajo",
      dot: "bg-emerald-500",
      badge: "border-emerald-200 bg-emerald-50 text-emerald-700",
      panel: "border-emerald-200 bg-emerald-50/60",
      description:
        "No se observan señales de recurrencia relevantes en los registros disponibles.",
    },
    moderado: {
      label: "Moderado",
      dot: "bg-amber-500",
      badge: "border-amber-200 bg-amber-50 text-amber-700",
      panel: "border-amber-200 bg-amber-50/60",
      description:
        "Hay señales que conviene revisar y mantener bajo seguimiento preventivo.",
    },
    alto: {
      label: "Alto",
      dot: "bg-red-500",
      badge: "border-red-200 bg-red-50 text-red-700",
      panel: "border-red-200 bg-red-50/60",
      description:
        "Se observan varias señales de recurrencia o seguimiento que requieren atención preventiva.",
    },
  } as const;

  const preventive = preventiveConfig[stats.preventiveLevel];

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
            Resumen generado a partir de los registros asociados a tu cuenta. Estos datos sirven para
            identificar patrones preventivos y apoyar la gestión institucional.
          </p>
        </div>
      </div>

      <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {[
          ["Total", stats.total, "bg-white border-slate-200"],
          ["En seguimiento", stats.followup, "bg-violet-50 border-violet-200"],
          ["Cerrados", stats.closed, "bg-emerald-50 border-emerald-200"],
          ["Tasa de cierre", `${stats.closureRate}%`, "bg-blue-50 border-blue-200"],
        ].map(([label, value, style]) => (
          <div key={String(label)} className={`rounded-2xl border p-4 ${style}`}>
            <p className="text-xs font-black uppercase tracking-wide text-slate-500">{label}</p>
            <p className="mt-1 text-2xl font-black text-slate-950">{value}</p>
          </div>
        ))}
      </div>

      <div
        className={`mt-5 rounded-2xl border p-5 sm:p-6 ${preventive.panel}`}
      >
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="text-xs font-black uppercase tracking-[.16em] text-indigo-700">
              Análisis preventivo
            </p>
            <h4 className="mt-1 text-xl font-black text-slate-950">
              Señales de atención
            </h4>
            <p className="mt-1 max-w-3xl text-sm leading-6 text-slate-600">
              Lectura preventiva de los patrones presentes en los registros
              disponibles. No constituye diagnóstico ni valoración médica.
            </p>
          </div>

          <div
            className={`inline-flex items-center gap-2 rounded-full border px-3 py-2 text-sm font-black ${preventive.badge}`}
          >
            <span
              className={`h-2.5 w-2.5 rounded-full ${preventive.dot}`}
              aria-hidden="true"
            />
            Nivel de atención: {preventive.label}
          </div>
        </div>

        <p className="mt-4 rounded-xl bg-white/80 p-4 text-sm font-semibold leading-6 text-slate-700">
          {preventive.description}
        </p>

        <div className="mt-4 grid gap-4 lg:grid-cols-2">
          <div className="rounded-2xl border border-white/80 bg-white p-5 shadow-sm">
            <p className="text-xs font-black uppercase tracking-wide text-indigo-700">
              Señales detectadas
            </p>
            <ul className="mt-3 space-y-3">
              {stats.signals.map((signal) => (
                <li
                  key={signal}
                  className="flex gap-3 text-sm leading-6 text-slate-700"
                >
                  <span
                    className="mt-2 h-2 w-2 shrink-0 rounded-full bg-indigo-600"
                    aria-hidden="true"
                  />
                  <span>{signal}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="rounded-2xl border border-white/80 bg-white p-5 shadow-sm">
            <p className="text-xs font-black uppercase tracking-wide text-indigo-700">
              Recomendaciones preventivas
            </p>
            <ul className="mt-3 space-y-3">
              {stats.recommendations.map((recommendation) => (
                <li
                  key={recommendation}
                  className="flex gap-3 text-sm leading-6 text-slate-700"
                >
                  <span
                    className="mt-2 h-2 w-2 shrink-0 rounded-full bg-emerald-600"
                    aria-hidden="true"
                  />
                  <span>{recommendation}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
   {/* ALERTAS PREVENTIVAS V2.2 */}
<div className="mt-6 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
  <div className="flex items-center justify-between gap-3">
    <div>
      <p className="text-xs font-black uppercase tracking-[0.18em] text-orange-600">
        MueveSeguro V2.2
      </p>

      <h3 className="mt-1 text-xl font-black text-slate-950">
        🚨 Alertas preventivas
      </h3>

      <p className="mt-1 text-sm text-slate-500">
        Patrones detectados a partir de los incidentes registrados.
      </p>
    </div>

    <div
      className={`rounded-full px-3 py-1 text-xs font-black uppercase ${
        stats.patternLevel === "critica"
          ? "bg-red-100 text-red-700"
          : stats.patternLevel === "alta"
            ? "bg-orange-100 text-orange-700"
            : stats.patternLevel === "moderada"
              ? "bg-amber-100 text-amber-700"
              : "bg-emerald-100 text-emerald-700"
      }`}
    >
      {stats.patternLevel === "critica"
        ? "Crítico"
        : stats.patternLevel === "alta"
          ? "Alto"
          : stats.patternLevel === "moderada"
            ? "Moderado"
            : "Preventivo"}
    </div>
  </div>

  {stats.patterns.length === 0 ? (
    <div className="mt-4 rounded-xl bg-emerald-50 p-4">
      <p className="font-bold text-emerald-800">
        🟢 No se detectaron patrones relevantes.
      </p>

      <p className="mt-1 text-sm text-emerald-700">
        Continúa registrando los incidentes para fortalecer el análisis preventivo.
      </p>
    </div>
  ) : (
    <div className="mt-4 space-y-3">
      {stats.patterns.slice(0, 4).map((pattern, index) => (
        <div
          key={`${pattern.type}-${pattern.label}-${index}`}
          className="rounded-xl border border-slate-200 bg-slate-50 p-4"
        >
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="font-black text-slate-950">
                {pattern.title}
              </p>

              <p className="mt-1 text-sm leading-6 text-slate-600">
                {pattern.description}
              </p>
            </div>

            <span
              className={`shrink-0 rounded-full px-2.5 py-1 text-[10px] font-black uppercase ${
                pattern.severity === "critica"
                  ? "bg-red-100 text-red-700"
                  : pattern.severity === "alta"
                    ? "bg-orange-100 text-orange-700"
                    : pattern.severity === "moderada"
                      ? "bg-amber-100 text-amber-700"
                      : "bg-emerald-100 text-emerald-700"
              }`}
            >
              {pattern.severity === "critica"
                ? "Crítico"
                : pattern.severity === "alta"
                  ? "Alto"
                  : pattern.severity === "moderada"
                    ? "Moderado"
                    : "Preventivo"}
            </span>
          </div>

          <div className="mt-3 rounded-lg bg-white p-3">
            <p className="text-xs font-black uppercase tracking-wide text-slate-400">
              Recomendación
            </p>

            <p className="mt-1 text-sm font-medium leading-6 text-slate-700">
              {pattern.recommendation}
            </p>
          </div>
        </div>
      ))}
    </div>
  )}
</div>
      <div className="mt-5 grid gap-5 lg:grid-cols-2">
        <div className="rounded-2xl border border-slate-200 bg-white p-5">
          <div className="mb-5">
            <p className="text-xs font-black uppercase tracking-wide text-indigo-700">Frecuencia</p>
         
            <h4 className="mt-1 text-lg font-black text-slate-950">Incidentes por tipo</h4>
          </div>
          <BarList
            items={stats.situations.slice(0, 6)}
            emptyMessage="Todavía no hay datos suficientes para mostrar este análisis."
          />
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5">
          <div className="mb-5">
            <p className="text-xs font-black uppercase tracking-wide text-indigo-700">Espacios</p>
            <h4 className="mt-1 text-lg font-black text-slate-950">Incidentes por lugar</h4>
          </div>
          <BarList
            items={stats.locations.slice(0, 6)}
            emptyMessage="Todavía no hay datos suficientes para mostrar este análisis."
          />
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5">
          <div className="mb-5">
            <p className="text-xs font-black uppercase tracking-wide text-indigo-700">Actividad</p>
            <h4 className="mt-1 text-lg font-black text-slate-950">Incidentes por actividad</h4>
          </div>
          <BarList
            items={stats.activities.slice(0, 6)}
            emptyMessage="Todavía no hay datos suficientes para mostrar este análisis."
          />
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5">
          <div className="mb-5">
            <p className="text-xs font-black uppercase tracking-wide text-indigo-700">Evolución</p>
            <h4 className="mt-1 text-lg font-black text-slate-950">Incidentes registrados por fecha</h4>
          </div>

          {stats.temporal.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 p-5 text-sm text-slate-500">
              Todavía no hay fechas disponibles para mostrar la evolución.
            </div>
          ) : (
            <div className="space-y-4">
              {stats.temporal.slice(-8).map((item) => (
                <div key={item.label}>
                  <div className="mb-1.5 flex items-center justify-between text-sm">
                    <span className="font-bold text-slate-700">{item.label}</span>
                    <span className="font-black text-slate-950">{item.count}</span>
                  </div>
                  <div className="h-2.5 overflow-hidden rounded-full bg-slate-100">
                    <div
                      className="h-full rounded-full bg-emerald-600 transition-all"
                      style={{ width: `${Math.max((item.count / temporalMax) * 100, 8)}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <p className="mt-5 text-xs leading-5 text-slate-500">
        MueveSeguro utiliza estas estadísticas con fines preventivos y de gestión. No constituyen
        diagnóstico, valoración médica ni evaluación individual de estudiantes.
      </p>
    </section>
  );
}
