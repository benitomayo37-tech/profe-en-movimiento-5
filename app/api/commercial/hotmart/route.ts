import { NextResponse } from "next/server";

import { recordCommercialEvent } from "@/features/commercial/server/tracking";
import { getAuthenticatedApiAccess } from "@/features/auth/server/apiAccess";
import { getStoreProductBySlug } from "@/features/store/data/products";
import { getHotmartCheckoutUrl } from "@/features/store/server/getHotmartCheckoutUrl";

export const runtime = "nodejs";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const productId = url.searchParams.get("product")?.trim() ?? "";
  const source = url.searchParams.get("source");
  const product = getStoreProductBySlug(productId);
  const checkoutUrl = product?.purchaseStatus === "available" ? getHotmartCheckoutUrl(productId) : undefined;
  if (!product || !checkoutUrl) return NextResponse.redirect(new URL("/store", url), 303);

  const accessResult = await getAuthenticatedApiAccess("Checkout Pro");
  if (!accessResult.error) {
    await recordCommercialEvent({ userId: accessResult.access.userId, eventType: "hotmart_reached", productId, source });
  }

  return NextResponse.redirect(checkoutUrl, 303);
}
