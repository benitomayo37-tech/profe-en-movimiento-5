import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";

import { AccountBadge, AppLayout, Sidebar } from "@/components/layout";
import Container from "@/components/ui/Container";
import AuthSetupNotice from "@/features/auth/components/AuthSetupNotice";
import ProfileForm from "@/features/auth/components/ProfileForm";
import { getAuthAccess } from "@/features/auth/server/access";
import { signOutAction } from "@/features/auth/server/actions";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Mi cuenta | Profe en Movimiento",
  description: "Perfil y plan de acceso docente.",
};

function AccountHeader({ email, fullName }: { email: string | null; fullName: string | null }) {
  return (
    <div className="flex min-h-20 items-center justify-between gap-4 px-6">
      <div><h1 className="text-lg font-bold text-slate-950">Mi cuenta</h1><p className="text-sm text-slate-500">Perfil y acceso a la plataforma</p></div>
      <AccountBadge authenticated email={email} fullName={fullName} />
    </div>
  );
}

export default async function AccountPage() {
  const access = await getAuthAccess();

  if (access.configured && !access.authenticated) redirect("/login?next=/cuenta");

  return (
    <AppLayout sidebar={<Sidebar />} header={<AccountHeader email={access.email} fullName={access.fullName} />} footer={<div className="px-6 py-4 text-center text-xs text-slate-500">Profe en Movimiento 5.0 · Cuenta docente</div>}>
      <Container className="py-8">
        {!access.configured ? <AuthSetupNotice /> : (
          <div className="space-y-8">
            <section className="overflow-hidden rounded-[2rem] bg-gradient-to-br from-slate-950 via-blue-950 to-blue-700 p-8 text-white shadow-2xl sm:p-10">
              <p className="text-xs font-black uppercase tracking-[0.18em] text-orange-300">Cuenta docente</p>
              <div className="mt-4 flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
                <div><h1 className="text-4xl font-black">{access.fullName || "Docente"}</h1><p className="mt-2 text-blue-100">{access.email}</p></div>
                <span className={`w-fit rounded-full px-4 py-2 text-sm font-black ${access.hasProAccess ? "bg-orange-400 text-slate-950" : "bg-white/15 text-white"}`}>Plan {access.hasProAccess ? "Pro" : "Free"}</span>
              </div>
            </section>

            <div className="grid gap-6 lg:grid-cols-2">
              <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
                <p className="text-xs font-black uppercase tracking-[0.16em] text-blue-700">Datos personales</p>
                <h2 className="mt-2 text-2xl font-black text-slate-950">Tu perfil</h2>
                <ProfileForm fullName={access.fullName ?? ""} />
              </section>

              <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
                <p className="text-xs font-black uppercase tracking-[0.16em] text-orange-600">Acceso actual</p>
                <h2 className="mt-2 text-2xl font-black text-slate-950">Plan {access.hasProAccess ? "Pro" : "Free"}</h2>
                <p className="mt-4 leading-7 text-slate-600">{access.hasProAccess ? "Tu cuenta tiene acceso a la Suite completa de miniapps y Entrenador IA." : "Puedes utilizar las herramientas gratuitas. Las miniapps Pro permanecerán protegidas hasta activar tu plan."}</p>
                <Link href="/apps" className="mt-6 inline-flex min-h-11 items-center justify-center rounded-xl bg-blue-700 px-5 py-2 font-black text-white hover:bg-blue-800">Explorar miniapps →</Link>
                <form action={signOutAction} className="mt-4"><button className="min-h-11 rounded-xl border border-slate-300 px-5 py-2 font-black text-slate-700 hover:bg-slate-50">Cerrar sesión</button></form>
              </section>
            </div>
          </div>
        )}
      </Container>
    </AppLayout>
  );
}
