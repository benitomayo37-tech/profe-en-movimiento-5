import Link from "next/link";

interface AuthenticatedAccessRequiredProps {
  returnTo: string;
  title: string;
}

export default function AuthenticatedAccessRequired({
  returnTo,
  title,
}: AuthenticatedAccessRequiredProps) {
  const loginHref = `/login?next=${encodeURIComponent(returnTo)}`;

  return (
    <section className="relative overflow-hidden rounded-[2rem] border border-slate-200 bg-white p-7 text-center shadow-xl sm:p-10">
      <div className="absolute -right-14 -top-16 h-48 w-48 rounded-full bg-blue-100 blur-3xl" />
      <div className="relative mx-auto max-w-2xl">
        <span className="mx-auto flex h-20 w-20 items-center justify-center rounded-3xl bg-gradient-to-br from-blue-700 to-cyan-500 text-4xl shadow-lg" aria-hidden="true">🔐</span>
        <p className="mt-6 text-xs font-black uppercase tracking-[0.18em] text-blue-700">Cuenta docente</p>
        <h2 className="mt-3 text-3xl font-black tracking-tight text-slate-950">{title}</h2>
        <p className="mt-4 leading-7 text-slate-600">
          Inicia sesión o crea una cuenta gratuita para generar contenido y proteger el uso de la inteligencia artificial.
        </p>
        <div className="mt-7 flex flex-col justify-center gap-3 sm:flex-row">
          <Link href={loginHref} className="inline-flex min-h-12 items-center justify-center rounded-xl bg-blue-700 px-6 py-3 font-black text-white hover:bg-blue-800">Iniciar sesión</Link>
          <Link href="/registro" className="inline-flex min-h-12 items-center justify-center rounded-xl border border-slate-300 px-6 py-3 font-black text-slate-700 hover:bg-slate-50">Crear cuenta gratuita</Link>
        </div>
      </div>
    </section>
  );
}
