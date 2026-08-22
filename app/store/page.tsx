import type { Metadata } from "next";

import { AccountBadge, AppLayout, Sidebar } from "@/components/layout";
import Container from "@/components/ui/Container";
import StoreCatalog from "@/features/store/components/StoreCatalog";

export const metadata: Metadata = {
  title: "Tienda digital | Profe en Movimiento",
  description:
    "Recursos educativos, aplicaciones para docentes, ebooks y paquetes de Profe en Movimiento.",
};

function StoreHeader() {
  return (
    <div className="flex min-h-20 items-center justify-between gap-4 px-6">
      <div className="min-w-0">
        <h1 className="truncate text-lg font-bold text-slate-950">
          Tienda digital
        </h1>
        <p className="truncate text-sm text-slate-500">
          Herramientas creadas para enseñar con menos esfuerzo
        </p>
      </div>

      <AccountBadge authenticated={false} />
    </div>
  );
}

function StoreFooter() {
  return (
    <div className="px-6 py-4 text-center text-xs text-slate-500">
      Profe en Movimiento 5.0 · Tienda digital · Proyecto FARO
    </div>
  );
}

export default function StorePage() {
  return (
    <AppLayout
      sidebar={<Sidebar />}
      header={<StoreHeader />}
      footer={<StoreFooter />}
    >
      <Container className="py-8">
        <StoreCatalog />
      </Container>
    </AppLayout>
  );
}
