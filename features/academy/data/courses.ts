export interface AcademyLesson {
  id: string;
  module: string;
  title: string;
  duration: string;
  icon: string;
  objective: string;
  content: Array<{ title: string; text: string }>;
  application: string;
  reflection: string;
}

export interface AcademyQuizQuestion {
  id: string;
  prompt: string;
  options: string[];
  correctIndex: number;
  feedback: string;
}

export const academyCourse = {
  slug: "metodologias-activas-educacion-fisica",
  title: "Metodologías Activas en Educación Física",
  subtitle: "Decide, adapta y aplica propuestas con rigor, seguridad y sentido pedagógico.",
  description: "Curso práctico para diferenciar metodologías, modelos pedagógicos, estilos de enseñanza y estrategias organizativas, y seleccionar la alternativa más adecuada para cada clase.",
  level: "Formación docente",
  access: "FREE",
  duration: "4 horas",
  lessonCount: 8,
  passingScore: 80,
  instructor: "MSc. Armando Mayo García",
};

export const academyLessons: AcademyLesson[] = [
  {
    id: "mapa-conceptual",
    module: "Módulo 1 · Fundamentos",
    title: "No todo es una metodología",
    duration: "25 min",
    icon: "🧭",
    objective: "Distinguir metodologías activas, modelos pedagógicos, estilos de enseñanza y estrategias organizativas.",
    content: [
      { title: "Metodología activa", text: "Organiza el aprendizaje alrededor de decisiones, problemas, proyectos, cooperación o creación del estudiante. Ejemplos: ABP, aprendizaje basado en retos y aprendizaje-servicio." },
      { title: "Modelo pedagógico", text: "Integra propósitos, roles, estructura de la unidad y evaluación. Educación Deportiva, TGfU y Responsabilidad Personal y Social son modelos, no actividades aisladas." },
      { title: "Estilo y organización", text: "El descubrimiento guiado es un estilo de enseñanza; las estaciones son una forma de organizar espacio, tiempo y participación. Ambos pueden combinarse con metodologías y modelos." },
    ],
    application: "Clasifica cuatro propuestas de una planificación real y explica por qué pertenecen a categorías diferentes.",
    reflection: "¿Alguna vez nombraste como metodología una actividad, un estilo o una forma de agrupar?",
  },
  {
    id: "aprendizaje-cooperativo",
    module: "Módulo 1 · Fundamentos",
    title: "Aprendizaje cooperativo auténtico",
    duration: "30 min",
    icon: "🤝",
    objective: "Diseñar tareas con interdependencia positiva, responsabilidad individual y participación equitativa.",
    content: [
      { title: "Cooperar no es solo agruparse", text: "El grupo necesita una meta compartida, pero cada integrante debe aportar una evidencia observable. Repartir estudiantes sin estructura no garantiza cooperación." },
      { title: "Roles con sentido", text: "Los roles deben ayudar a aprender: observador técnico, responsable de seguridad, registrador o facilitador. Conviene rotarlos y evitar que sustituyan la práctica motriz." },
      { title: "Evaluación", text: "Combina producto grupal, desempeño individual, coevaluación breve y reflexión sobre cómo se organizaron y ayudaron." },
    ],
    application: "Transforma un circuito competitivo en una tarea cooperativa donde nadie quede esperando y cada estudiante aporte.",
    reflection: "¿Cómo comprobarías que todos aprendieron y no solamente el estudiante con mayor dominio?",
  },
  {
    id: "abj-gamificacion",
    module: "Módulo 2 · Metodologías activas",
    title: "ABJ y gamificación: diferencias clave",
    duration: "30 min",
    icon: "🎲",
    objective: "Diferenciar el aprendizaje basado en juegos de la incorporación de elementos de juego.",
    content: [
      { title: "Aprendizaje basado en juegos", text: "El juego es el medio principal para aprender o aplicar un contenido. Sus reglas, decisiones y retroalimentación están conectadas con el objetivo." },
      { title: "Gamificación", text: "Añade una narrativa, misiones, niveles o retroalimentación a una experiencia que no necesariamente es un juego. No depende de premios ni de rankings públicos." },
      { title: "Cuidado pedagógico", text: "Evita eliminar estudiantes, exponer resultados, convertir cada tarea en competencia o premiar únicamente velocidad y rendimiento." },
    ],
    application: "Diseña una misión de diez minutos para practicar pases, sin eliminación y con dos formas equivalentes de participar.",
    reflection: "¿La mecánica elegida mejora el aprendizaje o solamente hace la actividad más llamativa?",
  },
  {
    id: "proyectos-retos",
    module: "Módulo 2 · Metodologías activas",
    title: "Proyectos y retos con producto auténtico",
    duration: "30 min",
    icon: "🎯",
    objective: "Construir problemas o retos que culminen en una evidencia útil y evaluable.",
    content: [
      { title: "Pregunta movilizadora", text: "Debe admitir investigación y decisiones: ¿cómo organizamos una jornada inclusiva con el espacio y los materiales disponibles?" },
      { title: "Proceso visible", text: "Planificar, probar, recibir retroalimentación, ajustar y comunicar forman parte del aprendizaje. El producto final no debe ocultar el proceso." },
      { title: "Viabilidad", text: "Reduce el alcance según tiempo, edad y recursos. Un miniproyecto de dos clases bien evaluado puede ser más valioso que una propuesta extensa inconclusa." },
    ],
    application: "Formula un reto para mejorar una pausa activa escolar y define tres evidencias observables.",
    reflection: "¿El reto permite decisiones reales o conduce a una única respuesta prevista por el docente?",
  },
  {
    id: "modelos-pedagogicos",
    module: "Módulo 3 · Modelos y estilos",
    title: "Modelos pedagógicos para Educación Física",
    duration: "35 min",
    icon: "🏟️",
    objective: "Reconocer cuándo utilizar Educación Deportiva, TGfU o Responsabilidad Personal y Social.",
    content: [
      { title: "Educación Deportiva", text: "Organiza una temporada con equipos estables, roles, calendario, registro y evento final. Requiere tiempo suficiente y participación auténtica, no copiar el deporte federado." },
      { title: "TGfU", text: "Parte de juegos modificados y preguntas tácticas para comprender qué hacer y por qué antes de perfeccionar toda la técnica." },
      { title: "Responsabilidad Personal y Social", text: "Integra respeto, esfuerzo, autonomía, ayuda y transferencia fuera de la clase mediante momentos explícitos de reflexión." },
    ],
    application: "Selecciona un modelo para una unidad de seis clases y justifica la elección según el propósito y el grupo.",
    reflection: "¿Dispones del tiempo necesario para aplicar el modelo completo y no solo algunos elementos decorativos?",
  },
  {
    id: "estilos-organizacion",
    module: "Módulo 3 · Modelos y estilos",
    title: "Estilos de enseñanza y estaciones",
    duration: "25 min",
    icon: "🔄",
    objective: "Combinar instrucción directa, enseñanza recíproca, descubrimiento guiado y estaciones de manera estratégica.",
    content: [
      { title: "Decisión profesional", text: "La instrucción directa es adecuada para una consigna de seguridad o una demostración breve; el descubrimiento guiado favorece explorar soluciones con preguntas planificadas." },
      { title: "Enseñanza recíproca", text: "Una pareja practica y otra observa con pocos criterios comprensibles; después intercambian roles. La retroalimentación debe ser respetuosa y concreta." },
      { title: "Estaciones", text: "Organizan la práctica, pero necesitan tiempos realistas, instrucciones visibles, materiales suficientes y rutas que eviten cruces y esperas." },
    ],
    application: "Diseña tres estaciones para cuarenta estudiantes con cuatro balones y participación simultánea.",
    reflection: "¿Qué decisión debe conservar el docente y cuál puede transferir gradualmente al estudiante?",
  },
  {
    id: "dua-seguridad",
    module: "Módulo 4 · Aplicación docente",
    title: "DUA, inclusión y seguridad",
    duration: "30 min",
    icon: "🛡️",
    objective: "Planificar múltiples formas de acceso, participación y expresión sin reducir el propósito de aprendizaje.",
    content: [
      { title: "Representación", text: "Combina explicación breve, demostración, referencias visuales, palabras clave y comprobación de comprensión." },
      { title: "Acción y expresión", text: "Permite demostrar lo aprendido mediante ejecución, explicación, registro, representación o rol equivalente, manteniendo criterios comunes." },
      { title: "Compromiso y seguridad", text: "Ofrece elección significativa, progresiones y alternativas. Revisa espacio, contacto, impacto, fatiga, privacidad y señales para detener la actividad." },
    ],
    application: "Adapta una actividad con salto para que conserve su propósito y ofrezca una alternativa sin salto.",
    reflection: "¿La adaptación permite aprender lo mismo o simplemente mantiene ocupado al estudiante?",
  },
  {
    id: "seleccion-hibridacion",
    module: "Módulo 4 · Aplicación docente",
    title: "Seleccionar, hibridar y evaluar",
    duration: "35 min",
    icon: "🧩",
    objective: "Elegir y combinar enfoques a partir del propósito, las condiciones y las evidencias esperadas.",
    content: [
      { title: "Primero el propósito", text: "Define qué debe comprender o hacer el estudiante. Después analiza edad, experiencia, recursos, espacio, duración y nivel de autonomía." },
      { title: "Hibridación coherente", text: "Combinar enfoques es válido cuando cada uno cumple una función reconocible. Por ejemplo, TGfU para decisiones tácticas y aprendizaje cooperativo para estructurar la ayuda." },
      { title: "Evaluación alineada", text: "Utiliza criterios observables relacionados con el propósito: decisión, ejecución, comunicación, cooperación o mejora. Evita calificar entusiasmo, apariencia o rendimiento sin contexto." },
    ],
    application: "Completa una matriz de decisión y redacta una microsecuencia con enfoque, actividad, adaptación y evidencia.",
    reflection: "¿Puedes explicar en una frase por qué cada enfoque elegido mejora esa clase concreta?",
  },
];

