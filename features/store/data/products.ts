export type StoreCategoryId =
  | "all"
  | "resources"
  | "apps"
  | "ebooks"
  | "bundles";

import { auditedStoreProducts } from "@/features/store/data/auditedProducts";

export interface StoreCategory {
  id: StoreCategoryId;
  label: string;
  icon: string;
}

export interface StoreProduct {
  id: string;
  title: string;
  description: string;
  category: Exclude<StoreCategoryId, "all">;
  categoryLabel: string;
  icon: string;
  accent: string;
  badge: string;
  format: string;
  contents: string[];
  longDescription: string;
  idealFor: string[];
  benefits: string[];
  howToUse: string[];
  delivery: string;
  access: string;
  price?: number;
  compareAtPrice?: number;
  billing?: "one-time" | "monthly" | "annual";
  purchaseStatus: "available" | "included" | "coming-soon";
  image?: string;
  imageAlt?: string;
  appList?: string[];
  commercialNote?: string;
}

export const storeCategories: StoreCategory[] = [
  { id: "all", label: "Todo", icon: "✦" },
  { id: "resources", label: "Recursos", icon: "📚" },
  { id: "apps", label: "Apps docentes", icon: "📱" },
  { id: "ebooks", label: "Ebooks", icon: "📘" },
  { id: "bundles", label: "Paquetes", icon: "🎁" },
];

