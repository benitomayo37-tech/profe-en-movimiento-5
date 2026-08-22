import Image from "next/image";

import ResourceActions from "@/components/resources/ResourceActions";
import type { ResourceStats } from "@/features/resources/server/library";
import type { Resource } from "@/types/Resource";

interface ResourceSidebarProps {
  resource: Resource;
  authenticated: boolean;
  initialFavorite: boolean;
  stats: ResourceStats;
}

function formatDate(date: string): string {
  return new Intl.DateTimeFormat("es-EC", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(new Date(`${date}T00:00:00`));
}

export default function ResourceSidebar({
  resource,
  authenticated,
  initialFavorite,
  stats,
}: ResourceSidebarProps) {
  return (
    <aside className="space-y-6 lg:sticky lg:top-24">
      <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-lg">
        <p className="text-sm font-bold uppercase tracking-[0.18em] text-orange-600">
          Modo docente
        </p>

        <h2 className="mt-3 text-2xl font-black text-slate-950">
          ¿Qué deseas hacer?
        </h2>

        <p className="mt-3 text-sm leading-6 text-slate-600">
          Utiliza este recurso directamente, guárdalo o
          adáptalo con Profe IA según el nivel, el contexto y las necesidades de tu clase.
        </p>

        <div className="mt-6">
          <ResourceActions
            slug={resource.slug}
            title={resource.title}
            hasDownload={Boolean(resource.downloadUrl)}
            aiReady={resource.aiReady}
            authenticated={authenticated}
            initialFavorite={initialFavorite}
            initialStats={stats}
          />
        </div>
      </section>

      <section className="rounded-3xl border border-slate-200 bg-slate-950 p-6 text-white shadow-lg">
        <p className="text-sm font-bold uppercase tracking-[0.18em] text-orange-400">
          Profe en Movimiento
        </p>

        <div className="mt-4 flex items-center gap-3">
          <span
            className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-400/15 text-xl"
            aria-hidden="true"
          >
            ✓
          </span>

          <div>
            <h2 className="text-xl font-black">
              Recurso verificado
            </h2>

            <p className="mt-1 text-xs font-semibold text-emerald-300">
              Control de calidad pedagógica
            </p>
          </div>
        </div>

        <p className="mt-4 text-sm leading-6 text-slate-300">
          Material organizado para facilitar su aplicación,
          adaptación y reutilización en el trabajo docente.
        </p>

        <ul className="mt-5 space-y-3 text-sm text-slate-200">
          <li className="flex gap-2">
            <span
              className="text-emerald-400"
              aria-hidden="true"
            >
              ✓
            </span>

            <span>Revisión pedagógica</span>
          </li>

          <li className="flex gap-2">
            <span
              className="text-emerald-400"
              aria-hidden="true"
            >
              ✓
            </span>

            <span>Información curricular identificada</span>
          </li>

          <li className="flex gap-2">
            <span
              className="text-emerald-400"
              aria-hidden="true"
            >
              ✓
            </span>

            <span>Formatos y niveles definidos</span>
          </li>

          <li className="flex gap-2">
            <span
              className="text-emerald-400"
              aria-hidden="true"
            >
              ✓
            </span>

            <span>Historial de actualización</span>
          </li>
        </ul>
      </section>

      <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <p className="text-sm font-bold uppercase tracking-[0.18em] text-violet-600">
          Ficha técnica
        </p>

        <dl className="mt-5 space-y-4 text-sm">
          <div className="flex items-start justify-between gap-4 border-b border-slate-100 pb-4">
            <dt className="text-slate-500">Versión</dt>

            <dd className="font-bold text-slate-950">
              {resource.version}
            </dd>
          </div>

          <div className="flex items-start justify-between gap-4 border-b border-slate-100 pb-4">
            <dt className="text-slate-500">
              Última actualización
            </dt>

            <dd className="max-w-44 text-right font-bold text-slate-950">
              {formatDate(resource.updatedAt)}
            </dd>
          </div>

          <div className="flex items-start justify-between gap-4 border-b border-slate-100 pb-4">
            <dt className="text-slate-500">Idioma</dt>

            <dd className="font-bold text-slate-950">
              {resource.language}
            </dd>
          </div>

          <div className="flex items-start justify-between gap-4">
            <dt className="text-slate-500">Formatos</dt>

            <dd className="max-w-44 text-right font-bold text-slate-950">
              {resource.formats.join(", ")}
            </dd>
          </div>
        </dl>
      </section>

      {resource.aiReady && (
        <section className="overflow-hidden rounded-3xl border border-sky-200 bg-gradient-to-br from-sky-50 to-blue-50 p-6 shadow-sm">
          <span className="flex h-16 w-16 items-center justify-center rounded-2xl bg-sky-100 p-1" aria-hidden="true">
            <Image src="/images/profe-ia-robot.png" alt="" width={54} height={72} className="h-full w-auto object-contain" />
          </span>

          <p className="mt-5 text-sm font-bold uppercase tracking-[0.18em] text-sky-700">
            IA Ready
          </p>

          <h2 className="mt-2 text-xl font-black text-slate-950">
            Preparado para Profe IA
          </h2>

          <p className="mt-3 text-sm leading-6 text-slate-600">
            Adapta este material, cambia su nivel, crea evaluaciones y genera variantes inclusivas directamente con Profe IA.
          </p>
        </section>
      )}
    </aside>
  );
}
