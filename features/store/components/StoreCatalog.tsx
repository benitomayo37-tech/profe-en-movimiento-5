"use client";

import Image from "next/image";
import Link from "next/link";
import { useMemo, useState } from "react";

import HotmartPurchaseButton from "@/features/store/components/HotmartPurchaseButton";
import {
  formatStorePrice,
  getStoreProductStatusLabel,
  storeCategories,
  storeProducts,
  type StoreCategoryId,
} from "@/features/store/data/products";

const appBenefits = [
  "Suite de miniapps en crecimiento",
  "Sorteador, marcador y cronómetros",
  "Sesiones, torneos y pausas activas",
  "Objetivos, rúbricas y planificación",
  "Registros y herramientas de evaluación",
  "Acceso desde móvil o computadora",
];

const appPlans = [
  {
    name: "Free",
    eyebrow: "Para comenzar",
    description: "Herramientas esenciales para organizar la clase.",
    features: ["Cronómetro y silbato", "Marcador", "Sorteador básico"],
    price: "$0",
    priceDetail: "para comenzar",
    featured: false,
  },
  {
    name: "Pro",
    eyebrow: "Para el trabajo diario",
    description: "La suite completa de herramientas docentes en línea.",
    features: ["Miniapps disponibles y nuevas incorporaciones", "Actualizaciones del kit", "Uso desde cualquier dispositivo", "1 cuenta docente"],
    price: "$4,99",
    priceDetail: "al mes",
    featured: true,
  },
  {
    name: "Premium",
    eyebrow: "Ecosistema completo",
    description: "Inteligencia artificial y biblioteca premium en un solo lugar.",
    features: ["Todo lo incluido en Pro", "Profe IA", "Entrenador IA", "Exportación Word y PDF"],
    price: "$9,99",
    priceDetail: "al mes",
    featured: false,
  },
  {
    name: "Institucional",
    eyebrow: "Para equipos docentes",
    description: "Una solución escalable para instituciones educativas.",
    features: ["Licencias para docentes", "Panel institucional", "Recursos compartidos", "Acompañamiento"],
    price: "Cotización",
    priceDetail: "según licencias",
    featured: false,
  },
];

