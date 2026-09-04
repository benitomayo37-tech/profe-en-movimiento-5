import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";

import { ThemeSwitcher } from "@/components/theme/ThemeSwitcher";
import { getAuthAccess } from "@/features/auth/server/access";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Kit gratuito para profes de Educación Física | Profe en Movimiento",
  description:
    "Tres aplicaciones gratuitas para formar equipos, controlar circuitos y llevar el marcador desde tu celular.",
  alternates: { canonical: "/kit-profes" },
};

const kitApps = [
  {
    number: "01",
    icon: "🔀",
    title: "Sorteador de equipos",
    description:
      "Forma equipos equilibrados en segundos y dedica menos tiempo a organizar el grupo.",
    benefit: "Equipos listos sin discusiones",
    href: "/apps/sorteador-equipos",
    accent: "from-blue-600 to-cyan-500",
    surface: "bg-blue-50",
  },
  {
    number: "02",
    icon: "⏱️",
    title: "Cronómetro de circuitos HIIT",
    description:
      "Programa trabajo, descanso y rondas para dirigir circuitos sin perder el control del tiempo.",
    benefit: "Intervalos claros para toda la clase",
    href: "/apps/cronometro-circuitos-hiit",
    accent: "from-orange-600 to-red-500",
    surface: "bg-orange-50",
  },
  {
    number: "03",
    icon: "🏆",
    title: "Marcador y cronómetro deportivo",
    description:
      "Controla puntuación, nombres de equipos y tiempo de juego desde una sola pantalla.",
    benefit: "Partidos más ágiles y organizados",
    href: "/apps/marcador-cronometro-deportivo",
    accent: "from-slate-900 to-blue-700",
    surface: "bg-slate-50",
  },
] as const;

function ArrowIcon() {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      className="h-5 w-5"
    >
      <path d="M5 12h14M13 6l6 6-6 6" />
    </svg>
  );
}

