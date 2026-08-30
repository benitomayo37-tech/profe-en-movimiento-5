import { createHash } from "node:crypto";

export type HotmartAccessAction = "grant" | "revoke";

export interface ParsedHotmartWebhook {
  action: HotmartAccessAction;
  buyerEmail: string;
  entitlementKey: string;
  eventId: string;
  eventName: string;
  offerCode: string | null;
  productId: string;
}

const grantEvents = new Set([
  "PURCHASE_APPROVED",
  "PURCHASE_COMPLETE",
  "PURCHASE_COMPLETED",
]);

const revokeEvents = new Set([
  "PURCHASE_CANCELED",
  "PURCHASE_CHARGEBACK",
  "PURCHASE_DELAYED",
  "PURCHASE_EXPIRED",
  "PURCHASE_REFUNDED",
  "SUBSCRIPTION_CANCELLATION",
]);

function asRecord(value: unknown): Record<string, unknown> | null {
  return typeof value === "object" && value !== null
    ? value as Record<string, unknown>
    : null;
}

function asNonEmptyString(value: unknown): string | null {
  if (typeof value === "string" && value.trim()) return value.trim();
  if (typeof value === "number" && Number.isFinite(value)) return String(value);
  return null;
}

function normalizeEmail(value: unknown): string | null {
  const email = asNonEmptyString(value)?.toLowerCase();
  return email && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) ? email : null;
}

export function getConfiguredProProductIds(): Set<string> {
  return new Set(
    (process.env.HOTMART_PRO_PRODUCT_IDS ?? "")
      .split(",")
      .map((value) => value.trim())
      .filter(Boolean),
  );
}

export function parseHotmartWebhook(
  payload: unknown,
  rawBody: string,
): ParsedHotmartWebhook | null {
  const body = asRecord(payload);
  const data = asRecord(body?.data);
  const product = asRecord(data?.product);
  const buyer = asRecord(data?.buyer);
  const subscription = asRecord(data?.subscription);
  const subscriber = asRecord(data?.subscriber)
    ?? asRecord(subscription?.subscriber);
  const purchase = asRecord(data?.purchase);
  const offer = asRecord(purchase?.offer) ?? asRecord(data?.offer);

  const eventName = asNonEmptyString(body?.event)?.toUpperCase();
  const productId = asNonEmptyString(product?.id);
  const buyerEmail = normalizeEmail(buyer?.email) ?? normalizeEmail(subscriber?.email);

  if (!eventName || !productId || !buyerEmail) return null;

  const action = grantEvents.has(eventName)
    ? "grant"
    : revokeEvents.has(eventName)
      ? "revoke"
      : null;

  if (!action) return null;

  const transaction = asNonEmptyString(purchase?.transaction);
  const offerCode = asNonEmptyString(offer?.code);
  const subscriberCode = asNonEmptyString(subscriber?.code);
  const sourceKey = subscriberCode ?? transaction ?? buyerEmail;
  const eventId = asNonEmptyString(body?.id)
    ?? createHash("sha256").update(rawBody).digest("hex");

  return {
    action,
    buyerEmail,
    entitlementKey: `${productId}:${sourceKey}`,
    eventId,
    eventName,
    offerCode,
    productId,
  };
}
