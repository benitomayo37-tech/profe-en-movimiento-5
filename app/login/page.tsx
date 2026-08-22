import type { Metadata } from "next";
import { redirect } from "next/navigation";

import AuthForm from "@/features/auth/components/AuthForm";
import AuthPageShell from "@/features/auth/components/AuthPageShell";
import AuthSetupNotice from "@/features/auth/components/AuthSetupNotice";
import { getAuthAccess, normalizeReturnTo } from "@/features/auth/server/access";
import { signInAction } from "@/features/auth/server/actions";
import StudentAuthForm from "@/features/students/components/StudentAuthForm";
import { studentSignInAction } from "@/features/students/server/actions";
import { getStudentSession } from "@/features/students/server/session";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Iniciar sesión | Profe en Movimiento",
  description: "Acceso de docentes a Profe en Movimiento 5.0.",
};

interface LoginPageProps {
  searchParams: Promise<{ next?: string; error?: string; rol?: string }>;
}

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const access = await getAuthAccess();
  const studentSession = await getStudentSession();
  const query = await searchParams;
  const isStudent = query.rol === "estudiante";
  const returnTo = normalizeReturnTo(query.next, "/dashboard");
  const encodedReturnTo = encodeURIComponent(returnTo);

  if (access.authenticated) redirect(isStudent ? "/estudiantes" : returnTo);
  if (studentSession) redirect("/estudiantes");

  const notice = query.error === "enlace"
    ? "El enlace no es válido o ya venció. Solicita uno nuevo."
    : query.error === "configuracion"
      ? "Supabase todavía no está configurado."
      : undefined;

  return (
    <AuthPageShell
      eyebrow="Elige cómo ingresar"
      title={isStudent ? "Aprende y descubre" : "Bienvenido, profe"}
      description={isStudent ? "Accede a recursos educativos creados para estudiantes." : "Ingresa para consultar tu plan y utilizar las herramientas habilitadas para tu cuenta."}
      audience={isStudent ? "student" : "teacher"}
    >
      <div className="mb-8 grid grid-cols-2 gap-1.5 rounded-2xl border border-slate-200 bg-slate-100/80 p-1.5" aria-label="Tipo de acceso">
        <a href={`/login?next=${encodedReturnTo}`} className={`flex min-h-12 items-center justify-center gap-2 rounded-xl px-3 py-3 text-center text-sm font-black transition-all ${!isStudent ? "bg-white text-blue-700 shadow-sm ring-1 ring-slate-200" : "text-slate-500 hover:bg-white/60 hover:text-slate-800"}`}>
          <span aria-hidden="true">👨‍🏫</span> Docente
        </a>
        <a href={`/login?rol=estudiante&next=${encodedReturnTo}`} className={`flex min-h-12 items-center justify-center gap-2 rounded-xl px-3 py-3 text-center text-sm font-black transition-all ${isStudent ? "bg-white text-emerald-700 shadow-sm ring-1 ring-slate-200" : "text-slate-500 hover:bg-white/60 hover:text-slate-800"}`}>
          <span aria-hidden="true">🎓</span> Estudiante
        </a>
      </div>
      {access.configured
        ? isStudent
          ? <StudentAuthForm mode="login" action={studentSignInAction} />
          : <AuthForm mode="login" action={signInAction} returnTo={returnTo} notice={notice} />
        : <AuthSetupNotice />}
    </AuthPageShell>
  );
}
