import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { redirect } from "next/navigation";

import { AccountBadge, AppLayout, Sidebar } from "@/components/layout";
import Container from "@/components/ui/Container";
import { getAuthAccess } from "@/features/auth/server/access";
import StudentSidebar from "@/features/students/components/StudentSidebar";
import StudentTraditionalGamesWorkspace from "@/features/students/traditional-games/StudentTraditionalGamesWorkspace";
import { getStudentSession } from "@/features/students/server/session";
import { createAdminClient } from "@/lib/supabase/admin";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Juegos tradicionales para estudiantes | Profe en Movimiento",
  description: "Juegos tradicionales de países y regiones explicados para estudiantes.",
};

async function getRemaining(studentId: string | null) {
  if (!studentId) return 10;
  const admin = createAdminClient();
  if (!admin) return 0;
  const month = `${new Date().toISOString().slice(0, 7)}-01`;
  const { data } = await admin
    .from("student_monthly_usage")
    .select("generation_count")
    .eq("student_id", studentId)
    .eq("usage_month", month)
    .maybeSingle();
  const used = typeof data?.generation_count === "number" ? data.generation_count : 0;
  return Math.max(10 - used, 0);
}

export default async function StudentTraditionalGamesPage() {
  const [student, teacher] = await Promise.all([getStudentSession(), getAuthAccess()]);
  if (!student && !teacher.authenticated) redirect("/login?rol=estudiante");

  const fullName = student?.fullName || teacher.fullName || "Docente";
  const remaining = await getRemaining(student?.studentId ?? null);

  return (
    <AppLayout
      sidebar={student ? <StudentSidebar fullName={student.fullName} gradeCourse={student.gradeCourse} /> : <Sidebar />}
      header={<div className="flex min-h-16 items-center justify-between px-6"><div><h1 className="text-lg font-bold">Juegos tradicionales</h1><p className="text-sm text-slate-500">Cultura, movimiento y diversión</p></div><AccountBadge authenticated fullName={fullName} email={teacher.email} className="bg-emerald-600" /></div>}
      footer={<div className="px-6 py-4 text-center text-xs text-slate-500">Profe en Movimiento 5.0 · Juegos de mi Tierra</div>}
    >
      <Container size="wide" className="py-8">
        <div className="student-traditional-controls mb-6 text-sm font-semibold text-slate-500"><Link href="/estudiantes" className="hover:text-emerald-700">Inicio estudiantil</Link><span className="mx-2">/</span><span className="text-slate-900">Juegos tradicionales</span></div>
        <section className="student-traditional-controls relative mb-8 overflow-hidden rounded-[2rem] bg-gradient-to-br from-emerald-600 via-teal-500 to-cyan-500 p-8 text-white shadow-xl sm:p-10">
          <div className="absolute -right-14 -top-20 h-64 w-64 rounded-full bg-yellow-300/25" aria-hidden="true" />
          <div className="absolute bottom-7 left-1/2 h-16 w-16 rotate-12 rounded-3xl border-2 border-white/20" aria-hidden="true" />
          <div className="relative z-10 grid gap-6 md:grid-cols-[1fr_190px] md:items-center">
            <div>
              <p className="text-xs font-black uppercase tracking-[0.2em] text-emerald-100">Juegos de mi Tierra</p>
              <h2 className="mt-4 text-4xl font-black tracking-tight sm:text-5xl">¡Descubre cómo juega cada comunidad!</h2>
              <p className="mt-4 max-w-3xl text-lg leading-8 text-emerald-50">Elige un país y, si deseas, una región. El robot viajero preparará una guía con juegos, reglas, materiales, seguridad y su valor cultural.</p>
            </div>
            <div className="relative mx-auto h-44 w-44" aria-hidden="true"><div className="absolute inset-5 rounded-full bg-white/20" /><Image src="/images/profe-ia-robot.png" alt="" width={220} height={280} priority className="relative z-10 h-full w-full object-contain drop-shadow-2xl" /></div>
          </div>
        </section>
        <StudentTraditionalGamesWorkspace initialRemaining={remaining} isTeacher={!student && teacher.authenticated} />
      </Container>
    </AppLayout>
  );
}
