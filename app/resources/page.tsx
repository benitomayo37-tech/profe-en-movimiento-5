import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";

import { AccountBadge, AppLayout, Sidebar } from "@/components/layout";
import ResourceLibrary from "@/components/resources/ResourceLibrary";
import { getAuthAccess } from "@/features/auth/server/access";
import { getLibraryResources } from "@/features/resources/server/catalog";
import { getResourceLibraryState } from "@/features/resources/server/library";

export const metadata: Metadata = {
  title: "Recursos educativos | Profe en Movimiento",
  description:
    "Biblioteca de planificaciones, evaluaciones, rúbricas, juegos y materiales de Educación Física para docentes.",
};

function formatNumber(value: number): string {
  return new Intl.NumberFormat("es-EC", {
    notation: value >= 1000 ? "compact" : "standard",
    maximumFractionDigits: 1,
  }).format(value);
}

function ResourcesHeader({ authenticated, email, fullName, isAdmin }: { authenticated: boolean; email: string | null; fullName: string | null; isAdmin: boolean }) {
  return (
    <div className="flex min-h-20 items-center justify-between gap-4 px-6">
      <div className="min-w-0">
        <h1 className="truncate text-lg font-bold text-slate-950">Recursos</h1>
        <p className="truncate text-sm text-slate-500">Biblioteca educativa profesional</p>
      </div>
      <div className="flex items-center gap-3">
        {isAdmin ? <Link href="/resources/admin" className="rounded-xl bg-slate-950 px-4 py-2.5 text-sm font-bold"><span className="text-white">Administrar</span></Link> : null}
        <AccountBadge authenticated={authenticated} email={email} fullName={fullName} className="bg-orange-500" />
      </div>
    </div>
  );
}

function ResourcesFooter() {
  return <div className="px-6 py-4 text-center text-xs text-slate-500">Profe en Movimiento 5.0 · Recursos educativos · Proyecto FARO</div>;
}

