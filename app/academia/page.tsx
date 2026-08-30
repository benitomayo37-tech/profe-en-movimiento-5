import type { Metadata } from "next";
import { redirect } from "next/navigation";

import { AppLayout, Sidebar } from "@/components/layout";
import Container from "@/components/ui/Container";
import { AcademyCatalog } from "@/features/academy/components/AcademyCatalog";
import { AcademyHeader } from "@/features/academy/components/AcademyHeader";
import { getAcademyProgress } from "@/features/academy/server/progress";
import { getAuthAccess } from "@/features/auth/server/access";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Academia | Profe en Movimiento", description: "Cursos de formación para docentes de Educación Física." };

export default async function AcademyPage() {
  const access = await getAuthAccess();
  if (!access.authenticated) redirect("/login?next=/academia");
  const progress = await getAcademyProgress(access.userId);
  const firstName = access.fullName?.trim().split(/\s+/)[0] || "profe";
  return <AppLayout sidebar={<Sidebar />} header={<AcademyHeader access={access} />} footer={<div className="px-6 py-4 text-center text-xs text-slate-500">Profe en Movimiento 5.0 · Academia</div>}><Container className="py-8"><AcademyCatalog progress={progress} firstName={firstName} /></Container></AppLayout>;
}
