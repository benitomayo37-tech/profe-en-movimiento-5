"use client";

import Image from "next/image";
import { useEffect, useMemo, useState } from "react";

import { healthyLessons, levelGuidance, levels, sourceLinks, type HealthyLesson, type SchoolLevel } from "@/features/apps/healthy-eating/data";

const STORAGE_KEY = "pem-healthy-eating-v1";
type Theme = "light" | "sepia" | "dark";
type AppView = "library" | "lesson";
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
  const [view, setView] = useState<AppView>("library");
  const [labSelected, setLabSelected] = useState<string[]>([]);
  const [labChecked, setLabChecked] = useState(false);

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
    setLessonId(id); setAnswers([-1, -1, -1]); setChecked(false); setLabSelected([]); setLabChecked(false);
    setView("lesson");
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
    <section className={`healthy-app overflow-hidden rounded-[2rem] border border-[#dbe5f5] shadow-xl ${themeClass}`} style={{ fontSize: `${fontScale}rem` }}>
      <style>{`@media print { body * { visibility:hidden!important } .healthy-print-area,.healthy-print-area * { visibility:visible!important } .healthy-print-area { position:absolute; inset:0; width:100%; background:#fff!important; color:#0f172a!important; padding:14mm!important } .healthy-no-print { display:none!important } @page { size:A4; margin:0 } }`}</style>
      <header className="healthy-no-print relative overflow-hidden bg-gradient-to-br from-[#0F2C5C] via-[#123d7a] to-[#0a5c75] p-6 text-white sm:p-8">
        <div className="absolute -right-16 -top-20 h-64 w-64 rounded-full bg-[#FF7A00]/25" aria-hidden />
        <div className="relative flex flex-wrap items-start justify-between gap-5">
          <div className="flex min-w-0 flex-1 items-start gap-4">
            <div className="rounded-2xl bg-white p-2 shadow-lg"><Image src="/logos/logo-profe-en-movimiento.png" alt="Profe en Movimiento" width={78} height={78} className="h-16 w-16 object-contain" /></div>
            <div><p className="text-xs font-black uppercase tracking-[.2em] text-orange-300">Libro interactivo docente · Edición segura 2026</p><h2 className="mt-2 text-3xl font-black sm:text-4xl">Alimentación en Movimiento</h2><p className="mt-2 max-w-3xl leading-7 text-blue-100">30 experiencias visuales sobre alimentación, hidratación, etiquetas y bienestar para aprender, enseñar y reflexionar.</p><div className="mt-4 flex flex-wrap gap-2 text-[11px] font-black"><span className="rounded-full border border-white/20 bg-white/10 px-3 py-1.5">30 lecciones</span><span className="rounded-full border border-white/20 bg-white/10 px-3 py-1.5">5 niveles</span><span className="rounded-full border border-white/20 bg-white/10 px-3 py-1.5">DUA</span><span className="rounded-full border border-white/20 bg-white/10 px-3 py-1.5">Datos locales</span></div></div>
          </div>
          <div className="rounded-2xl border border-white/20 bg-white/10 px-5 py-4 text-center backdrop-blur-sm"><p className="text-3xl font-black">{saved.completed.length}/30</p><p className="text-xs font-bold uppercase">Lecciones completadas</p></div>
        </div>
        <div className="relative mt-5 h-2 overflow-hidden rounded-full bg-white/20"><div className="h-full bg-[#FF7A00] transition-all" style={{ width: `${saved.completed.length / 30 * 100}%` }} /></div>
      </header>

      <div className="healthy-no-print grid gap-3 border-b border-[#dbe5f5] bg-white/95 p-4 lg:grid-cols-[1fr_220px_auto]">
        <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Buscar entre las 30 lecciones…" aria-label="Buscar lecciones" className="min-h-11 rounded-xl border border-slate-300 bg-white px-4 text-slate-900" />
        <select value={saved.level} onChange={(event) => update({ ...saved, level: event.target.value as SchoolLevel })} aria-label="Nivel educativo" className="min-h-11 rounded-xl border border-slate-300 bg-white px-3 text-slate-900">{levels.map((level) => <option key={level}>{level}</option>)}</select>
        <div className="flex flex-wrap gap-2">
          <button onClick={() => setFontScale((value) => Math.max(.9, value - .1))} className="rounded-xl border bg-white px-3 font-black text-slate-900" aria-label="Reducir texto">A−</button>
          <button onClick={() => setFontScale((value) => Math.min(1.25, value + .1))} className="rounded-xl border bg-white px-3 font-black text-slate-900" aria-label="Aumentar texto">A+</button>
          <select value={theme} onChange={(event) => setTheme(event.target.value as Theme)} aria-label="Tema visual" className="rounded-xl border bg-white px-3 text-sm font-bold text-slate-900"><option value="light">Claro</option><option value="sepia">Sepia</option><option value="dark">Nocturno</option></select>
        </div>
      </div>

      <div className="min-h-[760px]">
        <LibraryView modules={modules} moduleFilter={moduleFilter} setModuleFilter={setModuleFilter} favoritesOnly={favoritesOnly} setFavoritesOnly={setFavoritesOnly} filtered={filtered} saved={saved} chooseLesson={chooseLesson} toggleFavorite={toggleFavorite} />
        {view === "lesson" ? <div className="healthy-no-print fixed inset-0 z-[80] flex items-center justify-center bg-slate-950/60 p-2 backdrop-blur-sm sm:p-5" role="presentation" onMouseDown={() => setView("library")}>
        <section role="dialog" aria-modal="true" aria-labelledby="healthy-modal-title" onMouseDown={(event) => event.stopPropagation()} className="flex max-h-[94vh] w-full max-w-6xl flex-col overflow-hidden rounded-[1.5rem] bg-[#f8faff] text-slate-950 shadow-2xl">
        <header className="flex shrink-0 items-center justify-between gap-4 border-b border-[#dbe5f5] bg-white px-5 py-4 sm:px-7">
          <div className="flex min-w-0 items-center gap-3"><div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border bg-[#f5f8ff] text-2xl">{lesson.icon}</div><div className="min-w-0"><p className="text-[11px] font-black uppercase tracking-[.15em] text-[#FF7A00]">{index + 1}.0 · {lesson.module}</p><h3 id="healthy-modal-title" className="truncate text-xl font-black text-[#0F2C5C] sm:text-2xl">{lesson.title}</h3><p className="truncate text-sm text-slate-500">{lesson.subtitle}</p></div></div>
          <div className="flex gap-2"><button onClick={() => toggleFavorite(lesson.id)} className="flex h-11 w-11 items-center justify-center rounded-full border bg-white text-xl" aria-label="Favorito">{saved.favorites.includes(lesson.id) ? "♥" : "♡"}</button><button onClick={() => setView("library")} className="flex h-11 w-11 items-center justify-center rounded-full bg-[#0F2C5C] text-xl font-black text-white" aria-label="Cerrar">×</button></div>
        </header>
        <main className="healthy-print-area min-h-0 flex-1 overflow-y-auto p-5 sm:p-7">

          <div className="mt-5 rounded-2xl border border-blue-200 bg-blue-50 p-4 text-sm leading-6 text-blue-950"><b>Adaptación para {saved.level}:</b> {levelGuidance[saved.level]}</div>
          <div className="mt-5 rounded-2xl border border-orange-200 bg-orange-50 p-4 text-sm leading-6 text-orange-950"><b>Alcance educativo:</b> esta guía no diagnostica, prescribe dietas ni sustituye a profesionales de nutrición, medicina o psicología.</div>

          <ConceptVisual lesson={lesson} />

          <div className="mt-6 grid gap-5 xl:grid-cols-2">
            <Card title="Propósito observable"><p>{lesson.purpose}</p></Card>
            <Card title="Ideas clave"><ul className="list-disc space-y-2 pl-5">{lesson.keyPoints.map((point) => <li key={point}>{point}</li>)}</ul></Card>
            <Card title="Actividad cooperativa"><p>{lesson.activity}</p><p className="mt-3 text-sm"><b>Evidencia:</b> {lesson.evidence}</p></Card>
            <Card title="Seguridad y protección"><p>{lesson.safety}</p></Card>
          </div>

          <LearningLab lesson={lesson} selected={labSelected} checked={labChecked} onToggle={(point) => { setLabSelected((current) => current.includes(point) ? current.filter((item) => item !== point) : current.length < 3 ? [...current, point] : current); setLabChecked(false); }} onCheck={() => setLabChecked(true)} />

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
        </section>
        </div> : null}
      </div>
      {!ready ? <p className="healthy-no-print border-t bg-white p-3 text-center text-xs text-slate-500">Preparando progreso local…</p> : null}
    </section>
  );
}

