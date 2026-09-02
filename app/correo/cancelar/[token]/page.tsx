import type { Metadata } from "next";
import Link from "next/link";

import UnsubscribeForm from "@/features/funnel/components/UnsubscribeForm";

export const metadata: Metadata = { title: "Cancelar correos | Profe en Movimiento" };

export default async function UnsubscribePage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  return <main className="flex min-h-screen items-center justify-center bg-slate-950 px-5 py-12"><section className="w-full max-w-lg rounded-3xl bg-white p-7 shadow-2xl sm:p-9"><p className="text-xs font-black uppercase tracking-[.18em] text-orange-600">Preferencias de correo</p><h1 className="mt-3 text-3xl font-black text-slate-950">Cancelar mensajes del kit</h1><div className="mt-6"><UnsubscribeForm token={token} /></div><p className="mt-6 text-center text-xs text-slate-500">Profe en Movimiento · <Link href="/privacy" className="font-bold underline">Política de privacidad</Link></p></section></main>;
}

