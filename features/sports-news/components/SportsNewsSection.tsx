import Link from "next/link";

import SportsNewsCard from "@/features/sports-news/components/SportsNewsCard";
import {
  getSportsNews,
} from "@/features/sports-news/server/getSportsNews";
import type {
  SportsNewsCategory,
  SportsNewsItem,
} from "@/features/sports-news/types";

const categoryPriority:
  SportsNewsCategory[] = [
  "ecuadorian-football",
  "mlb",
  "nba",
  "mma",
  "football",
  "athletics",
  "tennis",
  "multisport",
  "olympic",
];

function selectHomepageNews(
  items: SportsNewsItem[],
  maximum: number,
): SportsNewsItem[] {
  const recentLimit =
    Date.now() -
    14 * 24 * 60 * 60 * 1000;

  const recentItems =
    items.filter(
      (item) =>
        new Date(item.publishedAt).getTime() >=
        recentLimit,
    );

  const selected: SportsNewsItem[] = [];
  const selectedIds = new Set<string>();

  for (const category of categoryPriority) {
    const candidate =
      recentItems.find(
        (item) =>
          item.category === category &&
          !selectedIds.has(item.id),
      ) ??
      items.find(
        (item) =>
          item.category === category &&
          !selectedIds.has(item.id),
      );

    if (candidate) {
      selected.push(candidate);
      selectedIds.add(candidate.id);
    }

    if (selected.length >= maximum) {
      return selected;
    }
  }

  for (const item of recentItems) {
    if (!selectedIds.has(item.id)) {
      selected.push(item);
      selectedIds.add(item.id);
    }

    if (selected.length >= maximum) {
      break;
    }
  }

  return selected;
}

export default async function SportsNewsSection() {
  const response = await getSportsNews();

  const items =
    selectHomepageNews(
      response.items,
      6,
    );

  if (items.length === 0) {
    return null;
  }

  return (
    <section
      id="actualidad-deportiva"
      className="order-2 scroll-mt-20 bg-slate-50 px-4 py-20 sm:px-6"
    >
      <div className="mx-auto max-w-7xl">
        <div className="flex flex-col justify-between gap-6 lg:flex-row lg:items-end">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.22em] text-orange-600">
              El deporte se mueve
            </p>

            <h2 className="mt-3 text-4xl font-black tracking-tight text-slate-950 sm:text-5xl">
              Actualidad Deportiva
            </h2>

            <p className="mt-4 max-w-3xl text-lg leading-8 text-slate-600">
              Acontecimientos recientes del deporte mundial,
              publicados por medios reconocidos y enlazados
              directamente a su fuente original.
            </p>
          </div>

          <Link
            href="/actualidad-deportiva"
            className="inline-flex min-h-12 w-fit items-center gap-2 rounded-xl bg-orange-600 px-6 py-3 font-black text-white shadow-lg shadow-orange-950/20 transition hover:-translate-y-0.5 hover:bg-orange-700 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-orange-200"
          >
            Ver todas las noticias
            <span aria-hidden="true">→</span>
          </Link>
        </div>

        <div className="mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {items.map((item) => (
            <SportsNewsCard
              key={item.id}
              item={item}
              compact
            />
          ))}
        </div>

        <p className="mt-8 text-xs leading-5 text-slate-500">
          Profe en Movimiento no reproduce los artículos.
          Los titulares enlazan al medio responsable de
          cada publicación.
        </p>
      </div>
    </section>
  );
}