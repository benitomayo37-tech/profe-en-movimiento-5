import Link from "next/link";

import type {
  Resource,
  ResourceQuality,
} from "@/types/Resource";
import type { ResourceStats } from "@/features/resources/server/library";

interface ResourceHeroProps {
  resource: Resource;
  stats: ResourceStats;
}

const qualityStyles: Record<ResourceQuality, string> = {
  Certificado:
    "border-emerald-300/30 bg-emerald-400/10 text-emerald-200",
  Recomendado:
    "border-amber-300/30 bg-amber-400/10 text-amber-200",
  Premium:
    "border-violet-300/30 bg-violet-400/10 text-violet-200",
  "IA Ready":
    "border-sky-300/30 bg-sky-400/10 text-sky-200",
  "Editor's Choice":
    "border-rose-300/30 bg-rose-400/10 text-rose-200",
};

function formatNumber(value: number): string {
  return new Intl.NumberFormat("es-EC", {
    notation: value >= 1000 ? "compact" : "standard",
    maximumFractionDigits: 1,
  }).format(value);
}

export default function ResourceHero({
  resource,
  stats,
}: ResourceHeroProps) {
  return (
    <section className="relative overflow-hidden bg-slate-950">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -right-24 -top-24 h-96 w-96 rounded-full bg-orange-500/20 blur-3xl" />
        <div className="absolute -bottom-32 -left-24 h-96 w-96 rounded-full bg-blue-500/20 blur-3xl" />
        <div className="absolute left-1/2 top-1/3 h-64 w-64 -translate-x-1/2 rounded-full bg-violet-500/10 blur-3xl" />
      </div>

      <div className="relative mx-auto max-w-7xl px-4 py-12 sm:px-6 sm:py-16 lg:px-8 lg:py-20">
        <Link
          href="/resources"
          className="mb-6 inline-flex min-h-11 items-center justify-center rounded-xl border border-white/20 bg-white/10 px-4 py-2.5 text-sm font-bold transition hover:border-orange-300 hover:bg-orange-500 hover:text-white focus:outline-none focus:ring-2 focus:ring-orange-400 focus:ring-offset-2 focus:ring-offset-slate-950"
        >
          <span className="text-white">← Volver a la biblioteca</span>
        </Link>

        <nav
          aria-label="Ruta de navegación"
          className="mb-8 flex flex-wrap items-center gap-2 text-sm"
        >
          <Link
            href="/"
            className="text-slate-400 transition hover:text-white"
          >
            Inicio
          </Link>

          <span className="text-slate-600" aria-hidden="true">
            /
          </span>

          <Link
            href="/resources"
            className="text-slate-400 transition hover:text-white"
          >
            Recursos
          </Link>

          <span className="text-slate-600" aria-hidden="true">
            /
          </span>

          <span
            className="max-w-72 truncate font-medium text-orange-300"
            aria-current="page"
          >
            {resource.title}
          </span>
        </nav>

        <div className="grid items-start gap-10 lg:grid-cols-[minmax(0,1fr)_320px]">
          <div>
            <div className="flex flex-wrap gap-2">
              {resource.categories.map((category) => (
                <span
                  key={category}
                  className="rounded-full border border-white/15 bg-white/10 px-3 py-1.5 text-xs font-semibold text-white backdrop-blur"
                >
                  {category}
                </span>
              ))}

              {resource.premium && (
                <span className="rounded-full bg-orange-500 px-3 py-1.5 text-xs font-bold text-white">
                  Premium
                </span>
              )}
            </div>

            <p className="mt-7 text-sm font-bold uppercase tracking-[0.2em] text-orange-400">
              Recurso educativo profesional
            </p>

            <h1 className="mt-4 max-w-4xl text-4xl font-black leading-tight tracking-tight text-white sm:text-5xl lg:text-6xl">
              {resource.title}
            </h1>

            <p className="mt-6 max-w-3xl text-base leading-8 text-slate-300 sm:text-lg">
              {resource.summary}
            </p>

            <div className="mt-7 flex flex-wrap gap-2">
              {resource.quality.map((quality) => (
                <span
                  key={quality}
                  className={`rounded-full border px-3 py-1.5 text-xs font-semibold ${qualityStyles[quality]}`}
                >
                  {quality}
                </span>
              ))}
            </div>

            <div className="mt-8 flex flex-wrap items-center gap-x-6 gap-y-3 text-sm text-slate-300">
              <span className="inline-flex items-center gap-2">
                <span
                  className="text-lg text-amber-400"
                  aria-hidden="true"
                >
                  ★
                </span>

                <strong className="text-white">
                  {resource.rating.toFixed(1)}
                </strong>

                <span>valoración</span>
              </span>

              <span className="inline-flex items-center gap-2">
                <span aria-hidden="true">⬇️</span>

                <strong className="text-white">
                  {formatNumber(stats.downloads)}
                </strong>

                <span>descargas reales</span>
              </span>

              <span className="inline-flex items-center gap-2">
                <span aria-hidden="true">👁️</span>

                <strong className="text-white">
                  {formatNumber(stats.views)}
                </strong>

                <span>visualizaciones</span>
              </span>
            </div>

            <div className="mt-8 flex flex-wrap gap-3">
              {resource.levels.map((level) => (
                <span
                  key={level}
                  className="rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm font-medium text-slate-200"
                >
                  🎓 {level}
                </span>
              ))}

              {resource.duration && (
                <span className="rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm font-medium text-slate-200">
                  ⏱️ {resource.duration}
                </span>
              )}

              <span className="rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm font-medium text-slate-200">
                📊 {resource.difficulty}
              </span>

              <span className="rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm font-medium text-slate-200">
                🌎 {resource.language}
              </span>
            </div>
          </div>

          <aside className="rounded-3xl border border-white/10 bg-white/5 p-6 shadow-2xl backdrop-blur">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-orange-400 to-orange-600 text-3xl shadow-lg shadow-orange-950/30">
              📘
            </div>

            <h2 className="mt-5 text-xl font-bold text-white">
              Información rápida
            </h2>

            <dl className="mt-5 space-y-4 text-sm">
              <div className="flex items-start justify-between gap-4 border-b border-white/10 pb-4">
                <dt className="text-slate-400">Formatos</dt>

                <dd className="text-right font-semibold text-white">
                  {resource.formats.join(", ")}
                </dd>
              </div>

              <div className="flex items-start justify-between gap-4 border-b border-white/10 pb-4">
                <dt className="text-slate-400">Versión</dt>

                <dd className="font-semibold text-white">
                  {resource.version}
                </dd>
              </div>

              <div className="flex items-start justify-between gap-4 border-b border-white/10 pb-4">
                <dt className="text-slate-400">Autor</dt>

                <dd className="text-right font-semibold text-white">
                  {resource.author}
                </dd>
              </div>

              <div className="flex items-start justify-between gap-4">
                <dt className="text-slate-400">Actualizado</dt>

                <dd className="font-semibold text-white">
                  {new Intl.DateTimeFormat("es-EC", {
                    day: "numeric",
                    month: "long",
                    year: "numeric",
                  }).format(new Date(`${resource.updatedAt}T00:00:00`))}
                </dd>
              </div>
            </dl>

            <div className="mt-6 flex flex-wrap gap-2">
              {resource.dua && (
                <span className="rounded-full bg-emerald-400/15 px-3 py-1.5 text-xs font-bold text-emerald-200">
                  DUA
                </span>
              )}

              {resource.nee && (
                <span className="rounded-full bg-blue-400/15 px-3 py-1.5 text-xs font-bold text-blue-200">
                  NEE
                </span>
              )}

              {resource.verified && (
                <span className="rounded-full bg-white/10 px-3 py-1.5 text-xs font-bold text-white">
                  ✓ Verificado
                </span>
              )}
            </div>
          </aside>
        </div>
      </div>
    </section>
  );
}
