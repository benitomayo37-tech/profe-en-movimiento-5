import "server-only";

import { resources as fallbackResources } from "@/lib/data/resources";
import { createClient } from "@/lib/supabase/server";
import type { Resource } from "@/types/Resource";

interface LibraryResourceRow {
  id: string;
  slug: string;
  title: string;
  summary: string;
  description: string;
  categories: string[];
  levels: string[];
  formats: string[];
  difficulty: string;
  language: string;
  duration: string | null;
  competencies: string[];
  tags: string[];
  quality: string[];
  cover_image: string | null;
  download_url: string | null;
  preview_url: string | null;
  featured: boolean;
  featured_order: number | null;
  premium: boolean;
  published: boolean;
  verified: boolean;
  editors_choice: boolean;
  ai_ready: boolean;
  dua: boolean;
  nee: boolean;
  author: string;
  version: string;
  rating: number | string;
  created_at: string;
  updated_at: string;
}

export interface AdminLibraryResource extends Resource {
  databaseId: string;
  published: boolean;
}

function dateOnly(value: string) {
  return value.slice(0, 10);
}

function rowToResource(row: LibraryResourceRow): AdminLibraryResource {
  return {
    databaseId: row.id,
    id: row.id,
    slug: row.slug,
    title: row.title,
    summary: row.summary,
    description: row.description,
    categories: row.categories as Resource["categories"],
    levels: row.levels as Resource["levels"],
    formats: row.formats as Resource["formats"],
    difficulty: row.difficulty as Resource["difficulty"],
    language: row.language as Resource["language"],
    duration: row.duration ?? undefined,
    competencies: row.competencies,
    tags: row.tags,
    coverImage: row.cover_image ?? undefined,
    downloadUrl: row.download_url ?? undefined,
    previewUrl: row.preview_url ?? undefined,
    quality: row.quality as Resource["quality"],
    featured: row.featured,
    featuredOrder: row.featured_order ?? undefined,
    premium: row.premium,
    published: row.published,
    verified: row.verified,
    editorsChoice: row.editors_choice,
    aiReady: row.ai_ready,
    downloads: 0,
    likes: 0,
    rating: Number(row.rating) || 0,
    dua: row.dua,
    nee: row.nee,
    author: row.author,
    version: row.version,
    createdAt: dateOnly(row.created_at),
    updatedAt: dateOnly(row.updated_at),
  };
}

export function resourceToDatabaseRow(resource: Resource) {
  return {
    slug: resource.slug,
    title: resource.title,
    summary: resource.summary,
    description: resource.description,
    categories: resource.categories,
    levels: resource.levels,
    formats: resource.formats,
    difficulty: resource.difficulty,
    language: resource.language,
    duration: resource.duration ?? null,
    competencies: resource.competencies ?? [],
    tags: resource.tags,
    quality: resource.quality,
    cover_image: resource.coverImage ?? null,
    download_url: resource.downloadUrl ?? null,
    preview_url: resource.previewUrl ?? null,
    featured: resource.featured,
    featured_order: resource.featuredOrder ?? null,
    premium: resource.premium,
    published: true,
    verified: resource.verified,
    editors_choice: resource.editorsChoice,
    ai_ready: resource.aiReady,
    dua: resource.dua,
    nee: resource.nee,
    author: resource.author,
    version: resource.version,
    rating: resource.rating,
    created_at: `${resource.createdAt}T00:00:00.000Z`,
    updated_at: `${resource.updatedAt}T00:00:00.000Z`,
  };
}

async function catalogInitialized() {
  const supabase = await createClient();
  if (!supabase) return false;
  const { data, error } = await supabase
    .from("library_catalog_state")
    .select("initialized")
    .eq("id", true)
    .maybeSingle();
  if (error) return false;
  return data?.initialized === true;
}

export async function getLibraryResources(): Promise<Resource[]> {
  if (!(await catalogInitialized())) return fallbackResources;
  const supabase = await createClient();
  if (!supabase) return fallbackResources;

  const { data, error } = await supabase
    .from("library_resources")
    .select("*")
    .eq("published", true)
    .order("featured", { ascending: false })
    .order("featured_order", { ascending: true, nullsFirst: false })
    .order("updated_at", { ascending: false });

  if (error) {
    console.warn("[Biblioteca] No se pudo cargar el catálogo administrable:", error.message);
    return fallbackResources;
  }
  return ((data ?? []) as LibraryResourceRow[]).map(rowToResource);
}

export async function getLibraryResourceBySlug(
  slug: string,
  includeUnpublished = false,
): Promise<Resource | null> {
  if (!(await catalogInitialized())) {
    return fallbackResources.find((resource) => resource.slug === slug) ?? null;
  }
  const supabase = await createClient();
  if (!supabase) return null;
  let query = supabase.from("library_resources").select("*").eq("slug", slug);
  if (!includeUnpublished) query = query.eq("published", true);
  const { data, error } = await query.maybeSingle();
  if (error || !data) return null;
  return rowToResource(data as LibraryResourceRow);
}

export async function getAdminLibraryResources(): Promise<AdminLibraryResource[]> {
  const supabase = await createClient();
  if (!supabase) return [];
  const { data, error } = await supabase
    .from("library_resources")
    .select("*")
    .order("updated_at", { ascending: false });
  if (error) return [];
  return ((data ?? []) as LibraryResourceRow[]).map(rowToResource);
}

export { fallbackResources };
