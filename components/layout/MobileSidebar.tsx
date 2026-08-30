"use client";

import type { ReactNode } from "react";
import { useEffect, useRef, useState } from "react";

interface MobileSidebarProps {
  children: ReactNode;
}

export function MobileSidebar({ children }: MobileSidebarProps) {
  const [open, setOpen] = useState(false);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLElement>(null);

  useEffect(() => {
    if (!open) {
      return;
    }

    const previousOverflow = document.body.style.overflow;
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setOpen(false);
      }
    };

    document.body.style.overflow = "hidden";
    document.addEventListener("keydown", closeOnEscape);
    requestAnimationFrame(() => panelRef.current?.querySelector<HTMLElement>("button, a")?.focus());

    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", closeOnEscape);
      triggerRef.current?.focus();
    };
  }, [open]);

  return (
    <div className="lg:hidden">
      <button
        ref={triggerRef}
        type="button"
        aria-controls="mobile-navigation"
        aria-expanded={open}
        aria-label="Abrir menú principal"
        onClick={() => setOpen(true)}
        className="fixed bottom-5 right-5 z-40 inline-flex h-14 w-14 items-center justify-center rounded-full bg-blue-700 text-2xl text-white shadow-xl shadow-blue-950/25 transition hover:bg-blue-800 focus:outline-none focus:ring-4 focus:ring-blue-200"
      >
        <span aria-hidden="true">☰</span>
      </button>

      {open ? (
        <div className="fixed inset-0 z-50" role="dialog" aria-modal="true" aria-label="Menú principal">
          <button
            type="button"
            aria-label="Cerrar menú principal"
            onClick={() => setOpen(false)}
            className="absolute inset-0 bg-slate-950/55 backdrop-blur-sm"
          />

          <aside
            ref={panelRef}
            id="mobile-navigation"
            onKeyDown={(event) => {
              if (event.key !== "Tab") return;
              const focusable = panelRef.current?.querySelectorAll<HTMLElement>('button:not([disabled]), a[href], [tabindex]:not([tabindex="-1"])');
              if (!focusable?.length) return;
              const first = focusable[0];
              const last = focusable[focusable.length - 1];
              if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
              else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
            }}
            onClick={(event) => {
              if ((event.target as HTMLElement).closest("a")) {
                setOpen(false);
              }
            }}
            className="relative h-full w-[min(88vw,320px)] overflow-y-auto bg-white shadow-2xl"
          >
            <button
              type="button"
              aria-label="Cerrar menú principal"
              onClick={() => setOpen(false)}
              className="absolute right-3 top-3 z-10 inline-flex h-10 w-10 items-center justify-center rounded-full bg-slate-100 text-xl font-bold text-slate-700 transition hover:bg-slate-200 focus:outline-none focus:ring-4 focus:ring-blue-100"
            >
              <span aria-hidden="true">×</span>
            </button>

            {children}
          </aside>
        </div>
      ) : null}
    </div>
  );
}
