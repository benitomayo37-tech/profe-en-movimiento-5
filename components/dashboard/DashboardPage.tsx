import { AccountBadge, AppLayout, Sidebar } from "@/components/layout";
import Container from "@/components/ui/Container";
import { getRecentActivity } from "@/features/dashboard/server/activity";
import { getAuthAccess } from "@/features/auth/server/access";
import QuickActions from "./QuickActions";
import RecentActivity from "./RecentActivity";
import WelcomeSection from "./WelcomeSection";

interface DashboardHeaderProps {
  authenticated: boolean;
  email: string | null;
  fullName: string | null;
}

function TemporaryHeader({ authenticated, email, fullName }: DashboardHeaderProps) {
  return (
    <div className="flex min-h-16 items-center justify-between px-6">
      <div>
        <h1 className="text-lg font-bold text-slate-900">
          Dashboard
        </h1>
        <p className="text-sm text-slate-500">
          Centro de operaciones
        </p>
      </div>

      <AccountBadge
        authenticated={authenticated}
        email={email}
        fullName={fullName}
        className="bg-blue-600"
      />
    </div>
  );
}

function TemporaryFooter() {
  return (
    <div className="px-6 py-4 text-center text-xs text-slate-500">
      Profe en Movimiento 5.0 · Proyecto FARO
    </div>
  );
}

export default async function DashboardPage() {
  const access = await getAuthAccess();
  const recentActivity = await getRecentActivity(access.userId);
  const userName = access.authenticated
    ? access.fullName?.trim().split(/\s+/)[0] || "profe"
    : "profe";

  return (
    <AppLayout
      sidebar={<Sidebar />}
      header={(
        <TemporaryHeader
          authenticated={access.authenticated}
          email={access.email}
          fullName={access.fullName}
        />
      )}
      footer={<TemporaryFooter />}
    >
       <Container className="space-y-10 py-8">
  <WelcomeSection userName={userName} />
  <QuickActions />
  <RecentActivity activities={recentActivity} />
</Container>
    </AppLayout>
  );
}
