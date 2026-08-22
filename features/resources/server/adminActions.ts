"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { getAuthAccess } from "@/features/auth/server/access";
import { fallbackResources, resourceToDatabaseRow } from "@/features/resources/server/catalog";
import { createClient } from "@/lib/supabase/server";

function text(formData: FormData, name: string, maxLength: number) {
  const value = formData.get(name);
  return typeof value === "string" ? value.trim().slice(0, maxLength) : "";
}

function list(formData: FormData, name: string) {
  return text(formData, name, 2000)
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
}

function checked(formData: FormData, name: string) {
  return formData.get(name) === "on";
}

async function requireAdmin() {
  const access = await getAuthAccess();
  if (!access.authenticated || access.role !== "admin") return null;
  return createClient();
}

export async function importCurrentCatalogAction() {
  const supabase = await requireAdmin();
  if (!supabase) redirect("/login?returnTo=/resources/admin");

  const { data: existingResources, error: readError } = await supabase
    .from("library_resources")
    .select("slug");
  if (readError) throw new Error(`No se pudo comprobar el catálogo: ${readError.message}`);

  const existingSlugs = new Set(
    (existingResources ?? []).map((resource) => resource.slug),
  );
  const missingResources = fallbackResources
    .filter((resource) => !existingSlugs.has(resource.slug))
    .map(resourceToDatabaseRow);

  if (missingResources.length > 0) {
    const { error } = await supabase
      .from("library_resources")
      .insert(missingResources);
    if (error) throw new Error(`No se pudo importar el catálogo: ${error.message}`);
  }

  const { error: stateError } = await supabase
    .from("library_catalog_state")
    .update({ initialized: true, updated_at: new Date().toISOString() })
    .eq("id", true);
  if (stateError) throw new Error(`No se pudo activar el catálogo: ${stateError.message}`);

  revalidatePath("/resources");
  revalidatePath("/resources/admin");
  redirect("/resources/admin?imported=1");
}

export async function saveResourceAction(formData: FormData) {
  const supabase = await requireAdmin();
  if (!supabase) redirect("/login?returnTo=/resources/admin");

  const databaseId = text(formData, "databaseId", 80);
  const slug = text(formData, "slug", 160).toLowerCase();
  const downloadUrl = text(formData, "downloadUrl", 1000);
  const validDownloadLocation = !downloadUrl
    || downloadUrl.startsWith("https://")
    || downloadUrl.startsWith("storage://recursos-publicos/")
    || downloadUrl.startsWith("storage://recursos-premium/");
  if (!validDownloadLocation) {
    redirect(`/resources/admin?error=download${databaseId ? `&edit=${databaseId}` : ""}`);
  }
  const payload = {
    slug,
    title: text(formData, "title", 180),
    summary: text(formData, "summary", 500),
    description: text(formData, "description", 5000),
    categories: list(formData, "categories"),
    levels: list(formData, "levels"),
    formats: list(formData, "formats"),
    difficulty: text(formData, "difficulty", 40) || "Intermedio",
    language: "Español",
    duration: text(formData, "duration", 100) || null,
    competencies: list(formData, "competencies"),
    tags: list(formData, "tags"),
    quality: list(formData, "quality"),
    download_url: downloadUrl || null,
    featured: checked(formData, "featured"),
    premium: checked(formData, "premium"),
    published: checked(formData, "published"),
    verified: checked(formData, "verified"),
    editors_choice: checked(formData, "editorsChoice"),
    ai_ready: checked(formData, "aiReady"),
    dua: checked(formData, "dua"),
    nee: checked(formData, "nee"),
    author: text(formData, "author", 160) || "Profe en Movimiento",
    version: text(formData, "version", 30) || "1.0",
    updated_at: new Date().toISOString(),
  };

  if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug)) {
    redirect(`/resources/admin?error=slug${databaseId ? `&edit=${databaseId}` : ""}`);
  }

  const query = databaseId
    ? supabase.from("library_resources").update(payload).eq("id", databaseId)
    : supabase.from("library_resources").insert(payload);
  const { error } = await query;
  if (error) redirect(`/resources/admin?error=save${databaseId ? `&edit=${databaseId}` : ""}`);

  await supabase
    .from("library_catalog_state")
    .update({ initialized: true, updated_at: new Date().toISOString() })
    .eq("id", true);

  revalidatePath("/resources");
  revalidatePath(`/resources/${slug}`);
  revalidatePath("/resources/admin");
  redirect("/resources/admin?saved=1");
}

export async function toggleResourcePublishedAction(formData: FormData) {
  const supabase = await requireAdmin();
  if (!supabase) redirect("/login?returnTo=/resources/admin");
  const databaseId = text(formData, "databaseId", 80);
  const published = formData.get("published") === "true";
  if (!databaseId) return;
  await supabase
    .from("library_resources")
    .update({ published: !published, updated_at: new Date().toISOString() })
    .eq("id", databaseId);
  revalidatePath("/resources");
  revalidatePath("/resources/admin");
}

export async function toggleResourceFeaturedAction(formData: FormData) {
  const supabase = await requireAdmin();
  if (!supabase) redirect("/login?returnTo=/resources/admin");
  const databaseId = text(formData, "databaseId", 80);
  const featured = formData.get("featured") === "true";
  if (!databaseId) return;
  await supabase
    .from("library_resources")
    .update({ featured: !featured, updated_at: new Date().toISOString() })
    .eq("id", databaseId);
  revalidatePath("/resources");
  revalidatePath("/resources/admin");
}
