import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";

import { AccountBadge, AppLayout, Sidebar } from "@/components/layout";
import Container from "@/components/ui/Container";
import { getAuthAccess } from "@/features/auth/server/access";
import TeacherExamCreator from "@/features/student-exams/components/TeacherExamCreator";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Crear examen | Profe en Movimiento" };

export default async function TeacherExamsPage() {
  const access = await getAuthAccess();
  if (!access.authenticated) redirect("/login?returnTo=/examenes");
  return (
    <AppLayout sidebar={<Sidebar />} header={<div className="flex min-h-16 items-center justify-between px-6"><div><h1 className="text-lg font-bold">Exámenes estudiantiles</h1><p className="text-sm text-slate-500">Crea y comparte una evaluación con código</p></div><AccountBadge authenticated fullName={access.fullName} email={access.email} className="bg-blue-700" /></div>}>
      <Container size="wide" className="space-y-7 py-8">
        <div className="flex flex-wrap items-center justify-between gap-3 text-sm font-semibold text-slate-500">
          <div><Link href="/dashboard" className="hover:text-blue-700">Dashboard</Link><span className="mx-2">/</span><span className="text-slate-900">Crear examen</span></div>
          <Link href="/examenes/resultados" className="rounded-xl border border-blue-200 bg-blue-50 px-4 py-2 font-black text-blue-800 hover:bg-blue-100">Ver resultados →</Link>
        </div>
        <section className="overflow-hidden rounded-[2rem] bg-gradient-to-r from-orange-500 via-amber-400 to-yellow-300 p-8 text-slate-950 shadow-xl sm:p-10"><p className="text-xs font-black uppercase tracking-[0.2em]">Evaluación guiada</p><h2 className="mt-3 text-4xl font-black sm:text-5xl">Evalúa sin repetir la misma prueba</h2><p className="mt-4 max-w-3xl text-lg font-semibold leading-8">Genera el banco una vez, entrega el código y recibe versiones equivalentes para cada estudiante.</p></section>
        <TeacherExamCreator />
      </Container>
    </AppLayout>
  );
}
