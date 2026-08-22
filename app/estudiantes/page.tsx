import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { redirect } from "next/navigation";

import { AccountBadge, AppLayout, Sidebar } from "@/components/layout";
import Container from "@/components/ui/Container";
import { getAuthAccess } from "@/features/auth/server/access";
import StudentSidebar from "@/features/students/components/StudentSidebar";
import { getStudentSession } from "@/features/students/server/session";
import { createAdminClient } from "@/lib/supabase/admin";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Recursos para estudiantes | Profe en Movimiento",
  description: "Investigación, juegos, videos y evaluaciones para estudiantes.",
};

const resources = [
  { id: "historia", icon: "🏛️", title: "Historia", description: "Investiga la historia de un deporte, evento o competencia y recibe un resumen claro de hasta cuatro páginas.", consumes: true, available: true, href: "/estudiantes/historia", color: "from-amber-500 to-orange-500" },
  { id: "juegos-tradicionales", icon: "🪁", title: "Juegos tradicionales", description: "Descubre juegos de un país o región, sus materiales, reglas y formas de practicarlos.", consumes: true, available: true, href: "/estudiantes/juegos-tradicionales", color: "from-emerald-500 to-teal-600" },
  { id: "deportes", icon: "🏀", title: "Deportes", description: "Consulta elementos técnicos, tácticos y reglamentarios o estudia una técnica específica.", consumes: true, available: true, href: "/estudiantes/deportes", color: "from-blue-600 to-cyan-500" },
  { id: "juegos-interactivos", icon: "🎮", title: "Juegos interactivos", description: "Aprende con quiz, sopa de letras, puzzle y otros desafíos de temática deportiva.", consumes: false, available: true, href: "/estudiantes/juegos-interactivos", color: "from-violet-600 to-fuchsia-500" },
  { id: "videos", icon: "▶️", title: "Videos", description: "Encuentra videos deportivos educativos y acontecimientos históricos en fuentes seguras.", consumes: false, available: true, href: "/estudiantes/videos", color: "from-red-600 to-rose-500" },
  { id: "examen", icon: "📝", title: "Realizar examen", description: "Ingresa únicamente con el código entregado por tu docente. Cada examen genera una versión equivalente y calificable.", consumes: false, codeRequired: true, available: true, href: "/estudiantes/examen", color: "from-slate-800 to-blue-900" },
];

async function getMonthlyUsage(studentId: string | null) {
  if (!studentId) return 0;
  const admin = createAdminClient();
  if (!admin) return 0;
  const month = new Date().toISOString().slice(0, 7) + "-01";
  const { data } = await admin.from("student_monthly_usage").select("generation_count").eq("student_id", studentId).eq("usage_month", month).maybeSingle();
  return typeof data?.generation_count === "number" ? data.generation_count : 0;
}

