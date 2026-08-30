"use client";

import { useMemo, useState } from "react";

import { gameTopics, gameTypes, getQuestions, getWords, type GameQuestion, type GameTopic, type GameType } from "./data";
import ChessStudentApp from "@/features/students/chess/ChessStudentApp";

type GridCell = { letter: string; word?: string };

function shuffled<T>(items: T[]) {
  const copy = [...items];
  for (let index = copy.length - 1; index > 0; index -= 1) {
    const random = Math.floor(Math.random() * (index + 1));
    [copy[index], copy[random]] = [copy[random], copy[index]];
  }
  return copy;
}

function buildWordGrid(words: string[]) {
  const size = 12;
  const grid: GridCell[][] = Array.from({ length: size }, () => Array.from({ length: size }, () => ({ letter: "" })));
  const directions = [[0, 1], [1, 0], [1, 1], [1, -1]];
  words.forEach((word) => {
    for (let attempt = 0; attempt < 120; attempt += 1) {
      const [rowStep, columnStep] = directions[Math.floor(Math.random() * directions.length)];
      const row = Math.floor(Math.random() * size);
      const column = Math.floor(Math.random() * size);
      const endRow = row + rowStep * (word.length - 1);
      const endColumn = column + columnStep * (word.length - 1);
      if (endRow < 0 || endRow >= size || endColumn < 0 || endColumn >= size) continue;
      const fits = [...word].every((letter, index) => {
        const cell = grid[row + rowStep * index][column + columnStep * index];
        return !cell.letter || cell.letter === letter;
      });
      if (!fits) continue;
      [...word].forEach((letter, index) => {
        grid[row + rowStep * index][column + columnStep * index] = { letter, word };
      });
      break;
    }
  });
  const alphabet = "ABCDEFGHIJKLMNÑOPQRSTUVWXYZ";
  return grid.map((row) => row.map((cell) => cell.letter || alphabet[Math.floor(Math.random() * alphabet.length)]));
}

function pathBetween(start: [number, number], end: [number, number]) {
  const rowDelta = end[0] - start[0];
  const columnDelta = end[1] - start[1];
  const length = Math.max(Math.abs(rowDelta), Math.abs(columnDelta));
  if (length === 0) return [start];
  const valid = rowDelta === 0 || columnDelta === 0 || Math.abs(rowDelta) === Math.abs(columnDelta);
  if (!valid) return [];
  const rowStep = Math.sign(rowDelta);
  const columnStep = Math.sign(columnDelta);
  return Array.from({ length: length + 1 }, (_, index) => [start[0] + rowStep * index, start[1] + columnStep * index] as [number, number]);
}

function shufflePuzzle() {
  const tiles = [1, 2, 3, 4, 5, 6, 7, 8, 0];
  let empty = 8;
  for (let move = 0; move < 90; move += 1) {
    const row = Math.floor(empty / 3);
    const column = empty % 3;
    const options = [empty - 3, empty + 3, column > 0 ? empty - 1 : -1, column < 2 ? empty + 1 : -1]
      .filter((position) => position >= 0 && position < 9 && Math.abs(Math.floor(position / 3) - row) <= 1);
    const next = options[Math.floor(Math.random() * options.length)];
    [tiles[empty], tiles[next]] = [tiles[next], tiles[empty]];
    empty = next;
  }
  return tiles;
}

