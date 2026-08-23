import type { ReactNode } from "react";
import Link from "next/link";

import Container from "@/components/ui/Container";

interface LegalSection {
  id: string;
  title: string;
  content: ReactNode;
}

interface LegalPageShellProps {
  eyebrow: string;
  title: string;
  description: string;
  updatedAt: string;
  sections: LegalSection[];
}

const legalNavigation = [
  { label: "Privacidad", href: "/privacy" },
  { label: "Términos de uso", href: "/terms" },
  { label: "Pagos y reembolsos", href: "/refunds" },
  { label: "Contacto", href: "/contact" },
];

function LegalHeader() {
  return (
    <header className="border-b border-slate-200 bg-white">
      <div className="mx-auto flex min-h-20 max-w-7xl items-center justify-between gap-4 px-6">
        <div className="min-w-0">
          <p className="truncate text-lg font-bold text-slate-950">
            Profe en Movimiento
          </p>
          <p className="truncate text-sm text-slate-500">
            Educación Física · Deporte · Salud
          </p>
        </div>

        <Link
          href="/"
          className="rounded-xl border border-slate-300 bg-white px-4 py-2 text-sm font-bold text-slate-700 transition hover:bg-slate-50"
        >
          ← Volver al inicio
        </Link>
      </div>
    </header>
  );
}

function LegalFooter() {
  return (
    <footer className="border-t border-slate-200 bg-slate-950">
      <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-center gap-x-6 gap-y-3 px-6 py-6 text-center text-xs text-slate-300">
        <span>© 2026 Profe en Movimiento</span>

        {legalNavigation.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className="transition hover:text-white"
          >
            {item.label}
          </Link>
        ))}
      </div>
    </footer>
  );
}

export default function LegalPageShell({
  eyebrow,
  title,
  description,
  updatedAt,
  sections,
}: LegalPageShellProps) {
  return (
    <div className="min-h-screen bg-slate-50">
      <LegalHeader />

      <main>
        <Container className="py-8 lg:py-12">
          <section className="overflow-hidden rounded-[2rem] bg-gradient-to-br from-slate-950 via-blue-950 to-blue-700 px-6 py-10 text-white shadow-2xl sm:px-10 lg:px-12 lg:py-14">
            <p className="text-xs font-black uppercase tracking-[0.18em] text-orange-300">
              {eyebrow}
            </p>

            <h1 className="mt-3 max-w-4xl text-4xl font-black tracking-tight sm:text-5xl">
              {title}
            </h1>

            <p className="mt-5 max-w-3xl text-base leading-8 text-blue-100 sm:text-lg">
              {description}
            </p>

            <p className="mt-6 text-sm font-semibold text-blue-200">
              Última actualización: {updatedAt}
            </p>
          </section>

          <div className="mt-8 grid items-start gap-8 lg:grid-cols-[280px_minmax(0,1fr)]">
            <aside className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm lg:sticky lg:top-8">
              <p className="text-xs font-black uppercase tracking-[0.16em] text-orange-600">
                Información legal
              </p>

              <nav
                className="mt-4 grid gap-2"
                aria-label="Información legal"
              >
                {legalNavigation.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    className="rounded-xl px-4 py-3 text-sm font-bold text-slate-700 transition hover:bg-blue-50 hover:text-blue-700"
                  >
                    {item.label}
                  </Link>
                ))}
              </nav>
            </aside>

            <article className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8 lg:p-10">
              <div className="space-y-10">
                {sections.map((section, index) => (
                  <section
                    key={section.id}
                    id={section.id}
                    className={
                      index === 0
                        ? undefined
                        : "border-t border-slate-200 pt-10"
                    }
                  >
                    <h2 className="text-2xl font-black tracking-tight text-slate-950">
                      {section.title}
                    </h2>

                    <div className="mt-4 space-y-4 text-base leading-8 text-slate-600">
                      {section.content}
                    </div>
                  </section>
                ))}
              </div>
            </article>
          </div>
        </Container>
      </main>

      <LegalFooter />
    </div>
  );
}