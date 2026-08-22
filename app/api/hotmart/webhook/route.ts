import { timingSafeEqual } from "node:crypto";

import { NextResponse } from "next/server";

import {
  getConfiguredProProductIds,
  parseHotmartWebhook,
} from "@/features/hotmart/server/parseHotmartWebhook";
import { createAdminClient } from "@/lib/supabase/admin";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const MAX_BODY_SIZE = 256_000;

function tokensMatch(received: string | null, expected: string) {
  if (!received) return false;

  const receivedBuffer = Buffer.from(received.trim());
  const expectedBuffer = Buffer.from(expected);

  return receivedBuffer.length === expectedBuffer.length
    && timingSafeEqual(receivedBuffer, expectedBuffer);
}

function json(message: string, status: number, extra: Record<string, unknown> = {}) {
  return NextResponse.json(
    { success: status < 400, message, ...extra },
    {
      status,
      headers: {
        "Cache-Control": "no-store",
        "X-Content-Type-Options": "nosniff",
      },
    },
  );
}

export async function POST(request: Request) {
  const hottok = process.env.HOTMART_HOTTOK?.trim();
  const configuredProducts = getConfiguredProProductIds();
  const admin = createAdminClient();

  if (!hottok || configuredProducts.size === 0 || !admin) {
    return json("La integración comercial todavía no está configurada.", 503);
  }

  const declaredLength = Number(request.headers.get("content-length") ?? 0);
  if (Number.isFinite(declaredLength) && declaredLength > MAX_BODY_SIZE) {
    return json("Solicitud demasiado grande.", 413);
  }

  if (!tokensMatch(request.headers.get("x-hotmart-hottok"), hottok)) {
    return json("Notificación no autorizada.", 401);
  }

  const rawBody = await request.text();
  if (Buffer.byteLength(rawBody, "utf8") > MAX_BODY_SIZE) {
    return json("Solicitud demasiado grande.", 413);
  }

  let payload: unknown;
  try {
    payload = JSON.parse(rawBody);
  } catch {
    return json("El contenido recibido no es JSON válido.", 400);
  }

  const event = parseHotmartWebhook(payload, rawBody);
  if (!event) {
    return json("Evento reconocido sin cambios de acceso.", 200, { processed: false });
  }

  if (!configuredProducts.has(event.productId)) {
    return json("Producto sin acceso Pro asociado.", 200, { processed: false });
  }

  const { data, error } = await admin.rpc("process_hotmart_access_event", {
    p_action: event.action,
    p_buyer_email: event.buyerEmail,
    p_entitlement_key: event.entitlementKey,
    p_event_id: event.eventId,
    p_event_name: event.eventName,
    p_product_id: event.productId,
  });

  if (error) {
    console.error("[Hotmart] No se pudo procesar la notificación.", error.code);
    return json("No se pudo procesar la notificación.", 500);
  }

  return json("Notificación procesada.", 200, {
    processed: true,
    result: data,
  });
}