export default function StudentGamesWorkspace() {
  const [type, setType] = useState<GameType>("quiz");
  const [topic, setTopic] = useState<GameTopic>("mixto");
  const [active, setActive] = useState(false);
  const [sessionKey, setSessionKey] = useState(0);
  const selectedGame = gameTypes.find((game) => game.value === type);
  const selectedGameAvailable = selectedGame?.status !== "coming-soon";

  function startGame() {
    setSessionKey((value) => value + 1);
    setActive(true);
  }

  return (
    <section className="rounded-[2rem] border border-blue-100 bg-white p-5 shadow-xl sm:p-8">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div><p className="text-xs font-black uppercase tracking-[0.2em] text-blue-600">Zona de juego</p><h3 className="mt-2 text-3xl font-black text-slate-950">Elige tu misión</h3><p className="mt-2 text-slate-600">Aprende mientras juegas y supera tu propia puntuación.</p></div>
        <div className="rounded-2xl bg-gradient-to-br from-blue-50 to-cyan-50 px-5 py-3 text-center ring-1 ring-cyan-200"><p className="text-[11px] font-black uppercase tracking-wider text-blue-800">Acceso gratuito</p><p className="mt-1 text-2xl font-black text-blue-900">Partidas ilimitadas</p></div>
      </div>

      {!active ? (
        <div className="mt-8 space-y-7">
          <div><p className="mb-3 text-sm font-black text-slate-900">1. Selecciona un juego</p><div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">{gameTypes.map((game) => <button key={game.value} type="button" onClick={() => setType(game.value)} className={`relative rounded-3xl border p-5 text-left transition hover:-translate-y-1 hover:shadow-lg ${type === game.value ? "border-blue-500 bg-blue-50 ring-2 ring-blue-200" : "border-slate-200 bg-white"}`}>{game.status === "coming-soon" ? <span className="absolute right-4 top-4 rounded-full bg-amber-100 px-3 py-1 text-[10px] font-black uppercase tracking-wide text-amber-800">En preparación</span> : null}<span className={`grid h-14 w-14 place-items-center rounded-2xl bg-gradient-to-br text-3xl text-white ${game.color}`}>{game.icon}</span><span className="mt-4 block text-lg font-black text-slate-950">{game.label}</span><span className="mt-2 block text-sm leading-6 text-slate-600">{game.description}</span></button>)}</div></div>
          {!selectedGame?.hasOwnTopics ? <div><p className="mb-3 text-sm font-black text-slate-900">2. Escoge la temática</p><div className="flex flex-wrap gap-3">{gameTopics.map((item) => <button key={item.value} type="button" onClick={() => setTopic(item.value)} className={`rounded-full px-5 py-3 text-sm font-black transition ${topic === item.value ? "bg-slate-950 text-white shadow-lg" : "bg-slate-100 text-slate-700 hover:bg-slate-200"}`}>{item.icon} {item.label}</button>)}</div></div> : <div className="rounded-2xl border border-cyan-200 bg-cyan-50 p-4 text-sm font-bold text-cyan-950">Este juego ya incluye sus propios niveles y contenidos. Podrás escogerlos al iniciar.</div>}
          {selectedGameAvailable ? <button type="button" onClick={startGame} className="rounded-2xl bg-gradient-to-r from-orange-500 to-amber-400 px-7 py-4 text-lg font-black text-slate-950 shadow-lg transition hover:-translate-y-0.5">¡Comenzar partida! →</button> : <div className="rounded-2xl border border-amber-200 bg-amber-50 p-5 text-sm leading-6 text-amber-950"><p className="font-black">Ajedrez desde Cero está en preparación</p><p className="mt-1">Estamos completando las reglas, el guardado del progreso y la accesibilidad antes de habilitarlo.</p></div>}
          <p className="text-sm text-slate-500">Puedes jugar y repetir las actividades todas las veces que quieras.</p>
        </div>
      ) : (
        <div className="mt-8"><GameRunner key={sessionKey} type={type} topic={topic} onExit={() => setActive(false)} /></div>
      )}
    </section>
  );
}

function GameRunner({ type, topic, onExit }: { type: GameType; topic: GameTopic; onExit: () => void }) {
  return <div><button type="button" onClick={onExit} className="mb-5 rounded-full border border-slate-300 px-4 py-2 text-sm font-black text-slate-700">← Cambiar de juego</button>{type === "quiz" && <Quiz topic={topic} />}{type === "word-search" && <WordSearch topic={topic} />}{type === "puzzle" && <Puzzle topic={topic} />}{type === "goose" && <Goose topic={topic} />}{type === "arcade-pack" && <EmbeddedGame title="Arcade deportivo — Pack 2" source="/student-games/arcade-deportivo-pack-2.html" />}{type === "puzzle-crossword" && <EmbeddedGame title="Puzle deportivo con crucigrama" source="/student-games/puzle-deportivo-con-crucigrama.html" />}{type === "chess" && <ChessStudentApp />}</div>;
}

function EmbeddedGame({ title, source }: { title: string; source: string }) {
  return <div className="overflow-hidden rounded-3xl border border-blue-100 bg-slate-950 shadow-xl"><div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/10 bg-slate-950 px-5 py-4 text-white"><div><p className="text-xs font-black uppercase tracking-[0.18em] text-cyan-300">Juego aportado por Profe en Movimiento</p><h4 className="mt-1 text-xl font-black">{title}</h4></div><a href={source} target="_blank" rel="noreferrer" className="rounded-full bg-white/10 px-4 py-2 text-sm font-black hover:bg-white/20">Abrir en pantalla completa ↗</a></div><iframe title={title} src={source} allow="fullscreen" allowFullScreen className="h-[780px] w-full border-0 bg-white sm:h-[880px]" /></div>;
}