function ConceptVisual({ lesson }: { lesson: HealthyLesson }) {
  if (lesson.id === "plato-flexible") return <section className="mt-6 rounded-2xl border border-[#dbe5f5] bg-white p-5 shadow-sm"><p className="text-xs font-black uppercase tracking-[.15em] text-[#0F2C5C]">Contenido visual · Plato flexible</p><div className="mt-5 grid gap-6 md:grid-cols-[280px_1fr] md:items-center"><div className="mx-auto grid aspect-square w-full max-w-[280px] grid-cols-2 grid-rows-2 overflow-hidden rounded-full border-[10px] border-white shadow-[0_0_0_2px_#dbe5f5]"><div className="col-span-2 flex items-center justify-center bg-gradient-to-r from-green-200 to-lime-200 p-4 text-center text-sm font-black text-green-950">½ FRUTAS Y VERDURAS<br/>🥦 🍅 🍊</div><div className="flex items-center justify-center bg-orange-100 p-3 text-center text-xs font-black text-orange-950">¼ PROTEÍNAS<br/>🫘 🥚 🐟</div><div className="flex items-center justify-center bg-blue-100 p-3 text-center text-xs font-black text-blue-950">¼ CEREALES Y TUBÉRCULOS<br/>🌽 🥔 🍚</div></div><div><h4 className="text-2xl font-black text-[#0F2C5C]">Una representación, no una dieta rígida</h4><p className="mt-3 leading-7 text-slate-600">Las proporciones ayudan a conversar sobre variedad. Deben adaptarse a la edad, cultura, disponibilidad, apetito y orientación profesional cuando corresponda.</p><div className="mt-4 rounded-xl bg-blue-50 p-4 font-bold text-blue-950">💧 Agua como bebida habitual · alimentos locales y preparaciones familiares.</div></div></div></section>;
  if (lesson.id === "guias-ecuador") return <section className="mt-6 rounded-2xl border border-[#dbe5f5] bg-white p-5 shadow-sm"><p className="text-xs font-black uppercase tracking-[.15em] text-[#0F2C5C]">Contenido visual · Guía alimentaria flexible</p><div className="mx-auto mt-5 flex max-w-2xl flex-col items-center gap-2 text-center text-xs font-black"><div className="w-[38%] rounded-xl border border-orange-200 bg-orange-50 p-3">OCASIONAL<br/>Productos con alto contenido de azúcar, sal o grasa</div><div className="w-[56%] rounded-xl border border-amber-200 bg-amber-50 p-3">VARIEDAD EN PORCIONES CONTEXTUALIZADAS<br/>Proteínas, lácteos o alternativas</div><div className="w-[72%] rounded-xl border border-green-200 bg-green-50 p-3">CON FRECUENCIA<br/>Frutas, verduras, cereales, tubérculos y legumbres locales</div><div className="w-[90%] rounded-xl border border-blue-200 bg-blue-50 p-3">BASE DEL BIENESTAR<br/>Agua segura · movimiento · descanso · convivencia</div></div><p className="mt-4 text-center text-sm text-slate-600">Es un organizador pedagógico, no una prescripción universal ni una clasificación moral de los alimentos.</p></section>;
  if (lesson.id === "hidratacion-escolar" || lesson.id === "calor-movimiento" || lesson.id === "bebidas") return <section className="mt-6 overflow-hidden rounded-2xl border border-blue-200 bg-white shadow-sm"><div className="bg-gradient-to-r from-sky-600 to-blue-500 p-5 text-white"><p className="text-xs font-black uppercase tracking-[.15em]">Contenido visual · Hidratación escolar</p><h4 className="mt-1 text-2xl font-black">Acceso al agua según el contexto</h4></div><div className="grid gap-3 p-5 sm:grid-cols-3"><VisualStep icon="💧" title="Antes">Llegar con acceso a agua segura y botella identificada si está permitida.</VisualStep><VisualStep icon="🏃" title="Durante">Ofrecer pausas, sombra y oportunidades regulares sin imponer una cantidad universal.</VisualStep><VisualStep icon="🌤️" title="Después">Recuperar con agua, descanso y observación del bienestar.</VisualStep></div></section>;
  if (lesson.id === "semaforo" || lesson.id === "ingredientes") return <section className="mt-6 rounded-2xl border border-[#dbe5f5] bg-white p-5 shadow-sm"><p className="text-xs font-black uppercase tracking-[.15em] text-[#0F2C5C]">Contenido visual · Lectura de etiqueta</p><div className="mt-5 grid gap-4 md:grid-cols-[220px_1fr]"><div className="rounded-2xl border-4 border-slate-900 bg-white p-4"><p className="text-center text-xs font-black">CONTENIDO POR PRODUCTO</p><div className="mt-3 space-y-2"><div className="rounded-lg bg-red-500 p-3 text-center font-black text-white">ALTO EN AZÚCAR</div><div className="rounded-lg bg-yellow-400 p-3 text-center font-black text-slate-950">MEDIO EN GRASA</div><div className="rounded-lg bg-green-500 p-3 text-center font-black text-white">BAJO EN SAL</div></div></div><div className="grid gap-3"><VisualStep icon="1️⃣" title="Compara productos semejantes">El color informa sobre nutrientes específicos.</VisualStep><VisualStep icon="2️⃣" title="Revisa la porción">El semáforo no describe por sí solo toda la alimentación.</VisualStep><VisualStep icon="3️⃣" title="Lee ingredientes">Decide con información, contexto y frecuencia.</VisualStep></div></div></section>;
  return <section className="mt-6 overflow-hidden rounded-2xl border border-[#dbe5f5] bg-white shadow-sm"><div className="grid gap-5 p-5 md:grid-cols-[180px_1fr] md:items-center"><div className="flex aspect-square items-center justify-center rounded-[2rem] bg-gradient-to-br from-[#eef2ff] to-orange-50 text-7xl shadow-inner">{lesson.icon}</div><div><p className="text-xs font-black uppercase tracking-[.15em] text-[#FF7A00]">Infografía de la lección</p><h4 className="mt-2 text-2xl font-black text-[#0F2C5C]">{lesson.title}</h4><div className="mt-4 grid gap-2">{lesson.keyPoints.map((point, index) => <p key={point} className="rounded-xl border border-[#dbe5f5] bg-[#f8faff] p-3 font-bold"><span className="mr-2 text-[#FF7A00]">{index + 1}.</span>{point}</p>)}</div></div></div></section>;
}

