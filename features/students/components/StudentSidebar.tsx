"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";

import { studentSignOutAction } from "@/features/students/server/actions";

const navigation = [
  { icon: "🚀", label: "Inicio estudiantil", href: "/estudiantes" },
  { icon: "🏛️", label: "Historia", href: "/estudiantes/historia" },
  { icon: "🪁", label: "Juegos tradicionales", href: "/estudiantes/juegos-tradicionales" },
  { icon: "🏀", label: "Deportes", href: "/estudiantes/deportes" },
  { icon: "🎮", label: "Juegos interactivos", href: "/estudiantes/juegos-interactivos" },
  { icon: "▶️", label: "Videos", href: "/estudiantes/videos" },
  { icon: "📝", label: "Realizar examen", href: "/estudiantes/examen" },
];

interface StudentSidebarProps { fullName: string; gradeCourse: string; }

export default function StudentSidebar({ fullName, gradeCourse }: StudentSidebarProps) {
  const pathname = usePathname();
  return <div className="flex h-full flex-col p-6">
    <Link href="/estudiantes" className="flex flex-col items-center border-b border-slate-200 pb-6 text-center">
      <Image src="/logos/logo-profe-en-movimiento.png" alt="Profe en Movimiento" width={180} height={180} priority className="h-auto w-full max-w-[170px] object-contain" />
      <p className="mt-3 text-xs font-black uppercase tracking-[0.18em] text-emerald-700">Espacio estudiantil</p><p className="mt-1 text-sm text-slate-500">Aprender · Jugar · Investigar</p>
    </Link>
    <nav className="mt-7 flex flex-col gap-1" aria-label="Recursos para estudiantes">{navigation.map((item) => {
      const active = item.href === pathname;
      return <Link key={item.label} href={item.href} className={`flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-semibold transition ${active ? "bg-gradient-to-r from-emerald-50 to-cyan-50 text-emerald-800 shadow-sm" : "text-slate-600 hover:bg-slate-100 hover:text-slate-950"}`}><span className="text-base" aria-hidden="true">{item.icon}</span><span>{item.label}</span></Link>;
    })}</nav>
    <div className="mt-auto border-t border-slate-200 pt-5"><p className="truncate text-sm font-black text-slate-900">{fullName}</p><p className="mt-1 text-xs text-slate-500">{gradeCourse}</p><form action={studentSignOutAction} className="mt-4"><button type="submit" className="w-full rounded-xl border border-slate-300 px-4 py-2.5 text-sm font-black text-slate-700 hover:bg-slate-50">Cerrar sesión</button></form></div>
  </div>;
}
