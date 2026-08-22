import "server-only";

import { createClient } from "@/lib/supabase/server";

export interface ResourceStats {
  views: number;
  downloads: number;
}

export async function getResourceLibraryState(userId: string | null) {
  const supabase = await createClient();
  if (!supabase) return { favoriteSlugs: [] as string[], stats: {} as Record<string, ResourceStats> };

  const [favoritesResult, statsResult] = await Promise.all([
    userId
      ? supabase.from("resource_favorites").select("resource_slug").eq("user_id", userId)
      : Promise.resolve({ data: [], error: null }),
    supabase.from("resource_stats").select("resource_slug, view_count, download_count"),
  ]);

  if (favoritesResult.error && favoritesResult.error.code !== "42P01") {
    console.warn("[Recursos] No se pudieron consultar favoritos:", favoritesResult.error.message);
  }
  if (statsResult.error && statsResult.error.code !== "42P01") {
    console.warn("[Recursos] No se pudieron consultar estadísticas:", statsResult.error.message);
  }

  const stats: Record<string, ResourceStats> = Object.fromEntries(
    (statsResult.data ?? []).map((row) => [
      row.resource_slug,
      { views: Number(row.view_count) || 0, downloads: Number(row.download_count) || 0 },
    ]),
  );

  return {
    favoriteSlugs: (favoritesResult.data ?? []).map((row) => row.resource_slug),
    stats,
  };
}
