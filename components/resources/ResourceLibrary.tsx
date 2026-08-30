"use client";

import { useMemo, useState } from "react";

import ResourceCard from "@/components/resources/ResourceCard";
import type {
  Resource,
  ResourceCategory,
  ResourceFormat,
  ResourceLevel,
} from "@/types/Resource";
import type { ResourceStats } from "@/features/resources/server/library";

interface ResourceLibraryProps {
  resources: Resource[];
  authenticated: boolean;
  favoriteSlugs: string[];
  resourceStats: Record<string, ResourceStats>;
}

type PremiumFilter = "Todos" | "Gratuitos" | "Premium";
type InclusionFilter = "Todos" | "DUA" | "NEE" | "DUA y NEE";

const ALL_CATEGORIES = "Todas";
const ALL_LEVELS = "Todos";
const ALL_FORMATS = "Todos";

function normalizeText(value: string): string {
  return value
    .toLocaleLowerCase("es")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
}

function sortResources(resources: Resource[]): Resource[] {
  return [...resources].sort((firstResource, secondResource) => {
    if (firstResource.featured !== secondResource.featured) {
      return Number(secondResource.featured) - Number(firstResource.featured);
    }

    return secondResource.downloads - firstResource.downloads;
  });
}

export default function ResourceLibrary({
  resources,
  authenticated,
  favoriteSlugs,
  resourceStats,
}: ResourceLibraryProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] =
    useState<string>(ALL_CATEGORIES);
  const [selectedLevel, setSelectedLevel] =
    useState<string>(ALL_LEVELS);
  const [premiumFilter, setPremiumFilter] =
    useState<PremiumFilter>("Todos");
  const [selectedFormat, setSelectedFormat] = useState<string>(ALL_FORMATS);
  const [inclusionFilter, setInclusionFilter] = useState<InclusionFilter>("Todos");
  const [favoritesOnly, setFavoritesOnly] = useState(false);
  const favoriteSet = useMemo(() => new Set(favoriteSlugs), [favoriteSlugs]);

  const categories = useMemo(() => {
    const uniqueCategories = new Set<ResourceCategory>();

    resources.forEach((resource) => {
      resource.categories.forEach((category) => {
        uniqueCategories.add(category);
      });
    });

    return Array.from(uniqueCategories).sort((first, second) =>
      first.localeCompare(second, "es"),
    );
  }, [resources]);

  const levels = useMemo(() => {
    const uniqueLevels = new Set<ResourceLevel>();

    resources.forEach((resource) => {
      resource.levels.forEach((level) => {
        uniqueLevels.add(level);
      });
    });

    return Array.from(uniqueLevels);
  }, [resources]);

  const formats = useMemo(() => {
    const uniqueFormats = new Set<ResourceFormat>();
    resources.forEach((resource) => resource.formats.forEach((format) => uniqueFormats.add(format)));
    return Array.from(uniqueFormats).sort((first, second) => first.localeCompare(second, "es"));
  }, [resources]);

  const filteredResources = useMemo(() => {
    const normalizedSearchTerm = normalizeText(searchTerm.trim());

    const matchingResources = resources.filter((resource) => {
      const searchableContent = normalizeText(
        [
          resource.title,
          resource.summary,
          resource.description,
          resource.author,
          ...resource.categories,
          ...resource.levels,
          ...resource.formats,
          ...resource.tags,
          ...(resource.competencies ?? []),
        ].join(" "),
      );

      const matchesSearch =
        normalizedSearchTerm.length === 0 ||
        searchableContent.includes(normalizedSearchTerm);

      const matchesCategory =
        selectedCategory === ALL_CATEGORIES ||
        resource.categories.includes(
          selectedCategory as ResourceCategory,
        );

      const matchesLevel =
        selectedLevel === ALL_LEVELS ||
        resource.levels.includes(selectedLevel as ResourceLevel);

      const matchesPremium =
        premiumFilter === "Todos" ||
        (premiumFilter === "Premium" && resource.premium) ||
        (premiumFilter === "Gratuitos" && !resource.premium);

      const matchesFormat =
        selectedFormat === ALL_FORMATS || resource.formats.includes(selectedFormat as ResourceFormat);

      const matchesInclusion =
        inclusionFilter === "Todos" ||
        (inclusionFilter === "DUA" && resource.dua) ||
        (inclusionFilter === "NEE" && resource.nee) ||
        (inclusionFilter === "DUA y NEE" && resource.dua && resource.nee);

      const matchesFavorites = !favoritesOnly || favoriteSet.has(resource.slug);

      return (
        matchesSearch &&
        matchesCategory &&
        matchesLevel &&
        matchesPremium &&
        matchesFormat &&
        matchesInclusion &&
        matchesFavorites
      );
    });

    return sortResources(matchingResources);
  }, [
    premiumFilter,
    resources,
    searchTerm,
    selectedCategory,
    selectedLevel,
    selectedFormat,
    inclusionFilter,
    favoritesOnly,
    favoriteSet,
  ]);

  const activeFiltersCount = [
    searchTerm.trim().length > 0,
    selectedCategory !== ALL_CATEGORIES,
    selectedLevel !== ALL_LEVELS,
    premiumFilter !== "Todos",
    selectedFormat !== ALL_FORMATS,
    inclusionFilter !== "Todos",
    favoritesOnly,
  ].filter(Boolean).length;

  function clearFilters(): void {
    setSearchTerm("");
    setSelectedCategory(ALL_CATEGORIES);
    setSelectedLevel(ALL_LEVELS);
    setPremiumFilter("Todos");
    setSelectedFormat(ALL_FORMATS);
    setInclusionFilter("Todos");
    setFavoritesOnly(false);
  }

  return (
    <section aria-labelledby="resource-library-title">
      <div className="mb-8 rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-7">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-orange-600">
              Catálogo educativo
            </p>

            <h2
              id="resource-library-title"
              className="mt-2 text-2xl font-bold tracking-tight text-slate-950 sm:text-3xl"
            >
              Explora la biblioteca
            </h2>

            <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">
              Busca materiales por tema, nivel educativo o tipo de
              acceso.
            </p>
          </div>

          <p
            className="text-sm font-semibold text-slate-600"
            aria-live="polite"
          >
            {filteredResources.length}{" "}
            {filteredResources.length === 1
              ? "recurso encontrado"
              : "recursos encontrados"}
          </p>
        </div>

        <div className="mt-6 grid gap-4 lg:grid-cols-6">
          <div className="lg:col-span-2">
            <label
              htmlFor="resource-search"
              className="mb-2 block text-sm font-semibold text-slate-700"
            >
              Buscar recursos
            </label>

            <div className="relative">
              <span
                aria-hidden="true"
                className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2"
              >
                🔎
              </span>

              <input
                id="resource-search"
                type="search"
                value={searchTerm}
                onChange={(event) => setSearchTerm(event.target.value)}
                placeholder="Ejemplo: baloncesto, DUA, rúbrica..."
                className="min-h-12 w-full rounded-xl border border-slate-300 bg-white py-3 pl-11 pr-4 text-sm text-slate-950 outline-none transition placeholder:text-slate-400 focus:border-orange-500 focus:ring-4 focus:ring-orange-100"
              />
            </div>
          </div>

          <div>
            <label
              htmlFor="resource-category"
              className="mb-2 block text-sm font-semibold text-slate-700"
            >
              Categoría
            </label>

            <select
              id="resource-category"
              value={selectedCategory}
              onChange={(event) =>
                setSelectedCategory(event.target.value)
              }
              className="min-h-12 w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-700 outline-none transition focus:border-orange-500 focus:ring-4 focus:ring-orange-100"
            >
              <option value={ALL_CATEGORIES}>
                Todas las categorías
              </option>

              {categories.map((category) => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label
              htmlFor="resource-level"
              className="mb-2 block text-sm font-semibold text-slate-700"
            >
              Nivel educativo
            </label>

            <select
              id="resource-level"
              value={selectedLevel}
              onChange={(event) =>
                setSelectedLevel(event.target.value)
              }
              className="min-h-12 w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-700 outline-none transition focus:border-orange-500 focus:ring-4 focus:ring-orange-100"
            >
              <option value={ALL_LEVELS}>Todos los niveles</option>

              {levels.map((level) => (
                <option key={level} value={level}>
                  {level}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="resource-format" className="mb-2 block text-sm font-semibold text-slate-700">Formato</label>
            <select id="resource-format" value={selectedFormat} onChange={(event) => setSelectedFormat(event.target.value)} className="min-h-12 w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-700 outline-none transition focus:border-orange-500 focus:ring-4 focus:ring-orange-100">
              <option value={ALL_FORMATS}>Todos los formatos</option>
              {formats.map((format) => <option key={format} value={format}>{format}</option>)}
            </select>
          </div>

          <div>
            <label htmlFor="resource-inclusion" className="mb-2 block text-sm font-semibold text-slate-700">Inclusión</label>
            <select id="resource-inclusion" value={inclusionFilter} onChange={(event) => setInclusionFilter(event.target.value as InclusionFilter)} className="min-h-12 w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-700 outline-none transition focus:border-orange-500 focus:ring-4 focus:ring-orange-100">
              {(["Todos", "DUA", "NEE", "DUA y NEE"] as InclusionFilter[]).map((option) => <option key={option} value={option}>{option === "Todos" ? "Toda inclusión" : option}</option>)}
            </select>
          </div>
        </div>

        <div className="mt-5 flex flex-col gap-4 border-t border-slate-100 pt-5 sm:flex-row sm:items-center sm:justify-between">
          <fieldset>
            <legend className="mb-2 text-sm font-semibold text-slate-700">
              Tipo de acceso
            </legend>

            <div className="flex flex-wrap gap-2">
              {(["Todos", "Gratuitos", "Premium"] as PremiumFilter[]).map(
                (option) => {
                  const isActive = premiumFilter === option;

                  return (
                    <button
                      key={option}
                      type="button"
                      onClick={() => setPremiumFilter(option)}
                      aria-pressed={isActive}
                      className={`rounded-full border px-4 py-2 text-sm font-semibold transition focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 ${
                        isActive
                          ? "border-slate-950 bg-slate-950 text-white"
                          : "border-slate-200 bg-white text-slate-600 hover:border-orange-300 hover:text-orange-700"
                      }`}
                    >
                      {option}
                    </button>
                  );
                },
              )}
              <button
                type="button"
                onClick={() => authenticated ? setFavoritesOnly((current) => !current) : window.location.assign("/login?next=/resources")}
                aria-pressed={favoritesOnly}
                className={`rounded-full border px-4 py-2 text-sm font-semibold transition focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 ${favoritesOnly ? "border-rose-500 bg-rose-500 text-white" : "border-slate-200 bg-white text-slate-600 hover:border-rose-300 hover:text-rose-700"}`}
              >
                ♥ Mis favoritos
              </button>
            </div>
          </fieldset>

          {activeFiltersCount > 0 && (
            <button
              type="button"
              onClick={clearFilters}
              className="inline-flex min-h-10 items-center justify-center rounded-xl px-4 py-2 text-sm font-semibold text-orange-700 transition hover:bg-orange-50 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2"
            >
              Limpiar filtros ({activeFiltersCount})
            </button>
          )}
        </div>
      </div>

      {filteredResources.length > 0 ? (
        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {filteredResources.map((resource) => (
            <ResourceCard
              key={resource.id}
              resource={resource}
              favorite={favoriteSet.has(resource.slug)}
              stats={resourceStats[resource.slug] ?? { views: 0, downloads: 0 }}
            />
          ))}
        </div>
      ) : (
        <div className="rounded-3xl border border-dashed border-slate-300 bg-white px-6 py-16 text-center">
          <div
            aria-hidden="true"
            className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-slate-100 text-3xl"
          >
            🔍
          </div>

          <h3 className="mt-5 text-xl font-bold text-slate-950">
            No encontramos recursos
          </h3>

          <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-600">
            Prueba con otra palabra o elimina algunos filtros para
            ampliar los resultados.
          </p>

          <button
            type="button"
            onClick={clearFilters}
            className="mt-6 inline-flex min-h-11 items-center justify-center rounded-xl bg-slate-950 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-orange-600 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2"
          >
            Mostrar todos los recursos
          </button>
        </div>
      )}
    </section>
  );
}
