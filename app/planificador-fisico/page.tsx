import {
  AccountBadge,
  AppLayout,
  Sidebar,
} from "@/components/layout";
import Container from "@/components/ui/Container";
import AuthenticatedAccessRequired from "@/features/auth/components/AuthenticatedAccessRequired";
import { getAuthAccess } from "@/features/auth/server/access";
import PhysicalPlannerWorkspace from "@/features/physical-planner/components/PhysicalPlannerWorkspace";

export const dynamic = "force-dynamic";

function PhysicalPlannerHeader({
  access,
}: {
  access: Awaited<ReturnType<typeof getAuthAccess>>;
}) {
  return (
    <div className="flex min-h-20 items-center justify-between gap-4 px-6">
      <div className="min-w-0">
        <h1 className="truncate text-lg font-bold text-slate-950">
          Planificador Físico
        </h1>
        <p className="truncate text-sm text-slate-500">
          Carga, tiempo y progresión bajo control
        </p>
      </div>

      <AccountBadge
        authenticated={access.authenticated}
        email={access.email}
        fullName={access.fullName}
        className="bg-orange-600"
      />
    </div>
  );
}

function PhysicalPlannerFooter() {
  return (
    <div className="px-6 py-4 text-center text-xs text-slate-500">
      Profe en Movimiento 5.0 · Planificador Físico ·
      El docente o entrenador conserva la decisión final
    </div>
  );
}

export default async function PhysicalPlannerPage() {
  const access = await getAuthAccess();

  return (
    <AppLayout
      sidebar={<Sidebar />}
      header={
        <PhysicalPlannerHeader access={access} />
      }
      footer={<PhysicalPlannerFooter />}
    >
      <Container className="py-8">
        {access.authenticated ? (
          <PhysicalPlannerWorkspace
            hasProAccess={access.hasProAccess}
          />
        ) : (
          <AuthenticatedAccessRequired
            title="Planificador Físico"
            returnTo="/planificador-fisico"
          />
        )}
      </Container>
    </AppLayout>
  );
}