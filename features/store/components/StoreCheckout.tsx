import Image from "next/image";
import Link from "next/link";

import type { StoreProduct } from "@/features/store/data/products";
import { formatStorePrice } from "@/features/store/data/products";

interface StoreCheckoutProps {
  checkoutUrl?: string;
  product?: StoreProduct;
}

export default function StoreCheckout({
  checkoutUrl,
  product,
}: StoreCheckoutProps) {
  if (!product) {
    return (
      <section className="rounded-[2rem] border border-slate-200 bg-white px-6 py-14 text-center shadow-xl sm:px-10">
        <span className="text-6xl" aria-hidden="true">🛍️</span>
        <h1 className="mt-6 text-3xl font-black tracking-tight text-slate-950">
          Selecciona un producto
        </h1>
        <p className="mx-auto mt-3 max-w-lg leading-7 text-slate-600">
          En Hotmart cada recurso o suscripción utiliza una oferta individual. Elige el producto que deseas adquirir para revisar su información.
        </p>
        <Link
          href="/store#catalogo"
          className="mt-7 inline-flex min-h-12 items-center justify-center rounded-xl bg-blue-700 px-6 py-3 font-black text-white transition hover:bg-blue-800 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-blue-100"
        >
          Explorar el catálogo
        </Link>
      </section>
    );
  }

  return (
    <div className="space-y-8">
      <nav aria-label="Migas de pan" className="flex flex-wrap items-center gap-2 text-sm font-semibold text-slate-500">
        <Link href="/dashboard" className="transition hover:text-blue-700">Dashboard</Link>
        <span aria-hidden="true">/</span>
        <Link href="/store" className="transition hover:text-blue-700">Tienda</Link>
        <span aria-hidden="true">/</span>
        <span className="text-slate-800" aria-current="page">Revisar compra</span>
      </nav>

      <section className="relative overflow-hidden rounded-[2rem] bg-gradient-to-br from-slate-950 via-blue-950 to-blue-700 px-6 py-9 text-white shadow-2xl sm:px-9">
        <div className="absolute -right-16 -top-24 h-64 w-64 rounded-full bg-orange-400/20 blur-3xl" />
        <div className="relative flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
          <div>
            <span className="inline-flex rounded-full border border-orange-300/30 bg-orange-400/15 px-4 py-2 text-xs font-black uppercase tracking-[0.16em] text-orange-200">
              Compra digital con Hotmart
            </span>
            <h1 className="mt-5 text-4xl font-black tracking-tight sm:text-5xl">
              Revisa tu oferta
            </h1>
            <p className="mt-4 max-w-2xl leading-7 text-blue-100">
              Confirma el producto seleccionado. El pago y los datos del comprador se completarán en el entorno seguro de Hotmart.
            </p>
          </div>
          <div className="rounded-2xl border border-white/20 bg-white/10 px-5 py-4 text-sm font-bold text-blue-50">
            🔒 Pago procesado fuera de Profe en Movimiento
          </div>
        </div>
      </section>

      <div className="grid items-start gap-8 lg:grid-cols-[minmax(0,1fr)_380px]">
        <div className="space-y-6">
          <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8" aria-labelledby="selected-product-title">
            <p className="text-xs font-black uppercase tracking-[0.16em] text-blue-700">Oferta seleccionada</p>
            <div className="mt-5 flex flex-col gap-6 sm:flex-row sm:items-start">
              {product.image ? (
                <div className="relative aspect-[2/3] w-32 shrink-0 overflow-hidden rounded-xl border border-slate-200 bg-slate-50 shadow-lg">
                  <Image
                    src={product.image}
                    alt={product.imageAlt ?? product.title}
                    fill
                    sizes="128px"
                    className="object-cover"
                  />
                </div>
              ) : (
                <span className={`flex h-24 w-24 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br ${product.accent} text-4xl text-white shadow-lg`} aria-hidden="true">
                  {product.icon}
                </span>
              )}

              <div className="min-w-0 flex-1">
                <p className="text-xs font-black uppercase tracking-[0.14em] text-orange-600">{product.categoryLabel}</p>
                <h2 id="selected-product-title" className="mt-2 text-2xl font-black leading-tight text-slate-950">{product.title}</h2>
                <p className="mt-3 text-sm leading-6 text-slate-600">{product.description}</p>
                <ul className="mt-5 grid gap-2 text-sm font-semibold text-slate-700 sm:grid-cols-2">
                  {product.contents.map((item) => (
                    <li key={item} className="flex items-start gap-2">
                      <span className="text-emerald-600" aria-hidden="true">✓</span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </section>

          <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8" aria-labelledby="hotmart-process-title">
            <p className="text-xs font-black uppercase tracking-[0.16em] text-orange-600">Proceso de compra</p>
            <h2 id="hotmart-process-title" className="mt-2 text-2xl font-black text-slate-950">¿Qué ocurrirá después?</h2>
            <ol className="mt-6 grid gap-4 sm:grid-cols-3">
              {[
                ["1", "Checkout seguro", "Hotmart solicitará los datos necesarios para procesar el pago."],
                ["2", "Confirmación", "Recibirás la confirmación de la compra en el correo registrado."],
                ["3", "Entrega o acceso", product.billing === "monthly" ? "Se habilitará el acceso correspondiente a la suscripción." : "Hotmart gestionará la entrega del producto digital."],
              ].map(([number, title, description]) => (
                <li key={number} className="rounded-2xl border border-blue-100 bg-blue-50 p-5">
                  <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-700 text-sm font-black text-white">{number}</span>
                  <h3 className="mt-4 font-black text-slate-950">{title}</h3>
                  <p className="mt-2 text-sm leading-6 text-slate-600">{description}</p>
                </li>
              ))}
            </ol>
          </section>
        </div>

        <aside className="space-y-5 lg:sticky lg:top-28" aria-label="Resumen de la oferta">
          <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-xl">
            <p className="text-xs font-black uppercase tracking-[0.16em] text-orange-600">Resumen</p>
            <h2 className="mt-2 text-xl font-black text-slate-950">{product.title}</h2>

            <dl className="mt-5 divide-y divide-slate-200 rounded-2xl border border-slate-200">
              <div className="p-4">
                <dt className="text-xs font-semibold uppercase tracking-wide text-slate-500">Formato</dt>
                <dd className="mt-1 font-black text-slate-900">{product.format}</dd>
              </div>
              <div className="p-4">
                <dt className="text-xs font-semibold uppercase tracking-wide text-slate-500">Entrega</dt>
                <dd className="mt-1 font-black text-slate-900">{product.delivery}</dd>
              </div>
              <div className="p-4">
                <dt className="text-xs font-semibold uppercase tracking-wide text-slate-500">Modalidad</dt>
                <dd className="mt-1 font-black text-slate-900">{product.billing === "monthly" ? "Suscripción mensual" : "Pago único"}</dd>
              </div>
            </dl>

            <div className="mt-6 border-t border-slate-200 pt-5">
              <div className="flex items-end justify-between gap-4">
                <span className="font-bold text-slate-600">Precio publicado</span>
                <div className="text-right">
                  {product.compareAtPrice ? <p className="text-sm font-semibold text-slate-400 line-through">{formatStorePrice(product.compareAtPrice)}</p> : null}
                  <p className="text-3xl font-black text-slate-950">
                    {formatStorePrice(product.price ?? 0)}
                  </p>
                  {product.billing === "monthly" ? <p className="text-xs font-semibold text-slate-500">al mes</p> : null}
                </div>
              </div>
              <p className="mt-3 text-xs leading-5 text-slate-500">
                Hotmart mostrará el importe y las condiciones definitivas antes de confirmar el pago.
              </p>
            </div>

            {checkoutUrl ? (
              <a
                href={checkoutUrl}
                className="mt-6 flex min-h-12 w-full items-center justify-center rounded-xl bg-orange-500 px-5 py-3 text-center font-black text-white transition hover:bg-orange-600 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-orange-100"
              >
                Continuar a Hotmart
                <span className="ml-2" aria-hidden="true">↗</span>
              </a>
            ) : (
              <span className="mt-6 flex min-h-12 w-full items-center justify-center rounded-xl bg-slate-200 px-5 py-3 text-center font-black text-slate-500" aria-disabled="true">
                Enlace de Hotmart pendiente
              </span>
            )}

            <Link href={`/store/${product.id}`} className="mt-3 flex min-h-12 w-full items-center justify-center rounded-xl border border-slate-300 bg-white px-5 py-3 text-center font-bold text-slate-700 transition hover:border-blue-400 hover:bg-blue-50 hover:text-blue-700">
              Volver a la ficha
            </Link>
          </section>

          {!checkoutUrl ? (
            <div className="rounded-2xl border border-amber-200 bg-amber-50 p-5 text-sm leading-6 text-amber-950">
              <p className="font-black">Próxima activación</p>
              <p className="mt-1">La oferta ya está preparada. El botón se habilitará cuando se configure el enlace oficial de Hotmart.</p>
            </div>
          ) : (
            <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-5 text-sm leading-6 text-emerald-950">
              <p className="font-black">Checkout externo verificado</p>
              <p className="mt-1">El enlace dirige únicamente a un dominio seguro de Hotmart.</p>
            </div>
          )}
        </aside>
      </div>
    </div>
  );
}
