"use client";

import Link from "next/link";
import { useEffect, useId } from "react";

interface ProUpgradeDialogProps {
  open: boolean;
  toolName: string;
  onClose: () => void;
}

export default function ProUpgradeDialog({
  open,
  toolName,
  onClose,
}: ProUpgradeDialogProps) {
  const titleId = useId();

  useEffect(() => {
    if (!open) return;

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") onClose();
    }

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/65 p-4 backdrop-blur-sm"
      onMouseDown={(event) => {
        if (event.currentTarget === event.target) onClose();
      }}
    >
      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        className="relative w-full max-w-xl overflow-hidden rounded-[2rem] border border-white/20 bg-white p-7 shadow-2xl sm:p-9"
      >
        <div className="absolute -right-16 -top-20 h-52 w-52 rounded-full bg-orange-200/70 blur-3xl" />
        <button
          type="button"
          onClick={onClose}
          aria-label="Cerrar"
          className="absolute right-5 top-5 z-10 flex h-10 w-10 items-center justify-center rounded-full border border-slate-200 bg-white text-xl font-black text-slate-500 hover:bg-slate-50"
        >
          ×
        </button>

        <div className="relative">
          <span className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-orange-500 to-amber-400 text-3xl shadow-lg" aria-hidden="true">
            🔒
          </span>
          <p className="mt-6 text-xs font-black uppercase tracking-[0.18em] text-orange-600">
            Herramienta Pro
          </p>
          <h2 id={titleId} className="mt-2 pr-10 text-3xl font-black tracking-tight text-slate-950">
            {toolName}
          </h2>
          <p className="mt-4 leading-7 text-slate-600">
            Esta herramienta pertenece al Plan Pro. Actívalo para utilizar todas las herramientas de Profe IA, la planificación deportiva completa y la Suite de 19 miniapps.
          </p>

          <div className="mt-6 rounded-2xl bg-blue-50 p-4 text-sm leading-6 text-blue-950">
            <strong>Plan Pro: $4,99 al mes.</strong> Tu cuenta Free conserva 3 planificaciones y 3 sesiones de entrenamiento gratuitas cada mes.
          </div>

          <div className="mt-7 flex flex-col gap-3 sm:flex-row">
            <Link
              href="/checkout?product=suite-19-miniapps-docentes"
              className="inline-flex min-h-12 flex-1 items-center justify-center rounded-xl bg-orange-500 px-6 py-3 text-center font-black text-slate-950 hover:bg-orange-400"
            >
              Activar Plan Pro
            </Link>
            <button
              type="button"
              onClick={onClose}
              className="inline-flex min-h-12 flex-1 items-center justify-center rounded-xl border border-slate-300 px-6 py-3 font-black text-slate-700 hover:bg-slate-50"
            >
              Seguir con Free
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}