export default function StoreCatalog() {
  const [selectedCategory, setSelectedCategory] =
    useState<StoreCategoryId>("all");
  const [query, setQuery] = useState("");

  const visibleProducts = useMemo(() => {
    const normalizedQuery = query.trim().toLocaleLowerCase("es");

    return storeProducts.filter((product) => {
      const matchesCategory =
        selectedCategory === "all" || product.category === selectedCategory;
      const searchableText = [
        product.title,
        product.description,
        product.categoryLabel,
        product.format,
        ...product.contents,
      ]
        .join(" ")
        .toLocaleLowerCase("es");

      return matchesCategory &&
        (!normalizedQuery || searchableText.includes(normalizedQuery));
    });
  }, [query, selectedCategory]);

  function resetFilters() {
    setSelectedCategory("all");
    setQuery("");
  }

  return (
    <div className="space-y-12">
      <section className="relative overflow-hidden rounded-[2rem] bg-gradient-to-br from-slate-950 via-blue-950 to-blue-700 px-6 py-10 text-white shadow-2xl sm:px-8 lg:px-12 lg:py-14">
        <div className="absolute -right-20 -top-24 h-72 w-72 rounded-full bg-orange-400/20 blur-3xl" />
        <div className="absolute -bottom-24 left-1/3 h-64 w-64 rounded-full bg-cyan-400/15 blur-3xl" />

        <div className="relative grid items-center gap-10 lg:grid-cols-[minmax(0,1.1fr)_minmax(320px,0.9fr)]">
          <div>
            <span className="inline-flex rounded-full border border-orange-300/30 bg-orange-400/15 px-4 py-2 text-xs font-black uppercase tracking-[0.18em] text-orange-200">
              Recursos creados por docentes, para docentes
            </span>

            <h2 className="mt-6 max-w-3xl text-4xl font-black tracking-tight sm:text-5xl">
              Todo lo que necesitas para enseñar, organizar y poner la clase en movimiento.
            </h2>

            <p className="mt-5 max-w-2xl text-base leading-8 text-blue-100 sm:text-lg">
              Explora aplicaciones, recursos editables, ebooks y paquetes diseñados para ahorrar tiempo y enriquecer cada experiencia de aprendizaje.
            </p>

            <div className="mt-8 flex flex-wrap gap-3">
              <a
                href="#app-para-profes"
                className="inline-flex min-h-12 items-center justify-center rounded-xl bg-orange-500 px-6 py-3 font-bold text-white shadow-lg shadow-orange-950/20 transition hover:-translate-y-0.5 hover:bg-orange-400 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-orange-200/50"
              >
                Conocer App para profes
                <span className="ml-2" aria-hidden="true">→</span>
              </a>
              <a
                href="#catalogo"
                className="inline-flex min-h-12 items-center justify-center rounded-xl border border-white/25 bg-white/10 px-6 py-3 font-bold text-white transition hover:bg-white/15 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-white/20"
              >
                Explorar productos
              </a>
            </div>

            <div className="mt-8 flex flex-wrap gap-x-6 gap-y-3 text-sm font-semibold text-blue-100">
              <span>✓ Descarga digital</span>
              <span>✓ Material editable</span>
              <span>✓ Actualizaciones futuras</span>
            </div>
          </div>

          <div className="relative mx-auto w-full max-w-lg">
            <div className="rounded-[2rem] border border-white/20 bg-white/10 p-4 shadow-2xl backdrop-blur">
              <div className="rounded-3xl bg-white p-5 text-slate-900 shadow-xl">
                <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                  <div>
                    <p className="text-xs font-black uppercase tracking-[0.16em] text-orange-500">App para profes</p>
                    <p className="mt-1 text-lg font-black">Tu clase, bajo control</p>
                  </div>
                  <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-50 text-2xl" aria-hidden="true">📱</span>
                </div>

                <div className="mt-5 grid grid-cols-2 gap-3">
                  {[
                    ["⏱️", "Cronómetro", "15:00"],
                    ["🔀", "Equipos", "1 toque"],
                    ["🏆", "Marcador", "12 · 10"],
                    ["✓", "Asistencia", "38 / 40"],
                  ].map(([icon, label, value]) => (
                    <div key={label} className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                      <span className="text-lg" aria-hidden="true">{icon}</span>
                      <p className="mt-3 text-xs font-semibold text-slate-500">{label}</p>
                      <p className="mt-1 font-black text-slate-900">{value}</p>
                    </div>
                  ))}
                </div>

                <div className="mt-4 rounded-2xl bg-gradient-to-r from-blue-700 to-blue-600 p-4 text-white">
                  <p className="text-xs font-semibold text-blue-100">Próxima clase</p>
                  <p className="mt-1 font-black">Baloncesto · Pases</p>
                  <div className="mt-3 h-2 overflow-hidden rounded-full bg-white/20">
                    <div className="h-full w-3/4 rounded-full bg-orange-400" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="app-para-profes" className="scroll-mt-24" aria-labelledby="app-title">
        <div className="grid gap-8 rounded-[2rem] border border-blue-100 bg-gradient-to-br from-blue-50 to-white p-6 shadow-lg sm:p-8 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)] lg:p-10">
          <div>
            <span className="inline-flex rounded-full bg-orange-100 px-4 py-2 text-xs font-black uppercase tracking-[0.18em] text-orange-700">
              Producto destacado
            </span>
            <h2 id="app-title" className="mt-5 text-3xl font-black tracking-tight text-slate-950 sm:text-4xl">
              Suite Pro de miniapps para docentes
            </h2>
            <p className="mt-4 max-w-xl leading-7 text-slate-600">
              Diecinueve herramientas en línea para acompañarte antes, durante y después de la clase. Organiza grupos, controla tiempos, crea materiales y evalúa desde un mismo lugar.
            </p>

            <div className="mt-6 grid gap-3 sm:grid-cols-2">
              {appBenefits.map((benefit) => (
                <div key={benefit} className="flex items-start gap-3 rounded-2xl bg-white p-4 shadow-sm">
                  <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-xs font-black text-emerald-700" aria-hidden="true">✓</span>
                  <p className="text-sm font-semibold leading-6 text-slate-700">{benefit}</p>
                </div>
              ))}
            </div>

            <p className="mt-6 rounded-2xl border border-orange-200 bg-orange-50 px-5 py-4 text-sm font-semibold leading-6 text-orange-900">
              Acceso web sin instalaciones. El Plan Pro reúne las miniapps disponibles, sus actualizaciones y nuevas incorporaciones.
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            {appPlans.map((plan) => (
              <article
                key={plan.name}
                className={`relative flex flex-col rounded-3xl border p-6 transition hover:-translate-y-1 hover:shadow-xl ${
                  plan.featured
                    ? "border-blue-700 bg-blue-700 text-white shadow-lg"
                    : "border-slate-200 bg-white text-slate-950 shadow-sm"
                }`}
              >
                {plan.featured ? (
                  <span className="absolute right-5 top-5 rounded-full bg-orange-400 px-3 py-1 text-[0.65rem] font-black uppercase tracking-wide text-slate-950">
                    Recomendado
                  </span>
                ) : null}
                <p className={`text-xs font-black uppercase tracking-[0.14em] ${plan.featured ? "text-blue-100" : "text-blue-700"}`}>
                  {plan.eyebrow}
                </p>
                <h3 className="mt-3 text-2xl font-black">{plan.name}</h3>
                <div className="mt-4 flex items-end gap-2">
                  <span className="text-3xl font-black">{plan.price}</span>
                  <span className={`pb-1 text-xs font-bold ${plan.featured ? "text-blue-100" : "text-slate-500"}`}>{plan.priceDetail}</span>
                </div>
                <p className={`mt-3 text-sm leading-6 ${plan.featured ? "text-blue-100" : "text-slate-600"}`}>
                  {plan.description}
                </p>
                <ul className="mt-5 space-y-3 text-sm font-semibold">
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex items-start gap-2">
                      <span className={plan.featured ? "text-orange-300" : "text-emerald-600"} aria-hidden="true">✓</span>
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
                {plan.name === "Pro" ? (
                  <Link
                    href="/store/suite-19-miniapps-docentes"
                    className="mt-auto pt-6 text-sm font-black text-orange-300 hover:text-orange-200"
                  >
                    Ver Suite Pro de miniapps →
                  </Link>
                ) : (
                  <span className={`mt-auto pt-6 text-sm font-black ${plan.featured ? "text-orange-300" : "text-blue-700"}`}>
                    {plan.name === "Free" ? "Acceso inicial" : "Disponible próximamente"}
                  </span>
                )}
              </article>
            ))}
          </div>
        </div>
      </section>

      <section id="catalogo" className="scroll-mt-24" aria-labelledby="catalog-title">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-sm font-black uppercase tracking-[0.16em] text-blue-700">Catálogo digital</p>
            <h2 id="catalog-title" className="mt-2 text-3xl font-black tracking-tight text-slate-950">
              Recursos para cada momento de tu trabajo
            </h2>
            <p className="mt-3 max-w-2xl leading-7 text-slate-600">
              Encuentra materiales para planificar, enseñar, evaluar y gestionar tus clases.
            </p>
          </div>

          <label className="relative block w-full lg:max-w-md">
            <span className="sr-only">Buscar en la tienda</span>
            <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" aria-hidden="true">⌕</span>
            <input
              type="search"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Buscar recursos, ebooks o apps..."
              className="min-h-12 w-full rounded-2xl border border-slate-300 bg-white py-3 pl-11 pr-4 text-sm text-slate-900 shadow-sm outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
            />
          </label>
        </div>

        <div className="mt-7 flex flex-wrap gap-3" role="group" aria-label="Filtrar productos por categoría">
          {storeCategories.map((category) => {
            const isSelected = selectedCategory === category.id;
            return (
              <button
                key={category.id}
                type="button"
                onClick={() => setSelectedCategory(category.id)}
                aria-pressed={isSelected}
                className={`inline-flex min-h-11 items-center gap-2 rounded-xl border px-4 py-2 text-sm font-bold transition focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-blue-100 ${
                  isSelected
                    ? "border-blue-700 bg-blue-700 text-white shadow-md"
                    : "border-slate-200 bg-white text-slate-700 hover:border-blue-200 hover:bg-blue-50 hover:text-blue-700"
                }`}
              >
                <span aria-hidden="true">{category.icon}</span>
                {category.label}
              </button>
            );
          })}
        </div>

        <p className="mt-6 text-sm font-semibold text-slate-500" aria-live="polite">
          {visibleProducts.length} {visibleProducts.length === 1 ? "producto encontrado" : "productos encontrados"}
        </p>

        {visibleProducts.length > 0 ? (
          <div className="mt-5 grid gap-6 md:grid-cols-2 xl:grid-cols-3">
            {visibleProducts.map((product) => (
              <article key={product.id} className="group flex overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm transition duration-300 hover:-translate-y-1 hover:border-blue-200 hover:shadow-xl">
                <div className="flex w-full flex-col">
                  <div className={`relative min-h-40 overflow-hidden bg-gradient-to-br ${product.accent} p-6 text-white`}>
                    <div className="absolute -right-8 -top-10 h-32 w-32 rounded-full bg-white/15" />
                    <div className="relative flex items-start justify-between gap-4">
                      {product.image ? (
                        <div className="relative h-24 w-16 overflow-hidden rounded-lg border border-white/30 bg-white shadow-xl">
                          <Image src={product.image} alt="" fill sizes="64px" className="object-cover" />
                        </div>
                      ) : (
                        <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white/15 text-3xl shadow-inner" aria-hidden="true">{product.icon}</span>
                      )}
                      <span className="rounded-full border border-white/20 bg-white/15 px-3 py-1 text-xs font-black">{product.badge}</span>
                    </div>
                    <p className="relative mt-6 text-xs font-black uppercase tracking-[0.16em] text-white/80">{product.categoryLabel}</p>
                  </div>

                  <div className="flex flex-1 flex-col p-6">
                    <h3 className="text-xl font-black leading-7 text-slate-950">{product.title}</h3>
                    <p className="mt-3 text-sm leading-6 text-slate-600">{product.description}</p>

                    <ul className="mt-5 space-y-2 text-sm text-slate-600">
                      {product.contents.map((item) => (
                        <li key={item} className="flex items-start gap-2">
                          <span className="font-black text-emerald-600" aria-hidden="true">✓</span>
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>

                    <div className="mt-auto border-t border-slate-100 pt-5">
                      <div className="flex items-end justify-between gap-4">
                      <div>
                        <p className="text-xs font-semibold text-slate-500">Formato</p>
                        <p className="mt-1 text-sm font-black text-slate-900">{product.format}</p>
                      </div>
                      <div className="text-right">
                        {product.price !== undefined ? (
                          <>
                            {product.compareAtPrice ? <p className="text-xs font-semibold text-slate-400 line-through">{formatStorePrice(product.compareAtPrice)}</p> : null}
                            <p className="text-xl font-black text-blue-700">{formatStorePrice(product.price)}</p>
                            {product.billing === "monthly" ? <p className="text-xs font-semibold text-slate-500">al mes</p> : null}
                          </>
                        ) : (
                          <p className="text-xs font-black text-orange-700">
                            {getStoreProductStatusLabel(product)}
                          </p>
                        )}
                      </div>
                      </div>
                      <div className="mt-4 flex flex-wrap justify-end gap-2">
                      <Link
                        href={`/store/${product.id}`}
                        aria-label={`Ver ficha de ${product.title}`}
                        className="inline-flex min-h-10 items-center justify-center rounded-xl bg-blue-700 px-4 py-2 text-xs font-black text-white transition hover:bg-blue-800 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-blue-100"
                      >
                        Ver ficha
                        <span className="ml-2" aria-hidden="true">→</span>
                      </Link>
                      {product.purchaseStatus === "available" ? (
                        <HotmartPurchaseButton productId={product.id} compact />
                      ) : product.purchaseStatus === "included" ? (
                        <Link
                          href="/store/suite-19-miniapps-docentes"
                          className="inline-flex min-h-10 items-center justify-center rounded-xl border border-orange-300 bg-orange-50 px-4 py-2 text-xs font-black text-orange-800 transition hover:bg-orange-100"
                        >
                          Ver Suite
                        </Link>
                      ) : null}
                      </div>
                    </div>
                  </div>
                </div>
              </article>
            ))}
          </div>
        ) : (
          <div className="mt-5 rounded-3xl border border-dashed border-slate-300 bg-white px-6 py-12 text-center">
            <span className="text-4xl" aria-hidden="true">🔎</span>
            <h3 className="mt-4 text-xl font-black text-slate-900">No encontramos coincidencias</h3>
            <p className="mt-2 text-sm text-slate-600">Prueba otra palabra o vuelve a mostrar todo el catálogo.</p>
            <button
              type="button"
              onClick={resetFilters}
              className="mt-6 inline-flex min-h-11 items-center justify-center rounded-xl bg-blue-700 px-5 py-2 font-bold text-white transition hover:bg-blue-800 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-blue-100"
            >
              Limpiar filtros
            </button>
          </div>
        )}
      </section>

      <section className="rounded-[2rem] bg-gradient-to-r from-orange-500 to-orange-400 px-6 py-9 text-slate-950 shadow-xl sm:px-8 lg:flex lg:items-center lg:justify-between lg:gap-8 lg:px-10">
        <div>
          <p className="text-xs font-black uppercase tracking-[0.18em] text-orange-950/70">Profe en Movimiento</p>
          <h2 className="mt-2 text-2xl font-black sm:text-3xl">Menos tiempo preparando. Más tiempo enseñando.</h2>
          <p className="mt-3 max-w-2xl font-medium leading-7 text-orange-950/80">
            La tienda crecerá con nuevos recursos, aplicaciones y actualizaciones creadas para las necesidades reales del aula y la cancha.
          </p>
        </div>
        <a
          href="#catalogo"
          className="mt-6 inline-flex min-h-12 shrink-0 items-center justify-center rounded-xl bg-slate-950 px-6 py-3 font-bold text-white transition hover:-translate-y-0.5 hover:bg-blue-950 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-white/50 lg:mt-0"
        >
          Volver al catálogo
          <span className="ml-2" aria-hidden="true">↑</span>
        </a>
      </section>
    </div>
  );
}
