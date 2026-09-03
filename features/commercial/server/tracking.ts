import "server-only";

import { createAdminClient } from "@/lib/supabase/admin";

export type CommercialEventType = "pro_interest" | "checkout_reached" | "hotmart_reached" | "pro_activated";

export function normalizeCommercialSource(value: string | null | undefined) {
  const normalized = value?.trim().toLowerCase().replace(/[^a-z0-9_-]/g, "").slice(0, 60);
  return normalized || "direct";
}

export async function recordCommercialEvent({
  userId,
  eventType,
  productId,
  source,
}: {
  userId: string | null;
  eventType: CommercialEventType;
  productId: string;
  source?: string | null;
}) {
  if (!userId) return;
  const admin = createAdminClient();
  if (!admin) return;

  const cleanSource = normalizeCommercialSource(source);
  const { data: lead, error: leadError } = await admin
    .from("marketing_leads")
    .select("id")
    .eq("converted_user_id", userId)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();
  if (leadError) throw new Error(leadError.message);

  const { error } = await admin.from("commercial_conversion_events").upsert({
    user_id: userId,
    lead_id: lead?.id ?? null,
    event_type: eventType,
    product_id: productId,
    source: cleanSource,
  }, { onConflict: "user_id,event_type,product_id,source", ignoreDuplicates: true });
  if (error) throw new Error(error.message);
}

export async function recordHotmartProActivation(userId: string, productId: string) {
  const admin = createAdminClient();
  if (!admin) return;
  const { data: previousStep, error } = await admin
    .from("commercial_conversion_events")
    .select("source")
    .eq("user_id", userId)
    .eq("event_type", "hotmart_reached")
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();
  if (error) throw new Error(error.message);
  await recordCommercialEvent({
    userId,
    eventType: "pro_activated",
    productId,
    source: previousStep?.source ?? "hotmart_webhook",
  });
}
