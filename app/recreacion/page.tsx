import type { Metadata } from "next";
import { redirect } from "next/navigation";

import { AccountBadge, AppLayout, Sidebar } from "@/components/layout";
import Container from "@/components/ui/Container";
import { getAuthAccess } from "@/features/auth/server/access";
import RecreationWorkspace from "@/features/recreation/components/RecreationWorkspace";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Recreaci\u00f3n y Retos | Profe en Movimiento", description: "Planifica juegos, yincanas y escape rooms inclusivos." };

export default async function RecreationPage() {
  const access = await getAuthAccess();
  if (!access.authenticated) redirect("/login?next=/recreacion");

  return (
    <AppLayout sidebar={<Sidebar />} header={<div className="flex min-h-20 items-center justify-between gap-4 px-4 sm:px-6"><div><h1 className="text-lg font-black text-slate-950">Recreaci&oacute;n y Retos</h1><p className="text-sm text-slate-500">Juegos, yincanas y escape rooms</p></div><AccountBadge authenticated={access.authenticated} email={access.email} fullName={access.fullName} className="bg-blue-700" /></div>} footer={<div className="px-6 py-4 text-center text-xs text-slate-500">Profe en Movimiento 5.0 - Recreaci&oacute;n y Retos</div>}>
      <Container size="wide" className="py-6 sm:py-8"><RecreationWorkspace /></Container>
    </AppLayout>
  );
}