"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";

interface NavigationItem {
  label: string;
  href: string;
  disabled?: boolean;
}

const navigation: NavigationItem[] = [
  {
    label: "Dashboard",
    href: "/dashboard",
  },
  {
    label: "Historial",
    href: "/historial",
  },
  {
    label: "Profe IA",
    href: "/ai",
  },
  {
    label: "Entrenador IA",
    href: "/entrenador-ia",
  },
  {
    label: "MueveSeguro",
    href: "/mueve-seguro",
  },
  {
    label: "App para profes",
    href: "/apps",
  },
  {
    label: "Exámenes estudiantiles",
    href: "/examenes",
  },
  {
    label: "Recursos",
    href: "/resources",
  },
  {
    label: "Academia",
    href: "#",
    disabled: true,
  },
  {
    label: "Deportes",
    href: "#",
    disabled: true,
  },
  {
    label: "Salud",
    href: "#",
    disabled: true,
  },
  {
    label: "Tienda",
    href: "/store",
  },
  {
    label: "Mi cuenta",
    href: "/cuenta",
  },
  {
    label: "Comunidad",
    href: "#",
    disabled: true,
  },
  {
    label: "Configuración",
    href: "#",
    disabled: true,
  },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <div className="flex h-full flex-col p-6">
      <Link
        href="/dashboard"
        aria-label="Ir al Dashboard de Profe en Movimiento"
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

        <p className="mt-3 text-xs font-semibold uppercase tracking-[0.18em] text-blue-600">
          Plataforma educativa inteligente
        </p>

        <p className="mt-1 text-sm text-slate-500">
          Aprender · Moverse · Innovar
        </p>
      </Link>

      <nav
        className="mt-8 flex flex-col gap-2"
        aria-label="Navegación principal"
      >
        {navigation.map((item) => {
          if (item.disabled) {
            return (
              <span
                key={item.label}
                className="rounded-xl px-4 py-3 text-sm font-medium text-slate-400"
              >
                {item.label}
              </span>
            );
          }

          const isActive =
            item.href === "/dashboard"
              ? pathname === "/dashboard"
              : pathname === item.href ||
                pathname.startsWith(`${item.href}/`);

          return (
            <Link
              key={item.label}
              href={item.href}
              aria-current={isActive ? "page" : undefined}
              className={`rounded-xl px-4 py-3 text-sm transition ${
                isActive
                  ? "bg-blue-50 font-semibold text-blue-700"
                  : "font-medium text-slate-600 hover:bg-slate-100 hover:text-slate-950"
              }`}
            >
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="mt-auto border-t border-slate-200 pt-6">
        <p className="text-xs font-semibold text-slate-500">
          Proyecto FARO
        </p>

        <p className="mt-1 text-xs text-slate-400">
          Plataforma educativa inteligente
        </p>

        <div className="mt-5 rounded-xl bg-slate-100 p-4">
          <p className="text-xs font-semibold text-slate-700">
            Estado
          </p>

          <p className="mt-1 text-sm text-emerald-600">
            ● Sistema operativo
          </p>
        </div>
      </div>
    </div>
  );
}