export default async function KitProfesPage() {
  const access = await getAuthAccess();
  const accountHref = access.authenticated ? "/dashboard" : "/registro";
  const accountLabel = access.authenticated
    ? "Ir a mi Dashboard"
    : "Crear mi cuenta Free";

  return (
    <main className="overflow-hidden bg-white text-slate-950">
      <header className="sticky top-0 z-50 border-b border-white/10 bg-[#071532]/95 text-white shadow-lg backdrop-blur">
        <div className="mx-auto flex min-h-16 max-w-7xl items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
          <Link
            href="/"
            className="flex items-center gap-2"
            aria-label="Profe en Movimiento, inicio"
          >
            <Image
              src="/logos/logo-profe-en-movimiento.png"
              alt="Profe en Movimiento"
              width={58}
              height={58}
              priority
              className="h-12 w-12 rounded-lg bg-white object-contain p-1"
            />
            <span className="hidden text-sm font-black leading-tight sm:block">
              PROFE
              <br />
              <span className="text-orange-400">EN MOVIMIENTO</span>
            </span>
          </Link>

          <div className="flex items-center gap-2">
            <ThemeSwitcher />
            <Link
              href="/"
              className="hidden rounded-xl px-4 py-2.5 text-sm font-black hover:bg-white/10 sm:inline-flex"
            >
              Ver plataforma
            </Link>
            <Link
              href={accountHref}
              className="inline-flex min-h-11 items-center rounded-xl !bg-[#FC7000] px-4 py-2.5 text-sm font-black text-white shadow-lg transition hover:-translate-y-0.5 hover:!bg-[#d95f00]"
            >
              {accountLabel}
            </Link>
          </div>
        </div>
      </header>

      <section className="relative isolate bg-[#071532] text-white">
        <div className="absolute inset-0 -z-20 bg-[radial-gradient(circle_at_82%_18%,rgba(37,99,235,.55),transparent_32%),radial-gradient(circle_at_15%_85%,rgba(249,115,22,.22),transparent_28%),linear-gradient(120deg,#071532_15%,#0b2b68_100%)]" />

        <div className="mx-auto grid min-h-[620px] max-w-7xl items-center gap-12 px-4 py-16 sm:px-6 lg:grid-cols-[1.05fr_.95fr] lg:px-8">
          <div>
            <span className="inline-flex rounded-full border border-emerald-300/30 bg-emerald-400/10 px-4 py-2 text-xs font-black uppercase tracking-[.18em] text-emerald-300">
              3 aplicaciones · 100% gratis
            </span>

            <h1 className="mt-6 max-w-3xl text-5xl font-black leading-[1.02] tracking-tight sm:text-6xl lg:text-7xl">
              El kit digital que todo{" "}
              <span className="text-orange-400">profe necesita</span>
            </h1>

            <p className="mt-6 max-w-2xl text-lg leading-8 text-blue-100">
              Forma equipos, controla el tiempo y lleva el marcador desde tu
              celular. Tres herramientas listas para usar en tu próxima clase.
            </p>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <a
                href="#kit"
                className="inline-flex min-h-14 items-center justify-center gap-2 rounded-xl !bg-[#FC7000] px-7 py-3 font-black text-white shadow-xl shadow-orange-950/30 transition hover:-translate-y-0.5 hover:!bg-[#d95f00]"
              >
                Usar el kit gratis
                <ArrowIcon />
              </a>
              <Link
                href="/"
                className="inline-flex min-h-14 items-center justify-center rounded-xl border border-white/25 bg-white/10 px-7 py-3 font-black backdrop-blur transition hover:bg-white/20"
              >
                Conocer la plataforma
              </Link>
            </div>

            <div className="mt-5 flex flex-wrap gap-x-5 gap-y-2 text-sm font-semibold text-blue-100">
              <span>✓ Sin tarjeta</span>
              <span>✓ Acceso inmediato</span>
              <span>✓ Funciona en celular</span>
            </div>
          </div>

          <div className="relative mx-auto w-full max-w-lg">
            <div className="absolute -inset-5 rounded-[2.5rem] bg-blue-500/20 blur-3xl" />
            <div className="relative overflow-hidden rounded-[2rem] border border-white/15 bg-white/10 p-5 shadow-2xl backdrop-blur">
              <div className="rounded-[1.5rem] bg-white p-6 text-slate-950">
                <p className="text-xs font-black uppercase tracking-[.2em] text-blue-700">
                  Tu clase, bajo control
                </p>
                <div className="mt-5 grid gap-3">
                  {kitApps.map((app) => (
                    <div
                      key={app.title}
                      className="flex items-center gap-4 rounded-2xl border border-slate-200 p-4"
                    >
                      <span
                        className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br text-2xl text-white ${app.accent}`}
                        aria-hidden="true"
                      >
                        {app.icon}
                      </span>
                      <div>
                        <p className="font-black">{app.title}</p>
                        <p className="mt-1 text-sm text-slate-500">
                          {app.benefit}
                        </p>
                      </div>
                      <span className="ml-auto rounded-full !bg-[#10B981] px-3 py-1 text-xs font-black !text-white shadow-sm">
                        FREE
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="kit" className="scroll-mt-20 px-4 py-20 sm:px-6 lg:py-24">
        <div className="mx-auto max-w-7xl">
          <div className="mx-auto max-w-3xl text-center">
            <p className="text-xs font-black uppercase tracking-[.22em] text-orange-600">
              Abre, usa y lleva a clase
            </p>
            <h2 className="mt-4 text-4xl font-black leading-tight tracking-tight sm:text-5xl">
              Tres problemas cotidianos. Tres soluciones inmediatas.
            </h2>
            <p className="mt-5 text-lg leading-8 text-slate-600">
              No necesitas instalar nada. Elige una herramienta y comienza a
              trabajar desde el navegador.
            </p>
          </div>

          <div className="mt-14 grid gap-6 lg:grid-cols-3">
            {kitApps.map((app) => (
              <article
                key={app.title}
                className={`group flex h-full flex-col overflow-hidden rounded-[2rem] border border-slate-200 ${app.surface} p-7 shadow-sm transition hover:-translate-y-2 hover:shadow-xl sm:p-8`}
              >
                <div className="flex items-center justify-between">
                  <span
                    className={`flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br text-3xl text-white shadow-lg ${app.accent}`}
                    aria-hidden="true"
                  >
                    {app.icon}
                  </span>
                  <span className="text-4xl font-black text-slate-200">
                    {app.number}
                  </span>
                </div>

                <h3 className="mt-7 text-2xl font-black">{app.title}</h3>
                <p className="mt-4 flex-1 leading-7 text-slate-600">
                  {app.description}
                </p>
                <p className="mt-6 text-sm font-black text-emerald-700">
                  ✓ {app.benefit}
                </p>

                <Link
                  href={app.href}
                  className="mt-7 inline-flex min-h-12 items-center justify-center gap-2 rounded-xl !bg-[#155EEF] px-5 py-3 font-black !text-white shadow-lg shadow-blue-950/25 transition hover:!bg-[#0F4CC4] hover:-translate-y-0.5"
                >
                  Abrir aplicación
                  <ArrowIcon />
                </Link>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-slate-50 px-4 py-20 sm:px-6">
        <div className="mx-auto max-w-6xl">
          <div className="flex flex-col gap-6 sm:flex-row sm:items-center">
            <span
              className="flex h-20 w-20 shrink-0 items-center justify-center rounded-[1.5rem] bg-gradient-to-br from-orange-500 to-orange-600 text-4xl shadow-xl"
              aria-hidden="true"
            >
              📱
            </span>

            <div>
              <p className="text-xs font-black uppercase tracking-[.22em] text-blue-700">
                Así de sencillo
              </p>
              <h2 className="mt-3 max-w-4xl text-4xl font-black leading-tight sm:text-5xl">
                Menos tiempo organizando. Más tiempo enseñando.
              </h2>
            </div>
          </div>

          <div className="mt-10 grid gap-4 sm:grid-cols-3">
            {[
              ["1", "Elige", "Abre la herramienta que necesitas."],
              ["2", "Configura", "Agrega equipos, tiempos o puntuaciones."],
              ["3", "Muévete", "Úsala directamente durante tu clase."],
            ].map(([number, title, text]) => (
              <div
                key={number}
                className="rounded-2xl border border-slate-200 bg-white p-6"
              >
                <span className="text-2xl font-black text-orange-500">
                  {number}
                </span>
                <h3 className="mt-3 font-black">{title}</h3>
                <p className="mt-2 text-sm leading-6 text-slate-600">
                  {text}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="relative isolate overflow-hidden bg-[#0b2050] px-4 py-20 text-white sm:px-6">
        <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_85%_50%,rgba(249,115,22,.28),transparent_35%)]" />
        <div className="mx-auto flex max-w-6xl flex-col items-start justify-between gap-8 md:flex-row md:items-center">
          <div>
            <p className="text-xs font-black uppercase tracking-[.2em] text-orange-300">
              Esto es solo el comienzo
            </p>
            <h2 className="mt-3 max-w-3xl text-4xl font-black leading-tight">
              Crea tu cuenta Free y descubre todo lo que Profe en Movimiento
              puede hacer por tus clases.
            </h2>
            <p className="mt-4 max-w-2xl leading-7 text-blue-100">
              Planificación, recursos, evaluaciones, biblioteca y herramientas
              creadas para docentes de Educación Física.
            </p>
          </div>

          <Link
            href={accountHref}
            className="inline-flex min-h-14 shrink-0 items-center gap-2 rounded-xl !bg-[#FC7000] px-7 py-3 font-black text-white transition hover:-translate-y-0.5 hover:!bg-[#d95f00]"
          >
            {accountLabel}
            <ArrowIcon />
          </Link>
        </div>
      </section>

      <footer className="bg-[#061027] px-4 py-10 text-white sm:px-6">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-6 border-b border-white/10 pb-8 sm:flex-row">
          <Link href="/" className="flex items-center gap-3">
            <Image
              src="/logos/logo-profe-en-movimiento.png"
              alt="Profe en Movimiento"
              width={64}
              height={64}
              className="h-14 w-14 rounded-xl bg-white object-contain p-1"
            />
            <div>
              <p className="font-black">Profe en Movimiento</p>
              <p className="text-xs font-bold uppercase tracking-[.14em] text-orange-300">
                Educación Física, deporte y salud
              </p>
            </div>
          </Link>

          <div className="flex flex-wrap justify-center gap-5 text-sm text-slate-300">
            <Link href="/">Inicio</Link>
            <Link href="/apps">Todas las apps</Link>
            <Link href="/terms">Términos</Link>
            <Link href="/privacy">Privacidad</Link>
          </div>
        </div>

        <p className="mx-auto mt-6 max-w-7xl text-center text-xs text-slate-400">
          © {new Date().getFullYear()} Profe en Movimiento. Todos los derechos
          reservados.
        </p>
      </footer>
    </main>
  );
}