"use client";

import Image from "next/image";
import Link from "next/link";
import {
  FormEvent,
  useMemo,
  useState,
} from "react";

interface QuickActionsProps {
  userName: string;
}

interface AssistantAction {
  title: string;
  shortLabel: string;
  description: string;
  href: string;
  icon: string;
  access: string;
  keywords: string[];
}

const actions: AssistantAction[] = [
  {
    title: "Agentes IA",
    shortLabel: "Trabajar con Agentes IA",
    description:
      "Coordina planificación, evaluación e inclusión mediante una conversación guiada.",
    href: "/agentes",
    icon: "🧠",
    access: "Free + Pro",
    keywords: [
      "agente",
      "conversacion",
      "coordinar",
      "inclusion",
      "dua",
      "nee",
    ],
  },
  {
    title: "Profe IA",
    shortLabel: "Planificar una clase",
    description:
      "Crea planificaciones, rúbricas, actividades y recursos educativos.",
    href: "/ai",
    icon: "✨",
    access: "Free + Pro",
    keywords: [
      "clase",
      "planificacion",
      "planificar",
      "rubrica",
      "actividad",
      "docente",
      "educacion fisica",
    ],
  },
  {
    title: "Entrenador IA",
    shortLabel: "Crear un entrenamiento",
    description:
      "Diseña sesiones, microciclos, mesociclos y macrociclos deportivos.",
    href: "/entrenador-ia",
    icon: "🏅",
    access: "Free + Pro",
    keywords: [
      "entrenamiento",
      "entrenador",
      "sesion",
      "microciclo",
      "mesociclo",
      "macrociclo",
      "deporte",
    ],
  },
  {
    title: "Planificador Físico",
    shortLabel: "Organizar la carga física",
    description:
      "Organiza carga, intervalos, recuperación y progresión de una sesión física.",
    href: "/planificador-fisico",
    icon: "🏃",
    access: "Free + Pro",
    keywords: [
      "fisico",
      "carga",
      "intervalo",
      "recuperacion",
      "fuerza",
      "resistencia",
      "velocidad",
    ],
  },
  {
    title: "Exámenes estudiantiles",
    shortLabel: "Crear una evaluación",
    description:
      "Prepara evaluaciones con código y consulta resultados y calificaciones.",
    href: "/examenes",
    icon: "📝",
    access: "Catálogo",
    keywords: [
      "examen",
      "evaluacion",
      "prueba",
      "preguntas",
      "calificacion",
      "resultado",
    ],
  },
  {
    title: "App para profes",
    shortLabel: "Usar una herramienta rápida",
    description:
      "Accede a herramientas para organizar y dinamizar tus clases.",
    href: "/apps",
    icon: "📱",
    access: "Free + Pro",
    keywords: [
      "app",
      "herramienta",
      "cronometro",
      "marcador",
      "sorteo",
      "equipos",
      "ruleta",
    ],
  },
  {
    title: "Recursos",
    shortLabel: "Buscar recursos",
    description:
      "Encuentra materiales, guías y contenidos listos para utilizar.",
    href: "/resources",
    icon: "📚",
    access: "Free + Pro",
    keywords: [
      "recurso",
      "material",
      "guia",
      "biblioteca",
      "documento",
      "descargar",
    ],
  },
  {
    title: "MueveSeguro",
    shortLabel: "Registrar o prevenir un incidente",
    description:
      "Previene riesgos, registra incidentes y realiza su seguimiento.",
    href: "/mueve-seguro",
    icon: "🛡️",
    access: "Free + Pro",
    keywords: [
      "seguridad",
      "incidente",
      "riesgo",
      "accidente",
      "seguimiento",
      "mueveseguro",
    ],
  },
  {
    title: "Movimiento para Todos",
    shortLabel: "Trabajar inclusión y adaptación",
    description:
      "Consulta actividad física adaptada y recursos para acompañantes.",
    href: "/movimiento-para-todos",
    icon: "🌎",
    access: "Free + Pro",
    keywords: [
      "inclusion",
      "adaptada",
      "discapacidad",
      "movilidad",
      "acompanamiento",
      "cuidador",
    ],
  },
  {
    title: "Actualidad Deportiva",
    shortLabel: "Consultar noticias deportivas",
    description:
      "Revisa noticias de fútbol, NBA, MLB, MMA y otros deportes.",
    href: "/actualidad-deportiva",
    icon: "📰",
    access: "Gratis",
    keywords: [
      "noticia",
      "actualidad",
      "futbol",
      "nba",
      "mlb",
      "mma",
      "liga ecuatoriana",
    ],
  },
];

