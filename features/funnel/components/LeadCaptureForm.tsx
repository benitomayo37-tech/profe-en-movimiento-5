"use client";

import Link from "next/link";
import { useActionState } from "react";
import { useFormStatus } from "react-dom";

import { captureFreeResourceLead } from "@/features/funnel/server/actions";
import { initialLeadCaptureState } from "@/features/funnel/types";

function SubmitButton() {
  const { pending } = useFormStatus();
  return <button type="submit" disabled={pending} className="flex min-h-12 w-full items-center justify-center rounded-xl !bg-orange-500 px-5 py-3 font-black !text-white shadow-lg shadow-orange-500/30 hover:!bg-orange-600 disabled:cursor-wait disabled:opacity-60">{pending ? "Preparando tu kit…" : "Quiero mi kit gratuito →"}</button>;
}

export default function LeadCaptureForm({ source, utmSource, utmMedium, utmCampaign }: { source: string; utmSource: string; utmMedium: string; utmCampaign: string }) {
  const [state, action] = useActionState(captureFreeResourceLead, initialLeadCaptureState);

  if (state.status === "success") {
    return <div className="rounded-3xl border border-emerald-200 bg-emerald-50 p-6 text-emerald-950"><p className="text-xs font-black uppercase tracking-[.16em] text-emerald-700">Entrega inmediata</p><h2 className="mt-2 text-2xl font-black">¡Tu kit está listo!</h2><p className="mt-3 leading-7">Descárgalo ahora y crea después una versión adaptada a tu curso con los Agentes IA.</p><a href="/downloads/kit-clase-45-minutos-4-balones.pdf" download className="mt-5 flex min-h-12 items-center justify-center rounded-xl bg-blue-700 px-5 py-3 font-black !text-white hover:bg-blue-800">Descargar el kit en PDF ↓</a><Link href="/registro" className="mt-3 flex min-h-12 items-center justify-center rounded-xl border border-blue-300 bg-white px-5 py-3 text-center font-black text-blue-800">Crear mi cuenta Free →</Link><p className="mt-3 text-xs leading-5 text-emerald-800">La cuenta Free incluye 3 ejecuciones mensuales en el Centro de Agentes IA.</p></div>;
  }

  const inputClass = "mt-2 min-h-12 w-full rounded-xl border border-slate-300 bg-white px-4 text-slate-950 outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100";
  return <form action={action} className="space-y-5 rounded-3xl bg-white p-6 shadow-2xl sm:p-8">
    <div><p className="text-xs font-black uppercase tracking-[.16em] text-orange-600">Descarga gratuita</p><h2 className="mt-2 text-2xl font-black text-slate-950">Recibe el kit inmediatamente</h2><p className="mt-2 text-sm leading-6 text-slate-600">Completa tus datos. No solicitamos información de estudiantes.</p></div>
    <input type="hidden" name="source" value={source} /><input type="hidden" name="utmSource" value={utmSource} /><input type="hidden" name="utmMedium" value={utmMedium} /><input type="hidden" name="utmCampaign" value={utmCampaign} />
    <label className="hidden" aria-hidden="true">Sitio web<input name="website" tabIndex={-1} autoComplete="off" /></label>
    <label className="block"><span className="text-sm font-black text-slate-800">Nombre</span><input name="fullName" autoComplete="name" className={inputClass} />{state.fieldErrors?.fullName ? <span className="mt-1 block text-xs font-bold text-red-600">{state.fieldErrors.fullName}</span> : null}</label>
    <label className="block"><span className="text-sm font-black text-slate-800">Correo electrónico</span><input name="email" type="email" autoComplete="email" className={inputClass} />{state.fieldErrors?.email ? <span className="mt-1 block text-xs font-bold text-red-600">{state.fieldErrors.email}</span> : null}</label>
    <label className="block"><span className="text-sm font-black text-slate-800">¿Cuál es tu perfil?</span><select name="profileType" defaultValue="" className={inputClass}><option value="" disabled>Selecciona una opción</option><option value="teacher">Docente de Educación Física</option><option value="trainer">Entrenador/a deportivo/a</option><option value="other">Otro perfil educativo</option></select>{state.fieldErrors?.profileType ? <span className="mt-1 block text-xs font-bold text-red-600">{state.fieldErrors.profileType}</span> : null}</label>
    <label className="flex items-start gap-3 rounded-xl bg-slate-50 p-3 text-xs leading-5 text-slate-600"><input name="consent" type="checkbox" className="mt-1 h-4 w-4" /><span>Acepto recibir el recurso y contenidos relacionados de Profe en Movimiento. Puedo retirar mi autorización. He leído la <Link href="/privacy" className="font-black text-blue-700 underline">Política de privacidad</Link>.</span></label>{state.fieldErrors?.consent ? <p className="text-xs font-bold text-red-600">{state.fieldErrors.consent}</p> : null}
    {state.message ? <p role="status" className="rounded-xl bg-red-50 p-3 text-sm font-bold text-red-700">{state.message}</p> : null}
    <SubmitButton />
    <p className="text-center text-xs text-slate-500">Sin tarjeta de crédito. Descarga directa en PDF.</p>
  </form>;
}
