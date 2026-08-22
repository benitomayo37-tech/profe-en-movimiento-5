import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { redirect } from "next/navigation";

import { AccountBadge, AppLayout, Sidebar } from "@/components/layout";
import Container from "@/components/ui/Container";
import { getAuthAccess } from "@/features/auth/server/access";
import StudentSidebar from "@/features/students/components/StudentSidebar";
import { getStudentSession } from "@/features/students/server/session";
import StudentVideosWorkspace from "@/features/students/videos/StudentVideosWorkspace";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Videos deportivos | Profe en Movimiento",
  description: "Búsqueda guiada de videos deportivos educativos para estudiantes.",
};

export default async function StudentVideosPage() {
  const [student, teacher] = await Promise.all([getStudentSession(), getAuthAccess()]);
  if (!student && !teacher.authenticated) redirect("/login?rol=estudiante");
  const fullName = student?.fullName || teacher.fullName || "Docente";

  return (
    <AppLayout
      sidebar={student ? <StudentSidebar fullName={student.fullName} gradeCourse={student.gradeCourse} /> : <Sidebar />}
      header={
        <div className="flex min-h-16 items-center justify-between px-6">
          <div><h1 className="text-lg font-bold">Videos deportivos</h1><p className="text-sm text-slate-500">Observa, comprende y aprende en movimiento</p></div>
          <AccountBadge authenticated fullName={fullName} email={teacher.email} className="bg-red-600" />
        </div>
      }
      footer={<div className="px-6 py-4 text-center text-xs text-slate-500">Profe en Movimiento 5.0 · Videoteca estudiantil</div>}
    >
      <Container size="wide" className="py-8">
        <div className="mb-6 text-sm font-semibold text-slate-500">
          <Link href="/estudiantes" className="hover:text-red-700">Inicio estudiantil</Link><span className="mx-2">/</span><span className="text-slate-900">Videos</span>
        </div>

        <section className="relative mb-8 overflow-hidden rounded-[2rem] bg-gradient-to-br from-red-600 via-orange-500 to-amber-300 p-8 text-white shadow-xl sm:p-10">
          <div className="absolute -left-16 -top-16 h-52 w-52 rounded-full bg-white/15" aria-hidden="true" />
          <div className="absolute -bottom-24 right-24 h-56 w-56 rounded-full bg-blue-700/20" aria-hidden="true" />
          <div className="relative z-10 grid gap-6 md:grid-cols-[1fr_190px] md:items-center">
            <div>
              <p className="text-xs font-black uppercase tracking-[0.22em] text-yellow-50">Tu pantalla deportiva</p>
              <h2 className="mt-4 text-4xl font-black tracking-tight sm:text-5xl">¡Mira, analiza y aprende!</h2>
              <p className="mt-4 max-w-3xl text-lg leading-8 text-orange-50">Encuentra demostraciones, competencias, historias y reglas deportivas mediante una búsqueda guiada y segura.</p>
              <div className="mt-5 flex flex-wrap gap-2 text-sm font-black"><span className="rounded-full bg-white/15 px-4 py-2">▶️ Observa</span><span className="rounded-full bg-white/15 px-4 py-2">🔎 Analiza</span><span className="rounded-full bg-white/15 px-4 py-2">💡 Comprende</span></div>
            </div>
            <div className="relative mx-auto h-44 w-44" aria-hidden="true"><div className="absolute inset-4 rounded-full bg-white/20" /><Image src="/images/profe-ia-robot.png" alt="" width={220} height={280} priority className="relative z-10 h-full w-full object-contain drop-shadow-2xl" /></div>
          </div>
        </section>

        <StudentVideosWorkspace />
      </Container>
    </AppLayout>
  );
}
