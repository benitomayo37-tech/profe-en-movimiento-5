import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";

import { AccountBadge, AppLayout, Sidebar } from "@/components/layout";
import Container from "@/components/ui/Container";
import { getAuthAccess } from "@/features/auth/server/access";
import { moderateCommunitySubmissionAction } from "@/features/community/server/actions";
import { getCommunitySubmissions } from "@/features/community/server/queries";
import { communityKinds } from "@/features/community/types";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Moderación de Comunidad | Profe en Movimiento" };

export default async function CommunityAdminPage({ searchParams }: { searchParams: Promise<{ saved?: string; error?: string }> }) {
  const access = await getAuthAccess();
  if (!access.authenticated) redirect("/login?next=/comunidad/admin");
  if (access.role !== "admin") redirect("/comunidad");
  const params = await searchParams;
  const submissions = await getCommunitySubmissions();

  return <AppLayout sidebar={<Sidebar />} header={<div className="flex min-h-20 items-center justify-between gap-4 px-6"><div><h1 className="text-lg font-bold">Moderación de Comunidad</h1><p className="text-sm text-slate-500">Buzón privado de aportes</p></div><AccountBadge authenticated email={access.email} fullName={access.fullName} className="bg-orange-500" /></div>}>
    <Container size="wide" className="space-y-7 py-8"><div className="flex flex-wrap items-center justify-between gap-3"><div><p className="text-xs font-black uppercase tracking-[.18em] text-orange-600">Panel administrativo</p><h2 className="mt-2 text-3xl font-black">{submissions.length} aportes recibidos</h2></div><Link href="/comunidad" className="rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm font-bold text-slate-700">← Volver a Comunidad</Link></div>{params.saved ? <p className="rounded-2xl bg-emerald-50 p-4 font-bold text-emerald-800">Moderación guardada correctamente.</p> : null}{params.error ? <p className="rounded-2xl bg-red-50 p-4 font-bold text-red-800">No se pudo guardar la moderación.</p> : null}<div className="space-y-5">{submissions.map((item) => <article key={item.id} className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm"><div className="flex flex-wrap items-start justify-between gap-4"><div><p className="text-sm font-black text-violet-700">{communityKinds[item.kind].icon} {communityKinds[item.kind].label}</p><h3 className="mt-2 text-xl font-black">{item.subject}</h3><p className="mt-1 text-xs font-semibold text-slate-400">Usuario: {item.user_id} · {new Intl.DateTimeFormat("es", { dateStyle: "medium", timeStyle: "short" }).format(new Date(item.created_at))}</p></div><span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-black uppercase text-slate-600">{item.status}</span></div><p className="mt-4 whitespace-pre-wrap rounded-2xl bg-slate-50 p-4 text-sm leading-7 text-slate-700">{item.message}</p><form action={moderateCommunitySubmissionAction} className="mt-5 grid gap-4 lg:grid-cols-[220px_minmax(0,1fr)_auto]"><input type="hidden" name="id" value={item.id} /><label className="text-sm font-bold">Estado<select name="status" defaultValue={item.status} className="mt-2 min-h-12 w-full rounded-xl border border-slate-300 px-3"><option value="pending">Recibido</option><option value="reviewing">En revisión</option><option value="resolved">Respondido</option><option value="archived">Archivado</option></select></label><label className="text-sm font-bold">Respuesta privada<textarea name="response" defaultValue={item.admin_response ?? ""} maxLength={4000} rows={3} className="mt-2 w-full rounded-xl border border-slate-300 p-3" placeholder="Respuesta visible únicamente para el autor" /></label><button className="self-end rounded-xl bg-slate-950 px-5 py-3 font-black text-white">Guardar</button></form></article>)}{!submissions.length ? <p className="rounded-3xl border border-dashed border-slate-300 p-12 text-center text-slate-500">No hay aportes pendientes.</p> : null}</div></Container>
  </AppLayout>;
}

