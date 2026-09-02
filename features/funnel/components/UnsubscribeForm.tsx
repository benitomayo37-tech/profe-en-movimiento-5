"use client";

import Link from "next/link";
import { useActionState } from "react";
import { useFormStatus } from "react-dom";

import { unsubscribeMarketingLead, type UnsubscribeState } from "@/features/funnel/server/unsubscribe";

const initialState: UnsubscribeState = { status: "idle" };

function SubmitButton() {
  const { pending } = useFormStatus();
  return <button type="submit" disabled={pending} className="min-h-12 w-full rounded-xl bg-red-600 px-5 py-3 font-black text-white hover:bg-red-700 disabled:opacity-60">{pending ? "Procesando…" : "Confirmar cancelación"}</button>;
}

export default function UnsubscribeForm({ token }: { token: string }) {
  const [state, action] = useActionState(unsubscribeMarketingLead, initialState);
  if (state.status === "success") return <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-5 text-emerald-900"><p className="font-black">Preferencia actualizada</p><p className="mt-2 text-sm leading-6">{state.message}</p><Link href="/" className="mt-4 inline-flex font-black text-blue-700">Volver al inicio →</Link></div>;
  return <form action={action} className="space-y-4"><input type="hidden" name="token" value={token} /><p className="text-sm leading-6 text-slate-600">Confirma si deseas dejar de recibir los mensajes de seguimiento relacionados con el kit gratuito. Tu cuenta y el acceso a la plataforma no se eliminarán.</p>{state.message ? <p className="rounded-xl bg-red-50 p-3 text-sm font-bold text-red-700">{state.message}</p> : null}<SubmitButton /><Link href="/" className="flex min-h-12 items-center justify-center rounded-xl border border-slate-300 px-5 py-3 font-black text-slate-700">Conservar suscripción</Link></form>;
}

