"use client";

import { useEffect, useState } from "react";

function formatTime(totalSeconds: number) {
  const minutes = Math.floor(totalSeconds / 60).toString().padStart(2, "0");
  const seconds = (totalSeconds % 60).toString().padStart(2, "0");
  return `${minutes}:${seconds}`;
}

export default function SportsScoreboardApp() {
  const [teamA, setTeamA] = useState("Equipo A");
  const [teamB, setTeamB] = useState("Equipo B");
  const [scoreA, setScoreA] = useState(0);
  const [scoreB, setScoreB] = useState(0);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [isRunning, setIsRunning] = useState(false);

  useEffect(() => {
    if (!isRunning) return;

    const intervalId = window.setInterval(() => {
      setElapsedSeconds((current) => current + 1);
    }, 1000);

    return () => window.clearInterval(intervalId);
  }, [isRunning]);

  function resetAll() {
    setScoreA(0);
    setScoreB(0);
    setElapsedSeconds(0);
    setIsRunning(false);
  }

  return (
    <section className="overflow-hidden rounded-[2rem] border border-slate-200 bg-slate-950 text-white shadow-2xl" aria-labelledby="scoreboard-title">
      <div className="border-b border-white/10 bg-slate-900 px-6 py-5 text-center">
        <p className="text-xs font-black uppercase tracking-[0.2em] text-orange-400">Marcador en vivo</p>
        <h2 id="scoreboard-title" className="mt-2 text-5xl font-black tabular-nums sm:text-7xl">{formatTime(elapsedSeconds)}</h2>
        <div className="mt-5 flex flex-wrap justify-center gap-3">
          <button type="button" onClick={() => setIsRunning((current) => !current)} className={`min-h-11 rounded-xl px-6 py-2 font-black transition ${isRunning ? "bg-orange-500 hover:bg-orange-600" : "bg-emerald-500 hover:bg-emerald-600"}`}>
            {isRunning ? "Pausar" : elapsedSeconds > 0 ? "Continuar" : "Iniciar"}
          </button>
          <button type="button" onClick={() => { setElapsedSeconds(0); setIsRunning(false); }} className="min-h-11 rounded-xl border border-white/20 bg-white/10 px-6 py-2 font-black transition hover:bg-white/15">Reiniciar tiempo</button>
        </div>
      </div>

      <div className="grid md:grid-cols-2">
        {[
          { name: teamA, setName: setTeamA, score: scoreA, setScore: setScoreA, color: "from-blue-700 to-blue-500" },
          { name: teamB, setName: setTeamB, score: scoreB, setScore: setScoreB, color: "from-orange-600 to-amber-500" },
        ].map((team, index) => (
          <article key={index} className={`bg-gradient-to-br ${team.color} p-6 text-center sm:p-9`}>
            <label className="block">
              <span className="sr-only">Nombre del equipo {index + 1}</span>
              <input
                type="text"
                value={team.name}
                onChange={(event) => team.setName(event.target.value)}
                className="w-full rounded-xl border border-white/20 bg-white/10 px-4 py-3 text-center text-xl font-black text-white outline-none placeholder:text-white/60 focus:bg-white/15 focus:ring-4 focus:ring-white/15"
              />
            </label>
            <p className="mt-7 text-8xl font-black tabular-nums sm:text-9xl">{team.score}</p>
            <div className="mt-7 flex justify-center gap-3">
              <button type="button" onClick={() => team.setScore((current) => Math.max(0, current - 1))} className="flex h-14 w-16 items-center justify-center rounded-2xl border border-white/20 bg-white/10 text-3xl font-black transition hover:bg-white/20" aria-label={`Restar un punto a ${team.name}`}>−</button>
              <button type="button" onClick={() => team.setScore((current) => current + 1)} className="flex h-14 w-20 items-center justify-center rounded-2xl bg-white text-3xl font-black text-slate-950 shadow-xl transition hover:scale-105" aria-label={`Sumar un punto a ${team.name}`}>＋</button>
            </div>
          </article>
        ))}
      </div>

      <div className="flex justify-center border-t border-white/10 bg-slate-900 px-6 py-5">
        <button type="button" onClick={resetAll} className="rounded-xl border border-white/20 bg-white/10 px-6 py-3 font-black transition hover:bg-white/15">Restablecer marcador completo</button>
      </div>
    </section>
  );
}
