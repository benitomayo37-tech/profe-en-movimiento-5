export type GameType = "quiz" | "word-search" | "puzzle" | "goose" | "arcade-pack" | "puzzle-crossword";
export type GameTopic = "baloncesto" | "futbol" | "atletismo" | "voleibol" | "mixto";

export interface GameQuestion {
  question: string;
  options: string[];
  answer: number;
  explanation: string;
}

export const gameTopics: Array<{ value: GameTopic; label: string; icon: string }> = [
  { value: "mixto", label: "Reto multideportivo", icon: "🏆" },
  { value: "baloncesto", label: "Baloncesto", icon: "🏀" },
  { value: "futbol", label: "Fútbol", icon: "⚽" },
  { value: "atletismo", label: "Atletismo", icon: "🏃" },
  { value: "voleibol", label: "Voleibol", icon: "🏐" },
];

export const gameTypes: Array<{ value: GameType; label: string; description: string; icon: string; color: string; hasOwnTopics?: boolean }> = [
  { value: "quiz", label: "Quiz deportivo", description: "Responde cinco preguntas y supera tu propia marca.", icon: "🧠", color: "from-blue-600 to-cyan-400" },
  { value: "word-search", label: "Sopa de letras", description: "Encuentra seis palabras escondidas en el tablero.", icon: "🔎", color: "from-emerald-500 to-lime-400" },
  { value: "puzzle", label: "Puzzle deportivo", description: "Ordena las nueve piezas con el menor número de movimientos.", icon: "🧩", color: "from-violet-600 to-fuchsia-400" },
  { value: "goose", label: "Oca deportiva", description: "Lanza el dado, responde y llega primero a la meta.", icon: "🎲", color: "from-orange-500 to-amber-300" },
  { value: "arcade-pack", label: "Arcade deportivo", description: "Supera retos de trivia, reflejos, estrategia y circuito corporal.", icon: "🕹️", color: "from-sky-600 to-indigo-500", hasOwnTopics: true },
  { value: "puzzle-crossword", label: "Puzle y crucigrama", description: "Resuelve desafíos deportivos de lógica, ubicación táctica y vocabulario.", icon: "🧩", color: "from-rose-500 to-orange-400", hasOwnTopics: true },
];

