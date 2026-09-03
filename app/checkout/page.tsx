import type { Metadata } from "next";

import { AppLayout, Sidebar } from "@/components/layout";
import Container from "@/components/ui/Container";
import { getAuthAccess } from "@/features/auth/server/access";
import StorePageHeader from "@/features/store/components/StorePageHeader";
import StoreCheckout from "@/features/store/components/StoreCheckout";
import { getStoreProductBySlug } from "@/features/store/data/products";
import { getHotmartCheckoutUrl } from "@/features/store/server/getHotmartCheckoutUrl";
import { normalizeCommercialSource, recordCommercialEvent } from "@/features/commercial/server/tracking";

export const metadata: Metadata = {
  title: "Checkout | Profe en Movimiento",
  description: "Revisa tu pedido y prepara la compra digital en Profe en Movimiento.",
};

function CheckoutFooter() {
  return <div className="px-6 py-4 text-center text-xs text-slate-500">Profe en Movimiento 5.0 · Checkout seguro · Proyecto FARO</div>;
}

interface CheckoutPageProps {
  searchParams: Promise<{
    product?: string | string[];
    source?: string | string[];
  }>;
}

export default async function CheckoutPage({ searchParams }: CheckoutPageProps) {
  const access = await getAuthAccess();
  const resolvedSearchParams = await searchParams;
  const requestedProduct = resolvedSearchParams.product;
  const requestedSource = resolvedSearchParams.source;
  const productId = Array.isArray(requestedProduct) ? requestedProduct[0] : requestedProduct;
  const source = normalizeCommercialSource(Array.isArray(requestedSource) ? requestedSource[0] : requestedSource);
  const product = productId ? getStoreProductBySlug(productId) : undefined;
  const availableProduct = product?.purchaseStatus === "available" ? product : undefined;
  const checkoutUrl = availableProduct
    ? getHotmartCheckoutUrl(availableProduct.id)
    : undefined;
  if (availableProduct && access.userId) {
    await recordCommercialEvent({ userId: access.userId, eventType: "checkout_reached", productId: availableProduct.id, source });
  }
  const trackedCheckoutUrl = checkoutUrl && availableProduct
    ? `/api/commercial/hotmart?product=${encodeURIComponent(availableProduct.id)}&source=${encodeURIComponent(source)}`
    : undefined;

  return (
    <AppLayout
      sidebar={<Sidebar />}
      header={(
        <StorePageHeader
          access={access}
          title="Checkout"
          description="Compra digital · Checkout seguro con Hotmart"
        />
      )}
      footer={<CheckoutFooter />}
    >
      <Container className="py-8">
        <StoreCheckout product={availableProduct} checkoutUrl={trackedCheckoutUrl} />
      </Container>
    </AppLayout>
  );
}
