import type { Metadata } from "next";

import { AccountBadge, AppLayout, Sidebar } from "@/components/layout";
import Container from "@/components/ui/Container";
import AIWorkspace from "@/features/ai/components/AIWorkspace";
import AuthenticatedAccessRequired from "@/features/auth/components/AuthenticatedAccessRequired";
import { getAuthAccess } from "@/features/auth/server/access";
import { getLibraryResourceBySlug } from "@/features/resources/server/catalog";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Profe IA | Profe en Movimiento",
  description: "Asistente inteligente para crear planificaciones, evaluaciones y recursos educativos.",
};

interface AIPageProps {
  searchParams: Promise<{ resource?: string | string[] }>;
}

function AIHeader({
  authenticated,
  email,
  fullName,
}: {
  authenticated: boolean;
  email: string | null;
  fullName: string | null;
}) {
  return (
    <div className="flex min-h-20 items-center justify-between gap-4 px-6">
      <div className="min-w-0">
        <h1 className="truncate text-lg font-bold text-slate-950">Profe IA</h1>
        <p className="truncate text-sm text-slate-500">Creación educativa inteligente</p>
      </div>
      <AccountBadge authenticated={authenticated} email={email} fullName={fullName} className="bg-blue-600" />
    </div>
  );
}

function AIFooter() {
  return <div className="px-6 py-4 text-center text-xs text-slate-500">Profe en Movimiento 5.0 · Profe IA · Proyecto FARO</div>;
}

export default async function AIPage({ searchParams }: AIPageProps) {
  const [access, params] = await Promise.all([getAuthAccess(), searchParams]);
  const requestedSlug = typeof params.resource === "string" ? params.resource : undefined;
  const sourceResource = requestedSlug ? await getLibraryResourceBySlug(requestedSlug) : null;
  const sourceResourceSlug = sourceResource ? requestedSlug : undefined;
  const userName = access.fullName?.trim().split(/\s+/)[0] || "profe";

  return (
    <AppLayout
      sidebar={<Sidebar />}
      header={<AIHeader authenticated={access.authenticated} email={access.email} fullName={access.fullName} />}
      footer={<AIFooter />}
    >
      <Container className="py-8">
        {access.authenticated ? (
          <AIWorkspace
            sourceResourceSlug={sourceResourceSlug}
            userName={userName}
            hasProAccess={access.hasProAccess}
          />
        ) : (
          <AuthenticatedAccessRequired title="Profe IA" returnTo={sourceResourceSlug ? `/ai?resource=${encodeURIComponent(sourceResourceSlug)}` : "/ai"} />
        )}
      </Container>
    </AppLayout>
  );
}
