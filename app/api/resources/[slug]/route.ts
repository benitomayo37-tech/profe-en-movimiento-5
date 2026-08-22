import { NextResponse } from "next/server";

import { getAuthAccess } from "@/features/auth/server/access";
import { getLibraryResourceBySlug } from "@/features/resources/server/catalog";
import { createClient } from "@/lib/supabase/server";

export const runtime = "nodejs";

function parseStorageLocation(value: string) {
  if (!value.startsWith("storage://")) return null;
  const location = value.slice("storage://".length);
  const separator = location.indexOf("/");
  if (separator < 1) return null;
  return {
    bucket: location.slice(0, separator),
    path: location.slice(separator + 1),
  };
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ slug: string }> },
) {
  const { slug } = await params;
  const resource = await getLibraryResourceBySlug(slug);
  if (!resource) {
    return NextResponse.json({ error: "Recurso no encontrado." }, { status: 404 });
  }

  const body = (await request.json().catch(() => null)) as { action?: unknown } | null;
  const action = body?.action;
  const supabase = await createClient();
  if (!supabase) return NextResponse.json({ error: "Supabase no está configurado." }, { status: 503 });

  if (action === "download") {
    if (!resource.downloadUrl) {
      return NextResponse.json({ error: "Este recurso todavía no tiene un archivo disponible." }, { status: 404 });
    }

    const access = await getAuthAccess();
    if (resource.premium && !access.authenticated) {
      return NextResponse.json({ error: "Debes iniciar sesión para descargar este recurso Premium." }, { status: 401 });
    }
    if (resource.premium && !access.hasProAccess) {
      return NextResponse.json({ error: "Este recurso requiere acceso Pro." }, { status: 403 });
    }

    let downloadUrl = resource.downloadUrl;
    const storageLocation = parseStorageLocation(resource.downloadUrl);
    if (storageLocation) {
      if (storageLocation.bucket === "recursos-premium") {
        const { data, error } = await supabase.storage
          .from(storageLocation.bucket)
          .createSignedUrl(storageLocation.path, 120, { download: true });
        if (error || !data?.signedUrl) {
          return NextResponse.json({ error: "No se pudo autorizar la descarga." }, { status: 500 });
        }
        downloadUrl = data.signedUrl;
      } else if (storageLocation.bucket === "recursos-publicos") {
        const { data } = supabase.storage
          .from(storageLocation.bucket)
          .getPublicUrl(storageLocation.path, { download: true });
        downloadUrl = data.publicUrl;
      } else {
        return NextResponse.json({ error: "Ubicación de archivo no permitida." }, { status: 400 });
      }
    }

    const { data, error } = await supabase.rpc("record_resource_event", {
      p_resource_slug: slug,
      p_event_type: "download",
    });
    if (error) return NextResponse.json({ error: "No se pudo registrar la actividad." }, { status: 500 });
    const stats = Array.isArray(data) ? data[0] : data;
    return NextResponse.json({ success: true, stats, downloadUrl });
  }

  if (action === "view") {
    const { data, error } = await supabase.rpc("record_resource_event", {
      p_resource_slug: slug,
      p_event_type: "view",
    });
    if (error) return NextResponse.json({ error: "No se pudo registrar la actividad." }, { status: 500 });
    const stats = Array.isArray(data) ? data[0] : data;
    return NextResponse.json({ success: true, stats });
  }

  if (action === "favorite" || action === "unfavorite") {
    const access = await getAuthAccess();
    if (!access.authenticated || !access.userId) {
      return NextResponse.json({ error: "Debes iniciar sesión." }, { status: 401 });
    }

    const query = action === "favorite"
      ? supabase.from("resource_favorites").upsert({ user_id: access.userId, resource_slug: slug })
      : supabase.from("resource_favorites").delete().eq("user_id", access.userId).eq("resource_slug", slug);
    const { error } = await query;
    if (error) return NextResponse.json({ error: "No se pudo actualizar favoritos." }, { status: 500 });
    return NextResponse.json({ success: true, favorite: action === "favorite" });
  }

  return NextResponse.json({ error: "Acción no válida." }, { status: 400 });
}
