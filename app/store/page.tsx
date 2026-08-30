import type { Metadata } from "next";

import { AppLayout, Sidebar } from "@/components/layout";
import Container from "@/components/ui/Container";
import { getAuthAccess } from "@/features/auth/server/access";
import StoreCatalog from "@/features/store/components/StoreCatalog";
import StorePageHeader from "@/features/store/components/StorePageHeader";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Tienda digital | Profe en Movimiento",
  description:
    "Recursos educativos, aplicaciones para docentes, ebooks y paquetes de Profe en Movimiento.",
};

function StoreFooter() {
  return (
    <div className="px-6 py-4 text-center text-xs text-slate-500">
      Profe en Movimiento 5.0 · Tienda digital · Proyecto FARO
    </div>
  );
}

export default async function StorePage() {
  const access = await getAuthAccess();

  return (
    <AppLayout
      sidebar={<Sidebar />}
      header={(
        <StorePageHeader
          access={access}
          title="Tienda digital"
          description="Herramientas creadas para enseñar con menos esfuerzo"
        />
      )}
      footer={<StoreFooter />}
    >
      <Container className="py-8">
        <StoreCatalog />
      </Container>
    </AppLayout>
  );
}
