import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { redirect } from "next/navigation";

import { AccountBadge, AppLayout, Sidebar } from "@/components/layout";
import Container from "@/components/ui/Container";
import { getAuthAccess } from "@/features/auth/server/access";
import StudentSidebar from "@/features/students/components/StudentSidebar";
import StudentSportsWorkspace from "@/features/students/sports/StudentSportsWorkspace";
import { getStudentSession } from "@/features/students/server/session";
import { createAdminClient } from "@/lib/supabase/admin";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Deportes para estudiantes | Profe en Movimiento",
  description: "Reportes deportivos sobre técnica, táctica y reglamento adaptados al curso.",
};

async function getRemaining(studentId: string | null) {
  if (!studentId) return 10;
  const admin = createAdminClient();
  if (!admin) return 0;
  const month = `${new Date().toISOString().slice(0, 7)}-01`;
  const { data } = await admin.from("student_monthly_usage").select("generation_count").eq("student_id", studentId).eq("usage_month", month).maybeSingle();
  const used = typeof data?.generation_count === "number" ? data.generation_count : 0;
  return Math.max(10 - used, 0);
}

async function getStudentInstitution(studentId: string | null) {
  if (!studentId) return "";
  const admin = createAdminClient();
  if (!admin) return "";

  const { data } = await admin
    .from("student_accounts")
    .select("*")
    .eq("id", studentId)
    .maybeSingle();

  if (!data || typeof data !== "object") return "";
  const profile = data as Record<string, unknown>;
  const possibleValues = [
    profile.educational_institution,
    profile.institution_name,
    profile.school_name,
    profile.school,
    profile.institution,
    profile.unidad_educativa,
  ];
  const institution = possibleValues.find(
    (value): value is string => typeof value === "string" && value.trim().length > 0,
  );
  return institution?.trim() ?? "";
}

export default async function StudentSportsPage() {
  const [student, teacher] = await Promise.all([getStudentSession(), getAuthAccess()]);
  if (!student && !teacher.authenticated) redirect("/login?rol=estudiante");

  const fullName = student?.fullName || teacher.fullName || "Docente";
  const [remaining, institution] = await Promise.all([
    getRemaining(student?.studentId ?? null),
    getStudentInstitution(student?.studentId ?? null),
  ]);
  const generatedAt = new Intl.DateTimeFormat("es-EC", {
    day: "2-digit",
    month: "long",
    year: "numeric",
    timeZone: "America/Guayaquil",
  }).format(new Date());

  return (
    <AppLayout
      sidebar={student ? <StudentSidebar fullName={student.fullName} gradeCourse={student.gradeCourse} /> : <Sidebar />}
      header={<div className="flex min-h-16 items-center justify-between px-6"><div><h1 className="text-lg font-bold">Deportes</h1><p className="text-sm text-slate-500">Técnica, táctica y reglamento</p></div><AccountBadge authenticated fullName={fullName} email={teacher.email} className="bg-blue-600" /></div>}
      footer={<div className="px-6 py-4 text-center text-xs text-slate-500">Profe en Movimiento 5.0 · Deportes en Acción</div>}
    >
      <Container size="wide" className="py-8">
        <div className="student-sports-controls mb-6 text-sm font-semibold text-slate-500"><Link href="/estudiantes" className="hover:text-blue-700">Inicio estudiantil</Link><span className="mx-2">/</span><span className="text-slate-900">Deportes</span></div>
        <section className="student-sports-controls relative mb-8 overflow-hidden rounded-[2rem] bg-gradient-to-br from-blue-700 via-cyan-500 to-emerald-400 p-8 text-white shadow-xl sm:p-10">
          <div className="absolute -right-14 -top-20 h-64 w-64 rounded-full bg-orange-300/30" aria-hidden="true" />
          <div className="relative z-10 grid gap-6 md:grid-cols-[1fr_190px] md:items-center"><div><p className="text-xs font-black uppercase tracking-[0.2em] text-cyan-100">Deportes en Acción</p><h2 className="mt-4 text-4xl font-black tracking-tight sm:text-5xl">¡Conoce el juego por dentro!</h2><p className="mt-4 max-w-3xl text-lg leading-8 text-blue-50">Investiga un deporte completo o una técnica específica. Descubre cómo se ejecuta, cuándo se utiliza y qué reglas debes conocer.</p></div><div className="relative mx-auto h-44 w-44" aria-hidden="true"><div className="absolute inset-5 rounded-full bg-white/20" /><Image src="/images/profe-ia-robot.png" alt="" width={220} height={280} priority className="relative z-10 h-full w-full object-contain drop-shadow-2xl" /></div></div>
        </section>
        <StudentSportsWorkspace
          initialRemaining={remaining}
          isTeacher={!student && teacher.authenticated}
          studentIdentification={{
            fullName,
            institution: student ? institution || "No registrada" : "Vista docente",
            educationLevel: student?.educationLevel || "Vista docente",
            gradeCourse: student?.gradeCourse || "No aplica",
            generatedAt,
          }}
        />
      </Container>
    </AppLayout>
  );
}
