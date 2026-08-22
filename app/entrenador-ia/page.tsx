import { AccountBadge, AppLayout, Sidebar } from "@/components/layout";
import Container from "@/components/ui/Container";
import AuthenticatedAccessRequired from "@/features/auth/components/AuthenticatedAccessRequired";
import { getAuthAccess } from "@/features/auth/server/access";
import TrainerWorkspace from "@/features/trainer/components/TrainerWorkspace";

export const dynamic = "force-dynamic";

function TrainerHeader({ access }: { access: Awaited<ReturnType<typeof getAuthAccess>> }) {
  return (
    <div className="flex min-h-20 items-center justify-between gap-4 px-6">
      <div className="min-w-0">
        <h1 className="truncate text-lg font-bold text-slate-950">
          Entrenador IA
        </h1>
        <p className="truncate text-sm text-slate-500">
          Planificación inteligente del entrenamiento deportivo
        </p>
      </div>
      <AccountBadge authenticated={access.authenticated} email={access.email} fullName={access.fullName} className="bg-emerald-600" />
    </div>
  );
}

function TrainerFooter() {
  return (
    <div className="px-6 py-4 text-center text-xs text-slate-500">
      Profe en Movimiento 5.0 · Entrenador IA · Proyecto FARO
    </div>
  );
}

export default async function TrainerAIPage() {
  const access = await getAuthAccess();

  return (
    <AppLayout
      sidebar={<Sidebar />}
      header={<TrainerHeader access={access} />}
      footer={<TrainerFooter />}
    >
      <Container className="py-8">
        {access.authenticated ? (
          <TrainerWorkspace hasProAccess={access.hasProAccess} />
        ) : (
          <AuthenticatedAccessRequired title="Entrenador IA" returnTo="/entrenador-ia" />
        )}
      </Container>
    </AppLayout>
  );
}