const suggestedActions = actions.slice(1, 6);

function normalizeText(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();
}

function findBestAction(query: string) {
  const normalizedQuery = normalizeText(query);

  if (!normalizedQuery) {
    return null;
  }

  const scoredActions = actions
    .map((action) => {
      const searchableText = normalizeText(
        [
          action.title,
          action.shortLabel,
          action.description,
          ...action.keywords,
        ].join(" "),
      );

      const score = action.keywords.reduce(
        (total, keyword) =>
          normalizedQuery.includes(
            normalizeText(keyword),
          )
            ? total + 3
            : total,
        searchableText.includes(normalizedQuery)
          ? 2
          : 0,
      );

      return {
        action,
        score,
      };
    })
    .sort((first, second) =>
      second.score - first.score,
    );

  return scoredActions[0]?.score > 0
    ? scoredActions[0].action
    : null;
}

export default function QuickActions({
  userName,
}: QuickActionsProps) {
  const [query, setQuery] = useState("");
  const [selectedAction, setSelectedAction] =
    useState<AssistantAction | null>(null);
  const [showFallback, setShowFallback] =
    useState(false);

  const greeting = useMemo(
    () =>
      userName.trim()
        ? `Hola, ${userName}`
        : "Hola, profe",
    [userName],
  );

  function selectAction(action: AssistantAction) {
    setSelectedAction(action);
    setShowFallback(false);
  }

  function handleSubmit(
    event: FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();

    const match = findBestAction(query);

    setSelectedAction(match);
    setShowFallback(!match);
  }

  return (
    <section
      aria-labelledby="virtual-assistant-title"
      className="overflow-hidden rounded-[2rem] border border-blue-200 bg-gradient-to-br from-slate-950 via-blue-950 to-blue-800 text-white shadow-2xl shadow-blue-950/20"
    >
      <div className="grid items-start lg:grid-cols-[280px_minmax(0,1fr)]">
        <div className="relative h-72 overflow-hidden border-b border-white/10 bg-blue-950 sm:h-80 lg:h-[410px] lg:self-start lg:border-b-0 lg:border-r">
          <Image
            src="/images/mascota-asistente-animada.webp"
            alt="Robot asistente animado de Profe en Movimiento"
            fill
            unoptimized
            priority
            sizes="(max-width: 1024px) 100vw, 280px"
            className="object-cover object-top"
          />


          <div
            className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-blue-950 to-transparent"
            aria-hidden="true"
          />

          <div className="absolute inset-x-5 bottom-5 rounded-2xl border border-white/15 bg-slate-950/70 p-4 backdrop-blur-md">
            <p className="text-xs font-black uppercase tracking-[0.18em] text-orange-300">
              Asistente de la plataforma
            </p>
            <p className="mt-1 text-sm font-semibold text-blue-100">
              Estoy aquí para ayudarte a encontrar la herramienta adecuada.
            </p>
          </div>
        </div>

        <div className="p-6 sm:p-8 lg:p-10">
          <p className="text-sm font-black uppercase tracking-[0.18em] text-orange-300">
            Tu asistente virtual
          </p>

          <h2
            id="virtual-assistant-title"
            className="mt-3 text-3xl font-black tracking-tight sm:text-4xl"
          >
            {greeting} 👋
          </h2>

          <p className="mt-3 max-w-2xl text-base leading-7 text-blue-100">
            ¿Qué deseas hacer hoy? Cuéntame lo que necesitas y te guiaré hacia la mejor herramienta.
          </p>

          <form
            onSubmit={handleSubmit}
            className="mt-7"
          >
            <label
              htmlFor="assistant-query"
              className="sr-only"
            >
              Escribe lo que necesitas
            </label>

            <div className="flex flex-col gap-3 sm:flex-row">
              <input
                id="assistant-query"
                type="text"
                value={query}
                onChange={(event) =>
                  setQuery(event.target.value)
                }
                placeholder="Ejemplo: necesito planificar una clase de baloncesto"
                className="min-h-14 min-w-0 flex-1 rounded-2xl border border-white/20 bg-white px-5 text-sm font-semibold text-slate-950 outline-none placeholder:text-slate-500 focus:border-orange-400 focus:ring-4 focus:ring-orange-400/20"
              />

              <button
                type="submit"
                className="min-h-14 rounded-2xl bg-orange-500 px-7 font-black text-white shadow-lg shadow-orange-950/30 transition hover:-translate-y-0.5 hover:bg-orange-400 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-orange-300/40"
              >
                Orientarme
              </button>
            </div>
          </form>

          <div className="mt-5 flex flex-wrap gap-2">
            {suggestedActions.map((action) => (
              <button
                key={action.title}
                type="button"
                onClick={() => selectAction(action)}
                className="rounded-full border border-white/15 bg-white/10 px-4 py-2 text-xs font-bold text-blue-50 transition hover:border-orange-300 hover:bg-white/15 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-blue-300/30"
              >
                <span
                  aria-hidden="true"
                  className="mr-2"
                >
                  {action.icon}
                </span>
                {action.shortLabel}
              </button>
            ))}
          </div>

          {selectedAction ? (
            <div
              className="mt-7 rounded-3xl border border-emerald-300/30 bg-emerald-400/10 p-5"
              aria-live="polite"
            >
              <div className="flex items-start gap-4">
                <span
                  aria-hidden="true"
                  className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-white/10 text-2xl"
                >
                  {selectedAction.icon}
                </span>

                <div className="min-w-0">
                  <p className="text-xs font-black uppercase tracking-[0.16em] text-emerald-300">
                    Te recomiendo
                  </p>

                  <h3 className="mt-1 text-xl font-black">
                    {selectedAction.title}
                  </h3>

                  <p className="mt-2 text-sm leading-6 text-blue-100">
                    {selectedAction.description}
                  </p>

                  <Link
                    href={selectedAction.href}
                    className="mt-4 inline-flex min-h-11 items-center rounded-xl bg-blue-500 px-5 py-2.5 text-sm font-black text-white transition hover:bg-blue-400 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-blue-300/40"
                  >
                    Abrir {selectedAction.title}
                    <span
                      aria-hidden="true"
                      className="ml-2"
                    >
                      →
                    </span>
                  </Link>
                </div>
              </div>
            </div>
          ) : null}

          {showFallback ? (
            <div
              className="mt-7 rounded-3xl border border-orange-300/30 bg-orange-400/10 p-5"
              aria-live="polite"
            >
              <p className="font-black">
                Necesito un poco más de información.
              </p>
              <p className="mt-2 text-sm leading-6 text-blue-100">
                Puedes escribir, por ejemplo: “crear una evaluación”, “registrar un incidente” o “usar el cronómetro”.
              </p>
            </div>
          ) : null}

          <details className="mt-8 border-t border-white/15 pt-6">
            <summary className="cursor-pointer text-sm font-black text-blue-100 transition hover:text-white">
              Ver todas las herramientas
            </summary>

            <div className="mt-5 grid gap-3 sm:grid-cols-2">
              {actions.map((action) => (
                <Link
                  key={action.title}
                  href={action.href}
                  className="group flex items-center gap-3 rounded-2xl border border-white/10 bg-white/5 p-3 transition hover:border-blue-300/40 hover:bg-white/10 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-blue-300/30"
                >
                  <span
                    aria-hidden="true"
                    className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white/10 text-lg"
                  >
                    {action.icon}
                  </span>

                  <span className="min-w-0">
                    <span className="block text-sm font-black">
                      {action.title}
                    </span>
                    <span className="mt-0.5 block text-[10px] font-bold uppercase tracking-wide text-blue-300">
                      {action.access}
                    </span>
                  </span>

                  <span
                    aria-hidden="true"
                    className="ml-auto text-blue-300 transition group-hover:translate-x-1"
                  >
                    →
                  </span>
                </Link>
              ))}
            </div>
          </details>
        </div>
      </div>
    </section>
  );
}