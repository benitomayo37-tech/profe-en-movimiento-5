"use client";

import { useEffect, useReducer, useState } from "react";

type TimerPhase = "ready" | "work" | "rest" | "complete";

interface TimerState {
  phase: TimerPhase;
  round: number;
  secondsLeft: number;
  isRunning: boolean;
}

interface TimerConfig {
  workSeconds: number;
  restSeconds: number;
  rounds: number;
}

type TimerAction =
  | { type: "start"; config: TimerConfig }
  | { type: "tick"; config: TimerConfig }
  | { type: "toggle" }
  | { type: "reset" };

const initialTimerState: TimerState = {
  phase: "ready",
  round: 1,
  secondsLeft: 0,
  isRunning: false,
};

function timerReducer(state: TimerState, action: TimerAction): TimerState {
  if (action.type === "reset") return initialTimerState;
  if (action.type === "toggle") return state.phase === "ready" || state.phase === "complete" ? state : { ...state, isRunning: !state.isRunning };
  if (action.type === "start") return { phase: "work", round: 1, secondsLeft: action.config.workSeconds, isRunning: true };
  if (!state.isRunning) return state;
  if (state.secondsLeft > 1) return { ...state, secondsLeft: state.secondsLeft - 1 };

  if (state.phase === "work") {
    if (state.round >= action.config.rounds) {
      return { phase: "complete", round: state.round, secondsLeft: 0, isRunning: false };
    }
    return { phase: "rest", round: state.round, secondsLeft: action.config.restSeconds, isRunning: true };
  }

  return { phase: "work", round: state.round + 1, secondsLeft: action.config.workSeconds, isRunning: true };
}

const phaseLabels: Record<TimerPhase, string> = {
  ready: "Listo para comenzar",
  work: "Trabajo",
  rest: "Descanso",
  complete: "Circuito completado",
};

export default function HiitTimerApp() {
  const [workSeconds, setWorkSeconds] = useState(30);
  const [restSeconds, setRestSeconds] = useState(15);
  const [rounds, setRounds] = useState(8);
  const [timer, dispatch] = useReducer(timerReducer, initialTimerState);
  const config = { workSeconds, restSeconds, rounds };

  useEffect(() => {
    if (!timer.isRunning) return;

    const intervalId = window.setInterval(() => {
      dispatch({
        type: "tick",
        config: { workSeconds, restSeconds, rounds },
      });
    }, 1000);

    return () => window.clearInterval(intervalId);
  }, [timer.isRunning, workSeconds, restSeconds, rounds]);

  const progressTotal = timer.phase === "work" ? workSeconds : restSeconds;
  const progress = timer.phase === "ready" || timer.phase === "complete" ? 0 : Math.max(0, Math.min(100, ((progressTotal - timer.secondsLeft) / progressTotal) * 100));
  const isConfiguredSession = timer.phase !== "ready" && timer.phase !== "complete";

  return (
    <section className="overflow-hidden rounded-[2rem] border border-slate-200 bg-white shadow-2xl" aria-labelledby="hiit-title">
      <div className={`p-7 text-center text-white transition-colors sm:p-10 ${timer.phase === "work" ? "bg-red-600" : timer.phase === "rest" ? "bg-emerald-600" : timer.phase === "complete" ? "bg-blue-700" : "bg-slate-950"}`}>
        <p className="text-sm font-black uppercase tracking-[0.2em] text-white/80">{phaseLabels[timer.phase]}</p>
        <h2 id="hiit-title" className="mt-5 text-8xl font-black tabular-nums sm:text-9xl">{timer.phase === "ready" ? workSeconds : timer.secondsLeft}</h2>
        <p className="mt-4 text-lg font-black">Ronda {Math.min(timer.round, rounds)} de {rounds}</p>
        <div className="mx-auto mt-6 h-3 max-w-2xl overflow-hidden rounded-full bg-white/20">
          <div className="h-full rounded-full bg-white transition-all duration-500" style={{ width: `${progress}%` }} />
        </div>
      </div>

      <div className="p-6 sm:p-8">
        <div className="grid gap-4 sm:grid-cols-3">
          {[
            { label: "Trabajo (seg)", value: workSeconds, setter: setWorkSeconds, min: 5, max: 600 },
            { label: "Descanso (seg)", value: restSeconds, setter: setRestSeconds, min: 5, max: 300 },
            { label: "Rondas", value: rounds, setter: setRounds, min: 1, max: 50 },
          ].map((field) => (
            <label key={field.label} className="block text-sm font-black text-slate-700">
              {field.label}
              <input
                type="number"
                min={field.min}
                max={field.max}
                value={field.value}
                disabled={isConfiguredSession}
                onChange={(event) => field.setter(Math.min(field.max, Math.max(field.min, Number(event.target.value) || field.min)))}
                className="mt-2 min-h-12 w-full rounded-xl border border-slate-300 bg-white px-4 text-lg font-black text-slate-950 outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100 disabled:bg-slate-100 disabled:text-slate-500"
              />
            </label>
          ))}
        </div>

        <div className="mt-7 flex flex-wrap justify-center gap-3">
          {timer.phase === "ready" || timer.phase === "complete" ? (
            <button type="button" onClick={() => dispatch({ type: "start", config })} className="min-h-12 rounded-xl bg-red-600 px-7 py-3 font-black text-white transition hover:bg-red-700">▶ Iniciar circuito</button>
          ) : (
            <button type="button" onClick={() => dispatch({ type: "toggle" })} className={`min-h-12 rounded-xl px-7 py-3 font-black text-white transition ${timer.isRunning ? "bg-orange-500 hover:bg-orange-600" : "bg-emerald-600 hover:bg-emerald-700"}`}>
              {timer.isRunning ? "Pausar" : "Continuar"}
            </button>
          )}
          <button type="button" onClick={() => dispatch({ type: "reset" })} className="min-h-12 rounded-xl border border-slate-300 bg-white px-7 py-3 font-black text-slate-700 transition hover:bg-slate-50">Reiniciar</button>
        </div>
      </div>
    </section>
  );
}
