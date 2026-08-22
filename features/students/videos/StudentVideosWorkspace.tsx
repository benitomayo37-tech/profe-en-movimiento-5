"use client";

import { useMemo, useState, type MouseEvent } from "react";

type VideoPurpose = "demostracion" | "competencia" | "historia" | "reglamento";
type SportKey = "general" | "atletismo" | "baloncesto" | "futbol" | "voleibol" | "gimnasia" | "natacion";

const sports: Array<{ value: SportKey; label: string; icon: string }> = [
  { value: "general", label: "Todos", icon: "🏆" },
  { value: "atletismo", label: "Atletismo", icon: "🏃" },
  { value: "baloncesto", label: "Baloncesto", icon: "🏀" },
  { value: "futbol", label: "Fútbol", icon: "⚽" },
  { value: "voleibol", label: "Voleibol", icon: "🏐" },
  { value: "gimnasia", label: "Gimnasia", icon: "🤸" },
  { value: "natacion", label: "Natación", icon: "🏊" },
];

const purposes: Array<{ value: VideoPurpose; label: string; description: string }> = [
  { value: "demostracion", label: "Técnica o demostración", description: "Observa cómo se ejecuta un gesto deportivo." },
  { value: "competencia", label: "Competencia memorable", description: "Revive una carrera, partido o final histórica." },
  { value: "historia", label: "Historia y protagonistas", description: "Conoce un evento, atleta o selección." },
  { value: "reglamento", label: "Reglas explicadas", description: "Comprende una regla o situación de juego." },
];

const missions: Array<{ title: string; subtitle: string; query: string; sport: SportKey; purpose: VideoPurpose; icon: string; color: string }> = [
  { title: "Usain Bolt y los 9,58 segundos", subtitle: "Observa la carrera del récord mundial de 100 metros.", query: "Usain Bolt 9.58 récord mundial 100 metros World Athletics", sport: "atletismo", purpose: "competencia", icon: "⚡", color: "from-amber-400 to-orange-500" },
  { title: "Técnica del tiro libre", subtitle: "Analiza postura, agarre, extensión y seguimiento.", query: "técnica del tiro libre baloncesto fundamentos FIBA español", sport: "baloncesto", purpose: "demostracion", icon: "🏀", color: "from-orange-500 to-red-500" },
  { title: "Saque de voleibol", subtitle: "Descubre sus fases y puntos técnicos principales.", query: "técnica saque de voleibol fundamentos español", sport: "voleibol", purpose: "demostracion", icon: "🏐", color: "from-cyan-400 to-blue-600" },
  { title: "Fuera de juego en fútbol", subtitle: "Comprende la regla mediante situaciones reales.", query: "regla fuera de juego fútbol explicación FIFA español", sport: "futbol", purpose: "reglamento", icon: "⚽", color: "from-emerald-400 to-green-600" },
  { title: "Estilo libre en natación", subtitle: "Observa respiración, brazada y patada.", query: "técnica estilo libre natación explicación educativa español", sport: "natacion", purpose: "demostracion", icon: "🏊", color: "from-sky-400 to-cyan-600" },
  { title: "Gimnasia: rodamiento adelante", subtitle: "Reconoce la secuencia técnica y las medidas de seguridad.", query: "rodamiento adelante gimnasia técnica seguridad educación física", sport: "gimnasia", purpose: "demostracion", icon: "🤸", color: "from-violet-500 to-fuchsia-500" },
];

const officialChannels = [
  { name: "Olympics", url: "https://www.youtube.com/@Olympics", label: "Juegos Olímpicos" },
  { name: "World Athletics", url: "https://www.youtube.com/@WorldAthletics", label: "Atletismo mundial" },
  { name: "FIBA", url: "https://www.youtube.com/@FIBA", label: "Baloncesto internacional" },
  { name: "FIFA", url: "https://www.youtube.com/@FIFA", label: "Fútbol internacional" },
];

function buildYouTubeSearch(query: string, sport: SportKey, purpose: VideoPurpose) {
  const sportLabel = sports.find((item) => item.value === sport)?.label || "deporte";
  const purposeLabel = purposes.find((item) => item.value === purpose)?.label || "video educativo";
  const terms = [query.trim(), sport === "general" ? "deporte" : sportLabel, purposeLabel, "educativo", "español"];
  return `https://www.youtube.com/results?search_query=${encodeURIComponent(terms.join(" "))}`;
}

