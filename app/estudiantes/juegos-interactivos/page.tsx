import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { redirect } from "next/navigation";

import { AccountBadge, AppLayout, Sidebar } from "@/components/layout";
import Container from "@/components/ui/Container";
import { getAuthAccess } from "@/features/auth/server/access";
import StudentSidebar from "@/features/students/components/StudentSidebar";
import StudentGamesWorkspace from "@/features/students/games/StudentGamesWorkspace";
import { getStudentSession } from "@/features/students/server/session";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Juegos interactivos | Profe en Movimiento",
  description: "Juegos educativos con temáticas deportivas para aprender de forma divertida.",
};

export default async function StudentInteractiveGamesPage() {
  const [student, teacher] = await Promise.all([getStudentSession(), getAuthAccess()]);
  if (!student && !teacher.authenticated) redirect("/login?rol=estudiante");
  const fullName = student?.fullName || teacher.fullName || "Docente";

  return (
    <AppLayout
      sidebar={student ? <StudentSidebar fullName={student.fullName} gradeCourse={student.gradeCourse} /> : <Sidebar />}
      header={<div className="flex min-h-16 items-center justify-between px-6"><div><h1 className="text-lg font-bold">Juegos interactivos</h1><p className="text-sm text-slate-500">Aprende, juega y supera tus retos</p></div><AccountBadge authenticated fullName={fullName} email={teacher.email} className="bg-violet-600" /></div>}
      footer={<div className="px-6 py-4 text-center text-xs text-slate-500">Profe en Movimiento 5.0 · Zona de juegos estudiantil</div>}
    >
      <Container size="wide" className="py-8">
        <div className="mb-6 text-sm font-semibold text-slate-500"><Link href="/estudiantes" className="hover:text-violet-700">Inicio estudiantil</Link><span className="mx-2">/</span><span className="text-slate-900">Juegos interactivos</span></div>
        <section className="relative mb-8 overflow-hidden rounded-[2rem] bg-gradient-to-br from-violet-700 via-blue-600 to-cyan-400 p-8 text-white shadow-xl sm:p-10">
          <div className="absolute -left-16 -top-16 h-52 w-52 rounded-full bg-fuchsia-300/20" aria-hidden="true" />
          <div className="absolute -bottom-24 right-28 h-56 w-56 rounded-full bg-orange-300/25" aria-hidden="true" />
          <div className="relative z-10 grid gap-6 md:grid-cols-[1fr_190px] md:items-center">
            <div><p className="text-xs font-black uppercase tracking-[0.22em] text-cyan-100">Desafío en movimiento</p><h2 className="mt-4 text-4xl font-black tracking-tight sm:text-5xl">¡Aprender también es jugar!</h2><p className="mt-4 max-w-3xl text-lg leading-8 text-blue-50">Completa retos deportivos, descubre conceptos y mejora tu puntuación en cada partida.</p><div className="mt-5 flex flex-wrap gap-2 text-sm font-black"><span className="rounded-full bg-white/15 px-4 py-2">🧠 Piensa</span><span className="rounded-full bg-white/15 px-4 py-2">🎯 Resuelve</span><span className="rounded-full bg-white/15 px-4 py-2">🏆 Supera tu marca</span></div></div>
            <div className="relative mx-auto h-44 w-44" aria-hidden="true"><div className="absolute inset-4 rounded-full bg-white/20" /><Image src="/images/profe-ia-robot.png" alt="" width={220} height={280} priority className="relative z-10 h-full w-full object-contain drop-shadow-2xl" /></div>
          </div>
        </section>
        <StudentGamesWorkspace />
      </Container>
    </AppLayout>
  );
}
