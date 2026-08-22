import Image from "next/image";
import Link from "next/link";
import type { ReactNode } from "react";

interface AuthPageShellProps {
  eyebrow: string;
  title: string;
  description: string;
  children: ReactNode;
  audience?: "teacher" | "student";
}

export default function AuthPageShell({ eyebrow, title, description, children, audience = "teacher" }: AuthPageShellProps) {
  return (
    <main className="relative min-h-screen overflow-hidden bg-[#f4f7fb] px-4 py-5 sm:px-6 sm:py-8 lg:flex lg:items-center lg:py-10">
      <div className="pointer-events-none absolute -left-32 top-1/3 h-80 w-80 rounded-full bg-blue-200/40 blur-3xl" />
      <div className="pointer-events-none absolute -right-32 bottom-0 h-96 w-96 rounded-full bg-orange-100/70 blur-3xl" />

      <div className="relative mx-auto grid w-full max-w-6xl overflow-hidden rounded-[2rem] border border-white/80 bg-white shadow-[0_30px_80px_-30px_rgba(15,23,42,0.35)] lg:min-h-[690px] lg:grid-cols-[1.08fr_0.92fr]">
        <section className="relative isolate flex overflow-hidden bg-[#07132f] p-7 text-white sm:p-10 lg:p-14">
          <div className="absolute inset-0 -z-20 bg-[radial-gradient(circle_at_15%_15%,rgba(37,99,235,0.55),transparent_32%),radial-gradient(circle_at_90%_90%,rgba(249,115,22,0.35),transparent_36%)]" />
          <div className="absolute -right-20 -top-20 -z-10 h-72 w-72 rounded-full border-[54px] border-white/[0.035]" />
          <div className="absolute -bottom-24 -left-20 -z-10 h-72 w-72 rounded-full border-[44px] border-orange-400/[0.08]" />
          <div className="relative flex w-full flex-col">
            <Link href="/" className="inline-flex w-fit items-center gap-3 rounded-2xl border border-white/15 bg-white/95 p-2 pr-4 shadow-xl backdrop-blur" aria-label="Ir a la página principal">
              <Image src="/logos/logo-profe-en-movimiento.png" alt="Profe en Movimiento" width={92} height={92} priority className="h-16 w-16 object-contain" />
              <span className="max-w-32 text-sm font-black leading-tight text-[#0b2050]">Profe en Movimiento</span>
            </Link>

            <div className="my-auto py-12 lg:py-16">
              <p className="text-xs font-black uppercase tracking-[0.24em] text-orange-300">{eyebrow}</p>
              <h1 className="mt-4 max-w-xl text-4xl font-black leading-[1.08] tracking-tight sm:text-5xl lg:text-[3.4rem]">{title}</h1>
              <p className="mt-5 max-w-lg text-base leading-7 text-blue-100 sm:text-lg">{description}</p>

              <div className="mt-9 grid max-w-lg gap-3 sm:grid-cols-2">
                <div className="rounded-2xl border border-white/10 bg-white/[0.07] p-4 backdrop-blur-sm">
                  <span className="text-xl" aria-hidden="true">✨</span>
                  <p className="mt-2 font-black">Planifica con IA</p>
                  <p className="mt-1 text-xs leading-5 text-blue-100">Convierte tus ideas en recursos listos para usar.</p>
                </div>
                <div className="rounded-2xl border border-white/10 bg-white/[0.07] p-4 backdrop-blur-sm">
                  <span className="text-xl" aria-hidden="true">📚</span>
                  <p className="mt-2 font-black">Todo en un lugar</p>
                  <p className="mt-1 text-xs leading-5 text-blue-100">Herramientas, historial y biblioteca profesional.</p>
                </div>
              </div>
            </div>

            <p className="flex items-center gap-2 text-xs font-semibold text-blue-200">
              <span className="flex h-6 w-6 items-center justify-center rounded-full bg-emerald-400/15 text-emerald-300" aria-hidden="true">✓</span>
              Acceso personal y protegido
              <span className="hidden text-blue-400 sm:inline">·</span>
              <span className="hidden sm:inline">{audience === "student" ? "Espacio para estudiantes" : "Cuentas Free y Pro"}</span>
            </p>
          </div>
        </section>
        <section className="relative flex items-center p-6 sm:p-10 lg:p-12 xl:p-14">
          <div className="w-full">{children}</div>
        </section>
      </div>
    </main>
  );
}
