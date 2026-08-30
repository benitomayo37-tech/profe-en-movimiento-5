import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";

import { AccountBadge, AppLayout, Sidebar } from "@/components/layout";
import Container from "@/components/ui/Container";
import { getAuthAccess } from "@/features/auth/server/access";
import { createCommunitySubmissionAction } from "@/features/community/server/actions";
import { getCommunitySubmissions } from "@/features/community/server/queries";
import { communityKinds, type CommunityKind, type CommunityStatus } from "@/features/community/types";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Comunidad | Profe en Movimiento", description: "Buzón privado para aportar ideas, experiencias, preguntas y mejoras." };

const statusLabel: Record<CommunityStatus, string> = { pending: "Recibido", reviewing: "En revisión", resolved: "Respondido", archived: "Archivado" };
const statusClass: Record<CommunityStatus, string> = {
  pending: "bg-[#fef3c7] text-[#78350f]",
  reviewing: "bg-[#dbeafe] text-[#1e3a8a]",
  resolved: "bg-[#d1fae5] text-[#064e3b]",
  archived: "bg-[#e2e8f0] text-[#334155]",
};

export default async function CommunityPage({ searchParams }: { searchParams: Promise<{ type?: string; sent?: string; error?: string }> }) {
  const access = await getAuthAccess();
  if (!access.authenticated || !access.userId) redirect("/login?next=/comunidad");
  const params = await searchParams;
  const selectedKind = (params.type && params.type in communityKinds ? params.type : "topic") as CommunityKind;
  const submissions = await getCommunitySubmissions(access.userId);

  return <AppLayout sidebar={<Sidebar />} header={<div className="flex min-h-20 items-center justify-between gap-4 px-6"><div><h1 className="text-lg font-bold">Comunidad</h1><p className="text-sm text-slate-500">Tu buzón privado con Profe en Movimiento</p></div><AccountBadge authenticated email={access.email} fullName={access.fullName} className="bg-violet-600" /></div>} footer={<div className="px-6 py-4 text-center text-xs text-slate-500">Comunidad · Escuchar, aprender y mejorar juntos</div>}>
    <Container size="wide" className="space-y-8 py-8">
      <section className="overflow-hidden rounded-[2rem] bg-gradient-to-br from-slate-950 via-violet-950 to-blue-900 p-8 text-white shadow-xl sm:p-10"><p className="text-xs font-black uppercase tracking-[.2em] text-orange-300">Buzón moderado</p><div className="mt-4 flex flex-col justify-between gap-6 lg:flex-row lg:items-end"><div><h2 className="max-w-3xl text-4xl font-black">Tu experiencia puede mejorar la plataforma.</h2><p className="mt-4 max-w-3xl leading-7 text-violet-100">Envía ideas, preguntas y experiencias directamente al equipo. Tus aportes son privados: solo tú y los administradores pueden consultarlos.</p></div>{access.role === "admin" ? <Link href="/comunidad/admin" className="shrink-0 rounded-xl bg-orange-500 px-5 py-3 font-black text-white">Abrir moderación →</Link> : null}</div></section>

      {params.sent ? <p className="rounded-2xl bg-emerald-50 p-4 font-bold text-emerald-800">✓ Recibimos tu aporte. Puedes seguir su estado en “Mis aportes”.</p> : null}
      {params.error ? <p className="rounded-2xl bg-red-50 p-4 font-bold text-red-800">No pudimos guardar el aporte. Revisa que el título tenga al menos 5 caracteres y el mensaje al menos 20.</p> : null}

      <div className="grid gap-8 xl:grid-cols-[minmax(0,1fr)_420px]">
        <section><p className="text-xs font-black uppercase tracking-[.18em] text-violet-700">Elige cómo participar</p><h2 className="mt-2 text-3xl font-black">¿Qué quieres compartir?</h2><div className="mt-5 grid gap-4 sm:grid-cols-2">{(Object.entries(communityKinds) as [CommunityKind, (typeof communityKinds)[CommunityKind]][]).map(([kind, item]) => <Link key={kind} href={`/comunidad?type=${kind}`} className={`rounded-3xl border p-5 transition hover:-translate-y-1 hover:shadow-lg ${selectedKind === kind ? "border-violet-500 bg-violet-50 ring-2 ring-violet-200" : "border-slate-200 bg-white"}`}><span className="text-3xl">{item.icon}</span><h3 className="mt-3 text-lg font-black">{item.label}</h3><p className="mt-2 text-sm leading-6 text-slate-600">{item.description}</p></Link>)}</div></section>

        <section className="h-fit rounded-3xl border border-violet-200 bg-white p-6 shadow-lg xl:sticky xl:top-24"><p className="text-xs font-black uppercase tracking-[.16em] text-violet-700">{communityKinds[selectedKind].icon} {communityKinds[selectedKind].label}</p><h2 className="mt-2 text-2xl font-black">Enviar aporte privado</h2><form action={createCommunitySubmissionAction} className="mt-6 space-y-4"><input type="hidden" name="kind" value={selectedKind} /><label className="block text-sm font-bold">Título<input name="subject" required minLength={5} maxLength={160} className="mt-2 min-h-12 w-full rounded-xl border border-slate-300 px-4" placeholder="Resume tu aporte" /></label><label className="block text-sm font-bold">Cuéntanos más<textarea name="message" required minLength={20} maxLength={4000} rows={7} className="mt-2 w-full rounded-xl border border-slate-300 p-4" placeholder="Evita incluir nombres, teléfonos, diagnósticos u otros datos personales." /></label><p className="rounded-xl bg-blue-50 p-3 text-xs font-semibold leading-5 text-blue-900">No publiques datos personales o sensibles de estudiantes, pacientes ni terceros.</p><button className="min-h-12 w-full rounded-xl bg-violet-700 px-5 py-3 font-black text-white hover:bg-violet-800">Enviar al equipo</button></form></section>
      </div>

      <section><div><p className="text-xs font-black uppercase tracking-[.18em] text-blue-700">Seguimiento privado</p><h2 className="mt-2 text-3xl font-black">Mis aportes</h2></div><div className="mt-5 space-y-4">{submissions.length ? submissions.map((item) => <article key={item.id} className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm"><div className="flex flex-wrap items-start justify-between gap-3"><div><p className="text-sm font-black text-violet-700">{communityKinds[item.kind].icon} {communityKinds[item.kind].label}</p><h3 className="mt-2 text-xl font-black">{item.subject}</h3></div><span className={`rounded-full px-3 py-1.5 text-xs font-black ${statusClass[item.status]}`}>{statusLabel[item.status]}</span></div><p className="mt-4 whitespace-pre-wrap text-sm leading-7 text-slate-600">{item.message}</p><p className="mt-4 text-xs font-semibold text-slate-400">Enviado el {new Intl.DateTimeFormat("es", { dateStyle: "medium" }).format(new Date(item.created_at))}</p>{item.admin_response ? <div className="mt-5 rounded-2xl border border-emerald-200 bg-emerald-50 p-5"><p className="text-xs font-black uppercase tracking-[.14em] text-emerald-700">Respuesta del equipo</p><p className="mt-2 whitespace-pre-wrap text-sm leading-7 text-emerald-950">{item.admin_response}</p></div> : null}</article>) : <p className="rounded-3xl border border-dashed border-slate-300 bg-white p-10 text-center text-slate-500">Todavía no has enviado aportes.</p>}</div></section>
    </Container>
  </AppLayout>;
}
