"use client";

import Link from "next/link";
import { useActionState, useState } from "react";
import { useFormStatus } from "react-dom";

import { initialStudentActionState, type StudentActionState } from "@/features/students/types";

interface StudentAuthFormProps {
  mode: "login" | "register";
  action: (state: StudentActionState, formData: FormData) => Promise<StudentActionState>;
}

function SubmitButton({ label }: { label: string }) {
  const { pending } = useFormStatus();
  return (
    <button disabled={pending} type="submit" className="mt-2 flex min-h-12 w-full items-center justify-center rounded-xl bg-emerald-600 px-5 py-3 font-black text-white transition hover:bg-emerald-700 disabled:cursor-wait disabled:opacity-60">
      {pending ? "Procesando…" : label}
    </button>
  );
}

function FieldError({ message }: { message?: string }) {
  return message ? <p className="mt-1 text-sm font-semibold text-red-600">{message}</p> : null;
}

export default function StudentAuthForm({ mode, action }: StudentAuthFormProps) {
  const [state, formAction] = useActionState(action, initialStudentActionState);
  const [showPin, setShowPin] = useState(false);
  const [showConfirmPin, setShowConfirmPin] = useState(false);
  const register = mode === "register";

  return (
    <div>
      <p className="text-xs font-black uppercase tracking-[0.16em] text-emerald-700">Acceso estudiantil</p>
      <h2 className="mt-2 text-3xl font-black tracking-tight text-slate-950">
        {register ? "Crea tu acceso" : "Hola, estudiante"}
      </h2>
      <p className="mt-3 text-sm leading-6 text-slate-600">
        {register
          ? "Registra tus datos reales y crea un PIN de cuatro números que puedas recordar."
          : "Escribe exactamente el nombre con el que te registraste y tu PIN personal."}
      </p>

      <form action={formAction} className="mt-7 space-y-5">
        <label className="block">
          <span className="text-sm font-black text-slate-800">Nombre completo</span>
          <input name="fullName" autoComplete="name" className="mt-2 min-h-12 w-full rounded-xl border border-slate-300 px-4 outline-none focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100" />
          <FieldError message={state.fieldErrors?.fullName} />
        </label>

        {register ? (
          <>
            <label className="block">
              <span className="text-sm font-black text-slate-800">Unidad Educativa</span>
              <input name="institution" autoComplete="organization" className="mt-2 min-h-12 w-full rounded-xl border border-slate-300 px-4 outline-none focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100" />
              <FieldError message={state.fieldErrors?.institution} />
            </label>
            <label className="block">
              <span className="text-sm font-black text-slate-800">Nivel educativo</span>
              <select name="educationLevel" defaultValue="" className="mt-2 min-h-12 w-full rounded-xl border border-slate-300 bg-white px-4 outline-none focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100">
                <option value="" disabled>Selecciona tu nivel</option>
                <option>Educación General Básica Elemental</option>
                <option>Educación General Básica Media</option>
                <option>Educación General Básica Superior</option>
                <option>Bachillerato</option>
                <option>Educación Superior</option>
              </select>
              <FieldError message={state.fieldErrors?.educationLevel} />
            </label>
            <label className="block">
              <span className="text-sm font-black text-slate-800">Grado, curso y paralelo</span>
              <input name="gradeCourse" placeholder="Ejemplo: 8vo EGB A" className="mt-2 min-h-12 w-full rounded-xl border border-slate-300 px-4 outline-none focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100" />
              <FieldError message={state.fieldErrors?.gradeCourse} />
            </label>
          </>
        ) : null}

        <label className="block">
          <span className="text-sm font-black text-slate-800">PIN de 4 números</span>
          <span className="relative mt-2 block">
            <input name="pin" type={showPin ? "text" : "password"} inputMode="numeric" pattern="[0-9]{4}" maxLength={4} autoComplete={register ? "new-password" : "current-password"} className="min-h-12 w-full rounded-xl border border-slate-300 px-4 pr-12 tracking-[0.5em] outline-none focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100" />
            <button type="button" onClick={() => setShowPin((current) => !current)} aria-label={showPin ? "Ocultar PIN" : "Mostrar PIN"} className="absolute inset-y-0 right-1 flex w-11 items-center justify-center rounded-lg text-slate-500 hover:bg-slate-100 hover:text-emerald-700">
              <span aria-hidden="true">{showPin ? "🙈" : "👁"}</span>
            </button>
          </span>
          <FieldError message={state.fieldErrors?.pin} />
        </label>

        {register ? (
          <label className="block">
            <span className="text-sm font-black text-slate-800">Confirmar PIN</span>
            <span className="relative mt-2 block">
              <input name="confirmPin" type={showConfirmPin ? "text" : "password"} inputMode="numeric" pattern="[0-9]{4}" maxLength={4} autoComplete="new-password" className="min-h-12 w-full rounded-xl border border-slate-300 px-4 pr-12 tracking-[0.5em] outline-none focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100" />
              <button type="button" onClick={() => setShowConfirmPin((current) => !current)} aria-label={showConfirmPin ? "Ocultar PIN" : "Mostrar PIN"} className="absolute inset-y-0 right-1 flex w-11 items-center justify-center rounded-lg text-slate-500 hover:bg-slate-100 hover:text-emerald-700">
                <span aria-hidden="true">{showConfirmPin ? "🙈" : "👁"}</span>
              </button>
            </span>
            <FieldError message={state.fieldErrors?.confirmPin} />
          </label>
        ) : null}

        {state.message ? (
          <p role="status" className="rounded-xl border border-red-200 bg-red-50 p-3 text-sm font-semibold text-red-700">{state.message}</p>
        ) : null}

        {register ? (
          <p className="text-xs leading-5 text-slate-500">
            Al registrarte aceptas los <Link href="/terms" className="font-bold text-emerald-700 hover:underline">Términos de uso</Link> y la <Link href="/privacy" className="font-bold text-emerald-700 hover:underline">Política de privacidad</Link>.
          </p>
        ) : null}

        <SubmitButton label={register ? "Crear acceso estudiantil" : "Entrar a recursos"} />
      </form>

      <p className="mt-6 text-center text-sm text-slate-600">
        {register ? "¿Ya te registraste?" : "¿Es tu primera vez?"}{" "}
        <Link href={register ? "/login?rol=estudiante" : "/registro?rol=estudiante"} className="font-black text-emerald-700 hover:underline">
          {register ? "Inicia sesión" : "Crea tu acceso"}
        </Link>
      </p>
    </div>
  );
}
