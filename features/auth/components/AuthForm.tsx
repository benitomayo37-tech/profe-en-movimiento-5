"use client";

import Link from "next/link";
import { useActionState, useState } from "react";
import { useFormStatus } from "react-dom";

import { initialAuthActionState, type AuthActionState } from "@/features/auth/types";

type AuthMode = "login" | "register" | "recover" | "update-password";

interface AuthFormProps {
  mode: AuthMode;
  action: (state: AuthActionState, formData: FormData) => Promise<AuthActionState>;
  returnTo?: string;
  notice?: string;
}

const copyByMode: Record<AuthMode, { heading: string; submit: string }> = {
  login: { heading: "Inicia sesión", submit: "Entrar a mi cuenta" },
  register: { heading: "Crea tu cuenta", submit: "Registrar cuenta" },
  recover: { heading: "Recupera tu contraseña", submit: "Enviar enlace" },
  "update-password": { heading: "Crea una nueva contraseña", submit: "Actualizar contraseña" },
};

function SubmitButton({ label }: { label: string }) {
  const { pending } = useFormStatus();

  return (
    <button disabled={pending} type="submit" className="mt-2 flex min-h-12 w-full items-center justify-center rounded-xl bg-blue-700 px-5 py-3 font-black text-white transition hover:bg-blue-800 disabled:cursor-wait disabled:opacity-60">
      {pending ? "Procesando…" : label}
    </button>
  );
}

function FieldError({ message }: { message?: string }) {
  if (!message) return null;
  return <p className="mt-1 text-sm font-semibold text-red-600">{message}</p>;
}

function PasswordField({ name, label, autoComplete, describedBy }: { name: string; label: string; autoComplete: string; describedBy?: string }) {
  const [visible, setVisible] = useState(false);

  return (
    <label className="block">
      <span className="text-sm font-black text-slate-800">{label}</span>
      <span className="relative mt-2 block">
        <input name={name} type={visible ? "text" : "password"} autoComplete={autoComplete} aria-describedby={describedBy} className="min-h-12 w-full rounded-xl border border-slate-300 bg-white px-4 pr-12 text-slate-950 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100" />
        <button type="button" onClick={() => setVisible((current) => !current)} aria-label={visible ? "Ocultar contraseña" : "Mostrar contraseña"} aria-pressed={visible} title={visible ? "Ocultar contraseña" : "Mostrar contraseña"} className="absolute inset-y-0 right-1 flex w-11 items-center justify-center rounded-lg text-slate-500 transition hover:bg-slate-100 hover:text-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-400">
          {visible ? (
            <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-5 w-5"><path d="m3 3 18 18" /><path d="M10.6 10.6a2 2 0 0 0 2.8 2.8" /><path d="M9.9 4.2A10.5 10.5 0 0 1 12 4c5.5 0 9 5 9 5a16 16 0 0 1-2.1 2.7M6.6 6.6C4.4 8 3 10 3 10s3.5 5 9 5c1 0 1.9-.2 2.7-.5" /></svg>
          ) : (
            <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-5 w-5"><path d="M2.5 12s3.5-6 9.5-6 9.5 6 9.5 6-3.5 6-9.5 6-9.5-6-9.5-6Z" /><circle cx="12" cy="12" r="2.5" /></svg>
          )}
        </button>
      </span>
    </label>
  );
}

export default function AuthForm({ mode, action, returnTo, notice }: AuthFormProps) {
  const [state, formAction] = useActionState(action, initialAuthActionState);
  const copy = copyByMode[mode];
  const showEmail = mode !== "update-password";
  const showPassword = mode === "login" || mode === "register" || mode === "update-password";

  return (
    <div>
      <p className="text-xs font-black uppercase tracking-[0.16em] text-orange-600">Cuenta docente</p>
      <h2 className="mt-2 text-3xl font-black tracking-tight text-slate-950">{copy.heading}</h2>
      {notice ? <p className="mt-4 rounded-xl border border-amber-200 bg-amber-50 p-3 text-sm font-semibold text-amber-900">{notice}</p> : null}

      <form action={formAction} className="mt-7 space-y-5">
        {returnTo ? <input type="hidden" name="returnTo" value={returnTo} /> : null}

        {mode === "register" ? (
          <label className="block">
            <span className="text-sm font-black text-slate-800">Nombre completo</span>
            <input name="fullName" autoComplete="name" className="mt-2 min-h-12 w-full rounded-xl border border-slate-300 px-4 text-slate-950 outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100" />
            <FieldError message={state.fieldErrors?.fullName} />
          </label>
        ) : null}

        {showEmail ? (
          <label className="block">
            <span className="text-sm font-black text-slate-800">Correo electrónico</span>
            <input name="email" type="email" autoComplete="email" className="mt-2 min-h-12 w-full rounded-xl border border-slate-300 px-4 text-slate-950 outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100" />
            <FieldError message={state.fieldErrors?.email} />
          </label>
        ) : null}

        {showPassword ? (
          <div>
            <PasswordField name="password" label={mode === "update-password" ? "Nueva contraseña" : "Contraseña"} autoComplete={mode === "login" ? "current-password" : "new-password"} describedBy={mode !== "login" ? "password-help" : undefined} />
            {mode !== "login" ? <p id="password-help" className="mt-1 text-xs text-slate-500">Mínimo 8 caracteres, una letra y un número.</p> : null}
            <FieldError message={state.fieldErrors?.password} />
          </div>
        ) : null}

        {mode === "register" || mode === "update-password" ? (
          <div>
            <PasswordField name="confirmPassword" label="Confirmar contraseña" autoComplete="new-password" />
            <FieldError message={state.fieldErrors?.confirmPassword} />
          </div>
        ) : null}

        {state.message ? (
          <p role="status" className={`rounded-xl border p-3 text-sm font-semibold ${state.status === "success" ? "border-emerald-200 bg-emerald-50 text-emerald-800" : "border-red-200 bg-red-50 text-red-700"}`}>
            {state.message}
          </p>
        ) : null}

        {mode === "register" ? (
          <p className="text-xs leading-5 text-slate-500">
            Al registrar tu cuenta confirmas que has leído los{" "}
            <Link href="/terms" className="font-bold text-blue-700 hover:underline">Términos de uso</Link>
            {" "}y la{" "}
            <Link href="/privacy" className="font-bold text-blue-700 hover:underline">Política de privacidad</Link>.
          </p>
        ) : null}

        <SubmitButton label={copy.submit} />
      </form>

      <div className="mt-6 space-y-3 text-center text-sm text-slate-600">
        {mode === "login" ? (
          <>
            <p><Link href="/recuperar-contrasena" className="font-black text-blue-700 hover:underline">¿Olvidaste tu contraseña?</Link></p>
            <p>¿Todavía no tienes cuenta? <Link href="/registro" className="font-black text-blue-700 hover:underline">Regístrate</Link></p>
          </>
        ) : null}
        {mode === "register" || mode === "recover" ? (
          <p><Link href="/login" className="font-black text-blue-700 hover:underline">← Volver al inicio de sesión</Link></p>
        ) : null}
        {mode === "update-password" && state.status === "success" ? (
          <p><Link href="/cuenta" className="font-black text-blue-700 hover:underline">Ir a mi cuenta →</Link></p>
        ) : null}
      </div>
    </div>
  );
}
