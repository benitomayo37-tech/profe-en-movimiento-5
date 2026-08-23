"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";

const navigation = [
  {
    label: "Inicio",
    href: "/movimiento-para-todos",
  },
  {
    label: "Adulto mayor",
    href: "/movimiento-para-todos?categoria=older-adults",
  },
  {
    label: "Enfermedades crónicas",
    href: "/movimiento-para-todos?categoria=chronic-diseases",
  },
  {
    label: "Embarazo",
    href: "/movimiento-para-todos?categoria=prenatal",
  },
  {
    label: "Movilidad reducida",
    href: "/movimiento-para-todos?categoria=reduced-mobility",
  },
];

export default function MovimientoParaTodosSidebar() {
  const pathname = usePathname();

  return (
    <div className="flex h-full flex-col p-6">
      <Link
        href="/movimiento-para-todos"
        aria-label="Ir a Movimiento para Todos"
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

        <p className="mt-3 text-xs font-black uppercase tracking-[0.18em] text-emerald-600">
          Movimiento para Todos
        </p>

        <p className="mt-1 text-sm text-slate-500">
          Movimiento · Adaptación · Inclusión
        </p>
      </Link>

      <nav
        className="mt-8 flex flex-col gap-2"
        aria-label="Navegación de Movimiento para Todos"
      >
        {navigation.map((item) => {
          const isActive =
            item.href === "/movimiento-para-todos"
              ? pathname === "/movimiento-para-todos"
              : false;

          return (
            <Link
              key={item.label}
              href={item.href}
              aria-current={isActive ? "page" : undefined}
              className={`rounded-xl px-4 py-3 text-sm transition ${
                isActive
                  ? "bg-emerald-50 font-semibold text-emerald-700"
                  : "font-medium text-slate-600 hover:bg-slate-100 hover:text-slate-950"
              }`}
            >
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="mt-6 grid gap-2">
        <Link
          href="/movimiento-para-todos#biblioteca"
          className="rounded-xl px-4 py-3 text-sm font-medium text-slate-600 transition hover:bg-slate-100 hover:text-slate-950"
        >
          Biblioteca
        </Link>

        <Link
          href="/movimiento-para-todos#comunidad"
          className="rounded-xl px-4 py-3 text-sm font-medium text-slate-600 transition hover:bg-slate-100 hover:text-slate-950"
        >
          Comunidad
        </Link>
      </div>

      <div className="mt-6 rounded-2xl border border-emerald-100 bg-emerald-50 p-4">
        <p className="text-xs font-black uppercase tracking-wide text-emerald-700">
          Movimiento seguro
        </p>

        <p className="mt-2 text-sm leading-6 text-emerald-800">
          Orientaciones educativas para adaptar el movimiento y acompañar a
          diferentes personas de forma responsable.
        </p>
      </div>

      <div className="mt-auto border-t border-slate-200 pt-6">
        <Link
          href="/"
          className="flex items-center justify-center rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-bold text-slate-700 transition hover:border-blue-200 hover:bg-blue-50 hover:text-blue-700"
        >
          ← Volver al inicio
        </Link>

        <p className="mt-6 text-xs font-semibold text-slate-500">
          Profe en Movimiento 5.0
        </p>

        <p className="mt-1 text-xs text-slate-400">
          Movimiento para Todos · Actividad física adaptada
        </p>
      </div>
    </div>
  );
}
