"use client";

import { useMemo, useState } from "react";

import SportsNewsCard, {
  categoryPresentation,
} from "@/features/sports-news/components/SportsNewsCard";
import type {
  SportsNewsCategory,
  SportsNewsItem,
} from "@/features/sports-news/types";

type CategoryFilter =
  | "all"
  | SportsNewsCategory;

const INITIAL_VISIBLE_ITEMS = 18;
const LOAD_MORE_ITEMS = 18;

const categoryOrder:
  SportsNewsCategory[] = [
  "football",
  "ecuadorian-football",
  "mlb",
  "nba",
  "mma",
  "athletics",
  "tennis",
  "olympic",
  "multisport",
];

interface SportsNewsExplorerProps {
  items: SportsNewsItem[];
}

export default function SportsNewsExplorer({
  items,
}: SportsNewsExplorerProps) {
  const [selectedCategory, setSelectedCategory] =
    useState<CategoryFilter>("all");

  const [visibleCount, setVisibleCount] =
    useState(INITIAL_VISIBLE_ITEMS);

  const selectCategory = (
    category: CategoryFilter,
  ) => {
    setSelectedCategory(category);
    setVisibleCount(INITIAL_VISIBLE_ITEMS);
  };

  const visibleCategories =
    useMemo(
      () =>
        categoryOrder.filter(
          (category) =>
            items.some(
              (item) =>
                item.category === category,
            ),
        ),
      [items],
    );

  const filteredItems =
    selectedCategory === "all"
      ? items
      : items.filter(
          (item) =>
            item.category === selectedCategory,
        );

  const visibleItems =
    filteredItems.slice(
      0,
      visibleCount,
    );

  return (
    <>
      <div
        className="mt-10 flex flex-wrap gap-2"
        aria-label="Filtrar noticias por deporte"
      >
        <button
          type="button"
          onClick={() =>
            selectCategory("all")
          }
          className={`rounded-full px-4 py-2.5 text-sm font-black transition focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-blue-200 ${
            selectedCategory === "all"
              ? "bg-[#0b2050] text-white"
              : "border border-slate-300 bg-white text-slate-700 hover:border-blue-400"
          }`}
        >
          Destacadas ({items.length})
        </button>

        {visibleCategories.map((category) => {
          const presentation =
            categoryPresentation[category];

          const count =
            items.filter(
              (item) =>
                item.category === category,
            ).length;

          return (
            <button
              key={category}
              type="button"
              onClick={() =>
                selectCategory(category)
              }
              className={`rounded-full px-4 py-2.5 text-sm font-black transition focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-blue-200 ${
                selectedCategory === category
                  ? presentation.badge
                  : "border border-slate-300 bg-white text-slate-700 hover:border-blue-400"
              }`}
            >
              {presentation.icon}{" "}
              {presentation.label} ({count})
            </button>
          );
        })}
      </div>

      <p
        className="mt-6 text-sm font-semibold text-slate-500"
        aria-live="polite"
      >
        Mostrando {visibleItems.length} de{" "}
        {filteredItems.length}{" "}
        {filteredItems.length === 1
          ? "noticia"
          : "noticias"}.
      </p>

      <div className="mt-5 grid gap-6 md:grid-cols-2 xl:grid-cols-3">
        {visibleItems.map((item) => (
          <SportsNewsCard
            key={item.id}
            item={item}
          />
        ))}
      </div>

      {visibleItems.length < filteredItems.length ? (
        <div className="mt-10 flex justify-center">
          <button
            type="button"
            onClick={() =>
              setVisibleCount(
                (currentCount) =>
                  currentCount +
                  LOAD_MORE_ITEMS,
              )
            }
            className="inline-flex min-h-12 items-center rounded-xl bg-orange-600 px-7 py-3 font-black text-white shadow-lg shadow-orange-950/20 transition hover:-translate-y-0.5 hover:bg-orange-700 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-orange-200"
          >
            Mostrar más noticias
          </button>
        </div>
      ) : null}
    </>
  );
}