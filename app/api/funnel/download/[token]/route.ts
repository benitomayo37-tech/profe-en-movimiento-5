import { NextResponse } from "next/server";

import { createAdminClient } from "@/lib/supabase/admin";

const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export async function GET(request: Request, context: { params: Promise<{ token: string }> }) {
  const { token } = await context.params;
  const destination = new URL("/downloads/kit-clase-45-minutos-4-balones.pdf", request.url);

  if (!UUID_PATTERN.test(token)) return NextResponse.redirect(destination);

  const admin = createAdminClient();
  if (admin) {
    const { error } = await admin
      .from("marketing_leads")
      .update({ downloaded_at: new Date().toISOString(), updated_at: new Date().toISOString() })
      .eq("download_token", token);
    if (error) console.error("[Embudo] No se pudo registrar la descarga.", error);
  }

  return NextResponse.redirect(destination);
}
