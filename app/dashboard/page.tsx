import type { Metadata } from "next";
import { redirect } from "next/navigation";

import DashboardPage from "@/components/dashboard/DashboardPage";
import { getAuthAccess } from "@/features/auth/server/access";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Dashboard | Profe en Movimiento" };

export default async function DashboardRoute() {
  const access = await getAuthAccess();
  if (!access.authenticated) redirect("/login?next=/dashboard");
  return <DashboardPage access={access} />;
}
