import Link from "next/link";
import type { ReactNode } from "react";

import { MobileSidebar } from "./MobileSidebar";

interface AppLayoutProps {
  children: ReactNode;
  sidebar?: ReactNode;
  header?: ReactNode;
  footer?: ReactNode;
  showLegalLinks?: boolean;
  mainClassName?: string;
}

export function AppLayout({
  children,
  sidebar,
  header,
  footer,
  showLegalLinks = true,
  mainClassName = "flex-1 px-4 py-6 sm:px-6 lg:px-8",
}: AppLayoutProps) {
  const gridColumns = sidebar
    ? "lg:grid-cols-[280px_minmax(0,1fr)]"
    : "grid-cols-1";

  return (
    <div className="min-h-screen bg-slate-50 text-slate-950">
      {sidebar ? <MobileSidebar>{sidebar}</MobileSidebar> : null}

      <div
        className={`mx-auto grid min-h-screen w-full max-w-[1920px] ${gridColumns}`}
      >
        {sidebar ? (
          <aside
            aria-label="Navegación principal"
            className="hidden border-r border-slate-200 bg-white lg:block"
          >
            <div className="sticky top-0 h-screen overflow-y-auto">
              {sidebar}
            </div>
          </aside>
        ) : null}

        <div className="flex min-w-0 flex-col">
          {header ? (
            <header className="sticky top-0 z-30 border-b border-slate-200 bg-white/95 backdrop-blur">
              {header}
            </header>
          ) : null}

          <main
            id="main-content"
            className={mainClassName}
          >
            {children}
          </main>

          {footer || showLegalLinks ? (
            <footer className="border-t border-slate-200 bg-white">
              {footer}
              {showLegalLinks ? (
                <nav
                  aria-label="Información legal"
                  className="flex flex-wrap items-center justify-center gap-x-5 gap-y-2 border-t border-slate-100 px-6 py-4 text-xs font-semibold text-slate-500"
                >
                  <Link className="hover:text-blue-700" href="/privacy">Privacidad</Link>
                  <Link className="hover:text-blue-700" href="/terms">Términos de uso</Link>
                  <Link className="hover:text-blue-700" href="/refunds">Pagos y reembolsos</Link>
                  <Link className="hover:text-blue-700" href="/contact">Contacto</Link>
                </nav>
              ) : null}
            </footer>
          ) : null}
        </div>
      </div>
    </div>
  );
}