export const academyFinalQuiz: AcademyQuizQuestion[] = [
  { id: "q1", prompt: "¿Cuál opción es un modelo pedagógico?", options: ["Estaciones", "Educación Deportiva", "Descubrimiento guiado", "Trabajo en parejas"], correctIndex: 1, feedback: "Educación Deportiva estructura una unidad o temporada completa." },
  { id: "q2", prompt: "¿Qué distingue al aprendizaje cooperativo?", options: ["Agrupar al alumnado", "Dar una nota grupal", "Interdependencia positiva y responsabilidad individual", "Evitar toda intervención docente"], correctIndex: 2, feedback: "Cooperar exige una meta compartida y aportes individuales verificables." },
  { id: "q3", prompt: "En ABJ, el juego…", options: ["Es el medio principal para aprender", "Solo entrega puntos", "Siempre debe ser competitivo", "Reemplaza la evaluación"], correctIndex: 0, feedback: "En ABJ, las decisiones y reglas del juego se conectan con el aprendizaje." },
  { id: "q4", prompt: "Una pregunta movilizadora adecuada…", options: ["Tiene una respuesta memorizada", "Permite investigar y tomar decisiones", "Evita producir evidencias", "No considera recursos"], correctIndex: 1, feedback: "Los proyectos y retos requieren decisiones y un producto o evidencia auténtica." },
  { id: "q5", prompt: "TGfU comienza preferentemente con…", options: ["Un examen escrito", "Técnica aislada durante toda la unidad", "Un juego modificado y preguntas tácticas", "Clasificaciones públicas"], correctIndex: 2, feedback: "TGfU parte de situaciones de juego para comprender problemas tácticos." },
  { id: "q6", prompt: "Las estaciones son principalmente…", options: ["Una forma de organización", "Un modelo pedagógico", "Una teoría del aprendizaje", "Un tipo de evaluación"], correctIndex: 0, feedback: "Las estaciones organizan espacio, tiempo, materiales y participación." },
  { id: "q7", prompt: "Una adaptación DUA adecuada…", options: ["Reduce siempre el objetivo", "Mantiene el propósito y ofrece otra vía", "Separa al estudiante", "Elimina los criterios"], correctIndex: 1, feedback: "La alternativa debe conservar el propósito de aprendizaje." },
  { id: "q8", prompt: "Para seleccionar una metodología se debe comenzar por…", options: ["La tendencia más popular", "Los puntos y premios", "El propósito y las condiciones reales", "La cantidad de tecnología"], correctIndex: 2, feedback: "La decisión parte del aprendizaje esperado y del contexto." },
];

export const academyLessonIds = academyLessons.map((lesson) => lesson.id);