function Quiz({ topic }: { topic: GameTopic }) {
  const questions = useMemo(() => shuffled(getQuestions(topic)).slice(0, 5), [topic]);
  const [index, setIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const current = questions[index];
  if (!current) return <p>No hay preguntas disponibles.</p>;
  const finished = index >= questions.length - 1 && selected !== null;
  return <div className="mx-auto max-w-3xl rounded-3xl bg-gradient-to-br from-blue-700 to-cyan-500 p-6 text-white sm:p-9"><div className="flex justify-between gap-4"><p className="font-black">Pregunta {index + 1} de {questions.length}</p><p className="font-black">Puntos: {score}</p></div><h4 className="mt-7 text-2xl font-black">{current.question}</h4><div className="mt-6 grid gap-3">{current.options.map((option, optionIndex) => <button key={option} type="button" disabled={selected !== null} onClick={() => { setSelected(optionIndex); if (optionIndex === current.answer) setScore((value) => value + 2); }} className={`rounded-2xl border px-5 py-4 text-left font-bold ${selected === null ? "border-white/40 bg-white/10 hover:bg-white/20" : optionIndex === current.answer ? "border-emerald-200 bg-emerald-500" : optionIndex === selected ? "border-red-200 bg-red-500" : "border-white/20 bg-white/5 opacity-60"}`}>{option}</button>)}</div>{selected !== null && <div className="mt-5 rounded-2xl bg-white/95 p-4 text-slate-800"><p className="font-bold">{selected === current.answer ? "¡Correcto! 🎉" : "Sigue aprendiendo 💪"}</p><p className="mt-1 text-sm">{current.explanation}</p>{finished ? <p className="mt-4 text-xl font-black text-blue-800">Resultado final: {score + (selected === current.answer ? 0 : 0)} de 10 puntos</p> : <button type="button" onClick={() => { setIndex((value) => value + 1); setSelected(null); }} className="mt-4 rounded-xl bg-slate-950 px-5 py-3 font-black text-white">Siguiente pregunta →</button>}</div>}</div>;
}

function WordSearch({ topic }: { topic: GameTopic }) {
  const words = useMemo(() => getWords(topic), [topic]);
  const grid = useMemo(() => buildWordGrid(words), [words]);
  const [start, setStart] = useState<[number, number] | null>(null);
  const [found, setFound] = useState<string[]>([]);
  const [message, setMessage] = useState("Selecciona la primera y la última letra de una palabra.");
  function choose(row: number, column: number) {
    if (!start) { setStart([row, column]); setMessage("Ahora selecciona la última letra."); return; }
    const path = pathBetween(start, [row, column]);
    const value = path.map(([r, c]) => grid[r][c]).join("");
    const matched = words.find((word) => word === value || word === [...value].reverse().join(""));
    if (matched && !found.includes(matched)) { setFound((items) => [...items, matched]); setMessage(`¡Encontraste ${matched}!`); } else setMessage("Esa línea no corresponde a una palabra pendiente. Inténtalo otra vez.");
    setStart(null);
  }
  return <div className="grid gap-7 lg:grid-cols-[minmax(0,620px)_1fr]"><div className="rounded-3xl bg-emerald-950 p-4 shadow-xl sm:p-6"><div className="grid grid-cols-12 gap-1">{grid.map((row, rowIndex) => row.map((letter, columnIndex) => <button key={`${rowIndex}-${columnIndex}`} type="button" onClick={() => choose(rowIndex, columnIndex)} className={`aspect-square rounded-md text-xs font-black sm:text-base ${start?.[0] === rowIndex && start?.[1] === columnIndex ? "bg-amber-300 text-slate-950" : "bg-white/95 text-emerald-950 hover:bg-cyan-200"}`}>{letter}</button>))}</div></div><div><h4 className="text-2xl font-black text-slate-950">Palabras por encontrar</h4><div className="mt-4 flex flex-wrap gap-2">{words.map((word) => <span key={word} className={`rounded-full px-4 py-2 text-sm font-black ${found.includes(word) ? "bg-emerald-100 text-emerald-800 line-through" : "bg-slate-100 text-slate-700"}`}>{word}</span>)}</div><p className="mt-6 rounded-2xl bg-cyan-50 p-4 font-bold text-cyan-900">{found.length === words.length ? "¡Misión cumplida! Encontraste todas las palabras. 🏆" : message}</p></div></div>;
}

function Puzzle({ topic }: { topic: GameTopic }) {
  const [tiles, setTiles] = useState(() => shufflePuzzle());
  const [moves, setMoves] = useState(0);
  const solved = tiles.every((tile, index) => tile === (index + 1) % 9);
  const icon = gameTopics.find((item) => item.value === topic)?.icon || "🏆";
  function move(index: number) {
    const empty = tiles.indexOf(0);
    const sameRow = Math.floor(index / 3) === Math.floor(empty / 3);
    if (!(Math.abs(index - empty) === 3 || (sameRow && Math.abs(index - empty) === 1))) return;
    const next = [...tiles]; [next[index], next[empty]] = [next[empty], next[index]]; setTiles(next); setMoves((value) => value + 1);
  }
  return <div className="mx-auto max-w-xl text-center"><h4 className="text-2xl font-black text-slate-950">Ordena las piezas del 1 al 8</h4><p className="mt-2 text-slate-600">Movimientos: <strong>{moves}</strong></p><div className="student-sports-puzzle mx-auto mt-6 grid max-w-md grid-cols-3 gap-3 rounded-[2rem] bg-violet-950 p-4 shadow-xl">{tiles.map((tile, index) => <button key={tile || "empty"} type="button" onClick={() => move(index)} className={`aspect-square rounded-2xl text-3xl font-black shadow-inner transition ${tile ? "bg-gradient-to-br from-violet-200 to-fuchsia-300 hover:scale-95" : "bg-violet-900"}`}>{tile ? <><span>{icon}</span><span className="student-sports-puzzle-number ml-1 text-base">{tile}</span></> : ""}</button>)}</div>{solved && <p className="mt-6 rounded-2xl bg-emerald-100 p-5 text-xl font-black text-emerald-900">¡Puzzle completado en {moves} movimientos! 🎉</p>}</div>;
}

function Goose({ topic }: { topic: GameTopic }) {
  const questions = useMemo(() => shuffled(getQuestions(topic)), [topic]);
  const [position, setPosition] = useState(1);
  const [roll, setRoll] = useState<number | null>(null);
  const [pending, setPending] = useState<GameQuestion | null>(null);
  const [message, setMessage] = useState("Lanza el dado para comenzar.");
  function throwDice() { const value = Math.floor(Math.random() * 6) + 1; setRoll(value); setPosition((current) => Math.min(20, current + value)); setPending(questions[(position + value) % questions.length]); setMessage("Responde correctamente para conservar tu casilla."); }
  function answer(option: number) { if (!pending) return; if (option === pending.answer) setMessage(`¡Correcto! ${pending.explanation}`); else { setPosition((current) => Math.max(1, current - 1)); setMessage(`Retrocedes una casilla. ${pending.explanation}`); } setPending(null); }
  return <div><div className="grid grid-cols-5 gap-2 sm:grid-cols-10">{Array.from({ length: 20 }, (_, index) => index + 1).map((cell) => <div key={cell} className={`grid aspect-square place-items-center rounded-xl border text-sm font-black sm:text-base ${cell === position ? "border-orange-500 bg-orange-400 text-slate-950 shadow-lg" : cell === 20 ? "border-emerald-300 bg-emerald-100 text-emerald-900" : "border-blue-100 bg-blue-50 text-blue-900"}`}>{cell === position ? "🏃" : cell === 20 ? "🏆" : cell}</div>)}</div><div className="mt-6 rounded-3xl bg-slate-950 p-6 text-white"><div className="flex flex-wrap items-center justify-between gap-4"><div><p className="text-sm font-bold text-cyan-300">Casilla {position} de 20</p><p className="mt-1 font-semibold">{position >= 20 ? "¡Llegaste a la meta!" : message}</p></div>{position < 20 && !pending && <button type="button" onClick={throwDice} className="rounded-2xl bg-orange-500 px-6 py-4 text-lg font-black text-slate-950">🎲 Lanzar dado {roll ? `(anterior: ${roll})` : ""}</button>}</div>{pending && <div className="mt-6 border-t border-white/20 pt-6"><h4 className="text-xl font-black">{pending.question}</h4><div className="mt-4 grid gap-3 sm:grid-cols-2">{pending.options.map((option, index) => <button key={option} type="button" onClick={() => answer(index)} className="rounded-xl bg-white/10 px-4 py-3 text-left font-bold hover:bg-white/20">{option}</button>)}</div></div>}</div></div>;
}
