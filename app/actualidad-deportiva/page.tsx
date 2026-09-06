import type { Metadata } from "next";
import Link from "next/link";

import SportsNewsExplorer from "@/features/sports-news/components/SportsNewsExplorer";
import {
  getSportsNews,
} from "@/features/sports-news/server/getSportsNews";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title:
    "Actualidad Deportiva | Profe en Movimiento",
  description:
    "Noticias recientes de fútbol, MLB, NBA, MMA, atletismo, tenis y deporte internacional enlazadas a sus fuentes originales.",
  alternates: {
    canonical: "/actualidad-deportiva",
  },
};

export default async function SportsNewsPage() {
  const response = await getSportsNews();

  const updatedAt =
    new Intl.DateTimeFormat(
      "es-EC",
      {
        dateStyle: "medium",
        timeStyle: "short",
        timeZone: "America/Guayaquil",
      },
    ).format(
      new Date(response.updatedAt),
    );

  return (
    <main className="min-h-screen bg-slate-50 text-slate-950">
      <header className="bg-[#071532] px-4 py-5 text-white sm:px-6">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-4">
          <Link
            href="/"
            className="font-black text-orange-300 transition hover:text-orange-200"
          >
            ← Profe en Movimiento
          </Link>

          <Link
            href="/dashboard"
            className="rounded-xl bg-orange-600 px-4 py-2.5 text-sm font-black text-white transition hover:bg-orange-700"
          >
            Ir al Dashboard
          </Link>
        </div>
      </header>

      <section className="bg-gradient-to-br from-[#071532] via-[#0b2050] to-blue-800 px-4 py-16 text-white sm:px-6">
        <div className="mx-auto max-w-7xl">
          <p className="text-xs font-black uppercase tracking-[0.22em] text-orange-300">
            Información deportiva en español
          </p>

          <h1 className="mt-4 max-w-4xl text-4xl font-black tracking-tight sm:text-6xl">
            Actualidad Deportiva
          </h1>

          <p className="mt-5 max-w-3xl text-lg leading-8 text-blue-100">
            Fútbol, MLB, NBA, MMA, atletismo, tenis y
            acontecimientos polideportivos desde medios
            reconocidos.
          </p>

          <p className="mt-5 text-sm font-semibold text-blue-200">
            Última actualización: {updatedAt}
          </p>
        </div>
      </section>

      <section className="px-4 py-14 sm:px-6">
        <div className="mx-auto max-w-7xl">
          {response.items.length > 0 ? (
            <SportsNewsExplorer
              items={response.items}
            />
          ) : (
            <div className="rounded-3xl border border-slate-200 bg-white p-10 text-center shadow-sm">
              <span className="text-4xl" aria-hidden="true">
                📰
              </span>

              <h2 className="mt-4 text-2xl font-black">
                Las noticias no están disponibles
              </h2>

              <p className="mt-3 text-slate-600">
                Las fuentes externas no respondieron.
                Intenta nuevamente dentro de unos minutos.
              </p>
            </div>
          )}

          <div className="mt-12 rounded-2xl border border-blue-200 bg-blue-50 p-5 text-sm leading-6 text-blue-950">
            <strong>Sobre esta sección:</strong>{" "}
            Profe en Movimiento presenta titulares,
            categorías, fechas y enlaces. Cada noticia
            pertenece al medio identificado y se abre
            directamente en su sitio web.
          </div>
        </div>
      </section>
    </main>
  );
}