function VisualStep({ icon, title, children }: { icon: string; title: string; children: React.ReactNode }) { return <div className="rounded-xl border border-[#dbe5f5] bg-[#f8faff] p-4"><span className="text-2xl" aria-hidden>{icon}</span><h5 className="mt-2 font-black text-[#0F2C5C]">{title}</h5><p className="mt-2 text-sm leading-6 text-slate-600">{children}</p></div>; }

/* eslint-disable @typescript-eslint/no-unused-vars -- el índice conserva la numeración visual después de filtrar */
function LibraryView({ modules, moduleFilter, setModuleFilter, favoritesOnly, setFavoritesOnly, filtered, saved, chooseLesson, toggleFavorite }: { modules: string[]; moduleFilter: string; setModuleFilter: (value: string) => void; favoritesOnly: boolean; setFavoritesOnly: (value: boolean) => void; filtered: HealthyLesson[]; saved: SavedState; chooseLesson: (id: string) => void; toggleFavorite: (id: string) => void }) {
  const moduleStyle: Record<string, string> = {
    "Fundamentos": "from-emerald-600 to-lime-500",
    "Hidratación y movimiento": "from-sky-600 to-blue-500",
    "Entorno escolar": "from-orange-500 to-amber-400",
    "Etiquetas y pensamiento crítico": "from-violet-600 to-fuchsia-500",
    "Bienestar y convivencia": "from-pink-600 to-rose-500",
    "Práctica docente": "from-[#0F2C5C] to-blue-600",
  };
  return <div className="healthy-no-print bg-[#f5f8ff] p-5 text-slate-950 sm:p-7">
    <section className="grid gap-5 lg:grid-cols-[1.3fr_.7fr]">
      <div className="relative overflow-hidden rounded-[1.5rem] border border-[#dbe5f5] bg-white p-6 shadow-sm"><div className="absolute -right-12 -top-16 h-44 w-44 rounded-full bg-orange-100" aria-hidden /><p className="relative text-xs font-black uppercase tracking-[.18em] text-[#FF7A00]">Biblioteca interactiva</p><h3 className="relative mt-2 text-3xl font-black text-[#0F2C5C]">Explora las 30 experiencias</h3><p className="relative mt-3 max-w-2xl leading-7 text-slate-600">Selecciona una lección, realiza su laboratorio visual, adapta la ficha a tu nivel y comprueba el aprendizaje.</p><div className="relative mt-5 flex flex-wrap gap-2">{modules.map((module) => <button key={module} onClick={() => setModuleFilter(module)} className={`rounded-full border px-3 py-2 text-xs font-black ${moduleFilter === module ? "border-[#0F2C5C] bg-[#0F2C5C] text-white" : "bg-white text-[#0F2C5C]"}`}>{module}</button>)}</div></div>
      <div className="rounded-[1.5rem] bg-gradient-to-br from-[#0F2C5C] to-[#174b87] p-6 text-white shadow-sm"><p className="text-xs font-black uppercase tracking-[.16em] text-orange-300">Tu progreso local</p><div className="mt-3 flex items-end gap-2"><span className="text-5xl font-black">{saved.completed.length}</span><span className="pb-1 text-blue-200">de 30 completadas</span></div><div className="mt-5 h-3 overflow-hidden rounded-full bg-white/15"><div className="h-full rounded-full bg-[#FF7A00]" style={{ width: `${saved.completed.length / 30 * 100}%` }} /></div><button onClick={() => setFavoritesOnly(!favoritesOnly)} className="mt-5 rounded-xl border border-white/20 bg-white/10 px-4 py-2.5 text-sm font-black">★ {favoritesOnly ? "Ver todas" : `Mis favoritas (${saved.favorites.length})`}</button></div>
    </section>
    <div className="mt-6 flex flex-wrap items-center justify-between gap-3"><div><p className="text-xs font-black uppercase tracking-[.16em] text-[#FF7A00]">{moduleFilter}</p><h3 className="mt-1 text-2xl font-black text-[#0F2C5C]">{filtered.length} lecciones disponibles</h3></div>{favoritesOnly ? <span className="rounded-full bg-amber-100 px-4 py-2 text-sm font-black text-amber-900">★ Solo favoritas</span> : null}</div>
    {filtered.length ? <div className="mt-5 grid gap-5 sm:grid-cols-2 xl:grid-cols-3">{filtered.map((item, lessonIndex) => <article key={item.id} className="group overflow-hidden rounded-2xl border border-[#dbe5f5] bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-xl"><div className={`bg-gradient-to-r ${moduleStyle[item.module] || "from-emerald-600 to-lime-500"} p-4 text-white`}><div className="flex items-start justify-between gap-3"><span className="flex h-12 w-12 items-center justify-center rounded-xl bg-white/20 text-2xl">{item.icon}</span><span className="rounded-full bg-white/20 px-2.5 py-1 text-[10px] font-black">{saved.completed.includes(item.id) ? "✓ COMPLETADA" : `LECCIÓN ${healthyLessons.findIndex((lesson) => lesson.id === item.id) + 1}`}</span></div><p className="mt-4 text-[10px] font-black uppercase tracking-[.14em]">{item.module}</p></div><div className="p-5"><h4 className="text-xl font-black text-[#0F2C5C]">{item.title}</h4><p className="mt-2 min-h-12 text-sm leading-6 text-slate-600">{item.subtitle}</p><div className="mt-5 flex gap-2"><button onClick={() => chooseLesson(item.id)} className="flex-1 rounded-xl bg-[#0F2C5C] px-4 py-3 text-sm font-black text-white transition group-hover:bg-[#FF7A00]">Abrir experiencia →</button><button onClick={() => toggleFavorite(item.id)} className={`rounded-xl border px-3 text-lg ${saved.favorites.includes(item.id) ? "bg-amber-100" : "bg-white"}`} aria-label={saved.favorites.includes(item.id) ? "Quitar de favoritos" : "Añadir a favoritos"}>★</button></div></div></article>)}</div> : <div className="mt-5 rounded-2xl border border-dashed border-slate-300 bg-white p-10 text-center"><p className="text-3xl">🔎</p><p className="mt-3 font-black">No hay lecciones que coincidan con estos filtros.</p></div>}
  </div>;
}
/* eslint-enable @typescript-eslint/no-unused-vars */