export default function StudentVideosWorkspace() {
  const [query, setQuery] = useState("");
  const [sport, setSport] = useState<SportKey>("general");
  const [purpose, setPurpose] = useState<VideoPurpose>("demostracion");
  const [error, setError] = useState("");
  const searchUrl = useMemo(() => buildYouTubeSearch(query, sport, purpose), [query, sport, purpose]);

  function selectMission(mission: (typeof missions)[number]) {
    setQuery(mission.query);
    setSport(mission.sport);
    setPurpose(mission.purpose);
    setError("");
    document.getElementById("video-search")?.scrollIntoView({ behavior: "smooth", block: "center" });
  }

  function validateSearch(event: MouseEvent<HTMLAnchorElement>) {
    if (query.trim().length >= 3) return;
    event.preventDefault();
    setError("Escribe el tema del video que deseas observar.");
  }

  return (
    <div className="space-y-8">
      <section id="video-search" className="rounded-[2rem] border border-red-100 bg-white p-5 shadow-xl sm:p-8">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div><p className="text-xs font-black uppercase tracking-[0.2em] text-red-600">Búsqueda guiada</p><h3 className="mt-2 text-3xl font-black text-slate-950">¿Qué deseas observar?</h3><p className="mt-2 max-w-3xl text-slate-600">Escribe una técnica, competencia, atleta, evento o regla. Prepararemos una búsqueda precisa en YouTube.</p></div>
          <div className="rounded-2xl bg-gradient-to-br from-red-50 to-amber-50 px-5 py-3 text-center ring-1 ring-orange-200"><p className="text-[11px] font-black uppercase tracking-wider text-red-800">Acceso gratuito</p><p className="mt-1 text-2xl font-black text-red-900">Sin límite</p></div>
        </div>

        <div className="mt-8 grid gap-6 lg:grid-cols-2">
          <div className="lg:col-span-2"><label htmlFor="video-topic" className="text-sm font-black text-slate-900">Tema del video</label><textarea id="video-topic" value={query} onChange={(event) => { setQuery(event.target.value); setError(""); }} placeholder="Ejemplo: carrera de 100 metros donde Usain Bolt estableció el récord mundial" className="mt-3 min-h-28 w-full rounded-2xl border border-slate-300 px-5 py-4 text-base outline-none transition focus:border-red-500 focus:ring-4 focus:ring-red-100" /></div>
          <div><p className="text-sm font-black text-slate-900">Deporte</p><div className="mt-3 flex flex-wrap gap-2">{sports.map((item) => <button key={item.value} type="button" onClick={() => setSport(item.value)} className={`rounded-full px-4 py-2.5 text-sm font-black transition ${sport === item.value ? "bg-slate-950 text-white shadow-lg" : "bg-slate-100 text-slate-700 hover:bg-slate-200"}`}>{item.icon} {item.label}</button>)}</div></div>
          <div><label htmlFor="video-purpose" className="text-sm font-black text-slate-900">¿Para qué deseas verlo?</label><select id="video-purpose" value={purpose} onChange={(event) => setPurpose(event.target.value as VideoPurpose)} className="mt-3 w-full rounded-2xl border border-slate-300 bg-white px-5 py-4 font-bold text-slate-800 outline-none focus:border-red-500 focus:ring-4 focus:ring-red-100">{purposes.map((item) => <option key={item.value} value={item.value}>{item.label}</option>)}</select><p className="mt-2 text-sm text-slate-500">{purposes.find((item) => item.value === purpose)?.description}</p></div>
        </div>

        {error && <p role="alert" className="mt-5 rounded-2xl border border-red-200 bg-red-50 p-4 font-bold text-red-800">{error}</p>}
        <div className="mt-6 flex flex-wrap items-center gap-4"><a href={searchUrl} target="_blank" rel="noopener noreferrer" onClick={validateSearch} className="rounded-2xl bg-gradient-to-r from-red-600 to-orange-500 px-7 py-4 text-lg font-black text-white shadow-lg transition hover:-translate-y-0.5">Buscar videos en YouTube ↗</a><p className="max-w-xl text-sm leading-6 text-slate-500">YouTube se abrirá en una pestaña nueva. Revisa primero los resultados de canales oficiales o instituciones deportivas.</p></div>
      </section>

      <section><div className="mb-5"><p className="text-xs font-black uppercase tracking-[0.2em] text-violet-600">Misiones rápidas</p><h3 className="mt-2 text-3xl font-black text-slate-950">Explora temas recomendados</h3></div><div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">{missions.map((mission) => <button key={mission.title} type="button" onClick={() => selectMission(mission)} className="group rounded-3xl border border-slate-200 bg-white p-5 text-left shadow-md transition hover:-translate-y-1 hover:shadow-xl"><span className={`grid h-14 w-14 place-items-center rounded-2xl bg-gradient-to-br text-3xl text-white ${mission.color}`}>{mission.icon}</span><span className="mt-4 block text-xl font-black text-slate-950 group-hover:text-red-700">{mission.title}</span><span className="mt-2 block text-sm leading-6 text-slate-600">{mission.subtitle}</span><span className="mt-4 inline-block text-sm font-black text-red-600">Preparar búsqueda →</span></button>)}</div></section>

      <section className="grid gap-6 rounded-[2rem] bg-slate-950 p-6 text-white sm:p-8 lg:grid-cols-[1fr_1.2fr]">
        <div><p className="text-xs font-black uppercase tracking-[0.2em] text-cyan-300">Navegación responsable</p><h3 className="mt-2 text-3xl font-black">Antes de reproducir</h3><ul className="mt-5 space-y-3 text-sm leading-6 text-slate-200"><li>✓ Prefiere canales oficiales y educativos.</li><li>✓ No compartas tu nombre, institución ni datos personales en comentarios.</li><li>✓ Si aparece contenido inadecuado, ciérralo y comunícalo a un adulto.</li><li>✓ Observa el video con un propósito: técnica, regla, historia o competencia.</li></ul></div>
        <div><p className="text-sm font-black text-white">Canales deportivos oficiales</p><div className="mt-4 grid gap-3 sm:grid-cols-2">{officialChannels.map((channel) => <a key={channel.name} href={channel.url} target="_blank" rel="noopener noreferrer" className="rounded-2xl bg-white/10 p-4 transition hover:bg-white/20"><span className="block font-black">▶ {channel.name}</span><span className="mt-1 block text-xs text-slate-300">{channel.label}</span></a>)}</div></div>
      </section>
    </div>
  );
}
