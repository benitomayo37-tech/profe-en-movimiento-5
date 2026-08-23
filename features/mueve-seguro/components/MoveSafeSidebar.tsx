import Image from "next/image";
import Link from "next/link";

export default function MoveSafeSidebar() {
  return (
    <div className="flex h-full flex-col p-6">
      <Link
        href="/mueve-seguro"
        aria-label="Ir a MueveSeguro"
        className="flex flex-col items-center border-b border-slate-200 pb-6 text-center"
      >
        <Image
          src="/logos/logo-profe-en-movimiento.png"
          alt="Logo de Profe en Movimiento"
          width={180}
          height={180}
          priority
          className="h-auto w-full max-w-[180px] object-contain"
        />

        <p className="mt-3 text-xs font-black uppercase tracking-[0.18em] text-orange-600">
          MueveSeguro
        </p>

        <p className="mt-1 text-sm text-slate-500">
          Educa · Previene · Protege
        </p>
      </Link>
            <Link
        href="/"
        className="mt-6 flex items-center justify-center rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-bold text-slate-700 transition hover:border-blue-200 hover:bg-blue-50 hover:text-blue-700"
      >
        ← Volver al inicio
      </Link>

      <div className="mt-8">
        <p className="px-4 text-xs font-black uppercase tracking-[0.18em] text-slate-400">
          MueveSeguro
        </p>

        <nav
          className="mt-3 flex flex-col gap-2"
          aria-label="Navegación de MueveSeguro"
        >
          <Link
            href="/mueve-seguro"
            className="rounded-xl bg-orange-50 px-4 py-3 text-sm font-semibold text-orange-700"
          >
            🛡️ MueveSeguro
          </Link>
        </nav>
      </div>

      <div className="mt-6 rounded-2xl border border-emerald-100 bg-emerald-50 p-4">
        <p className="text-xs font-black uppercase tracking-wide text-emerald-700">
          Acceso gratuito
        </p>

        <p className="mt-2 text-sm leading-6 text-emerald-800">
          Consulta orientaciones preventivas y recomendaciones sin necesidad
          de registrarte.
        </p>
      </div>

      <div className="mt-4 rounded-2xl border border-slate-200 bg-slate-50 p-4">
        <p className="text-xs font-black uppercase tracking-wide text-slate-500">
          MueveSeguro PRO
        </p>

        <p className="mt-2 text-sm leading-6 text-slate-600">
          Registro de incidentes, historial y seguimiento profesional.
        </p>

        <span className="mt-3 inline-flex rounded-full bg-slate-200 px-2.5 py-1 text-[10px] font-black uppercase tracking-wide text-slate-600">
          🔒 Funciones PRO
        </span>
      </div>

      <div className="mt-auto border-t border-slate-200 pt-6">
        <p className="text-xs font-semibold text-slate-500">
          Profe en Movimiento 5.0
        </p>

        <p className="mt-1 text-xs text-slate-400">
          MueveSeguro · Prevención y respuesta
        </p>
      </div>
    </div>
  );
}