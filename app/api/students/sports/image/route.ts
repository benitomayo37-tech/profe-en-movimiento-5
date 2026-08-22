import { NextResponse } from "next/server";

export const runtime = "nodejs";

function allowedImageUrl(value: string) {
  try {
    const url = new URL(value);
    return url.protocol === "https:" && url.hostname === "upload.wikimedia.org" ? url : null;
  } catch {
    return null;
  }
}

export async function GET(request: Request) {
  const source = allowedImageUrl(new URL(request.url).searchParams.get("url") ?? "");
  if (!source) return NextResponse.json({ error: "Imagen no permitida." }, { status: 400 });

  try {
    const upstream = await fetch(source, {
      headers: { "User-Agent": "ProfeEnMovimiento/5.0 (educational visual support)" },
      signal: AbortSignal.timeout(7_000),
    });
    const contentType = upstream.headers.get("content-type") ?? "";
    const contentLength = Number(upstream.headers.get("content-length") ?? "0");
    if (!upstream.ok || !contentType.startsWith("image/") || contentLength > 8_000_000) {
      return NextResponse.json({ error: "No se pudo recuperar la imagen." }, { status: 502 });
    }

    return new NextResponse(upstream.body, {
      headers: {
        "Content-Type": contentType,
        "Cache-Control": "public, max-age=86400, s-maxage=604800, stale-while-revalidate=2592000",
        "X-Content-Type-Options": "nosniff",
      },
    });
  } catch {
    return NextResponse.json({ error: "No se pudo recuperar la imagen." }, { status: 502 });
  }
}