const existingStoreProducts: StoreProduct[] = [
  {
    id: "games-cooperative-volume-1",
    title: "Banco de juegos cooperativos · Vol. 1",
    description:
      "Actividades prácticas para promover participación, movimiento y trabajo en equipo.",
    category: "resources",
    categoryLabel: "Recursos educativos",
    icon: "🤝",
    accent: "from-blue-600 to-cyan-500",
    badge: "Más solicitado",
    format: "Word + PDF",
    contents: ["Juegos listos para aplicar", "Variantes por nivel", "Organización y seguridad"],
    longDescription:
      "Una colección práctica de juegos cooperativos diseñada para que el docente pueda activar la clase, fortalecer la convivencia y garantizar que todo el grupo participe. Cada propuesta presenta una organización clara, materiales sencillos y alternativas para ajustar el nivel de dificultad.",
    idealFor: ["Docentes de Educación Física", "Educación General Básica", "Bachillerato", "Clases con grupos numerosos"],
    benefits: ["Reduce el tiempo de planificación", "Favorece la cooperación", "Permite adaptar cada juego", "Prioriza participación y seguridad"],
    howToUse: ["Selecciona el objetivo de la clase", "Elige un juego adecuado al grupo", "Revisa materiales y organización", "Aplica las variantes necesarias"],
    delivery: "Descarga digital",
    access: "Uso personal docente",
    price: 6.99,
    billing: "one-time",
    purchaseStatus: "available",
  },
  {
    id: "physical-education-planning",
    title: "Planificaciones de Educación Física",
    description:
      "Clases estructuradas por nivel, con metodología, evaluación, DUA y adaptaciones.",
    category: "resources",
    categoryLabel: "Recursos educativos",
    icon: "🗂️",
    accent: "from-indigo-600 to-blue-500",
    badge: "Editable",
    format: "Word editable",
    contents: ["Inicio, desarrollo y cierre", "Instrumentos de evaluación", "Estrategias inclusivas"],
    longDescription:
      "Planificaciones editables que integran objetivos, actividades, organización, seguridad y evaluación en una secuencia coherente. El material está pensado para ajustarse al nivel educativo, los recursos disponibles y las necesidades del grupo.",
    idealFor: ["Docentes de Educación Física", "Básica Media y Superior", "Bachillerato", "Docentes que necesitan material editable"],
    benefits: ["Ofrece una estructura clara", "Facilita la adaptación curricular", "Integra evaluación formativa", "Incluye estrategias de inclusión"],
    howToUse: ["Escoge la planificación más cercana a tu tema", "Ajusta nivel, duración y materiales", "Adapta las actividades al grupo", "Guarda o imprime la versión final"],
    delivery: "Descarga digital",
    access: "Archivos editables",
    price: 9.99,
    billing: "one-time",
    purchaseStatus: "available",
  },
  {
    id: "evaluation-toolkit",
    title: "Kit de evaluación docente",
    description:
      "Rúbricas, listas de cotejo y escalas estimativas para evaluar con claridad.",
    category: "resources",
    categoryLabel: "Recursos educativos",
    icon: "✅",
    accent: "from-emerald-600 to-teal-500",
    badge: "Práctico",
    format: "Word + Excel",
    contents: ["Rúbricas editables", "Listas de cotejo", "Regla de 3"],
    longDescription:
      "Un conjunto organizado de instrumentos para observar, registrar y comunicar el aprendizaje. Incluye formatos editables que pueden utilizarse en evaluación docente, autoevaluación y coevaluación.",
    idealFor: ["Docentes de Educación Física", "Evaluaciones prácticas", "Autoevaluación y coevaluación", "Seguimiento por destrezas"],
    benefits: ["Unifica criterios de evaluación", "Agiliza el registro de resultados", "Facilita la retroalimentación", "Permite personalizar indicadores"],
    howToUse: ["Selecciona el tipo de instrumento", "Edita criterios e indicadores", "Aplica durante la actividad", "Calcula y registra la calificación"],
    delivery: "Descarga digital",
    access: "Archivos editables",
    price: 7.99,
    billing: "one-time",
    purchaseStatus: "available",
  },
  {
    id: "team-generator",
    title: "Sorteador de equipos",
    description:
      "Forma grupos equilibrados en segundos y aprovecha mejor el tiempo de clase.",
    category: "apps",
    categoryLabel: "Aplicaciones para docentes",
    icon: "🔀",
    accent: "from-orange-500 to-amber-400",
    badge: "App docente",
    format: "Aplicación web",
    contents: ["Sorteo instantáneo", "Equipos personalizables", "Uso desde el móvil"],
    longDescription:
      "Una herramienta rápida para formar equipos desde el teléfono o la computadora. Permite aprovechar mejor el tiempo de clase y mantener una dinámica ágil cuando el grupo debe cambiar de organización.",
    idealFor: ["Clases de Educación Física", "Entrenamientos deportivos", "Actividades por estaciones", "Grupos numerosos"],
    benefits: ["Forma equipos en segundos", "Evita procesos manuales", "Funciona desde distintos dispositivos", "Facilita reorganizar la clase"],
    howToUse: ["Ingresa los nombres o la cantidad de participantes", "Selecciona el número de equipos", "Genera el sorteo", "Ajusta o repite cuando sea necesario"],
    delivery: "Acceso en línea",
    access: "Incluido en la Suite Pro de miniapps",
    purchaseStatus: "included",
    commercialNote: "Disponible como parte de la Suite Pro de miniapps para docentes.",
  },
  {
    id: "class-scoreboard",
    title: "Marcador y cronómetro de clase",
    description:
      "Controla tiempo, puntuación y rondas desde una interfaz simple y visible.",
    category: "apps",
    categoryLabel: "Aplicaciones para docentes",
    icon: "⏱️",
    accent: "from-slate-800 to-blue-700",
    badge: "App docente",
    format: "Aplicación web",
    contents: ["Cronómetro y cuenta regresiva", "Marcador por equipos", "Señales rápidas"],
    longDescription:
      "Una pantalla de control diseñada para gestionar tiempos, rondas y puntuaciones durante clases, juegos y entrenamientos. Su interfaz busca ser clara, visible y fácil de utilizar mientras el docente se mantiene en movimiento.",
    idealFor: ["Juegos por tiempo", "Circuitos y estaciones", "Partidos escolares", "Sesiones de entrenamiento"],
    benefits: ["Centraliza tiempo y puntuación", "Reduce interrupciones", "Mejora la visibilidad del marcador", "Facilita controlar rondas"],
    howToUse: ["Selecciona cronómetro o cuenta regresiva", "Configura equipos y puntuación", "Inicia la actividad", "Registra rondas y resultados"],
    delivery: "Acceso en línea",
    access: "Incluido en la Suite Pro de miniapps",
    purchaseStatus: "included",
    commercialNote: "Disponible como parte de la Suite Pro de miniapps para docentes.",
  },
  {
    id: "ebook-games",
    title: "Ebook · Juegos que ponen la clase en movimiento",
    description:
      "Una guía visual para seleccionar, explicar y adaptar juegos de forma sencilla.",
    category: "ebooks",
    categoryLabel: "Ebooks",
    icon: "📖",
    accent: "from-violet-600 to-fuchsia-500",
    badge: "Guía visual",
    format: "PDF digital",
    contents: ["Juegos por objetivo", "Fichas visuales", "Adaptaciones y variantes"],
    longDescription:
      "Una guía visual para encontrar juegos según el objetivo de aprendizaje y explicar cada actividad con mayor claridad. Sus fichas reúnen organización, materiales, reglas, variantes y recomendaciones de seguridad.",
    idealFor: ["Docentes de Educación Física", "Monitores y entrenadores", "Clases dinámicas", "Docentes que buscan nuevas ideas"],
    benefits: ["Organiza juegos por finalidad", "Facilita la explicación", "Ofrece variantes prácticas", "Sirve como consulta rápida"],
    howToUse: ["Identifica el objetivo de tu clase", "Busca la categoría correspondiente", "Revisa la ficha del juego", "Adapta reglas y espacio"],
    delivery: "Descarga digital",
    access: "Lectura en cualquier dispositivo",
    price: 5.99,
    billing: "one-time",
    purchaseStatus: "available",
  },
  {
    id: "ebook-active-methodologies",
    title: "Ebook · Metodologías activas en Educación Física",
    description:
      "Ideas concretas para aplicar ABJ, gamificación, cooperación y estaciones.",
    category: "ebooks",
    categoryLabel: "Ebooks",
    icon: "💡",
    accent: "from-purple-600 to-indigo-500",
    badge: "Formación",
    format: "PDF digital",
    contents: ["Ejemplos de clase", "Roles del docente", "Evaluación formativa"],
    longDescription:
      "Una introducción práctica a metodologías activas aplicadas a Educación Física. Presenta orientaciones para aprendizaje basado en juegos, gamificación, cooperación, estaciones y otras estrategias centradas en la participación del estudiante.",
    idealFor: ["Docentes que desean innovar", "Coordinadores de área", "Formación docente", "Planificación metodológica"],
    benefits: ["Traduce la teoría a la práctica", "Aclara roles docentes y estudiantiles", "Incluye ejemplos aplicables", "Conecta metodología y evaluación"],
    howToUse: ["Revisa la metodología de interés", "Analiza el ejemplo de aplicación", "Adapta roles y organización", "Incorpora evaluación formativa"],
    delivery: "Descarga digital",
    access: "Lectura en cualquier dispositivo",
    price: 7.99,
    billing: "one-time",
    purchaseStatus: "available",
  },
  {
    id: "teacher-pro-pack",
    title: "Paquete Docente PRO",
    description:
      "Una biblioteca inicial con planificación, evaluación, juegos y materiales visuales.",
    category: "bundles",
    categoryLabel: "Paquetes",
    icon: "🚀",
    accent: "from-orange-600 to-rose-500",
    badge: "Ahorra más",
    format: "Pack digital",
    contents: ["Banco de juegos", "Plantillas editables", "Ebook y recursos visuales"],
    longDescription:
      "Un paquete inicial que reúne materiales esenciales para planificar, desarrollar y evaluar clases. Combina recursos editables y visuales para que el docente disponga de una base organizada desde el primer día.",
    idealFor: ["Docentes que comienzan su biblioteca", "Educación Física escolar", "Docentes con poco tiempo", "Regalo profesional educativo"],
    benefits: ["Reúne varios tipos de recursos", "Evita buscar materiales por separado", "Ofrece formatos editables", "Cubre planificación, clase y evaluación"],
    howToUse: ["Descarga y organiza el paquete", "Elige el recurso que necesitas", "Personaliza los archivos editables", "Construye tu biblioteca docente"],
    delivery: "Descarga digital",
    access: "Biblioteca de archivos",
    price: 24.99,
    compareAtPrice: 30.96,
    billing: "one-time",
    purchaseStatus: "available",
  },
  {
    id: "fundamentos-tendencias-educacion-fisica",
    title: "Fundamentos y Tendencias Contemporáneas en Educación Física",
    description:
      "Una obra de Armando Mayo García para comprender las bases, transformaciones y enfoques actuales de la Educación Física.",
    category: "ebooks",
    categoryLabel: "Libro profesional",
    icon: "📚",
    accent: "from-teal-800 via-cyan-800 to-emerald-700",
    badge: "Libro del autor",
    format: "PDF digital",
    contents: ["Fundamentos de la Educación Física", "Tendencias contemporáneas", "Enfoque pedagógico e inclusivo"],
    longDescription:
      "Una publicación profesional que reúne fundamentos esenciales y tendencias contemporáneas de la Educación Física. El libro ofrece una mirada pedagógica, actual e inclusiva para docentes, estudiantes y profesionales interesados en comprender la evolución del área y enriquecer su práctica.",
    idealFor: ["Docentes de Educación Física", "Estudiantes universitarios", "Entrenadores y profesionales", "Coordinadores de área"],
    benefits: ["Integra fundamentos y actualidad", "Fortalece la formación profesional", "Promueve una mirada inclusiva", "Sirve como material de consulta"],
    howToUse: ["Descarga la edición PDF", "Organiza la lectura por capítulos", "Relaciona los contenidos con tu práctica", "Conserva el libro como material de consulta"],
    delivery: "Descarga digital del PDF",
    access: "PDF personal; Kindle próximamente en Amazon",
    price: 9.99,
    billing: "one-time",
    purchaseStatus: "available",
    image: "/images/store/fundamentos-tendencias-portada.png",
    imageAlt: "Portada del libro Fundamentos y Tendencias Contemporáneas en Educación Física, de Armando Mayo García",
    commercialNote: "La edición Kindle estará disponible próximamente en Amazon.",
  },
  {
    id: "plan-pro-mensual",
    title: "Suite Pro de miniapps para docentes",
    description:
      "Herramientas en línea para organizar clases, evaluar, crear recursos y gestionar actividades desde cualquier dispositivo.",
    category: "apps",
    categoryLabel: "Aplicaciones para docentes",
    icon: "🧰",
    accent: "from-orange-600 via-amber-500 to-yellow-400",
    badge: "Suite en crecimiento",
    format: "Suite de aplicaciones web",
    contents: [
      "20 miniapps docentes",
      "Profe IA con todas sus herramientas",
      "Entrenador IA y planificación deportiva",
      "MueveSeguro: registros e historial",
      "Movimiento para Todos completo",
      "Biblioteca Premium de la plataforma",
      "Academia, progreso y certificados",
      "Exámenes con códigos y resultados",
      "Experiencias y juegos estudiantiles",
      "Comunidad, Dashboard e historial",
    ],
    longDescription:
      "Un ecosistema de miniaplicaciones en línea que crece con nuevas herramientas para reducir tareas repetitivas y facilitar el trabajo diario del docente. Reúne recursos deportivos, organizativos y pedagógicos que funcionan desde el navegador, sin instalaciones.",
    idealFor: ["Docentes de Educación Física", "Docentes de otras asignaturas", "Entrenadores y monitores", "Instituciones educativas"],
    benefits: ["Reúne herramientas en un solo acceso", "Incorpora nuevas aplicaciones", "Reduce tiempo de preparación", "Combina gestión, evaluación y actividad física"],
    howToUse: ["Activa tu plan Pro", "Ingresa desde cualquier dispositivo", "Selecciona la miniapp necesaria", "Guarda o exporta el resultado disponible"],
    delivery: "Activación de acceso en línea",
    access: "Suscripción mensual Pro",
    price: 4.99,
    billing: "monthly",
    purchaseStatus: "available",
    commercialNote: "Incluye las herramientas y contenidos digitales de la plataforma durante la suscripción. Los ebooks, archivos editables y paquetes comerciales de la Tienda se venden por separado.",
    appList: [
      "Creador de Juegos",
      "Pizarra Táctica Multideporte",
      "Creador de Certificados",
      "Generador de Retos de 30 Días",
      "Planificador de Clases Express",
      "Planificador de Cívica y Acompañamiento Integral",
      "Planificador de Animación a la Lectura",
      "Evalúa en Movimiento",
      "Guía Interactiva de Juegos en Movimiento",
      "Yoga en Movimiento",
      "CitaProfe APA 7",
      "Fundamentos y Tendencias Contemporáneas en Educación Física",
      "Metodologías Activas en Educación Física",
      "Desagregador de Destrezas con Criterio de Desempeño",
      "Ajedrez Educativo",
      "Alimentación en Movimiento",
      "Sorteador de equipos",
      "Generador de sesiones y entrenamientos",
      "Marcador y cronómetro deportivo",
      "Cronómetro de circuitos HIIT",
    ],
  },
  {
    id: "plan-pro-anual",
    title: "Plan Pro anual",
    description: "Acceso durante 12 meses a las 20 miniapps, Profe IA, Entrenador IA y los contenidos Pro de la plataforma.",
    category: "apps",
    categoryLabel: "Suscripción Pro",
    icon: "⭐",
    accent: "from-violet-700 via-blue-700 to-cyan-500",
    badge: "Ahorra USD 9,89",
    format: "Plataforma web",
    contents: [
      "20 miniapps docentes",
      "Profe IA con todas sus herramientas",
      "Entrenador IA y planificación deportiva",
      "MueveSeguro: registros e historial",
      "Movimiento para Todos completo",
      "Biblioteca Premium de la plataforma",
      "Academia, progreso y certificados",
      "Exámenes con códigos y resultados",
      "Experiencias y juegos estudiantiles",
      "Comunidad, Dashboard e historial",
      "12 meses de acceso Pro",
    ],
    longDescription: "La modalidad anual ofrece el mismo acceso que el Plan Pro mensual durante doce meses, con un ahorro frente a doce pagos mensuales. Los ebooks, planificaciones y paquetes descargables se comercializan por separado.",
    idealFor: ["Docentes que utilizan la plataforma todo el año", "Entrenadores y monitores", "Profesionales que desean ahorrar", "Usuarios frecuentes de herramientas con IA"],
    benefits: ["Mismo acceso completo del Plan Pro mensual", "Ahorro de USD 9,89 al año", "Activación automática mediante Hotmart", "Acceso desde móvil o computadora"],
    howToUse: ["Compra el plan con tu correo habitual", "Confirma o inicia sesión con ese mismo correo", "Espera la aprobación automática de Hotmart", "Utiliza las funciones Pro durante la vigencia"],
    delivery: "Activación de acceso en línea",
    access: "Suscripción anual Pro",
    price: 49.99,
    compareAtPrice: 59.88,
    billing: "annual",
    purchaseStatus: "available",
    commercialNote: "Doce meses de Plan Pro. Los productos descargables de la tienda se venden por separado.",
  },
];

export const storeProducts: StoreProduct[] = [
  ...existingStoreProducts,
  ...auditedStoreProducts,
];

export function getStoreProductStatusLabel(product: StoreProduct) {
  if (product.purchaseStatus === "available") return "Disponible";
  if (product.purchaseStatus === "included") return "Incluido en la Suite";
  return "Próximamente";
}

export function getStoreProductBySlug(slug: string) {
  const normalizedSlug = slug === "suite-19-miniapps-docentes" ? "plan-pro-mensual" : slug;
  return storeProducts.find((product) => product.id === normalizedSlug);
}

export function formatStorePrice(price: number) {
  return new Intl.NumberFormat("es-EC", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
  }).format(price);
}
