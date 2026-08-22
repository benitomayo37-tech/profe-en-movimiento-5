import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { AccountBadge, AppLayout, Sidebar } from "@/components/layout";
import Container from "@/components/ui/Container";
import ProAccessRequired from "@/features/auth/components/ProAccessRequired";
import { getAuthAccess } from "@/features/auth/server/access";
import MiniAppWorkspace from "@/features/apps/components/MiniAppWorkspace";
import {
  getMiniAppBySlug,
} from "@/features/apps/data/miniApps";

interface MiniAppPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: MiniAppPageProps): Promise<Metadata> {
  const { slug } = await params;
  const app = getMiniAppBySlug(slug);

  if (!app || app.status !== "available") {
    return { title: "Miniapp no disponible | Profe en Movimiento" };
  }

  return {
    title: `${app.title} | App para profes`,
    description: app.description,
  };
}

function MiniAppHeader({ title, access }: { title: string; access: Awaited<ReturnType<typeof getAuthAccess>> }) {
  return (
    <div className="flex min-h-20 items-center justify-between gap-4 px-6">
      <div className="min-w-0">
        <h1 className="truncate text-lg font-bold text-slate-950">{title}</h1>
        <p className="truncate text-sm text-slate-500">App para profes · Profe en Movimiento</p>
      </div>
      <AccountBadge authenticated={access.authenticated} email={access.email} fullName={access.fullName} />
    </div>
  );
}

export default async function MiniAppPage({ params }: MiniAppPageProps) {
  const { slug } = await params;
  const app = getMiniAppBySlug(slug);

  if (!app || app.status !== "available") notFound();

  const access = await getAuthAccess();

  return (
    <AppLayout
      sidebar={<Sidebar />}
      header={<MiniAppHeader title={app.title} access={access} />}
      footer={<div className="px-6 py-4 text-center text-xs text-slate-500">Profe en Movimiento 5.0 · App para profes · Proyecto FARO</div>}
    >
      <Container className="py-8">
        {app.plan === "Pro" && !access.hasProAccess ? (
          <ProAccessRequired access={access} title={app.title} returnTo={`/apps/${app.id}`} />
        ) : (
          <MiniAppWorkspace app={app} />
        )}
      </Container>
    </AppLayout>
  );
}
