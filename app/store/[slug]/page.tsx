import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { AppLayout, Sidebar } from "@/components/layout";
import Container from "@/components/ui/Container";
import StoreProductDetail from "@/features/store/components/StoreProductDetail";
import {
  getStoreProductBySlug,
  storeProducts,
} from "@/features/store/data/products";

interface StoreProductPageProps {
  params: Promise<{
    slug: string;
  }>;
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

function ProductHeader() {
  return (
    <div className="flex min-h-20 items-center justify-between gap-4 px-6">
      <div className="min-w-0">
        <h1 className="truncate text-lg font-bold text-slate-950">
          Ficha de producto
        </h1>
        <p className="truncate text-sm text-slate-500">
          Tienda digital · Profe en Movimiento
        </p>
      </div>
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-orange-500 font-bold text-white">
        AM
      </div>
    </div>
  );
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
}: StoreProductPageProps) {
  const { slug } = await params;
  const product = getStoreProductBySlug(slug);

  if (!product) {
    notFound();
  }

  return (
    <AppLayout
      sidebar={<Sidebar />}
      header={<ProductHeader />}
      footer={<ProductFooter />}
    >
      <Container className="py-8">
        <StoreProductDetail product={product} />
      </Container>
    </AppLayout>
  );
}
