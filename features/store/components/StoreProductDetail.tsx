import Image from "next/image";
import Link from "next/link";

import HotmartPurchaseButton from "@/features/store/components/HotmartPurchaseButton";
import type { StoreProduct } from "@/features/store/data/products";
import { formatStorePrice, storeProducts } from "@/features/store/data/products";

interface StoreProductDetailProps {
  product: StoreProduct;
}

export default function StoreProductDetail({
  product,
}: StoreProductDetailProps) {
  const relatedProducts = storeProducts
    .filter(
      (candidate) =>
        candidate.id !== product.id &&
        candidate.category === product.category,
    )
    .slice(0, 2);

  return (
    <div className="space-y-10">
      <nav aria-label="Migas de pan" className="flex flex-wrap items-center gap-2 text-sm font-semibold text-slate-500">
        <Link href="/dashboard" className="transition hover:text-blue-700">
          Dashboard
        </Link>
        <span aria-hidden="true">/</span>
        <Link href="/store" className="transition hover:text-blue-700">
          Tienda
        </Link>
        <span aria-hidden="true">/</span>
        <span className="text-slate-800" aria-current="page">
          {product.title}
        </span>
      </nav>

      <section className={`relative overflow-hidden rounded-[2rem] bg-gradient-to-br ${product.accent} px-6 py-10 text-white shadow-2xl sm:px-8 lg:px-12 lg:py-14`}>
        <div className="absolute -right-16 -top-20 h-72 w-72 rounded-full bg-white/15" />
        <div className="absolute -bottom-28 left-1/3 h-72 w-72 rounded-full bg-slate-950/10" />

        <div className="relative grid items-center gap-10 lg:grid-cols-[minmax(0,1fr)_320px]">
          <div>
            <div className="flex flex-wrap items-center gap-3">
              <span className="rounded-full border border-white/25 bg-white/15 px-4 py-2 text-xs font-black uppercase tracking-[0.16em]">
                {product.categoryLabel}
              </span>
              <span className="rounded-full border border-white/25 bg-white/15 px-4 py-2 text-xs font-black">
                {product.badge}
              </span>
            </div>

            <h1 className="mt-6 max-w-4xl text-4xl font-black tracking-tight sm:text-5xl">
              {product.title}
            </h1>
            <p className="mt-5 max-w-3xl text-base leading-8 text-white/90 sm:text-lg">
              {product.description}
            </p>
          </div>

          <div className="flex min-h-64 items-center justify-center rounded-[2rem] border border-white/20 bg-white/15 p-8 shadow-2xl backdrop-blur">
            {product.image ? (
              <div className="relative aspect-[2/3] w-44 overflow-hidden rounded-xl border border-white/30 bg-white shadow-2xl sm:w-52">
                <Image
                  src={product.image}
                  alt={product.imageAlt ?? product.title}
                  fill
                  priority
                  sizes="(max-width: 640px) 176px, 208px"
                  className="object-cover"
                />
              </div>
            ) : (
              <div className="text-center">
                <span className="inline-flex h-28 w-28 items-center justify-center rounded-3xl bg-white/20 text-6xl shadow-inner" aria-hidden="true">
                  {product.icon}
                </span>
                <p className="mt-5 text-sm font-black uppercase tracking-[0.18em] text-white/80">
                  Profe en Movimiento
                </p>
              </div>
            )}
          </div>
        </div>
      </section>

      <section className="grid items-start gap-8 lg:grid-cols-[minmax(0,1fr)_360px]">
        <div className="space-y-8">
          <article className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
            <p className="text-sm font-black uppercase tracking-[0.16em] text-orange-600">
              Acerca del producto
            </p>
            <h2 className="mt-3 text-2xl font-black tracking-tight text-slate-950 sm:text-3xl">
              Diseñado para facilitar tu trabajo
            </h2>
            <p className="mt-5 text-base leading-8 text-slate-600">
              {product.longDescription}
            </p>
          </article>

          {product.appList ? (
            <article className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
              <p className="text-sm font-black uppercase tracking-[0.16em] text-orange-600">
                Suite completa
              </p>
              <h2 className="mt-3 text-2xl font-black tracking-tight text-slate-950">
                Las 19 miniapps incluidas
              </h2>
              <div className="mt-6 grid gap-3 sm:grid-cols-2">
                {product.appList.map((app, index) => (
                  <div key={app} className="flex items-start gap-3 rounded-2xl border border-orange-100 bg-orange-50 p-4">
                    <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-orange-500 text-xs font-black text-white">
                      {index + 1}
                    </span>
                    <p className="text-sm font-bold leading-6 text-slate-800">{app}</p>
                  </div>
                ))}
              </div>
            </article>
          ) : null}

          <article className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
            <p className="text-sm font-black uppercase tracking-[0.16em] text-blue-700">
              Contenido
            </p>
            <h2 className="mt-3 text-2xl font-black tracking-tight text-slate-950">
              ¿Qué incluye?
            </h2>
            <div className="mt-6 grid gap-4 sm:grid-cols-2">
              {product.contents.map((item, index) => (
                <div key={item} className="flex items-start gap-4 rounded-2xl border border-blue-100 bg-blue-50 p-5">
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-blue-700 text-sm font-black text-white">
                    {index + 1}
                  </span>
                  <p className="font-bold leading-6 text-slate-800">{item}</p>
                </div>
              ))}
            </div>
          </article>

          <article className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
            <p className="text-sm font-black uppercase tracking-[0.16em] text-emerald-700">
              Beneficios
            </p>
            <h2 className="mt-3 text-2xl font-black tracking-tight text-slate-950">
              Lo que aporta a tu práctica docente
            </h2>
            <div className="mt-6 grid gap-4 sm:grid-cols-2">
              {product.benefits.map((benefit) => (
                <div key={benefit} className="flex items-start gap-3 rounded-2xl border border-slate-200 bg-slate-50 p-5">
                  <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-sm font-black text-emerald-700" aria-hidden="true">
                    ✓
                  </span>
                  <p className="font-semibold leading-6 text-slate-700">{benefit}</p>
                </div>
              ))}
            </div>
          </article>

          <article className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
            <p className="text-sm font-black uppercase tracking-[0.16em] text-violet-700">
              Aplicación
            </p>
            <h2 className="mt-3 text-2xl font-black tracking-tight text-slate-950">
              Cómo utilizarlo
            </h2>
            <ol className="mt-6 grid gap-4 sm:grid-cols-2">
              {product.howToUse.map((step, index) => (
                <li key={step} className="flex items-start gap-4 rounded-2xl border border-violet-100 bg-violet-50 p-5">
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-violet-700 text-sm font-black text-white">
                    {index + 1}
                  </span>
                  <p className="font-semibold leading-6 text-slate-700">{step}</p>
                </li>
              ))}
            </ol>
          </article>
        </div>

        <aside className="space-y-6 lg:sticky lg:top-28" aria-label="Información del producto">
          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-xl">
            <span className={`inline-flex rounded-full px-3 py-1 text-xs font-black uppercase tracking-[0.14em] ${
              product.purchaseStatus === "available"
                ? "bg-emerald-100 text-emerald-700"
                : "bg-orange-100 text-orange-700"
            }`}>
              {product.purchaseStatus === "available" ? "Disponible" : "Incluido en la Suite"}
            </span>
            <h2 className="mt-5 text-2xl font-black text-slate-950">
              {product.title}
            </h2>
            {product.price !== undefined ? (
              <div className="mt-4">
                {product.compareAtPrice ? (
                  <p className="text-sm font-semibold text-slate-400 line-through">{formatStorePrice(product.compareAtPrice)}</p>
                ) : null}
                <p className="text-4xl font-black tracking-tight text-blue-700">
                  {formatStorePrice(product.price)}
                  {product.billing === "monthly" ? <span className="ml-2 text-sm font-bold text-slate-500">/ mes</span> : null}
                </p>
              </div>
            ) : null}
            <p className="mt-3 text-sm leading-6 text-slate-600">
              {product.commercialNote ?? "Revisa la oferta y continúa al entorno seguro de Hotmart."}
            </p>

            <dl className="mt-6 divide-y divide-slate-200 rounded-2xl border border-slate-200">
              <div className="p-4">
                <dt className="text-xs font-semibold uppercase tracking-wide text-slate-500">Formato</dt>
                <dd className="mt-1 font-black text-slate-900">{product.format}</dd>
              </div>
              <div className="p-4">
                <dt className="text-xs font-semibold uppercase tracking-wide text-slate-500">Entrega</dt>
                <dd className="mt-1 font-black text-slate-900">{product.delivery}</dd>
              </div>
              <div className="p-4">
                <dt className="text-xs font-semibold uppercase tracking-wide text-slate-500">Acceso</dt>
                <dd className="mt-1 font-black text-slate-900">{product.access}</dd>
              </div>
            </dl>

            {product.purchaseStatus === "available" ? (
              <div className="mt-6">
                <HotmartPurchaseButton productId={product.id} />
              </div>
            ) : product.purchaseStatus === "included" ? (
              <Link
                href="/store/suite-19-miniapps-docentes"
                className="mt-6 flex min-h-12 w-full items-center justify-center rounded-xl bg-orange-500 px-5 py-3 text-center font-black text-white transition hover:bg-orange-600 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-orange-100"
              >
                Ver Suite de 19 miniapps
              </Link>
            ) : (
              <span className="mt-6 flex min-h-12 w-full items-center justify-center rounded-xl bg-slate-200 px-5 py-3 text-center font-black text-slate-500" aria-disabled="true">
                Disponible próximamente
              </span>
            )}
            <Link href="/store" className="mt-3 flex min-h-12 w-full items-center justify-center rounded-xl border border-slate-300 bg-white px-5 py-3 text-center font-bold text-slate-700 transition hover:border-blue-400 hover:bg-blue-50 hover:text-blue-700 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-blue-100">
              Volver a la tienda
            </Link>
          </div>

          <div className="rounded-3xl border border-emerald-200 bg-emerald-50 p-6">
            <p className="text-sm font-black uppercase tracking-[0.14em] text-emerald-700">
              Ideal para
            </p>
            <ul className="mt-4 space-y-3 text-sm font-semibold text-emerald-950">
              {product.idealFor.map((audience) => (
                <li key={audience} className="flex items-start gap-2">
                  <span aria-hidden="true">✓</span>
                  <span>{audience}</span>
                </li>
              ))}
            </ul>
          </div>
        </aside>
      </section>

      {relatedProducts.length > 0 ? (
        <section aria-labelledby="related-products-title">
          <div className="flex items-end justify-between gap-4">
            <div>
              <p className="text-sm font-black uppercase tracking-[0.16em] text-blue-700">
                También puede interesarte
              </p>
              <h2 id="related-products-title" className="mt-2 text-3xl font-black tracking-tight text-slate-950">
                Productos relacionados
              </h2>
            </div>
            <Link href="/store#catalogo" className="hidden text-sm font-black text-blue-700 hover:text-blue-900 sm:inline-flex">
              Ver catálogo →
            </Link>
          </div>

          <div className="mt-6 grid gap-5 md:grid-cols-2">
            {relatedProducts.map((related) => (
              <Link key={related.id} href={`/store/${related.id}`} className="group flex items-center gap-5 rounded-3xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-1 hover:border-blue-200 hover:shadow-xl focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-blue-100">
                <span className={`flex h-20 w-20 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br ${related.accent} text-3xl text-white`} aria-hidden="true">
                  {related.icon}
                </span>
                <div className="min-w-0">
                  <p className="text-xs font-black uppercase tracking-[0.14em] text-blue-700">{related.categoryLabel}</p>
                  <h3 className="mt-2 font-black leading-6 text-slate-950">{related.title}</h3>
                  <span className="mt-2 inline-flex text-sm font-bold text-slate-500 transition group-hover:text-blue-700">Ver ficha →</span>
                </div>
              </Link>
            ))}
          </div>
        </section>
      ) : null}
    </div>
  );
}
