import { readFile } from "node:fs/promises";
import path from "node:path";

import { getAuthAccess } from "@/features/auth/server/access";
import { getMiniAppBySlug } from "@/features/apps/data/miniApps";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const securityHeaders = {
  "Cache-Control": "private, no-store, max-age=0",
  "Content-Security-Policy": "default-src 'none'; script-src 'unsafe-inline'; style-src 'unsafe-inline' https://fonts.googleapis.com; font-src https://fonts.gstatic.com data:; img-src data: blob:; media-src data: blob:; connect-src data:; object-src 'none'; base-uri 'none'; form-action 'none'; frame-ancestors 'self'",
  "Content-Type": "text/html; charset=utf-8",
  "Referrer-Policy": "no-referrer",
  "X-Content-Type-Options": "nosniff",
};

function messagePage(title: string, message: string, status: number) {
  const html = `<!doctype html><html lang="es"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${title}</title><body style="margin:0;font-family:system-ui;background:#f8fafc;color:#0f172a;display:grid;min-height:100vh;place-items:center;padding:24px;box-sizing:border-box"><main style="max-width:620px;background:white;border:1px solid #e2e8f0;border-radius:24px;padding:32px;text-align:center;box-shadow:0 18px 50px rgba(15,23,42,.1)"><div style="font-size:48px">🔒</div><h1>${title}</h1><p style="line-height:1.7;color:#475569">${message}</p></main></body></html>`;
  return new Response(html, { status, headers: securityHeaders });
}

interface MiniAppRouteContext {
  params: Promise<{ slug: string }>;
}

export async function GET(_request: Request, context: MiniAppRouteContext) {
  const { slug } = await context.params;
  const app = getMiniAppBySlug(slug);

  if (!app?.embeddedAsset) return messagePage("Herramienta no encontrada", "La miniapp solicitada no existe.", 404);

  const access = await getAuthAccess();

  if (!access.configured) return messagePage("Configuración pendiente", "Conecta Supabase para habilitar el acceso Pro.", 503);
  if (!access.authenticated) return messagePage("Inicia sesión", "Necesitas una cuenta para abrir esta herramienta.", 401);
  if (app.plan === "Pro" && !access.hasProAccess) return messagePage("Plan Pro requerido", "Tu cuenta actual no tiene acceso a esta herramienta.", 403);

  const filePath = path.join(process.cwd(), "private", "miniapps", app.embeddedAsset);

  try {
    const html = await readFile(filePath, "utf8");
    return new Response(html, { status: 200, headers: securityHeaders });
  } catch {
    return messagePage("Herramienta no disponible", "No pudimos cargar el archivo de esta miniapp.", 500);
  }
}
