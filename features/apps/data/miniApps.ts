export type MiniAppCategoryId =
  | "all"
  | "organization"
  | "sports"
  | "games"
  | "pedagogy";

export type MiniAppStatus = "available" | "integrated" | "planned";

export interface MiniAppCategory {
  id: MiniAppCategoryId;
  label: string;
  icon: string;
}

export interface MiniAppDefinition {
  id: string;
  title: string;
  description: string;
  category: Exclude<MiniAppCategoryId, "all">;
  categoryLabel: string;
  icon: string;
  accent: string;
  plan: "Free" | "Pro";
  status: MiniAppStatus;
  href?: string;
  embeddedAsset?: string;
}

export const miniAppCategories: MiniAppCategory[] = [
  { id: "all", label: "Todas", icon: "✦" },
  { id: "organization", label: "Organización", icon: "🗂️" },
  { id: "sports", label: "Deporte y salud", icon: "🏃" },
  { id: "games", label: "Juegos y dinámicas", icon: "🎯" },
  { id: "pedagogy", label: "Pedagógicas", icon: "📚" },
];

export const miniApps: MiniAppDefinition[] = [
  {
    id: "sorteador-equipos",
    title: "Sorteador de equipos",
    description: "Forma equipos equilibrados en segundos a partir de una lista de participantes.",
    category: "organization",
    categoryLabel: "Organización",
    icon: "🔀",
    accent: "from-blue-600 to-cyan-500",
    plan: "Free",
    status: "available",
  },
  {
    id: "generador-sesiones-entrenamientos",
    title: "Generador de sesiones y entrenamientos",
    description: "Planifica sesiones, microciclos, mesociclos y macrociclos con Entrenador IA.",
    category: "sports",
    categoryLabel: "Deporte y salud",
    icon: "🏋️",
    accent: "from-emerald-600 to-teal-500",
    plan: "Pro",
    status: "integrated",
    href: "/entrenador-ia",
  },
  {
    id: "marcador-cronometro-deportivo",
    title: "Marcador y cronómetro deportivo",
    description: "Controla puntuación, nombres de equipos y tiempo de juego en una sola pantalla.",
    category: "sports",
    categoryLabel: "Deporte y salud",
    icon: "🏆",
    accent: "from-slate-900 to-blue-700",
    plan: "Free",
    status: "available",
  },
  {
    id: "calculadora-intensidad-calorias",
    title: "Calculadora de intensidad y calorías",
    description: "Estima carga de trabajo y gasto energético para orientar la actividad física.",
    category: "sports",
    categoryLabel: "Deporte y salud",
    icon: "🔥",
    accent: "from-orange-600 to-amber-400",
    plan: "Pro",
    status: "available",
    embeddedAsset: "calculadora-intensidad-calorias.html",
  },
  {
    id: "rueda-retos-juegos",
    title: "Rueda de retos y juegos",
    description: "Selecciona retos motrices y juegos al azar para dinamizar la clase.",
    category: "games",
    categoryLabel: "Juegos y dinámicas",
    icon: "🎡",
    accent: "from-fuchsia-600 to-violet-500",
    plan: "Pro",
    status: "available",
    embeddedAsset: "rueda-retos-juegos.html",
  },
  {
    id: "cronometro-circuitos-hiit",
    title: "Cronómetro de circuitos HIIT",
    description: "Programa intervalos de trabajo, descanso y rondas para circuitos físicos.",
    category: "sports",
    categoryLabel: "Deporte y salud",
    icon: "⏱️",
    accent: "from-red-600 to-orange-500",
    plan: "Free",
    status: "available",
  },
  {
    id: "generador-diplomas",
    title: "Generador de diplomas",
    description: "Crea reconocimientos personalizados para estudiantes y participantes.",
    category: "pedagogy",
    categoryLabel: "Pedagógicas",
    icon: "🎓",
    accent: "from-amber-500 to-yellow-400",
    plan: "Pro",
    status: "available",
    embeddedAsset: "generador-diplomas.html",
  },
  {
    id: "banco-dinamicas-rompehielos",
    title: "Banco de dinámicas rompehielos",
    description: "Encuentra actividades breves para activar, integrar y motivar al grupo.",
    category: "games",
    categoryLabel: "Juegos y dinámicas",
    icon: "🧊",
    accent: "from-sky-600 to-cyan-400",
    plan: "Pro",
    status: "available",
    embeddedAsset: "banco-dinamicas-rompehielos.html",
  },
  {
    id: "registro-test-fisicos",
    title: "Registro de test físicos",
    description: "Organiza resultados y seguimiento de evaluaciones de condición física.",
    category: "organization",
    categoryLabel: "Organización",
    icon: "📊",
    accent: "from-indigo-600 to-blue-500",
    plan: "Pro",
    status: "available",
    embeddedAsset: "registro-test-fisicos.html",
  },
  {
    id: "generador-torneos-relampago",
    title: "Generador de torneos relámpago",
    description: "Organiza enfrentamientos y rondas para competencias escolares rápidas.",
    category: "organization",
    categoryLabel: "Organización",
    icon: "🥇",
    accent: "from-yellow-500 to-orange-500",
    plan: "Pro",
    status: "available",
    embeddedAsset: "generador-torneos-relampago.html",
  },
  {
    id: "generador-pausas-activas",
    title: "Generador de pausas activas",
    description: "Crea secuencias con temporizador, audiencia y pictogramas por ejercicio.",
    category: "games",
    categoryLabel: "Juegos y dinámicas",
    icon: "🤸",
    accent: "from-emerald-500 to-lime-500",
    plan: "Pro",
    status: "available",
    embeddedAsset: "generador-pausas-activas.html",
  },
  {
    id: "desagregador-destrezas",
    title: "Desagregador de destrezas",
    description: "Analiza Destrezas con Criterio de Desempeño de las distintas asignaturas.",
    category: "pedagogy",
    categoryLabel: "Pedagógicas",
    icon: "🧩",
    accent: "from-purple-600 to-indigo-500",
    plan: "Pro",
    status: "available",
    embeddedAsset: "desagregador-destrezas.html",
  },
  {
    id: "activacion-conocimientos-previos",
    title: "Activación de conocimientos previos",
    description: "Genera estrategias de inicio con enfoque regular y principios DUA.",
    category: "pedagogy",
    categoryLabel: "Pedagógicas",
    icon: "💭",
    accent: "from-violet-600 to-fuchsia-500",
    plan: "Pro",
    status: "available",
    embeddedAsset: "activacion-conocimientos-previos.html",
  },
  {
    id: "formulador-objetivos-clase",
    title: "Formulador de objetivos de clase",
    description: "Formula objetivos con taxonomía de Bloom y revisión de verbos ambiguos.",
    category: "pedagogy",
    categoryLabel: "Pedagógicas",
    icon: "🎯",
    accent: "from-blue-700 to-indigo-500",
    plan: "Pro",
    status: "available",
    embeddedAsset: "formulador-objetivos-clase.html",
  },
  {
    id: "calculadora-frecuencia-cardiaca",
    title: "Calculadora de frecuencia cardíaca máxima",
    description: "Calcula la FCM con fórmula de Tanaka y presenta zonas orientativas de carga.",
    category: "sports",
    categoryLabel: "Deporte y salud",
    icon: "❤️",
    accent: "from-rose-600 to-red-500",
    plan: "Pro",
    status: "available",
    embeddedAsset: "calculadora-frecuencia-cardiaca.html",
  },
  {
    id: "calculadora-imc",
    title: "Calculadora de IMC",
    description: "Obtiene el índice de masa corporal y muestra una clasificación orientativa.",
    category: "sports",
    categoryLabel: "Deporte y salud",
    icon: "⚖️",
    accent: "from-teal-600 to-emerald-500",
    plan: "Pro",
    status: "available",
    embeddedAsset: "calculadora-imc.html",
  },
  {
    id: "generador-rubricas",
    title: "Generador de rúbricas de evaluación",
    description: "Construye rúbricas de cuatro niveles con criterios claros y editables.",
    category: "pedagogy",
    categoryLabel: "Pedagógicas",
    icon: "✅",
    accent: "from-green-600 to-emerald-500",
    plan: "Pro",
    status: "available",
    embeddedAsset: "generador-rubricas.html",
  },
  {
    id: "armador-plan-clase",
    title: "Armador de plan de clase completo",
    description: "Integra objetivo, activación, desarrollo y evaluación en una sola secuencia.",
    category: "pedagogy",
    categoryLabel: "Pedagógicas",
    icon: "📝",
    accent: "from-cyan-700 to-blue-600",
    plan: "Pro",
    status: "available",
    embeddedAsset: "armador-plan-clase.html",
  },
  {
    id: "dinamicas-cierre-ticket-salida",
    title: "Dinámicas de cierre y tickets de salida",
    description: "Genera cierres breves para recuperar evidencias de aprendizaje con DUA.",
    category: "games",
    categoryLabel: "Juegos y dinámicas",
    icon: "🚪",
    accent: "from-orange-600 to-rose-500",
    plan: "Pro",
    status: "available",
    embeddedAsset: "dinamicas-cierre-ticket-salida.html",
  },
];

export const functionalMiniAppSlugs = miniApps
  .filter((app) => app.status === "available")
  .map((app) => app.id);

export function getMiniAppBySlug(slug: string) {
  return miniApps.find((app) => app.id === slug);
}