function Card({ title, children }: { title: string; children: React.ReactNode }) { return <section className="rounded-2xl border border-[#dbe5f5] bg-white p-5 leading-7 text-slate-950 shadow-sm"><h4 className="border-l-4 border-[#FF7A00] pl-3 text-lg font-black text-[#0F2C5C]">{title}</h4><div className="mt-3">{children}</div></section>; }
function Dua({ color, title, children }: { color: "violet" | "blue" | "green"; title: string; children: React.ReactNode }) { const classes = { violet: "border-violet-300 bg-violet-50", blue: "border-blue-300 bg-blue-50", green: "border-green-300 bg-green-50" }; return <div className={`rounded-xl border-l-4 p-4 ${classes[color]}`}><b>{title}</b><p className="mt-2 text-sm leading-6">{children}</p></div>; }

function LearningLab({ lesson, selected, checked, onToggle, onCheck }: { lesson: HealthyLesson; selected: string[]; checked: boolean; onToggle: (point: string) => void; onCheck: () => void }) {
  const distractor = "Aplicar la misma regla a todas las personas sin considerar su contexto.";
  const options = [...lesson.keyPoints, distractor];
  const correct = selected.length === 3 && lesson.keyPoints.every((point) => selected.includes(point));
  return <section className="healthy-no-print mt-6 overflow-hidden rounded-2xl border border-orange-200 bg-white text-slate-950 shadow-sm">
    <div className="bg-gradient-to-r from-[#FF7A00] to-amber-400 p-5 text-[#0F2C5C]"><p className="text-xs font-black uppercase tracking-[.18em]">Actividad interactiva</p><h4 className="mt-1 text-xl font-black">Laboratorio visual · construye el mensaje clave</h4><p className="mt-1 text-sm font-semibold">Selecciona las tres ideas que conservarían el propósito educativo de esta lección.</p></div>
    <div className="p-5"><div className="grid gap-3 sm:grid-cols-2">{options.map((point, optionIndex) => <button key={point} onClick={() => onToggle(point)} aria-pressed={selected.includes(point)} className={`rounded-xl border-2 p-4 text-left font-bold transition ${selected.includes(point) ? "border-[#0F2C5C] bg-[#eef2ff] text-[#0F2C5C]" : "border-slate-200 bg-white hover:border-orange-300"}`}><span className="mr-2 text-lg" aria-hidden>{["🥕","💧","🧠","⚠️"][optionIndex]}</span>{point}</button>)}</div><div className="mt-4 flex flex-wrap items-center gap-3"><button onClick={onCheck} className="rounded-xl bg-[#0F2C5C] px-5 py-3 font-black text-white">Comprobar selección</button><span className="text-sm font-bold text-slate-500">{selected.length}/3 seleccionadas</span></div>{checked ? <p role="status" className={`mt-3 rounded-xl border p-3 font-bold ${correct ? "border-emerald-200 bg-emerald-50 text-emerald-800" : "border-orange-200 bg-orange-50 text-orange-900"}`}>{correct ? "¡Excelente! El mensaje conserva variedad, contexto y seguridad." : "Revisa las ideas clave: evita reglas universales y conserva las tres afirmaciones contextualizadas."}</p> : null}</div>
  </section>;
}

function buildQuiz(lesson: HealthyLesson) {
  return [
    { prompt: "¿Cuál afirmación corresponde a esta lección?", options: [lesson.keyPoints[0], "Existe una regla idéntica para todas las personas.", "El docente debe diagnosticar las necesidades individuales."] },
    { prompt: "¿Qué decisión protege mejor al grupo?", options: [lesson.safety, "Pedir datos personales y compararlos públicamente.", "Usar la actividad sin revisar el contexto ni ofrecer alternativas."] },
    { prompt: "¿Qué evidencia permite evaluar el aprendizaje?", options: [lesson.evidence, "El peso o la apariencia corporal.", "La comida que la familia pudo comprar esa semana."] },
  ];
}
