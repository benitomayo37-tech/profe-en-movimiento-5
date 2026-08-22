import type { ReactNode } from "react";
import Link from "next/link";

import { AppLayout, Sidebar } from "@/components/layout";
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
    <div className="flex min-h-20 items-center justify-between gap-4 px-6">
      <div className="min-w-0">
        <p className="truncate text-lg font-bold text-slate-950">
          Información y soporte
        </p>
        <p className="truncate text-sm text-slate-500">
          Transparencia para nuestra comunidad docente
        </p>
      </div>

      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-orange-500 font-bold text-white">
        PM
      </div>
    </div>
  );
}

function LegalFooter() {
  return (
    <div className="flex flex-wrap items-center justify-center gap-x-5 gap-y-2 px-6 py-5 text-center text-xs text-slate-500">
      <span>© 2026 Profe en Movimiento</span>
      {legalNavigation.map((item) => (
        <Link key={item.href} href={item.href} className="hover:text-blue-700">
          {item.label}
        </Link>
      ))}
    </div>
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
    <AppLayout
      sidebar={<Sidebar />}
      header={<LegalHeader />}
      footer={<LegalFooter />}
      showLegalLinks={false}
    >
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
          <aside className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm lg:sticky lg:top-28">
            <p className="text-xs font-black uppercase tracking-[0.16em] text-orange-600">
              Información legal
            </p>
            <nav className="mt-4 grid gap-2" aria-label="Información legal">
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
                    index === 0 ? undefined : "border-t border-slate-200 pt-10"
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
    </AppLayout>
  );
}
