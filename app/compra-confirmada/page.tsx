import type { Metadata } from "next";
import Link from "next/link";

import { AccountBadge, AppLayout, Sidebar } from "@/components/layout";
import Container from "@/components/ui/Container";
import AuthSetupNotice from "@/features/auth/components/AuthSetupNotice";
import { getAuthAccess } from "@/features/auth/server/access";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Compra recibida | Profe en Movimiento",
  description: "Pasos para activar el Plan Pro después de una compra en Hotmart.",
  robots: { index: false, follow: false },
};

function PurchaseHeader({ access }: { access: Awaited<ReturnType<typeof getAuthAccess>> }) {
  return (
    <div className="flex min-h-20 items-center justify-between gap-4 px-6">
      <div className="min-w-0">
        <h1 className="truncate text-lg font-bold text-slate-950">Compra recibida</h1>
        <p className="truncate text-sm text-slate-500">Activación de tu Plan Pro</p>
      </div>
      <AccountBadge authenticated={access.authenticated} email={access.email} fullName={access.fullName} />
    </div>
  );
}

function PurchaseFooter() {
  return <div className="px-6 py-4 text-center text-xs text-slate-500">Profe en Movimiento 5.0 · Compra segura procesada por Hotmart</div>;
}

export default async function PurchaseConfirmedPage() {
  const access = await getAuthAccess();

  const status = access.hasProAccess
    ? {
        eyebrow: "Activación completa",
        title: "¡Tu Plan Pro ya está activo!",
        description: "Tu cuenta ya puede utilizar la Suite completa de miniapps y las herramientas Pro habilitadas.",
        badge: "Plan Pro activo",
        badgeClassName: "bg-emerald-100 text-emerald-800",
      }
    : access.authenticated
      ? {
          eyebrow: "Confirmación en proceso",
          title: "Estamos verificando tu compra",
          description: "Hotmart puede tardar unos minutos en confirmar el pago. Cuando recibamos la aprobación, tu Plan Pro se activará automáticamente.",
          badge: "Activación pendiente",
          badgeClassName: "bg-amber-100 text-amber-900",
        }
      : {
          eyebrow: "Último paso",
          title: "Completa el acceso a tu Suite",
          description: "Crea tu cuenta o inicia sesión para que podamos asociar la compra con tu perfil docente.",
          badge: "Cuenta requerida",
          badgeClassName: "bg-blue-100 text-blue-800",
        };

  return (
    <AppLayout sidebar={<Sidebar />} header={<PurchaseHeader access={access} />} footer={<PurchaseFooter />}>
      <Container className="py-8">
        {!access.configured ? (
          <AuthSetupNotice />
        ) : (
          <div className="space-y-8">
            <section className="relative overflow-hidden rounded-[2rem] bg-gradient-to-br from-slate-950 via-blue-950 to-blue-700 px-6 py-10 text-white shadow-2xl sm:px-10 lg:px-12 lg:py-14">
              <div className="absolute -right-16 -top-24 h-72 w-72 rounded-full bg-orange-400/20 blur-3xl" />
              <div className="relative max-w-4xl">
                <span className="inline-flex rounded-full border border-white/20 bg-white/10 px-4 py-2 text-xs font-black uppercase tracking-[0.16em] text-orange-200">Suite Pro de miniapps</span>
                <p className="mt-7 text-sm font-black uppercase tracking-[0.18em] text-orange-300">{status.eyebrow}</p>
                <h1 className="mt-3 text-4xl font-black tracking-tight sm:text-5xl">{status.title}</h1>
                <p className="mt-5 max-w-3xl text-base leading-8 text-blue-100 sm:text-lg">{status.description}</p>
              </div>
            </section>

            <div className="grid items-start gap-8 lg:grid-cols-[minmax(0,1fr)_360px]">
              <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8" aria-labelledby="activation-steps-title">
                <p className="text-xs font-black uppercase tracking-[0.16em] text-blue-700">Acceso paso a paso</p>
                <h2 id="activation-steps-title" className="mt-2 text-3xl font-black tracking-tight text-slate-950">¿Qué debes hacer ahora?</h2>
                <ol className="mt-7 space-y-4">
                  {[
                    ["1", "Utiliza el mismo correo", "Regístrate o inicia sesión con exactamente el mismo correo electrónico que utilizaste en la compra de Hotmart."],
                    ["2", "Confirma tu cuenta", "Si acabas de registrarte, abre el mensaje de Supabase y confirma tu dirección de correo electrónico."],
                    ["3", "Entra a App para profes", "Después de la aprobación del pago, el Plan Pro se habilitará automáticamente en tu perfil."],
                  ].map(([number, title, description]) => (
                    <li key={number} className="flex gap-4 rounded-2xl border border-blue-100 bg-blue-50 p-5">
                      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-700 font-black text-white">{number}</span>
                      <div>
                        <h3 className="font-black text-slate-950">{title}</h3>
                        <p className="mt-1 text-sm leading-6 text-slate-600">{description}</p>
                      </div>
                    </li>
                  ))}
                </ol>
                <div className="mt-7 rounded-2xl border border-orange-200 bg-orange-50 p-5 text-sm leading-6 text-orange-950">
                  <p className="font-black">Importante sobre el correo</p>
                  <p className="mt-1">Si utilizas un correo diferente al de la compra, Hotmart no podrá asociar automáticamente la suscripción con tu cuenta de Profe en Movimiento.</p>
                </div>
              </section>

              <aside className="space-y-5" aria-label="Estado y accesos">
                <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-xl">
                  <span className={`inline-flex rounded-full px-3 py-1.5 text-xs font-black uppercase tracking-[0.12em] ${status.badgeClassName}`}>{status.badge}</span>
                  {access.authenticated ? (
                    <div className="mt-5 rounded-2xl border border-slate-200 bg-slate-50 p-4">
                      <p className="text-xs font-bold uppercase tracking-wide text-slate-500">Cuenta identificada</p>
                      <p className="mt-1 break-all font-bold text-slate-900">{access.email}</p>
                    </div>
                  ) : null}
                  <div className="mt-6 grid gap-3">
                    {access.hasProAccess ? (
                      <>
                        <Link href="/apps" className="flex min-h-12 items-center justify-center rounded-xl bg-orange-500 px-5 py-3 text-center font-black text-white transition hover:bg-orange-600">Entrar a las miniapps →</Link>
                        <Link href="/cuenta" className="flex min-h-12 items-center justify-center rounded-xl border border-slate-300 px-5 py-3 text-center font-black text-slate-700 transition hover:bg-slate-50">Ver mi cuenta</Link>
                      </>
                    ) : access.authenticated ? (
                      <>
                        <Link href="/compra-confirmada" className="flex min-h-12 items-center justify-center rounded-xl bg-blue-700 px-5 py-3 text-center font-black text-white transition hover:bg-blue-800">Revisar activación</Link>
                        <Link href="/cuenta" className="flex min-h-12 items-center justify-center rounded-xl border border-slate-300 px-5 py-3 text-center font-black text-slate-700 transition hover:bg-slate-50">Ver mi cuenta</Link>
                      </>
                    ) : (
                      <>
                        <Link href="/registro" className="flex min-h-12 items-center justify-center rounded-xl bg-blue-700 px-5 py-3 text-center font-black text-white transition hover:bg-blue-800">Crear mi cuenta</Link>
                        <Link href="/login?next=/compra-confirmada" className="flex min-h-12 items-center justify-center rounded-xl border border-slate-300 px-5 py-3 text-center font-black text-slate-700 transition hover:bg-slate-50">Ya tengo una cuenta</Link>
                      </>
                    )}
                  </div>
                </section>
                <section className="rounded-2xl border border-emerald-200 bg-emerald-50 p-5 text-sm leading-6 text-emerald-950">
                  <p className="font-black">Pago protegido por Hotmart</p>
                  <p className="mt-1">El cobro, la renovación y las solicitudes comerciales se gestionan en el entorno seguro de Hotmart.</p>
                </section>
              </aside>
            </div>
          </div>
        )}
      </Container>
    </AppLayout>
  );
}
