"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";

interface NavigationItem {
  label: string;
  href: string;
  disabled?: boolean;
}

const navigationGroups: Array<{ title: string; items: NavigationItem[] }> = [
  { title: "Principal", items: [
    { label: "Dashboard", href: "/dashboard" },
    { label: "Historial", href: "/historial" },
  ] },
  { title: "Herramientas docentes", items: [
    { label: "Profe IA", href: "/ai" },
    { label: "Entrenador IA", href: "/entrenador-ia" },
    { label: "Exámenes estudiantiles", href: "/examenes" },
    { label: "App para profes", href: "/apps" },
  ] },
  { title: "Seguridad e inclusión", items: [
    { label: "MueveSeguro", href: "/mueve-seguro" },
    { label: "Movimiento para Todos", href: "/movimiento-para-todos" },
  ] },
  { title: "Recursos y cuenta", items: [
    { label: "Biblioteca", href: "/resources" },
    { label: "Tienda", href: "/store" },
    { label: "Mi cuenta", href: "/cuenta" },
  ] },
];

const upcoming = ["Academia", "Comunidad"];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <div className="flex h-full flex-col p-6">
      <Link
        href="/dashboard"
        aria-label="Ir al Dashboard de Profe en Movimiento"
        className="flex flex-col items-center border-b border-slate-200 pb-6 text-center"
      >
        <span className="theme-brand-logo flex w-full max-w-[200px] items-center justify-center rounded-2xl border border-slate-200 p-3 shadow-sm">
          <Image
            src="/logos/logo-profe-en-movimiento.png"
            alt="Logo de Profe en Movimiento"
            width={180}
            height={180}
            priority
            className="h-auto w-full max-w-[174px] object-contain"
          />
        </span>

        <p className="mt-3 text-xs font-semibold uppercase tracking-[0.18em] text-blue-600">
          Plataforma educativa inteligente
        </p>

        <p className="mt-1 text-sm text-slate-500">
          Aprender · Moverse · Innovar
        </p>
      </Link>

      <nav
        className="mt-6 flex flex-col gap-5"
        aria-label="Navegación principal"
      >
        {navigationGroups.map((group) => (
          <div key={group.title}>
            <p className="px-4 text-[10px] font-black uppercase tracking-[0.18em] text-blue-600">{group.title}</p>
            <div className="mt-2 flex flex-col gap-1">
              {group.items.map((item) => {
                const isActive = item.href === "/dashboard" ? pathname === "/dashboard" : pathname === item.href || pathname.startsWith(`${item.href}/`);
                return <Link key={item.label} href={item.href} aria-current={isActive ? "page" : undefined} className={`theme-sidebar-link rounded-xl px-4 py-2.5 text-sm transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 ${isActive ? "bg-blue-50 font-semibold text-blue-700" : "font-medium text-slate-600 hover:bg-slate-100 hover:text-slate-950"}`}>{item.label}</Link>;
              })}
            </div>
          </div>
        ))}
        <div>
          <p className="px-4 text-[10px] font-black uppercase tracking-[0.18em] text-blue-600">Próximamente</p>
          <div className="mt-2 flex flex-wrap gap-2 px-4">{upcoming.map((label) => <span key={label} className="rounded-full bg-slate-100 px-3 py-1.5 text-xs font-bold text-slate-400">{label}</span>)}</div>
        </div>
      </nav>

      <div className="mt-auto border-t border-slate-200 pt-6">
        <p className="text-xs font-semibold text-slate-500">
          Profe en Movimiento
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
