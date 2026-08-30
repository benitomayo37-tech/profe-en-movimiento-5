import type { Metadata } from "next";

import { AccountBadge, AppLayout } from "@/components/layout";
import Container from "@/components/ui/Container";
import { getAuthAccess } from "@/features/auth/server/access";
import MoveSafeSidebar from "@/features/mueve-seguro/components/MoveSafeSidebar";
import MoveSafeWorkspace from "@/features/mueve-seguro/components/MoveSafeWorkspace";

export const dynamic = "force-dynamic";
export const metadata: Metadata = {
  title: "MueveSeguro | Profe en Movimiento",
  description: "Asistente educativo de prevención y respuesta segura para docentes y entrenadores.",
};

export default async function MoveSafePage() {
  const access = await getAuthAccess();

  return (
    <AppLayout
      sidebar={<MoveSafeSidebar />}
      header={<div className="flex min-h-20 items-center justify-between gap-4 px-6"><div><h1 className="text-lg font-bold text-slate-950">MueveSeguro</h1><p className="text-sm text-slate-500">Educa, previene y protege.</p></div><AccountBadge authenticated={access.authenticated} email={access.email} fullName={access.fullName} className="bg-emerald-600" /></div>}
      footer={<div className="px-6 py-4 text-center text-xs text-slate-500">MueveSeguro · Orientación educativa para la prevención y respuesta</div>}
    >
      <Container size="wide" className="py-8">
        <MoveSafeWorkspace
          authenticated={access.authenticated}
          hasProAccess={access.hasProAccess}
        />
      </Container>
    </AppLayout>
  );
}
