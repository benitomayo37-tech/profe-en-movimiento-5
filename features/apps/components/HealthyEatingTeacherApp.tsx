"use client";

import { useEffect, useMemo, useState } from "react";

import { healthyLessons, levelGuidance, levels, sourceLinks, type HealthyLesson, type SchoolLevel } from "@/features/apps/healthy-eating/data";

const STORAGE_KEY = "pem-healthy-eating-v1";
type Theme = "light" | "sepia" | "dark";
interface SavedState { completed: string[]; favorites: string[]; notes: Record<string, string>; lastLesson: string; level: SchoolLevel; }
const emptySaved: SavedState = { completed: [], favorites: [], notes: {}, lastLesson: healthyLessons[0].id, level: "EGB Media" };

function readSaved(): SavedState {
  try {
    const parsed = JSON.parse(localStorage.getItem(STORAGE_KEY) || "null") as Partial<SavedState> | null;
    return parsed ? { ...emptySaved, ...parsed, notes: parsed.notes || {} } : emptySaved;
  } catch { return emptySaved; }
}

export default function HealthyEatingTeacherApp() {
  const [saved, setSaved] = useState<SavedState>(emptySaved);
  const [ready, setReady] = useState(false);
  const [lessonId, setLessonId] = useState(healthyLessons[0].id);
  const [query, setQuery] = useState("");
  const [moduleFilter, setModuleFilter] = useState("Todas");
  const [favoritesOnly, setFavoritesOnly] = useState(false);
  const [answers, setAnswers] = useState<number[]>([-1, -1, -1]);
  const [checked, setChecked] = useState(false);
  const [theme, setTheme] = useState<Theme>("light");
  const [fontScale, setFontScale] = useState(1);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      const stored = readSaved();
      setSaved(stored);
      setLessonId(healthyLessons.some((item) => item.id === stored.lastLesson) ? stored.lastLesson : healthyLessons[0].id);
      setReady(true);
    }, 0);
    return () => window.clearTimeout(timer);
  }, []);

  function update(next: SavedState) {
    setSaved(next);
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(next)); } catch { /* almacenamiento no disponible */ }
  }

  const lesson = healthyLessons.find((item) => item.id === lessonId) || healthyLessons[0];
  const modules = useMemo(() => ["Todas", ...Array.from(new Set(healthyLessons.map((item) => item.module)))], []);
  const filtered = useMemo(() => healthyLessons.filter((item) => {
    const text = `${item.title} ${item.subtitle} ${item.module}`.toLocaleLowerCase("es");
    return (moduleFilter === "Todas" || item.module === moduleFilter)
      && (!favoritesOnly || saved.favorites.includes(item.id))
      && text.includes(query.toLocaleLowerCase("es").trim());
  }), [favoritesOnly, moduleFilter, query, saved.favorites]);
  const index = healthyLessons.findIndex((item) => item.id === lesson.id);
  const score = answers.filter((answer) => answer === 0).length;
  const themeClass = theme === "dark" ? "bg-slate-950 text-slate-100" : theme === "sepia" ? "bg-amber-50 text-amber-950" : "bg-slate-50 text-slate-950";

  function chooseLesson(id: string) {
    setLessonId(id); setAnswers([-1, -1, -1]); setChecked(false);
    update({ ...saved, lastLesson: id });
  }
  function toggleFavorite(id: string) {
    const favorites = saved.favorites.includes(id) ? saved.favorites.filter((item) => item !== id) : [...saved.favorites, id];
    update({ ...saved, favorites });
  }
  function saveNote(note: string) { update({ ...saved, notes: { ...saved.notes, [lesson.id]: note } }); }
  function complete() {
    setChecked(true);
    if (answers.every((answer) => answer >= 0) && score >= 2 && !saved.completed.includes(lesson.id)) {
      update({ ...saved, completed: [...saved.completed, lesson.id] });
    }
  }
  function resetProgress() {
    if (!window.confirm("¿Deseas borrar el progreso, favoritos y notas guardados en este dispositivo?")) return;
    localStorage.removeItem(STORAGE_KEY); setSaved(emptySaved); setLessonId(healthyLessons[0].id); setAnswers([-1,-1,-1]); setChecked(false);
  }

  const quiz = buildQuiz(lesson);
  return (
    <section className={`healthy-app overflow-hidden rounded-[2rem] border border-emerald-200 shadow-xl ${themeClass}`} style={{ fontSize: `${fontScale}rem` }}>
      <style>{`@media print { body * { visibility:hidden!important } .healthy-print-area,.healthy-print-area * { visibility:visible!important } .healthy-print-area { position:absolute; inset:0; width:100%; background:#fff!important; color:#0f172a!important; padding:14mm!important } .healthy-no-print { display:none!important } @page { size:A4; margin:0 } }`}</style>
      <header className="healthy-no-print bg-gradient-to-br from-emerald-900 via-emerald-700 to-lime-500 p-6 text-white sm:p-8">
        <div className="flex flex-wrap items-start justify-between gap-5">
          <div><p className="text-xs font-black uppercase tracking-[.2em] text-lime-200">Profe en Movimiento · Herramienta docente PRO</p><h2 className="mt-2 text-3xl font-black sm:text-4xl">Alimentación en Movimiento</h2><p className="mt-2 max-w-3xl leading-7 text-emerald-50">Guía interactiva de hábitos saludables para enseñar sin diagnosticar, prescribir dietas ni comparar cuerpos.</p></div>
          <div className="rounded-2xl border border-white/20 bg-white/10 px-5 py-4 text-center"><p className="text-3xl font-black">{saved.completed.length}/30</p><p className="text-xs font-bold uppercase">Lecciones completadas</p></div>
        </div>
        <div className="mt-5 h-2 overflow-hidden rounded-full bg-white/20"><div className="h-full bg-lime-300 transition-all" style={{ width: `${saved.completed.length / 30 * 100}%` }} /></div>
      </header>

      <div className="healthy-no-print grid gap-3 border-b border-emerald-200 bg-white/90 p-4 lg:grid-cols-[1fr_220px_auto]">
        <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Buscar entre las 30 lecciones…" aria-label="Buscar lecciones" className="min-h-11 rounded-xl border border-slate-300 bg-white px-4 text-slate-900" />
        <select value={saved.level} onChange={(event) => update({ ...saved, level: event.target.value as SchoolLevel })} aria-label="Nivel educativo" className="min-h-11 rounded-xl border border-slate-300 bg-white px-3 text-slate-900">{levels.map((level) => <option key={level}>{level}</option>)}</select>
        <div className="flex flex-wrap gap-2">
          <button onClick={() => setFontScale((value) => Math.max(.9, value - .1))} className="rounded-xl border bg-white px-3 font-black text-slate-900" aria-label="Reducir texto">A−</button>
          <button onClick={() => setFontScale((value) => Math.min(1.25, value + .1))} className="rounded-xl border bg-white px-3 font-black text-slate-900" aria-label="Aumentar texto">A+</button>
          <select value={theme} onChange={(event) => setTheme(event.target.value as Theme)} aria-label="Tema visual" className="rounded-xl border bg-white px-3 text-sm font-bold text-slate-900"><option value="light">Claro</option><option value="sepia">Sepia</option><option value="dark">Nocturno</option></select>
        </div>
      </div>

      <div className="min-h-[760px]">
        <aside className="healthy-no-print border-b border-emerald-200 bg-slate-100 p-4 text-slate-900 sm:p-5">
          <div className="flex flex-wrap items-center gap-2"><select value={moduleFilter} onChange={(event) => setModuleFilter(event.target.value)} className="min-h-11 min-w-[220px] flex-1 rounded-xl border bg-white px-3 py-2 text-sm font-bold">{modules.map((module) => <option key={module}>{module}</option>)}</select><button onClick={() => setFavoritesOnly((value) => !value)} className={`min-h-11 rounded-xl border px-4 font-bold ${favoritesOnly ? "bg-amber-100" : "bg-white"}`} aria-label="Mostrar favoritos">★ {favoritesOnly ? "Solo favoritas" : "Favoritas"}</button><span className="text-xs font-bold text-slate-500">{filtered.length} lecciones visibles</span></div>
          <nav className="mt-4 grid max-h-[285px] gap-2 overflow-y-auto pr-1 sm:grid-cols-2 xl:grid-cols-3" aria-label="Lecciones de alimentación">{filtered.map((item) => <button key={item.id} onClick={() => chooseLesson(item.id)} className={`w-full rounded-xl border p-3 text-left transition ${item.id === lesson.id ? "border-emerald-600 bg-emerald-50 shadow-sm" : "bg-white hover:border-emerald-300"}`}><div className="flex items-start gap-2"><span aria-hidden>{item.icon}</span><span className="min-w-0 flex-1"><span className="block text-[10px] font-black uppercase tracking-wide text-emerald-700">{item.module}</span><span className="mt-1 block text-sm font-black">{item.title}</span></span><span aria-label={saved.completed.includes(item.id) ? "Completada" : "Pendiente"}>{saved.completed.includes(item.id) ? "✓" : "○"}</span></div></button>)}</nav>
        </aside>

        <main className="healthy-print-area mx-auto w-full max-w-5xl p-5 sm:p-8">
          <div className="flex flex-wrap items-start justify-between gap-4 border-b border-current/10 pb-5">
            <div><p className="text-xs font-black uppercase tracking-[.18em] text-emerald-700">Lección {index + 1} de 30 · {lesson.module}</p><h3 className="mt-2 text-3xl font-black">{lesson.icon} {lesson.title}</h3><p className="mt-2 opacity-70">{lesson.subtitle}</p></div>
            <button onClick={() => toggleFavorite(lesson.id)} className="healthy-no-print rounded-xl border bg-white px-4 py-2 font-black text-slate-900" aria-pressed={saved.favorites.includes(lesson.id)}>{saved.favorites.includes(lesson.id) ? "★ Favorita" : "☆ Favorito"}</button>
          </div>

          <div className="mt-5 rounded-2xl border border-blue-200 bg-blue-50 p-4 text-sm leading-6 text-blue-950"><b>Adaptación para {saved.level}:</b> {levelGuidance[saved.level]}</div>
          <div className="mt-5 rounded-2xl border border-orange-200 bg-orange-50 p-4 text-sm leading-6 text-orange-950"><b>Alcance educativo:</b> esta guía no diagnostica, prescribe dietas ni sustituye a profesionales de nutrición, medicina o psicología.</div>

          <div className="mt-6 grid gap-5 xl:grid-cols-2">
            <Card title="Propósito observable"><p>{lesson.purpose}</p></Card>
            <Card title="Ideas clave"><ul className="list-disc space-y-2 pl-5">{lesson.keyPoints.map((point) => <li key={point}>{point}</li>)}</ul></Card>
            <Card title="Actividad cooperativa"><p>{lesson.activity}</p><p className="mt-3 text-sm"><b>Evidencia:</b> {lesson.evidence}</p></Card>
            <Card title="Seguridad y protección"><p>{lesson.safety}</p></Card>
          </div>

          <section className="mt-6 rounded-2xl border border-violet-200 bg-white p-5 text-slate-950">
            <h4 className="text-xl font-black">Diseño Universal para el Aprendizaje</h4>
            <div className="mt-4 grid gap-3 md:grid-cols-3">
              <Dua color="violet" title="Representación">Presenta tarjetas, objetos simulados, imágenes, lectura en voz alta o explicación breve.</Dua>
              <Dua color="blue" title="Acción y Expresión">Permite clasificar, dibujar, hablar, escribir o representar corporalmente sin degustar.</Dua>
              <Dua color="green" title="Compromiso e Implicación">Ofrece elección, conecta con alimentos locales y evita revelar hábitos personales.</Dua>
            </div>
          </section>

          <section className="mt-6 rounded-2xl border border-emerald-200 bg-emerald-50 p-5 text-emerald-950">
            <h4 className="text-xl font-black">Ficha para una clase de 45 minutos</h4>
            <ol className="mt-4 grid gap-3 md:grid-cols-3"><li className="rounded-xl bg-white p-4"><b>Inicio · 8 min</b><br/>Presenta un caso ficticio y recupera ideas sin preguntar qué come cada estudiante.</li><li className="rounded-xl bg-white p-4"><b>Desarrollo · 30 min</b><br/>{lesson.activity}</li><li className="rounded-xl bg-white p-4"><b>Cierre · 7 min</b><br/>Solicita la evidencia: {lesson.evidence.toLocaleLowerCase("es")}</li></ol>
            <p className="mt-4 text-sm"><b>Vínculo familiar opcional:</b> {lesson.family}</p>
          </section>

          <section className="healthy-no-print mt-6 rounded-2xl border bg-white p-5 text-slate-950">
            <h4 className="text-xl font-black">Comprobación formativa · 3 preguntas</h4>
            <div className="mt-4 space-y-5">{quiz.map((question, questionIndex) => <fieldset key={question.prompt}><legend className="font-black">{questionIndex + 1}. {question.prompt}</legend><div className="mt-2 grid gap-2">{question.options.map((option, optionIndex) => <label key={option} className={`flex cursor-pointer gap-3 rounded-xl border p-3 ${answers[questionIndex] === optionIndex ? "border-emerald-600 bg-emerald-50" : ""}`}><input type="radio" name={`healthy-${lesson.id}-${questionIndex}`} checked={answers[questionIndex] === optionIndex} onChange={() => { const next = [...answers]; next[questionIndex] = optionIndex; setAnswers(next); setChecked(false); }} /><span>{option}</span></label>)}</div></fieldset>)}</div>
            <button onClick={complete} className="mt-5 rounded-xl bg-emerald-700 px-5 py-3 font-black text-white">Comprobar y marcar lección</button>
            {checked ? <p role="status" className={`mt-3 rounded-xl border p-3 font-bold ${answers.every((answer) => answer >= 0) && score >= 2 ? "border-emerald-200 bg-emerald-50 text-emerald-800" : "border-orange-200 bg-orange-50 text-orange-900"}`}>{!answers.every((answer) => answer >= 0) ? "Responde las tres preguntas antes de completar." : score >= 2 ? `Resultado: ${score}/3. Lección completada.` : `Resultado: ${score}/3. Revisa las ideas clave e inténtalo otra vez.`}</p> : null}
          </section>

          <section className="healthy-no-print mt-6 rounded-2xl border bg-white p-5 text-slate-950"><label className="font-black">Notas privadas del docente<textarea value={saved.notes[lesson.id] || ""} onChange={(event) => saveNote(event.target.value)} placeholder="Adaptaciones, ideas o recordatorios…" className="mt-3 min-h-28 w-full rounded-xl border p-3 font-normal" /></label><p className="mt-2 text-xs text-slate-500">Se guardan únicamente en este dispositivo.</p></section>

          <footer className="mt-6 flex flex-wrap items-center justify-between gap-3 border-t border-current/10 pt-5">
            <a href={sourceLinks[lesson.source]} target="_blank" rel="noreferrer" className="text-sm font-bold text-blue-700 underline">Fuente orientadora: {lesson.source}</a>
            <div className="healthy-no-print flex flex-wrap gap-2"><button onClick={() => window.print()} className="rounded-xl border bg-white px-4 py-2 font-black text-slate-900">Imprimir ficha</button><button disabled={index === 0} onClick={() => chooseLesson(healthyLessons[index - 1].id)} className="rounded-xl border bg-white px-4 py-2 font-black text-slate-900 disabled:opacity-40">← Anterior</button><button disabled={index === healthyLessons.length - 1} onClick={() => chooseLesson(healthyLessons[index + 1].id)} className="rounded-xl bg-orange-500 px-4 py-2 font-black text-white disabled:opacity-40">Siguiente →</button></div>
          </footer>
          <div className="healthy-no-print mt-6 text-right"><button onClick={resetProgress} className="text-xs font-bold text-red-700 underline">Borrar todos mis datos locales</button></div>
        </main>
      </div>
      {!ready ? <p className="healthy-no-print border-t bg-white p-3 text-center text-xs text-slate-500">Preparando progreso local…</p> : null}
    </section>
  );
}

