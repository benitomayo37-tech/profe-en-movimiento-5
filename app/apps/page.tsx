import type { Metadata } from "next";

import { AccountBadge, AppLayout, Sidebar } from "@/components/layout";
import Container from "@/components/ui/Container";
import { getAuthAccess } from "@/features/auth/server/access";
import AppsCatalog from "@/features/apps/components/AppsCatalog";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "App para profes | Profe en Movimiento",
  description: "Centro de miniapps para organizar clases, actividades y recursos docentes.",
};

function AppsHeader({ access }: { access: Awaited<ReturnType<typeof getAuthAccess>> }) {
  return (
    <div className="flex min-h-20 items-center justify-between gap-4 px-6">
      <div className="min-w-0">
        <h1 className="truncate text-lg font-bold text-slate-950">App para profes</h1>
        <p className="truncate text-sm text-slate-500">19 herramientas para acompañar tu trabajo docente</p>
      </div>
      <AccountBadge authenticated={access.authenticated} email={access.email} fullName={access.fullName} />
    </div>
  );
}

function AppsFooter() {
  return <div className="px-6 py-4 text-center text-xs text-slate-500">Profe en Movimiento 5.0 · App para profes · Proyecto FARO</div>;
}

export default async function AppsPage() {
  const access = await getAuthAccess();

  return (
    <AppLayout sidebar={<Sidebar />} header={<AppsHeader access={access} />} footer={<AppsFooter />}>
      <Container className="py-8">
        <AppsCatalog access={access} />
      </Container>
    </AppLayout>
  );
}