export default async function ResourcesPage() {
  const access = await getAuthAccess();
  const [libraryState, resources] = await Promise.all([
    getResourceLibraryState(access.userId),
    getLibraryResources(),
  ]);
  const verifiedResources = resources.filter((resource) => resource.verified).length;
  const aiReadyResources = resources.filter((resource) => resource.aiReady).length;
  const totalCategories = new Set(resources.flatMap((resource) => resource.categories)).size;
  const totalDownloads = Object.values(libraryState.stats).reduce(
    (total, resourceStats) => total + resourceStats.downloads,
    0,
  );

  return (
    <AppLayout
      sidebar={<Sidebar />}
      header={<ResourcesHeader authenticated={access.authenticated} email={access.email} fullName={access.fullName} isAdmin={access.role === "admin"} />}
      footer={<ResourcesFooter />}
      mainClassName="flex-1 bg-slate-50 p-0"
    >
      <div className="min-h-screen bg-slate-50">
      <section className="relative overflow-hidden bg-slate-950">
        <div className="absolute inset-0">
          <div className="absolute -right-24 -top-24 h-80 w-80 rounded-full bg-orange-500/20 blur-3xl" />
          <div className="absolute -bottom-32 -left-20 h-96 w-96 rounded-full bg-blue-500/20 blur-3xl" />
        </div>

        <div className="relative mx-auto max-w-7xl px-4 py-16 sm:px-6 sm:py-20 lg:px-8 lg:py-24">
          <div className="max-w-3xl">
            <span className="inline-flex rounded-full border border-orange-400/30 bg-orange-400/10 px-4 py-2 text-sm font-semibold text-orange-300">
              Biblioteca educativa profesional
            </span>

            <h1 className="mt-6 text-4xl font-black tracking-tight text-white sm:text-5xl lg:text-6xl">
              Recursos que transforman la clase en movimiento
            </h1>

            <p className="mt-6 max-w-2xl text-base leading-8 text-slate-300 sm:text-lg">
              Encuentra planificaciones, juegos, evaluaciones,
              rúbricas y materiales editables diseñados para facilitar
              el trabajo diario de los docentes de Educación Física.
            </p>

            <div className="mt-8 flex flex-wrap gap-3">
              <span className="rounded-full border border-white/15 bg-white/10 px-4 py-2 text-sm font-medium text-white">
                ✓ Revisados pedagógicamente
              </span>

              <span className="rounded-full border border-white/15 bg-white/10 px-4 py-2 text-sm font-medium text-white">
                ✓ Materiales editables
              </span>

              <span className="rounded-full border border-white/15 bg-white/10 px-4 py-2 text-sm font-medium text-white">
                ✓ DUA y NEE
              </span>

              <span className="rounded-full border border-white/15 bg-white/10 px-4 py-2 text-sm font-medium text-white">
                ✓ Preparados para Profe IA
              </span>
            </div>
          </div>

          <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <article className="rounded-2xl border border-white/10 bg-white/5 p-5 backdrop-blur">
              <p className="text-3xl font-black text-white">
                {resources.length}
              </p>

              <p className="mt-1 text-sm text-slate-300">
                Recursos disponibles
              </p>
            </article>

            <article className="rounded-2xl border border-white/10 bg-white/5 p-5 backdrop-blur">
              <p className="text-3xl font-black text-white">
                {totalCategories}
              </p>

              <p className="mt-1 text-sm text-slate-300">
                Categorías educativas
              </p>
            </article>

            <article className="rounded-2xl border border-white/10 bg-white/5 p-5 backdrop-blur">
              <p className="text-3xl font-black text-white">
                {verifiedResources}
              </p>

              <p className="mt-1 text-sm text-slate-300">
                Recursos verificados
              </p>
            </article>

            <article className="rounded-2xl border border-white/10 bg-white/5 p-5 backdrop-blur">
              <p className="text-3xl font-black text-white">
                {formatNumber(totalDownloads)}
              </p>

              <p className="mt-1 text-sm text-slate-300">
                Descargas reales
              </p>
            </article>
          </div>
        </div>
      </section>

      <section className="border-b border-slate-200 bg-white">
        <div className="mx-auto grid max-w-7xl gap-6 px-4 py-8 sm:px-6 md:grid-cols-3 lg:px-8">
          <article className="flex gap-4">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-emerald-100 text-xl">
              ✓
            </div>

            <div>
              <h2 className="font-bold text-slate-950">
                Calidad certificada
              </h2>

              <p className="mt-1 text-sm leading-6 text-slate-600">
                Recursos organizados, actualizados y revisados para su
                aplicación educativa.
              </p>
            </div>
          </article>

          <article className="flex gap-4">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-blue-100 text-xl">
              ◯
            </div>

            <div>
              <h2 className="font-bold text-slate-950">
                Educación inclusiva
              </h2>

              <p className="mt-1 text-sm leading-6 text-slate-600">
                Materiales con aplicación del DUA y alternativas para
                necesidades educativas.
              </p>
            </div>
          </article>

          <article className="flex gap-4">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-sky-100 p-1">
              <Image src="/images/profe-ia-robot.png" alt="Robot de Profe IA" width={40} height={52} className="h-full w-auto object-contain" />
            </div>

            <div>
              <h2 className="font-bold text-slate-950">
                Integración con Profe IA
              </h2>

              <p className="mt-1 text-sm leading-6 text-slate-600">
                {aiReadyResources} recursos preparados para futuras
                adaptaciones mediante inteligencia artificial.
              </p>
            </div>
          </article>
        </div>
      </section>

      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8 lg:py-16">
        <ResourceLibrary
          resources={resources}
          authenticated={access.authenticated}
          favoriteSlugs={libraryState.favoriteSlugs}
          resourceStats={libraryState.stats}
        />
      </div>
      </div>
    </AppLayout>
  );
}