const questions: Record<Exclude<GameTopic, "mixto">, GameQuestion[]> = {
  baloncesto: [
    { question: "¿Cuántos puntos vale un tiro libre convertido?", options: ["1 punto", "2 puntos", "3 puntos", "4 puntos"], answer: 0, explanation: "Cada tiro libre convertido suma un punto." },
    { question: "¿Qué acción permite avanzar botando el balón?", options: ["Bloqueo", "Dribling", "Rebote", "Pivote"], answer: 1, explanation: "El dribling permite desplazarse mientras se controla el balón." },
    { question: "¿Cuántos jugadores de cada equipo están normalmente en cancha?", options: ["4", "5", "6", "7"], answer: 1, explanation: "Cada equipo juega con cinco participantes en cancha." },
    { question: "¿Qué pase sale desde el pecho con ambas manos?", options: ["Pase de pecho", "Pase de béisbol", "Pase picado", "Pase de mano baja"], answer: 0, explanation: "El pase de pecho parte frente al torso y se impulsa con ambas manos." },
    { question: "¿Qué debe hacer la mano guía durante un tiro?", options: ["Empujar el balón", "Estabilizar al costado", "Golpear el balón", "Cubrir los ojos"], answer: 1, explanation: "La mano guía se ubica al costado y únicamente estabiliza el balón." },
  ],
  futbol: [
    { question: "¿Cuántos jugadores forman normalmente un equipo en cancha?", options: ["9", "10", "11", "12"], answer: 2, explanation: "Un equipo inicia con once jugadores, incluido el guardameta." },
    { question: "¿Qué parte del pie ofrece mayor precisión en un pase corto?", options: ["Borde interno", "Talón", "Punta", "Empeine exterior siempre"], answer: 0, explanation: "El borde interno brinda una superficie amplia y controlada." },
    { question: "¿Quién puede usar las manos dentro de su propia área?", options: ["Cualquier defensa", "El capitán", "El guardameta", "El delantero"], answer: 2, explanation: "El guardameta puede usar las manos dentro de su área penal." },
    { question: "¿Cómo se reanuda el juego cuando el balón cruza la línea lateral?", options: ["Saque de meta", "Saque de banda", "Tiro libre", "Bote neutral"], answer: 1, explanation: "Se realiza un saque de banda con ambas manos." },
    { question: "¿Qué tarjeta indica expulsión?", options: ["Azul", "Verde", "Amarilla", "Roja"], answer: 3, explanation: "La tarjeta roja indica que el jugador debe abandonar el partido." },
  ],
  atletismo: [
    { question: "¿Qué prueba se considera de velocidad pura?", options: ["100 metros", "1500 metros", "Maratón", "Marcha 20 km"], answer: 0, explanation: "Los 100 metros son una prueba clásica de velocidad." },
    { question: "¿Qué objeto se entrega en una carrera de relevos?", options: ["Testigo", "Silbato", "Bandera", "Disco"], answer: 0, explanation: "Los relevistas intercambian un testigo dentro de una zona reglamentaria." },
    { question: "¿Qué fase sigue a la salida en una carrera corta?", options: ["Llegada", "Aceleración", "Recuperación", " premiación"], answer: 1, explanation: "Después de la salida, el atleta acelera progresivamente." },
    { question: "¿Dónde debe mirar el velocista durante la carrera?", options: ["Hacia atrás", "Al suelo todo el tiempo", "Hacia el frente", "A las gradas"], answer: 2, explanation: "La mirada se orienta al frente para conservar postura y dirección." },
    { question: "¿Qué capacidad física predomina en los 100 metros?", options: ["Flexibilidad", "Velocidad", "Equilibrio estático", "Resistencia de larga duración"], answer: 1, explanation: "La velocidad es la capacidad predominante en esta prueba." },
  ],
  voleibol: [
    { question: "¿Cuántos jugadores de cada equipo están normalmente en cancha?", options: ["5", "6", "7", "8"], answer: 1, explanation: "Cada equipo juega con seis participantes en cancha." },
    { question: "¿Cuántos toques como máximo puede realizar un equipo antes de enviar el balón?", options: ["2", "3", "4", "5"], answer: 1, explanation: "El equipo dispone de hasta tres toques, sin contar el bloqueo según el reglamento." },
    { question: "¿Qué gesto se usa habitualmente para recibir un saque?", options: ["Golpe de antebrazos", "Remate", "Bloqueo", "Saque de tenis"], answer: 0, explanation: "El golpe de antebrazos ofrece control en la recepción." },
    { question: "¿Qué elemento divide la cancha?", options: ["Una cuerda en el suelo", "La red", "Una pared", "Una línea curva"], answer: 1, explanation: "La red divide los dos campos de juego." },
    { question: "¿Desde dónde comienza cada jugada?", options: ["Con un saque", "Con un bote", "Con un salto entre dos", "Con un penal"], answer: 0, explanation: "Cada punto comienza con el servicio o saque." },
  ],
};

export function getQuestions(topic: GameTopic): GameQuestion[] {
  if (topic !== "mixto") return questions[topic];
  return Object.values(questions).flatMap((items, index) => items.slice(index % 2, index % 2 + 2)).slice(0, 8);
}

const words: Record<GameTopic, string[]> = {
  baloncesto: ["BALON", "PASE", "ARO", "REBOTE", "DRIBLE", "CANCHA"],
  futbol: ["GOL", "PASE", "ARCO", "EQUIPO", "BALON", "DEFENSA"],
  atletismo: ["PISTA", "SALIDA", "META", "TESTIGO", "CARRERA", "VELOCIDAD"],
  voleibol: ["RED", "SAQUE", "BLOQUEO", "REMATE", "EQUIPO", "BALON"],
  mixto: ["DEPORTE", "EQUIPO", "REGLA", "META", "BALON", "JUEGO"],
};

export function getWords(topic: GameTopic) {
  return words[topic];
}
