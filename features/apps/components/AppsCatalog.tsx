"use client";

import Link from "next/link";
import { useMemo, useState } from "react";

import {
  miniAppCategories,
  miniApps,
  type MiniAppCategoryId,
} from "@/features/apps/data/miniApps";
import type { AuthAccess } from "@/features/auth/types";

interface AppsCatalogProps {
  access: AuthAccess;
}

export default function AppsCatalog({ access }: AppsCatalogProps) {
  const [category, setCategory] = useState<MiniAppCategoryId>("all");
  const [query, setQuery] = useState("");

  const visibleApps = useMemo(() => {
    const normalizedQuery = query.trim().toLocaleLowerCase("es");

    return miniApps.filter((app) => {
      const matchesCategory = category === "all" || app.category === category;
      const searchableText = `${app.title} ${app.description} ${app.categoryLabel}`
        .toLocaleLowerCase("es");

      return matchesCategory && (!normalizedQuery || searchableText.includes(normalizedQuery));
    });
  }, [category, query]);

  const availableCount = miniApps.filter((app) => app.status !== "planned").length;

  return (
    <div className="space-y-10">
      <section className="relative overflow-hidden rounded-[2rem] bg-gradient-to-br from-slate-950 via-blue-950 to-blue-700 px-6 py-10 text-white shadow-2xl sm:px-9 lg:px-12 lg:py-14">
        <div className="absolute -right-20 -top-24 h-72 w-72 rounded-full bg-orange-400/20 blur-3xl" />
        <div className="absolute -bottom-24 left-1/3 h-64 w-64 rounded-full bg-cyan-400/15 blur-3xl" />
        <div className="relative grid items-center gap-10 lg:grid-cols-[minmax(0,1fr)_360px]">
          <div>
            <span className="inline-flex rounded-full border border-orange-300/30 bg-orange-400/15 px-4 py-2 text-xs font-black uppercase tracking-[0.18em] text-orange-200">
              App para profes
            </span>
            <h1 className="mt-6 max-w-4xl text-4xl font-black tracking-tight sm:text-5xl">
              Herramientas rápidas para enseñar con menos esfuerzo.
            </h1>
            <p className="mt-5 max-w-2xl text-base leading-8 text-blue-100 sm:text-lg">
              Organiza grupos, controla actividades y prepara recursos desde un centro diseñado para acompañarte antes, durante y después de la clase.
            </p>
            <div className="mt-8 flex flex-wrap gap-3 text-sm font-bold text-blue-100">
              <span className="rounded-full border border-white/15 bg-white/10 px-4 py-2">19 miniapps organizadas</span>
              <span className="rounded-full border border-white/15 bg-white/10 px-4 py-2">{availableCount} accesos activos</span>
              <span className="rounded-full border border-white/15 bg-white/10 px-4 py-2">Móvil y computadora</span>
            </div>
          </div>

          <div className="rounded-[2rem] border border-white/20 bg-white/10 p-5 shadow-2xl backdrop-blur">
            <div className="grid grid-cols-2 gap-3">
              {[
                ["🔀", "Equipos", "Equilibrados"],
                ["🏆", "Marcador", "En vivo"],
                ["⏱️", "HIIT", "Por intervalos"],
                ["✨", "Profe IA", "Integrada"],
              ].map(([icon, label, value]) => (
                <div key={label} className="rounded-2xl border border-white/15 bg-white/10 p-4">
                  <span className="text-2xl" aria-hidden="true">{icon}</span>
                  <p className="mt-4 text-xs font-semibold text-blue-200">{label}</p>
                  <p className="mt-1 font-black text-white">{value}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section id="catalogo-apps" className="scroll-mt-24" aria-labelledby="apps-catalog-title">
        <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
          <div className="flex flex-col gap-5 xl:flex-row xl:items-end xl:justify-between">
            <div>
              <p className="text-sm font-black uppercase tracking-[0.16em] text-orange-600">Suite docente</p>
              <h2 id="apps-catalog-title" className="mt-2 text-3xl font-black tracking-tight text-slate-950">Explora las 19 miniapps</h2>
            </div>
            <label className="block w-full xl:max-w-md">
              <span className="sr-only">Buscar miniapps</span>
              <input
                type="search"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Buscar por nombre o función…"
                className="min-h-12 w-full rounded-2xl border border-slate-300 bg-slate-50 px-4 text-sm text-slate-950 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-100"
              />
            </label>
          </div>

          <div className="mt-6 flex flex-wrap gap-2" role="group" aria-label="Categorías de miniapps">
            {miniAppCategories.map((item) => {
              const isSelected = category === item.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setCategory(item.id)}
                  aria-pressed={isSelected}
                  className={`inline-flex min-h-11 items-center gap-2 rounded-xl px-4 py-2 text-sm font-black transition focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-blue-100 ${
                    isSelected ? "bg-blue-700 text-white" : "border border-slate-200 bg-white text-slate-600 hover:border-blue-200 hover:bg-blue-50 hover:text-blue-700"
                  }`}
                >
                  <span aria-hidden="true">{item.icon}</span>
                  {item.label}
                </button>
              );
            })}
          </div>
        </div>

        {visibleApps.length > 0 ? (
          <div className="mt-6 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
            {visibleApps.map((app, index) => {
              const href = app.status === "integrated" ? app.href : `/apps/${app.id}`;
              const isLocked = app.plan === "Pro" && !access.hasProAccess;
              const lockedHref = !access.configured
                ? "/cuenta"
                : access.authenticated
                  ? "/cuenta"
                  : `/login?next=${encodeURIComponent(href ?? "/apps")}`;
              return (
                <article key={app.id} className="flex min-h-full flex-col overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm transition hover:-translate-y-1 hover:border-blue-200 hover:shadow-xl">
                  <div className={`relative bg-gradient-to-br ${app.accent} p-6 text-white`}>
                    <div className="absolute right-4 top-4 rounded-full border border-white/25 bg-white/15 px-3 py-1 text-xs font-black">{app.plan}</div>
                    <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white/15 text-3xl shadow-inner" aria-hidden="true">{app.icon}</span>
                    <p className="mt-5 text-xs font-black uppercase tracking-[0.16em] text-white/80">{String(index + 1).padStart(2, "0")} · {app.categoryLabel}</p>
                  </div>
                  <div className="flex flex-1 flex-col p-6">
                    <h3 className="text-xl font-black leading-7 text-slate-950">{app.title}</h3>
                    <p className="mt-3 text-sm leading-6 text-slate-600">{app.description}</p>
                    <div className="mt-auto pt-6">
                      {app.status === "planned" ? (
                        <span className="flex min-h-11 w-full items-center justify-center rounded-xl bg-slate-100 px-4 py-2 text-center text-sm font-black text-slate-500" aria-disabled="true">
                          Desarrollo progresivo
                        </span>
                      ) : isLocked ? (
                        <Link
                          href={lockedHref}
                          className="flex min-h-11 w-full items-center justify-center rounded-xl border border-orange-200 bg-orange-50 px-4 py-2 text-center text-sm font-black text-orange-800 transition hover:bg-orange-100 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-orange-100"
                        >
                          <span className="mr-2" aria-hidden="true">🔒</span>
                          {!access.configured ? "Configurar acceso" : access.authenticated ? "Plan Pro requerido" : "Iniciar sesión"}
                        </Link>
                      ) : (
                        <Link
                          href={href ?? "/apps"}
                          className="flex min-h-11 w-full items-center justify-center rounded-xl bg-blue-700 px-4 py-2 text-center text-sm font-black text-white transition hover:bg-blue-800 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-blue-100"
                        >
                          {app.status === "integrated" ? "Abrir Entrenador IA" : "Abrir herramienta"}
                          <span className="ml-2" aria-hidden="true">→</span>
                        </Link>
                      )}
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        ) : (
          <div className="mt-6 rounded-3xl border border-dashed border-slate-300 bg-white px-6 py-14 text-center">
            <span className="text-5xl" aria-hidden="true">🔎</span>
            <h3 className="mt-4 text-xl font-black text-slate-950">No encontramos miniapps</h3>
            <p className="mt-2 text-sm text-slate-600">Prueba otra palabra o selecciona una categoría diferente.</p>
          </div>
        )}
      </section>
    </div>
  );
}