export default async function StudentPortalPage() {
  const [student, teacher] = await Promise.all([getStudentSession(), getAuthAccess()]);
  if (!student && !teacher.authenticated) redirect("/login?rol=estudiante");

  const fullName = student?.fullName || teacher.fullName || "Docente";
  const firstName = fullName.trim().split(/\s+/)[0] || "estudiante";
  const used = await getMonthlyUsage(student?.studentId ?? null);
  const remaining = Math.max(10 - used, 0);

  return (
    <AppLayout
      sidebar={student ? <StudentSidebar fullName={student.fullName} gradeCourse={student.gradeCourse} /> : <Sidebar />}
      header={(
        <div className="flex min-h-16 items-center justify-between px-6">
          <div><h1 className="text-lg font-bold">Recursos para estudiantes</h1><p className="text-sm text-slate-500">Aprende, investiga y comprueba tus conocimientos</p></div>
          <AccountBadge authenticated fullName={fullName} email={teacher.email} className="bg-emerald-600" />
        </div>
      )}
      footer={<div className="px-6 py-4 text-center text-xs text-slate-500">Profe en Movimiento 5.0 · Espacio estudiantil seguro</div>}
    >
      <Container size="wide" className="space-y-9 py-8">
        <section className="relative overflow-hidden rounded-[2rem] bg-gradient-to-br from-blue-950 via-blue-700 to-cyan-500 p-8 text-white shadow-xl sm:p-10">
          <div className="absolute -right-16 -top-20 h-64 w-64 rounded-full bg-orange-400/30" aria-hidden="true" />
          <div className="absolute bottom-5 right-64 h-20 w-20 rotate-12 rounded-3xl border-2 border-white/15" aria-hidden="true" />
          <div className="relative z-10 grid gap-6 lg:grid-cols-[1fr_230px] lg:items-center">
            <div>
              <p className="text-xs font-black uppercase tracking-[0.2em] text-cyan-100">Tu zona de aprendizaje en movimiento</p>
              <h2 className="mt-4 text-4xl font-black tracking-tight sm:text-5xl">¡Hola, {firstName}! 👋</h2>
              <p className="mt-4 max-w-3xl text-lg leading-8 text-blue-50">Investiga, juega y supera nuevos retos de Educación Física con recursos adaptados a tu nivel.</p>
              <div className="mt-7 flex flex-wrap gap-3">
                <span className="rounded-full border border-white/20 bg-white/15 px-4 py-2 text-sm font-bold">🔎 Investiga temas deportivos</span>
                <span className="rounded-full border border-white/20 bg-white/15 px-4 py-2 text-sm font-bold">🎮 Aprende jugando</span>
                <span className="rounded-full border border-white/20 bg-white/15 px-4 py-2 text-sm font-bold">🏆 Supera tus retos</span>
              </div>
            </div>
            <div className="relative mx-auto h-52 w-52" aria-hidden="true">
              <div className="absolute inset-5 rounded-full bg-white/15 blur-sm" />
              <Image src="/images/profe-ia-robot.png" alt="" width={220} height={280} priority className="relative z-10 h-full w-full object-contain drop-shadow-2xl" />
            </div>
          </div>
        </section>

        <section className="grid gap-5 rounded-3xl border border-blue-100 bg-gradient-to-r from-white to-blue-50 p-6 shadow-sm md:grid-cols-[1fr_auto] md:items-center">
          <div><p className="text-xs font-black uppercase tracking-[0.18em] text-blue-700">Tu energía para investigar</p><h2 className="mt-2 text-2xl font-black">Tienes {remaining} de 10 investigaciones disponibles</h2><p className="mt-2 text-sm text-slate-600">Historia, Juegos tradicionales y Deportes usan una investigación. Tu energía se recarga cada mes.</p></div>
          <div className="flex h-24 w-24 flex-col items-center justify-center rounded-full border-[9px] border-cyan-100 bg-white text-blue-800 shadow-inner"><span className="text-3xl font-black">{remaining}</span><span className="text-[10px] font-black uppercase">disponibles</span></div>
        </section>

        <section>
          <p className="text-xs font-black uppercase tracking-[0.18em] text-orange-600">Elige tu próxima misión</p>
          <h2 className="mt-2 text-3xl font-black tracking-tight">¿Qué quieres descubrir hoy?</h2>
          <div className="mt-6 grid gap-6 md:grid-cols-2 xl:grid-cols-3">
            {resources.map((resource) => (
              <article id={resource.id} key={resource.id} className="group scroll-mt-24 overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-xl">
                <div className={`relative overflow-hidden bg-gradient-to-br ${resource.color} p-6 text-white`}><div className="absolute -right-8 -top-8 h-28 w-28 rounded-full bg-white/15" aria-hidden="true" /><span className="relative text-4xl" aria-hidden>{resource.icon}</span><p className="relative mt-5 text-xs font-black uppercase tracking-[0.16em]">{resource.codeRequired ? "Código docente requerido" : resource.consumes ? "Usa 1 investigación" : "Uso libre"}</p></div>
                <div className="p-6"><h3 className="text-2xl font-black">{resource.title}</h3><p className="mt-3 min-h-20 text-sm leading-7 text-slate-600">{resource.description}</p>{resource.available && resource.href ? <Link href={resource.href} className="mt-5 inline-flex rounded-xl bg-gradient-to-r from-orange-500 to-amber-500 px-4 py-3 text-sm font-black text-white shadow-sm transition group-hover:shadow-md">¡Comenzar misión! →</Link> : <span className="mt-5 inline-flex rounded-xl bg-slate-100 px-4 py-3 text-sm font-black text-slate-500">Próximamente</span>}</div>
              </article>
            ))}
          </div>
        </section>

        {teacher.authenticated ? <p className="rounded-2xl border border-blue-200 bg-blue-50 p-4 text-sm font-semibold text-blue-900">Estás viendo el espacio estudiantil desde tu cuenta docente. <Link href="/dashboard" className="font-black underline">Volver al Dashboard docente</Link>.</p> : null}
      </Container>
    </AppLayout>
  );
}
