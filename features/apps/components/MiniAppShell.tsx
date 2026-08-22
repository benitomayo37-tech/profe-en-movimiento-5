import Link from "next/link";
import type { ReactNode } from "react";

import type { MiniAppDefinition } from "@/features/apps/data/miniApps";

interface MiniAppShellProps {
  app: MiniAppDefinition;
  children: ReactNode;
  guidance: string[];
}

export default function MiniAppShell({ app, children, guidance }: MiniAppShellProps) {
  return (
    <div className="space-y-8">
      <nav aria-label="Migas de pan" className="flex flex-wrap items-center gap-2 text-sm font-semibold text-slate-500">
        <Link href="/dashboard" className="transition hover:text-blue-700">Dashboard</Link>
        <span aria-hidden="true">/</span>
        <Link href="/apps" className="transition hover:text-blue-700">App para profes</Link>
        <span aria-hidden="true">/</span>
        <span className="text-slate-800" aria-current="page">{app.title}</span>
      </nav>

      <section className={`relative overflow-hidden rounded-[2rem] bg-gradient-to-br ${app.accent} px-6 py-9 text-white shadow-2xl sm:px-9 lg:px-12`}>
        <div className="absolute -right-16 -top-20 h-64 w-64 rounded-full bg-white/15" />
        <div className="relative flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
          <div>
            <span className="inline-flex rounded-full border border-white/25 bg-white/15 px-4 py-2 text-xs font-black uppercase tracking-[0.16em]">{app.categoryLabel} · Plan {app.plan}</span>
            <h1 className="mt-5 text-4xl font-black tracking-tight sm:text-5xl">{app.title}</h1>
            <p className="mt-4 max-w-3xl leading-7 text-white/90">{app.description}</p>
          </div>
          <span className="flex h-24 w-24 shrink-0 items-center justify-center rounded-3xl border border-white/20 bg-white/15 text-5xl shadow-inner" aria-hidden="true">{app.icon}</span>
        </div>
      </section>

      <div className="grid items-start gap-8 xl:grid-cols-[minmax(0,1fr)_300px]">
        <div>{children}</div>
        <aside className="space-y-5 xl:sticky xl:top-28">
          <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <p className="text-xs font-black uppercase tracking-[0.16em] text-orange-600">Uso rápido</p>
            <h2 className="mt-2 text-xl font-black text-slate-950">Recomendaciones</h2>
            <ul className="mt-5 space-y-3 text-sm leading-6 text-slate-600">
              {guidance.map((item) => (
                <li key={item} className="flex items-start gap-3">
                  <span className="mt-1 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-xs font-black text-emerald-700" aria-hidden="true">✓</span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </section>
          <div className="rounded-2xl border border-blue-200 bg-blue-50 p-5 text-sm leading-6 text-blue-950">
            <p className="font-black">Privacidad local</p>
            <p className="mt-1">La información ingresada se procesa en este dispositivo y no se envía a un servidor.</p>
          </div>
          <Link href="/apps" className="flex min-h-12 w-full items-center justify-center rounded-xl border border-slate-300 bg-white px-5 py-3 text-center font-black text-slate-700 transition hover:border-blue-300 hover:bg-blue-50 hover:text-blue-700">
            ← Volver a las miniapps
          </Link>
        </aside>
      </div>
    </div>
  );
}
