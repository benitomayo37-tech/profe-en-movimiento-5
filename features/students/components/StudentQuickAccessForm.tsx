"use client";

import Link from "next/link";
import { useActionState } from "react";
import { useFormStatus } from "react-dom";

import { initialStudentActionState, type StudentActionState } from "@/features/students/types";

interface StudentQuickAccessFormProps {
  action: (state: StudentActionState, formData: FormData) => Promise<StudentActionState>;
}

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button disabled={pending} type="submit" className="mt-2 flex min-h-12 w-full items-center justify-center rounded-xl bg-emerald-600 px-5 py-3 font-black text-white transition hover:bg-emerald-700 disabled:cursor-wait disabled:opacity-60">
      {pending ? "Preparando tu espacio…" : "Entrar y aprender"}
    </button>
  );
}

function FieldError({ message }: { message?: string }) {
  return message ? <p className="mt-1 text-sm font-semibold text-red-600">{message}</p> : null;
}

export default function StudentQuickAccessForm({ action }: StudentQuickAccessFormProps) {
  const [state, formAction] = useActionState(action, initialStudentActionState);

  return (
    <div>
      <p className="text-xs font-black uppercase tracking-[0.16em] text-emerald-700">Acceso gratuito</p>
      <h2 className="mt-2 text-3xl font-black tracking-tight text-slate-950">¡Hola, estudiante!</h2>
      <p className="mt-3 text-sm leading-6 text-slate-600">
        No necesitas registrarte ni crear un PIN. Usa un nombre o apodo y selecciona tu nivel para personalizar los recursos.
      </p>

      <form action={formAction} className="mt-7 space-y-5">
        <label className="block">
          <span className="text-sm font-black text-slate-800">Nombre o apodo</span>
          <input name="displayName" autoComplete="nickname" maxLength={40} placeholder="Ejemplo: Alex" className="mt-2 min-h-12 w-full rounded-xl border border-slate-300 px-4 outline-none focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100" />
          <FieldError message={state.fieldErrors?.displayName} />
        </label>

        <label className="block">
          <span className="text-sm font-black text-slate-800">Nivel educativo</span>
          <select name="educationLevel" defaultValue="" className="mt-2 min-h-12 w-full rounded-xl border border-slate-300 bg-white px-4 outline-none focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100">
            <option value="" disabled>Selecciona tu nivel</option>
            <option>Preparatoria</option>
            <option>Educación General Básica Elemental</option>
            <option>Educación General Básica Media</option>
            <option>Educación General Básica Superior</option>
            <option>BGU</option>
          </select>
          <FieldError message={state.fieldErrors?.educationLevel} />
        </label>

        <label className="block">
          <span className="text-sm font-black text-slate-800">Grado o curso</span>
          <input name="gradeCourse" maxLength={80} placeholder="Ejemplo: 8vo EGB" className="mt-2 min-h-12 w-full rounded-xl border border-slate-300 px-4 outline-none focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100" />
          <FieldError message={state.fieldErrors?.gradeCourse} />
        </label>

        {state.message ? <p role="status" className="rounded-xl border border-red-200 bg-red-50 p-3 text-sm font-semibold text-red-700">{state.message}</p> : null}

        <p className="rounded-xl border border-emerald-100 bg-emerald-50 p-3 text-xs leading-5 text-emerald-900">
          Tu perfil se conserva en este dispositivo para recordar el progreso. No necesitas correo electrónico ni contraseña.
        </p>
        <SubmitButton />
      </form>

      <div className="mt-6 rounded-2xl border border-blue-200 bg-blue-50 p-4 text-center">
        <p className="text-sm font-bold text-blue-950">¿Vas a realizar una evaluación?</p>
        <p className="mt-1 text-xs leading-5 text-blue-800">Primero entra a tu espacio. En “Realizar examen” usarás el código entregado por tu docente.</p>
      </div>

      <p className="mt-5 text-center text-xs leading-5 text-slate-500">
        Al continuar aceptas los <Link href="/terms" className="font-bold text-emerald-700 hover:underline">Términos de uso</Link> y la <Link href="/privacy" className="font-bold text-emerald-700 hover:underline">Política de privacidad</Link>.
      </p>
    </div>
  );
}
