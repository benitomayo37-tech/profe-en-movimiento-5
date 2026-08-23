import type { Metadata } from "next";

import { AccountBadge, AppLayout } from "@/components/layout";
import Container from "@/components/ui/Container";
import { getAuthAccess } from "@/features/auth/server/access";
import MovimientoParaTodosSidebar from "@/features/movimiento-para-todos/components/MovimientoParaTodosSidebar";
import MovimientoParaTodosWorkspace from "@/features/movimiento-para-todos/components/MovimientoParaTodosWorkspace";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Movimiento para Todos | Profe en Movimiento",
  description:
    "Actividad física adaptada, segura e inclusiva para diferentes poblaciones y para quienes las acompañan.",
};

export default async function MovimientoParaTodosPage() {
  const access = await getAuthAccess();

  return (
    <AppLayout
      sidebar={<MovimientoParaTodosSidebar />}
      header={
        <div className="flex min-h-20 items-center justify-between gap-4 px-6">
          <div>
            <h1 className="text-lg font-bold text-slate-950">
              Movimiento para Todos
            </h1>

            <p className="text-sm text-slate-500">
              Actividad física adaptada, segura e inclusiva.
            </p>
          </div>

          <AccountBadge
            authenticated={access.authenticated}
            email={access.email}
            fullName={access.fullName}
            className="bg-emerald-600"
          />
        </div>
      }
      footer={
        <div className="px-6 py-4 text-center text-xs text-slate-500">
          Movimiento para Todos · Actividad física adaptada y acompañamiento
        </div>
      }
    >
      <Container size="wide" className="py-8">
        <MovimientoParaTodosWorkspace />
      </Container>
    </AppLayout>
  );
}
