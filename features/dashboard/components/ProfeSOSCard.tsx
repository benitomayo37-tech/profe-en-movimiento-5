import Card from "@/components/ui/Card";

import Link from "next/link";

export default function ProfeSOSCard() {
  return (
    <Card
      hover={false}
      className="overflow-hidden border-emerald-200 bg-gradient-to-br from-emerald-50 via-white to-blue-50 p-0"
    >
      <div className="grid gap-6 p-6 sm:p-8 lg:grid-cols-[1fr_auto] lg:items-center">
        <div>
          <div className="flex items-center gap-3">
            <div
              className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-600 text-2xl text-white shadow-lg"
              aria-hidden="true"
            >
              🛡️
            </div>

            <div>
              <p className="text-sm font-bold uppercase tracking-[0.16em] text-emerald-700">
                Educa, previene y protege
              </p>

              <h3 className="mt-1 text-2xl font-black tracking-tight text-slate-950">
                MueveSeguro
              </h3>
            </div>
          </div>

          <p className="mt-5 max-w-2xl text-sm leading-7 text-slate-600 sm:text-base">
            Orientación educativa para identificar señales de alerta,
            prevenir riesgos y actuar con calma durante una clase o entrenamiento.
          </p>

          <div className="mt-5 flex flex-wrap gap-2">
            <span className="rounded-full bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 shadow-sm ring-1 ring-slate-200">
              ⚡ Consulta rápida
            </span>

            <span className="rounded-full bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 shadow-sm ring-1 ring-slate-200">
              🛡️ Protocolos de seguridad
            </span>

            <span className="rounded-full bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 shadow-sm ring-1 ring-slate-200">
              🩹 Primeros auxilios
            </span>
          </div>

          <p className="mt-5 text-xs leading-5 text-slate-500">
            Herramienta de orientación educativa. No sustituye la
            valoración de profesionales sanitarios ni los servicios de
            emergencia.
          </p>
        </div>

        <div className="flex lg:justify-end">
          <Link href="/mueve-seguro" className="inline-flex min-h-12 items-center justify-center rounded-xl bg-emerald-600 px-6 py-3 text-sm font-bold text-white shadow-lg transition hover:bg-emerald-700">Abrir MueveSeguro →</Link>
        </div>
      </div>
    </Card>
  );
}
