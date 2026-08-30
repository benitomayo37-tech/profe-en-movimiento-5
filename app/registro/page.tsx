import type { Metadata } from "next";
import { redirect } from "next/navigation";

import AuthForm from "@/features/auth/components/AuthForm";
import AuthPageShell from "@/features/auth/components/AuthPageShell";
import AuthSetupNotice from "@/features/auth/components/AuthSetupNotice";
import { getAuthAccess } from "@/features/auth/server/access";
import { signUpAction } from "@/features/auth/server/actions";
import { getStudentSession } from "@/features/students/server/session";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Crear cuenta | Profe en Movimiento",
  description: "Registro de docentes en Profe en Movimiento 5.0.",
};

interface RegisterPageProps {
  searchParams: Promise<{ rol?: string }>;
}

export default async function RegisterPage({ searchParams }: RegisterPageProps) {
  const access = await getAuthAccess();
  const studentSession = await getStudentSession();
  const query = await searchParams;
  const isStudent = query.rol === "estudiante";
  if (isStudent) redirect("/login?rol=estudiante");
  if (access.authenticated) redirect(isStudent ? "/estudiantes" : "/cuenta");
  if (studentSession) redirect("/estudiantes");

  return (
    <AuthPageShell
      eyebrow={isStudent ? "Registro estudiantil" : "Registro docente"}
      title="Tu espacio educativo"
      description={isStudent ? "Crea un acceso gratuito con límites mensuales, sin necesidad de correo electrónico." : "Crea una cuenta gratuita. Si adquieres el plan Pro, activaremos las herramientas adicionales en este mismo perfil."}
      audience={isStudent ? "student" : "teacher"}
    >
      <div className="mb-7 grid grid-cols-2 gap-2 rounded-2xl bg-slate-100 p-1.5" aria-label="Tipo de registro">
        <a href="/registro" className={`rounded-xl px-4 py-3 text-center text-sm font-black ${!isStudent ? "bg-white text-blue-700 shadow" : "text-slate-500"}`}>Docente</a>
        <a href="/registro?rol=estudiante" className={`rounded-xl px-4 py-3 text-center text-sm font-black ${isStudent ? "bg-white text-emerald-700 shadow" : "text-slate-500"}`}>Estudiante</a>
      </div>
      {access.configured
        ? <AuthForm mode="register" action={signUpAction} />
        : <AuthSetupNotice />}
    </AuthPageShell>
  );
}
