"use client";

import { useMemo, useState } from "react";

function shuffleItems(items: string[]) {
  const shuffled = [...items];

  for (let index = shuffled.length - 1; index > 0; index -= 1) {
    const randomIndex = Math.floor(Math.random() * (index + 1));
    [shuffled[index], shuffled[randomIndex]] = [shuffled[randomIndex], shuffled[index]];
  }

  return shuffled;
}

export default function TeamGeneratorApp() {
  const [namesInput, setNamesInput] = useState("");
  const [teamCount, setTeamCount] = useState(2);
  const [teams, setTeams] = useState<string[][]>([]);
  const [message, setMessage] = useState("");

  const participants = useMemo(() => {
    const uniqueNames = new Map<string, string>();

    namesInput
      .split(/[\n,;]+/)
      .map((name) => name.trim())
      .filter(Boolean)
      .forEach((name) => uniqueNames.set(name.toLocaleLowerCase("es"), name));

    return Array.from(uniqueNames.values());
  }, [namesInput]);

  function generateTeams() {
    if (participants.length < 2) {
      setMessage("Añade al menos dos participantes.");
      return;
    }

    const safeTeamCount = Math.min(teamCount, participants.length);
    const nextTeams = Array.from({ length: safeTeamCount }, () => [] as string[]);

    shuffleItems(participants).forEach((participant, index) => {
      nextTeams[index % safeTeamCount].push(participant);
    });

    setTeams(nextTeams);
    setMessage(`${participants.length} participantes distribuidos en ${safeTeamCount} equipos.`);
  }

  async function copyTeams() {
    const text = teams
      .map((team, index) => `Equipo ${index + 1}\n${team.map((name) => `- ${name}`).join("\n")}`)
      .join("\n\n");

    try {
      await navigator.clipboard.writeText(text);
      setMessage("Equipos copiados al portapapeles.");
    } catch {
      setMessage("No fue posible copiar automáticamente.");
    }
  }

  function reset() {
    setNamesInput("");
    setTeamCount(2);
    setTeams([]);
    setMessage("");
  }

  return (
    <section className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-xl sm:p-8" aria-labelledby="team-generator-title">
      <p className="text-xs font-black uppercase tracking-[0.16em] text-blue-700">Configuración</p>
      <h2 id="team-generator-title" className="mt-2 text-2xl font-black text-slate-950">Prepara el sorteo</h2>

      <div className="mt-6 grid gap-6 lg:grid-cols-[minmax(0,1fr)_220px]">
        <label className="block">
          <span className="text-sm font-black text-slate-700">Participantes</span>
          <textarea
            value={namesInput}
            onChange={(event) => setNamesInput(event.target.value)}
            placeholder="Un nombre por línea o separados por comas"
            rows={10}
            className="mt-2 w-full rounded-2xl border border-slate-300 bg-slate-50 p-4 text-sm leading-7 text-slate-950 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-100"
          />
          <span className="mt-2 block text-xs font-semibold text-slate-500">{participants.length} participantes únicos detectados</span>
        </label>

        <div className="space-y-5">
          <label className="block">
            <span className="text-sm font-black text-slate-700">Número de equipos</span>
            <input
              type="number"
              min={2}
              max={10}
              value={teamCount}
              onChange={(event) => setTeamCount(Math.min(10, Math.max(2, Number(event.target.value) || 2)))}
              className="mt-2 min-h-12 w-full rounded-xl border border-slate-300 bg-white px-4 font-black text-slate-950 outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
            />
          </label>
          <button type="button" onClick={generateTeams} className="flex min-h-12 w-full items-center justify-center rounded-xl bg-blue-700 px-5 py-3 font-black text-white transition hover:bg-blue-800 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-blue-100">
            🔀 Sortear equipos
          </button>
          <button type="button" onClick={reset} className="flex min-h-12 w-full items-center justify-center rounded-xl border border-slate-300 bg-white px-5 py-3 font-bold text-slate-600 transition hover:bg-slate-50">
            Limpiar
          </button>
        </div>
      </div>

      <p aria-live="polite" className="mt-5 min-h-6 text-sm font-bold text-blue-700">{message}</p>

      {teams.length > 0 ? (
        <div className="mt-6 border-t border-slate-200 pt-6">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <h3 className="text-xl font-black text-slate-950">Resultado del sorteo</h3>
            <button type="button" onClick={copyTeams} className="rounded-xl border border-blue-200 bg-blue-50 px-4 py-2 text-sm font-black text-blue-700 transition hover:bg-blue-100">Copiar equipos</button>
          </div>
          <div className="mt-5 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {teams.map((team, index) => (
              <article key={`team-${index + 1}`} className="overflow-hidden rounded-2xl border border-blue-100 bg-blue-50">
                <h4 className="bg-blue-700 px-5 py-3 font-black text-white">Equipo {index + 1} · {team.length}</h4>
                <ol className="space-y-2 p-5 text-sm font-semibold text-slate-700">
                  {team.map((name) => <li key={name}>{name}</li>)}
                </ol>
              </article>
            ))}
          </div>
        </div>
      ) : null}
    </section>
  );
}
