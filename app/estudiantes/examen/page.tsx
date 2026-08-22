import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";

import { AccountBadge, AppLayout, Sidebar } from "@/components/layout";
import Container from "@/components/ui/Container";
import { getAuthAccess } from "@/features/auth/server/access";
import StudentExamWorkspace from "@/features/student-exams/components/StudentExamWorkspace";
import StudentSidebar from "@/features/students/components/StudentSidebar";
import { getStudentSession } from "@/features/students/server/session";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Realizar examen | Profe en Movimiento" };

export default async function StudentExamPage() {
  const [student, teacher] = await Promise.all([getStudentSession(), getAuthAccess()]);
  if (!student && !teacher.authenticated) redirect("/login?rol=estudiante");
  const fullName = student?.fullName || teacher.fullName || "Docente";
  return (
    <AppLayout sidebar={student ? <StudentSidebar fullName={student.fullName} gradeCourse={student.gradeCourse} /> : <Sidebar />} header={<div className="flex min-h-16 items-center justify-between px-6"><div><h1 className="text-lg font-bold">Realizar examen</h1><p className="text-sm text-slate-500">Evaluación autorizada por tu docente</p></div><AccountBadge authenticated fullName={fullName} email={teacher.email} className="bg-blue-800" /></div>} footer={<div className="px-6 py-4 text-center text-xs text-slate-500">Profe en Movimiento 5.0 · Evaluación estudiantil</div>}>
      <Container size="wide" className="space-y-7 py-8">
        <div className="text-sm font-semibold text-slate-500"><Link href="/estudiantes" className="hover:text-blue-700">Inicio estudiantil</Link><span className="mx-2">/</span><span className="text-slate-900">Realizar examen</span></div>
        <section className="relative overflow-hidden rounded-[2rem] bg-gradient-to-br from-slate-950 via-blue-900 to-blue-600 p-8 text-white shadow-xl sm:p-10"><div className="absolute -right-16 -top-16 h-56 w-56 rounded-full bg-orange-400/25" /><p className="relative text-xs font-black uppercase tracking-[0.2em] text-cyan-200">Reto autorizado</p><h2 className="relative mt-3 text-4xl font-black sm:text-5xl">¡Demuestra lo que aprendiste!</h2><p className="relative mt-4 max-w-3xl text-lg leading-8 text-blue-100">Necesitas el código de tu docente. Al finalizar recibirás tu nota, las correcciones y un documento listo para imprimir.</p></section>
        <StudentExamWorkspace defaultName={student?.fullName || ""} defaultGradeCourse={student?.gradeCourse || ""} teacherView={!student && teacher.authenticated} />
      </Container>
    </AppLayout>
  );
}
