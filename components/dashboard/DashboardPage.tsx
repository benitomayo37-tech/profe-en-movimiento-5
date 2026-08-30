import { AppLayout, Sidebar } from "@/components/layout";
import Container from "@/components/ui/Container";
import { getRecentActivity } from "@/features/dashboard/server/activity";
import type { AuthAccess } from "@/features/auth/types";
import DashboardHeader from "@/features/dashboard/components/DashboardHeader";
import QuickActions from "./QuickActions";
import RecentActivity from "./RecentActivity";
import WelcomeSection from "./WelcomeSection";

export default async function DashboardPage({ access }: { access: AuthAccess }) {
  const recentActivity = await getRecentActivity(access.userId);
  const userName = access.authenticated
    ? access.fullName?.trim().split(/\s+/)[0] || "profe"
    : "profe";

  return (
    <AppLayout
      sidebar={<Sidebar />}
      header={<DashboardHeader access={access} />}
      footer={<div className="px-6 py-4 text-center text-xs text-slate-500">Profe en Movimiento · Centro de operaciones docente</div>}
    >
       <Container className="space-y-10 py-8">
  <WelcomeSection userName={userName} access={access} />
  <QuickActions />
  <RecentActivity activities={recentActivity} />
</Container>
    </AppLayout>
  );
}
