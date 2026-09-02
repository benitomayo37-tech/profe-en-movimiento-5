"use server";

import { createAdminClient } from "@/lib/supabase/admin";

export interface UnsubscribeState {
  status: "idle" | "success" | "error";
  message?: string;
}

export async function unsubscribeMarketingLead(_previous: UnsubscribeState, formData: FormData): Promise<UnsubscribeState> {
  const token = String(formData.get("token") ?? "").trim();
  if (!/^[0-9a-f-]{36}$/i.test(token)) return { status: "error", message: "El enlace no es válido." };
  const admin = createAdminClient();
  if (!admin) return { status: "error", message: "No pudimos procesar la solicitud en este momento." };
  const now = new Date().toISOString();
  const { data: lead, error } = await admin.from("marketing_leads").update({ unsubscribed_at: now, updated_at: now }).eq("unsubscribe_token", token).select("id").maybeSingle();
  if (error || !lead) return { status: "error", message: "No pudimos encontrar esta suscripción." };
  await admin.from("marketing_email_deliveries").update({ status: "skipped", last_error: "unsubscribed", updated_at: now }).eq("lead_id", lead.id).in("status", ["pending", "failed"]);
  return { status: "success", message: "Tu correo fue retirado de esta secuencia. No recibirás nuevos mensajes del kit gratuito." };
}