function Card({ title, children }: { title: string; children: React.ReactNode }) { return <section className="rounded-2xl border bg-white p-5 leading-7 text-slate-950"><h4 className="text-lg font-black">{title}</h4><div className="mt-3">{children}</div></section>; }
function Dua({ color, title, children }: { color: "violet" | "blue" | "green"; title: string; children: React.ReactNode }) { const classes = { violet: "border-violet-300 bg-violet-50", blue: "border-blue-300 bg-blue-50", green: "border-green-300 bg-green-50" }; return <div className={`rounded-xl border-l-4 p-4 ${classes[color]}`}><b>{title}</b><p className="mt-2 text-sm leading-6">{children}</p></div>; }

function buildQuiz(lesson: HealthyLesson) {
  return [
    { prompt: "¿Cuál afirmación corresponde a esta lección?", options: [lesson.keyPoints[0], "Existe una regla idéntica para todas las personas.", "El docente debe diagnosticar las necesidades individuales."] },
    { prompt: "¿Qué decisión protege mejor al grupo?", options: [lesson.safety, "Pedir datos personales y compararlos públicamente.", "Usar la actividad sin revisar el contexto ni ofrecer alternativas."] },
    { prompt: "¿Qué evidencia permite evaluar el aprendizaje?", options: [lesson.evidence, "El peso o la apariencia corporal.", "La comida que la familia pudo comprar esa semana."] },
  ];
}
