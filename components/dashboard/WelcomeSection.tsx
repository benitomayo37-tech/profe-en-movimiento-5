import Link from "next/link";
import type { AuthAccess } from "@/features/auth/types";

interface WelcomeSectionProps {
  userName?: string;
  access: AuthAccess;
}

export default function WelcomeSection({
  userName = "Armando",
  access,
}: WelcomeSectionProps) {
  return (
    <section className="rounded-3xl bg-gradient-to-br from-blue-950 via-blue-800 to-blue-600 px-6 py-8 text-white shadow-xl sm:px-8 lg:px-10">
      <div className="max-w-4xl">
        <div className="flex flex-wrap gap-2">
          <span className="inline-flex rounded-full border border-white/20 bg-white/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-blue-100">Centro de operaciones</span>
          <span className="inline-flex rounded-full bg-orange-400 px-3 py-1 text-xs font-black uppercase tracking-[0.14em] text-slate-950">Plan {access.hasProAccess ? "Pro" : "Free"}</span>
          {access.role === "admin" ? <span className="inline-flex rounded-full bg-amber-200 px-3 py-1 text-xs font-black uppercase tracking-[0.14em] text-amber-950">Administrador</span> : null}
        </div>

        <h2 className="mt-5 text-3xl font-black tracking-tight sm:text-4xl">
          Bienvenido, {userName}
        </h2>

        <p className="mt-4 max-w-3xl text-sm leading-7 text-blue-100 sm:text-base">
          Organiza tus clases, crea recursos educativos y planifica
          entrenamientos deportivos con Profe IA y Entrenador IA desde un
          solo lugar.
        </p>

        <div className="mt-7 flex flex-wrap gap-3">
          <Link
            href="/ai"
            className="inline-flex items-center justify-center rounded-xl bg-orange-500 px-5 py-3 text-sm font-bold text-white shadow-lg transition hover:-translate-y-0.5 hover:bg-orange-600"
          >
            Abrir Profe IA
          </Link>

          <Link
            href="/entrenador-ia"
            className="inline-flex items-center justify-center rounded-xl bg-emerald-500 px-5 py-3 text-sm font-bold text-white shadow-lg transition hover:-translate-y-0.5 hover:bg-emerald-600"
          >
            Abrir Entrenador IA
          </Link>

          <Link
            href="/resources"
            className="inline-flex items-center justify-center rounded-xl border border-white/30 bg-white/10 px-5 py-3 text-sm font-bold text-white transition hover:bg-white/20"
          >
            Explorar recursos
          </Link>
          <Link href="/cuenta" className="inline-flex items-center justify-center rounded-xl border border-white/30 bg-white/10 px-5 py-3 text-sm font-bold text-white transition hover:bg-white/20 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-white/30">Ver mi cuenta</Link>
        </div>
      </div>
    </section>
  );
}
