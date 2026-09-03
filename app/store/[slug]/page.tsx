import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { AppLayout, Sidebar } from "@/components/layout";
import Container from "@/components/ui/Container";
import { getAuthAccess } from "@/features/auth/server/access";
import StorePageHeader from "@/features/store/components/StorePageHeader";
import StoreProductDetail from "@/features/store/components/StoreProductDetail";
import {
  getStoreProductBySlug,
  storeProducts,
} from "@/features/store/data/products";

interface StoreProductPageProps {
  params: Promise<{
    slug: string;
  }>;
  searchParams: Promise<{ source?: string | string[] }>;
}

export function generateStaticParams() {
  return storeProducts.map((product) => ({
    slug: product.id,
  }));
}

export async function generateMetadata({
  params,
}: StoreProductPageProps): Promise<Metadata> {
  const { slug } = await params;
  const product = getStoreProductBySlug(slug);

  if (!product) {
    return {
      title: "Producto no encontrado | Profe en Movimiento",
      description: "El producto solicitado no se encuentra disponible.",
    };
  }

  return {
    title: `${product.title} | Tienda Profe en Movimiento`,
    description: product.description,
    openGraph: {
      title: product.title,
      description: product.description,
      type: "website",
    },
  };
}

function ProductFooter() {
  return (
    <div className="px-6 py-4 text-center text-xs text-slate-500">
      Profe en Movimiento 5.0 · Tienda digital · Proyecto FARO
    </div>
  );
}

export default async function StoreProductPage({
  params,
  searchParams,
}: StoreProductPageProps) {
  const { slug } = await params;
  const product = getStoreProductBySlug(slug);
  const access = await getAuthAccess();
  const requestedSource = (await searchParams).source;
  const source = Array.isArray(requestedSource) ? requestedSource[0] : requestedSource;

  if (!product) {
    notFound();
  }

  return (
    <AppLayout
      sidebar={<Sidebar />}
      header={(
        <StorePageHeader
          access={access}
          title="Ficha de producto"
          description="Tienda digital · Profe en Movimiento"
        />
      )}
      footer={<ProductFooter />}
    >
      <Container className="py-8">
        <StoreProductDetail product={product} source={source} userId={access.userId} />
      </Container>
    </AppLayout>
  );
}
