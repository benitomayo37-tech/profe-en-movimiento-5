"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";

import { updateProfileAction } from "@/features/auth/server/actions";
import { initialAuthActionState } from "@/features/auth/types";

function SaveButton() {
  const { pending } = useFormStatus();
  return <button disabled={pending} className="min-h-11 rounded-xl bg-blue-700 px-5 py-2 font-black text-white hover:bg-blue-800 disabled:opacity-60">{pending ? "Guardando…" : "Guardar nombre"}</button>;
}

export default function ProfileForm({ fullName }: { fullName: string }) {
  const [state, action] = useActionState(updateProfileAction, initialAuthActionState);

  return (
    <form action={action} className="mt-6 space-y-4">
      <label className="block">
        <span className="text-sm font-black text-slate-800">Nombre completo</span>
        <input name="fullName" defaultValue={fullName} autoComplete="name" className="mt-2 min-h-12 w-full rounded-xl border border-slate-300 px-4 outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100" />
        {state.fieldErrors?.fullName ? <p className="mt-1 text-sm font-semibold text-red-600">{state.fieldErrors.fullName}</p> : null}
      </label>
      {state.message ? <p className={`text-sm font-semibold ${state.status === "success" ? "text-emerald-700" : "text-red-600"}`}>{state.message}</p> : null}
      <SaveButton />
    </form>
  );
}
