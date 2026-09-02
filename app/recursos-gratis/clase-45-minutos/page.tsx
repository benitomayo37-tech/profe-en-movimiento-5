import type { Metadata } from "next";
import Image from "next/image";

import Footer from "@/components/layout/Footer";
import Navbar from "@/components/layout/Navbar";
import Container from "@/components/ui/Container";
import LeadCaptureForm from "@/features/funnel/components/LeadCaptureForm";
import { getAuthAccess } from "@/features/auth/server/access";

export const metadata: Metadata = {
  title: "Kit gratuito: clase de 45 minutos | Profe en Movimiento",
  description: "Descarga una planificación de Educación Física para 40 estudiantes con 4 balones, rúbrica y apoyos inclusivos.",
};

export default async function FreeClassKitPage({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const [query, access] = await Promise.all([searchParams, getAuthAccess()]);
  const first = (key: string) => typeof query[key] === "string" ? query[key] as string : "";
  const source = first("source") || first("utm_source") || "direct";

  return <><Navbar /><main className="bg-slate-50">
    <section className="overflow-hidden bg-gradient-to-br from-slate-950 via-blue-950 to-violet-900 py-14 text-white sm:py-20"><Container size="wide" className="px-5 sm:px-8"><div className="grid items-center gap-10 lg:grid-cols-[1.1fr_.9fr]"><div><div className="flex flex-wrap gap-2"><span className="rounded-full bg-orange-400 px-3 py-1.5 text-xs font-black uppercase tracking-wide text-slate-950">Recurso gratuito</span><span className="rounded-full border border-white/20 bg-white/10 px-3 py-1.5 text-xs font-black">PDF listo para aplicar</span></div><h1 className="mt-6 max-w-4xl text-4xl font-black leading-tight sm:text-6xl">Una clase de 45 minutos con 40 estudiantes y solo 4 balones</h1><p className="mt-5 max-w-3xl text-lg leading-8 text-blue-100">Recibe una planificación práctica de pases de baloncesto, con organización simultánea, rúbrica observable y apoyos para la participación.</p><ul className="mt-7 grid gap-3 text-sm font-bold sm:grid-cols-2"><li>✓ Inicio, desarrollo y cierre</li><li>✓ Participación sin filas extensas</li><li>✓ Rúbrica en tabla</li><li>✓ DUA y apoyos NEE</li></ul><div className="mt-9 flex items-center gap-4 rounded-2xl border border-white/15 bg-white/10 p-4"><Image src="/logos/logo-profe-en-movimiento.png" alt="Profe en Movimiento" width={64} height={64} className="h-14 w-14 rounded-xl bg-white object-contain p-1" /><div><p className="font-black">Creado por Profe en Movimiento</p><p className="mt-1 text-sm text-blue-200">Educación Física · Deporte · Salud</p></div></div></div><LeadCaptureForm source={source} utmSource={first("utm_source")} utmMedium={first("utm_medium")} utmCampaign={first("utm_campaign")} authenticated={access.authenticated} currentEmail={access.email} /></div></Container></section>
    <section className="py-14 sm:py-20"><Container><div className="text-center"><p className="text-xs font-black uppercase tracking-[.18em] text-orange-600">Qué encontrarás</p><h2 className="mt-3 text-3xl font-black text-slate-950">Pensado para la realidad del docente</h2></div><div className="mt-9 grid gap-5 md:grid-cols-3"><article className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm"><p className="text-3xl">🏀</p><h3 className="mt-4 text-xl font-black">Pocos materiales</h3><p className="mt-3 leading-7 text-slate-600">Organización concreta para aprovechar cuatro balones sin dejar estudiantes esperando.</p></article><article className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm"><p className="text-3xl">📋</p><h3 className="mt-4 text-xl font-black">Evaluación clara</h3><p className="mt-3 leading-7 text-slate-600">Rúbrica con criterios observables y escala 10, 9, 8, 7 y 5.</p></article><article className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm"><p className="text-3xl">🤝</p><h3 className="mt-4 text-xl font-black">Participación inclusiva</h3><p className="mt-3 leading-7 text-slate-600">Alternativas de representación, acción, expresión y compromiso sin cambiar el objetivo.</p></article></div></Container></section>
  </main><Footer /></>;
}
