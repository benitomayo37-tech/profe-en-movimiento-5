import Link from "next/link";

import type {
  Resource,
  ResourceQuality,
} from "@/types/Resource";
import type { ResourceStats } from "@/features/resources/server/library";

interface ResourceCardProps {
  resource: Resource;
  stats: ResourceStats;
  favorite: boolean;
}

const qualityStyles: Record<ResourceQuality, string> = {
  Certificado:
    "border-emerald-200 bg-emerald-50 text-emerald-700",
  Recomendado:
    "border-amber-200 bg-amber-50 text-amber-700",
  Premium:
    "border-violet-200 bg-violet-50 text-violet-700",
  "IA Ready":
    "border-sky-200 bg-sky-50 text-sky-700",
  "Editor's Choice":
    "border-rose-200 bg-rose-50 text-rose-700",
};

function formatNumber(value: number): string {
  return new Intl.NumberFormat("es-EC", {
    notation: value >= 1000 ? "compact" : "standard",
    maximumFractionDigits: 1,
  }).format(value);
}

export default function ResourceCard({
  resource,
  stats,
  favorite,
}: ResourceCardProps) {
  const primaryCategory =
    resource.categories[0] ?? "Recurso educativo";

  const visibleLevels = resource.levels.slice(0, 2);
  const remainingLevels =
    resource.levels.length - visibleLevels.length;

  return (
    <article className="group flex h-full flex-col overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm transition duration-300 hover:-translate-y-1 hover:border-orange-200 hover:shadow-xl">
      <div className="relative overflow-hidden bg-gradient-to-br from-slate-950 via-slate-900 to-orange-950">
        <div className="absolute inset-0 opacity-20">
          <div className="absolute -right-10 -top-10 h-40 w-40 rounded-full bg-orange-500 blur-3xl" />
          <div className="absolute -bottom-10 -left-10 h-36 w-36 rounded-full bg-blue-500 blur-3xl" />
        </div>

        <div className="relative flex min-h-52 flex-col justify-between p-6">
          <div className="flex items-start justify-between gap-4">
            <span className="rounded-full border border-white/20 bg-white/10 px-3 py-1 text-xs font-semibold text-white backdrop-blur">
              {primaryCategory}
            </span>

            <div className="flex flex-wrap justify-end gap-2">
            {favorite && (
              <span className="rounded-full bg-rose-500 px-3 py-1 text-xs font-bold text-white shadow-sm">
                ♥ Favorito
              </span>
            )}
            {resource.premium && (
              <span className="rounded-full bg-orange-500 px-3 py-1 text-xs font-bold text-white shadow-sm">
                Premium
              </span>
            )}
            </div>
          </div>

          <div className="mt-12">
            <p className="mb-2 text-sm font-medium text-orange-300">
              Profe en Movimiento
            </p>

            <h2 className="line-clamp-3 text-2xl font-bold leading-tight text-white">
              {resource.title}
            </h2>
          </div>
        </div>
      </div>

      <div className="flex flex-1 flex-col p-6">
        <div className="mb-4 flex flex-wrap gap-2">
          {resource.quality.map((quality) => (
            <span
              key={quality}
              className={`rounded-full border px-2.5 py-1 text-xs font-semibold ${qualityStyles[quality]}`}
            >
              {quality}
            </span>
          ))}
        </div>

        <p className="line-clamp-3 text-sm leading-6 text-slate-600">
          {resource.summary}
        </p>

        <div className="mt-5 space-y-3 border-y border-slate-100 py-4 text-sm">
          <div className="flex items-start gap-3">
            <span
              className="mt-0.5 shrink-0 text-base"
              aria-hidden="true"
            >
              🎓
            </span>

            <div className="flex flex-wrap gap-2">
              {visibleLevels.map((level) => (
                <span
                  key={level}
                  className="rounded-lg bg-slate-100 px-2.5 py-1 font-medium text-slate-700"
                >
                  {level}
                </span>
              ))}

              {remainingLevels > 0 && (
                <span className="rounded-lg bg-slate-100 px-2.5 py-1 font-medium text-slate-500">
                  +{remainingLevels}
                </span>
              )}
            </div>
          </div>

          <div className="flex items-center gap-3">
            <span
              className="shrink-0 text-base"
              aria-hidden="true"
            >
              📄
            </span>

            <p className="text-slate-600">
              {resource.formats.join(" · ")}
            </p>
          </div>

          {resource.duration && (
            <div className="flex items-center gap-3">
              <span
                className="shrink-0 text-base"
                aria-hidden="true"
              >
                ⏱️
              </span>

              <p className="text-slate-600">
                {resource.duration}
              </p>
            </div>
          )}
        </div>

        <div className="mt-4 flex flex-wrap items-center justify-between gap-3 text-sm text-slate-500">
          <div className="flex items-center gap-4">
            <span
              className="flex items-center gap-1.5"
              title="Valoración"
            >
              <span
                className="text-amber-500"
                aria-hidden="true"
              >
                ★
              </span>

              <span className="font-semibold text-slate-700">
                {resource.rating.toFixed(1)}
              </span>
            </span>

            <span
              className="flex items-center gap-1.5"
              title="Descargas reales"
            >
              <span aria-hidden="true">⬇️</span>
              {formatNumber(stats.downloads)}
            </span>

            <span
              className="flex items-center gap-1.5"
              title="Visualizaciones"
            >
              <span aria-hidden="true">👁️</span>
              {formatNumber(stats.views)}
            </span>
          </div>

          <div className="flex items-center gap-2">
            {resource.dua && (
              <span className="rounded-full bg-emerald-100 px-2.5 py-1 text-xs font-bold text-emerald-700">
                DUA
              </span>
            )}

            {resource.nee && (
              <span className="rounded-full bg-blue-100 px-2.5 py-1 text-xs font-bold text-blue-700">
                NEE
              </span>
            )}
          </div>
        </div>

        <div className="mt-auto grid gap-3 pt-6 sm:grid-cols-2">
          <Link
            href={`/resources/${resource.slug}`}
            aria-label={`Ver el recurso ${resource.title}`}
            className="inline-flex min-h-11 items-center justify-center rounded-xl bg-slate-950 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-orange-600 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2"
          >
            <span className="text-white">Ver recurso</span>
          </Link>

          {resource.aiReady ? (
            <Link
              href={`/ai?resource=${resource.slug}`}
              aria-label={`Adaptar ${resource.title} con Profe IA`}
              className="inline-flex min-h-11 items-center justify-center rounded-xl border border-sky-200 bg-sky-50 px-4 py-2.5 text-sm font-semibold text-sky-700 transition hover:border-sky-300 hover:bg-sky-100 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:ring-offset-2"
            >
              <span className="text-sky-700">Adaptar con Profe IA</span>
            </Link>
          ) : (
            <span className="inline-flex min-h-11 items-center justify-center rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm font-medium text-slate-400">
              IA próximamente
            </span>
          )}
        </div>
      </div>
    </article>
  );
}
