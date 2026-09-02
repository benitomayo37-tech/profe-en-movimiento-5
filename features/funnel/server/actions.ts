"use server";

import { createAdminClient } from "@/lib/supabase/admin";
import type { LeadCaptureState } from "@/features/funnel/types";

const RESOURCE_KEY = "kit-clase-45-minutos-4-balones";

function value(formData: FormData, key: string) {
  return String(formData.get(key) ?? "").trim();
}

function cleanTrackingValue(input: string, fallback: string | null = null) {
  const cleaned = input.replace(/[^a-zA-Z0-9áéíóúÁÉÍÓÚñÑ_.\- ]/g, "").slice(0, 100);
  return cleaned || fallback;
}

export async function captureFreeResourceLead(_previous: LeadCaptureState, formData: FormData): Promise<LeadCaptureState> {
  const fullName = value(formData, "fullName");
  const email = value(formData, "email").toLocaleLowerCase("es");
  const profileType = value(formData, "profileType");
  const consent = formData.get("consent") === "on";
  const website = value(formData, "website");
  const fieldErrors: LeadCaptureState["fieldErrors"] = {};

  if (website) return { status: "success", message: "Tu recurso está listo." };
  if (fullName.length < 2 || fullName.length > 120) fieldErrors.fullName = "Escribe un nombre válido.";
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || email.length > 254) fieldErrors.email = "Escribe un correo electrónico válido.";
  if (!["teacher", "trainer", "other"].includes(profileType)) fieldErrors.profileType = "Selecciona tu perfil.";
  if (!consent) fieldErrors.consent = "Necesitamos tu autorización para entregar el recurso y enviarte contenidos relacionados.";
  if (Object.keys(fieldErrors).length) return { status: "error", message: "Revisa los datos indicados.", fieldErrors };

  const admin = createAdminClient();
  if (!admin) return { status: "error", message: "El registro no está disponible en este momento." };

  const source = cleanTrackingValue(value(formData, "source"), "direct") ?? "direct";
  const { data: lead, error } = await admin.from("marketing_leads").upsert({
    full_name: fullName,
    email,
    profile_type: profileType,
    resource_key: RESOURCE_KEY,
    source,
    utm_source: cleanTrackingValue(value(formData, "utmSource")),
    utm_medium: cleanTrackingValue(value(formData, "utmMedium")),
    utm_campaign: cleanTrackingValue(value(formData, "utmCampaign")),
    consent_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  }, { onConflict: "email,resource_key" }).select("download_token").single();

  if (error) {
    console.error("[Embudo] No se pudo registrar el lead.", error);
    return { status: "error", message: "No pudimos preparar el recurso. Inténtalo nuevamente." };
  }

  await admin.rpc("link_existing_marketing_lead", { p_email: email });
  return {
    status: "success",
    message: "Tu recurso está listo.",
    downloadUrl: `/api/funnel/download/${lead.download_token}`,
  };
}
