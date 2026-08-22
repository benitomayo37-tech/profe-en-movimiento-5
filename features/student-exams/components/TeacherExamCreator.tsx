"use client";

import { useState } from "react";

interface CreatedExam { code: string; expiresAt: string; }

export default function TeacherExamCreator({ defaultInstitution = "" }: { defaultInstitution?: string }) {
  const [created, setCreated] = useState<CreatedExam | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setCreated(null);
    setLoading(true);
    const form = new FormData(event.currentTarget);
    try {
      const response = await fetch("/api/teacher/exams/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: form.get("title"),
          topic: form.get("topic"),
          institution: form.get("institution"),
          gradeCourse: form.get("gradeCourse"),
          expiresInDays: form.get("expiresInDays"),
        }),
      });
      const payload = await response.json() as CreatedExam & { error?: string };
      if (!response.ok) throw new Error(payload.error || "No se pudo crear el examen.");
      setCreated(payload);
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "No se pudo crear el examen.");
    } finally {
      setLoading(false);
    }
  }

  async function copyCode() {
    if (created?.code) await navigator.clipboard.writeText(created.code);
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
      <form onSubmit={handleSubmit} className="rounded-3xl border border-blue-100 bg-white p-6 shadow-lg sm:p-8">
        <p className="text-xs font-black uppercase tracking-[0.18em] text-blue-700">Configuración docente</p>
        <h2 className="mt-2 text-3xl font-black">Crea una evaluación</h2>
        <p className="mt-3 text-sm leading-6 text-slate-600">La IA preparará un banco de 15 preguntas. Cada estudiante recibirá 10 preguntas equivalentes en orden diferente.</p>
        <div className="mt-7 grid gap-5 sm:grid-cols-2">
          <label className="sm:col-span-2"><span className="text-sm font-black">Título del examen</span><input name="title" required minLength={3} maxLength={120} placeholder="Ejemplo: Evaluación de baloncesto" className="mt-2 w-full rounded-2xl border border-slate-300 px-4 py-3 outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100" /></label>
          <label className="sm:col-span-2"><span className="text-sm font-black">Tema e indicaciones</span><textarea name="topic" required minLength={3} maxLength={500} rows={4} placeholder="Ejemplo: reglas básicas, pases y lanzamiento. Evitar contenidos no estudiados." className="mt-2 w-full rounded-2xl border border-slate-300 px-4 py-3 outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100" /></label>
          <label><span className="text-sm font-black">Unidad Educativa</span><input name="institution" defaultValue={defaultInstitution} required maxLength={160} className="mt-2 w-full rounded-2xl border border-slate-300 px-4 py-3 outline-none focus:border-blue-500" /></label>
          <label><span className="text-sm font-black">Grado y curso</span><input name="gradeCourse" required maxLength={80} placeholder="Ejemplo: 8vo EGB A" className="mt-2 w-full rounded-2xl border border-slate-300 px-4 py-3 outline-none focus:border-blue-500" /></label>
          <label><span className="text-sm font-black">Vigencia del código</span><select name="expiresInDays" defaultValue="7" className="mt-2 w-full rounded-2xl border border-slate-300 bg-white px-4 py-3"><option value="1">1 día</option><option value="3">3 días</option><option value="7">7 días</option><option value="14">14 días</option><option value="30">30 días</option></select></label>
        </div>
        {error ? <p role="alert" className="mt-5 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm font-bold text-red-700">{error}</p> : null}
        <button disabled={loading} className="mt-6 rounded-2xl bg-gradient-to-r from-blue-700 to-cyan-500 px-6 py-4 font-black text-white shadow-lg disabled:opacity-60">{loading ? "Generando banco de preguntas…" : "Crear examen y código"}</button>
      </form>

      <aside className="rounded-3xl bg-gradient-to-br from-blue-950 via-blue-800 to-cyan-600 p-7 text-white shadow-xl">
        <span className="text-5xl" aria-hidden>🔐</span>
        <h2 className="mt-5 text-2xl font-black">Código para tus estudiantes</h2>
        {!created ? <p className="mt-3 leading-7 text-blue-100">Cuando el examen esté listo, aquí aparecerá el código que debes compartir. El estudiante no podrá ingresar sin él.</p> : (
          <div className="mt-6 rounded-3xl bg-white p-6 text-center text-slate-950">
            <p className="text-xs font-black uppercase tracking-[0.18em] text-blue-700">Código de acceso</p>
            <p className="mt-3 text-4xl font-black tracking-widest">{created.code}</p>
            <p className="mt-3 text-sm text-slate-600">Válido hasta {new Date(created.expiresAt).toLocaleString("es-EC")}</p>
            <button type="button" onClick={copyCode} className="mt-5 rounded-xl bg-orange-500 px-5 py-3 text-sm font-black text-white">Copiar código</button>
          </div>
        )}
        <div className="mt-7 space-y-3 text-sm text-blue-50"><p>✓ 10 puntos, uno por pregunta</p><p>✓ Corrección y nota automáticas</p><p>✓ Versiones diferentes y equivalentes</p><p>✓ Resultado listo para imprimir</p></div>
      </aside>
    </div>
  );
}
