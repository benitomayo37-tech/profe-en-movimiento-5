"use client";

import type { MovementExercise } from "../types";

interface MovementExerciseCardProps {
  exercise: MovementExercise;
  accent?: "emerald" | "rose" | "violet" | "blue";
  isOpen: boolean;
  onToggle: () => void;
}

const accentStyles = {
  emerald: {
    openBorder: "border-emerald-300 ring-2 ring-emerald-100",
    hoverBorder: "border-slate-200 hover:border-emerald-200",
    badge: "bg-emerald-100 text-emerald-700",
    iconOpen: "bg-emerald-600 text-white",
    iconClosed: "bg-emerald-50 text-emerald-700",
    focus: "focus:ring-emerald-100",
    benefitsBorder: "border-emerald-100 bg-emerald-50",
    benefitsTitle: "text-emerald-700",
    benefitsText: "text-emerald-900",
  },
  rose: {
    openBorder: "border-rose-300 ring-2 ring-rose-100",
    hoverBorder: "border-slate-200 hover:border-rose-200",
    badge: "bg-rose-100 text-rose-700",
    iconOpen: "bg-rose-600 text-white",
    iconClosed: "bg-rose-50 text-rose-700",
    focus: "focus:ring-rose-100",
    benefitsBorder: "border-rose-100 bg-rose-50",
    benefitsTitle: "text-rose-700",
    benefitsText: "text-rose-900",
  },
  violet: {
    openBorder: "border-violet-300 ring-2 ring-violet-100",
    hoverBorder: "border-slate-200 hover:border-violet-200",
    badge: "bg-violet-100 text-violet-700",
    iconOpen: "bg-violet-600 text-white",
    iconClosed: "bg-violet-50 text-violet-700",
    focus: "focus:ring-violet-100",
    benefitsBorder: "border-violet-100 bg-violet-50",
    benefitsTitle: "text-violet-700",
    benefitsText: "text-violet-900",
  },
  blue: {
    openBorder: "border-blue-300 ring-2 ring-blue-100",
    hoverBorder: "border-slate-200 hover:border-blue-200",
    badge: "bg-blue-100 text-blue-700",
    iconOpen: "bg-blue-600 text-white",
    iconClosed: "bg-blue-50 text-blue-700",
    focus: "focus:ring-blue-100",
    benefitsBorder: "border-blue-100 bg-blue-50",
    benefitsTitle: "text-blue-700",
    benefitsText: "text-blue-900",
  },
} as const;

const goalLabels: Record<string, string> = {
  mobility: "Movilidad",
  strength: "Fuerza",
  balance: "Equilibrio",
  endurance: "Resistencia",
  coordination: "Coordinación",
  flexibility: "Flexibilidad",
  "functional-autonomy": "Autonomía",
  "fall-prevention": "Prevención de caídas",
  "gentle-activity": "Actividad suave",
};

export default function MovementExerciseCard({
  exercise,
  accent = "emerald",
  isOpen,
  onToggle,
}: MovementExerciseCardProps) {
  const styles = accentStyles[accent];

  return (
    <article
      className={`overflow-hidden rounded-2xl border bg-white shadow-sm transition ${
        isOpen ? styles.openBorder : styles.hoverBorder
      }`}
    >
      <button
        type="button"
        aria-expanded={isOpen}
        aria-controls={`exercise-${exercise.id}`}
        onClick={onToggle}
        className={`flex w-full items-center justify-between gap-4 p-5 text-left transition hover:bg-slate-50 focus:outline-none focus:ring-4 sm:p-6 ${styles.focus}`}
      >
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <h4 className="text-lg font-black text-slate-950">
              {exercise.title}
            </h4>

            <span
              className={`rounded-full px-3 py-1 text-[10px] font-black uppercase tracking-wide ${styles.badge}`}
            >
              {exercise.difficulty === "basic"
                ? "Básico"
                : exercise.difficulty === "intermediate"
                  ? "Intermedio"
                  : "Avanzado"}
            </span>
          </div>

          <p className="mt-2 text-sm leading-6 text-slate-600">
            {exercise.objective}
          </p>

          <div className="mt-3 flex flex-wrap gap-2">
            {exercise.goals.map((goal) => (
              <span
                key={goal}
                className="rounded-full bg-slate-100 px-2.5 py-1 text-[10px] font-bold text-slate-600"
              >
                {goalLabels[goal] ?? goal}
              </span>
            ))}
          </div>
        </div>

        <span
          aria-hidden="true"
          className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full font-black transition ${
            isOpen ? styles.iconOpen : styles.iconClosed
          }`}
        >
          {isOpen ? "−" : "+"}
        </span>
      </button>

      {isOpen ? (
        <div
          id={`exercise-${exercise.id}`}
          className="border-t border-slate-200 bg-slate-50 p-5 sm:p-6"
        >
          <div className="grid gap-4">
            <section className="rounded-2xl border border-slate-200 bg-white p-5">
              <p className="text-xs font-black uppercase tracking-wide text-slate-500">
                Cómo realizarlo
              </p>

              <ol className="mt-3 list-decimal space-y-2 pl-5 text-sm leading-6 text-slate-700">
                {exercise.instructions.map((instruction) => (
                  <li key={instruction}>{instruction}</li>
                ))}
              </ol>
            </section>

            <div className="grid gap-4 sm:grid-cols-2">
              <section
                className={`rounded-2xl border p-5 ${styles.benefitsBorder}`}
              >
                <p
                  className={`text-xs font-black uppercase tracking-wide ${styles.benefitsTitle}`}
                >
                  Beneficios
                </p>

                <ul
                  className={`mt-3 space-y-2 text-sm leading-6 ${styles.benefitsText}`}
                >
                  {exercise.benefits.map((benefit) => (
                    <li key={benefit}>✓ {benefit}</li>
                  ))}
                </ul>
              </section>

              {exercise.adaptations?.length ? (
                <section className="rounded-2xl border border-blue-100 bg-blue-50 p-5">
                  <p className="text-xs font-black uppercase tracking-wide text-blue-700">
                    Adaptaciones
                  </p>

                  <ul className="mt-3 space-y-2 text-sm leading-6 text-blue-900">
                    {exercise.adaptations.map((adaptation) => (
                      <li key={adaptation}>• {adaptation}</li>
                    ))}
                  </ul>
                </section>
              ) : null}
            </div>

            <section className="rounded-2xl border border-amber-100 bg-amber-50 p-5">
              <p className="text-xs font-black uppercase tracking-wide text-amber-700">
                Seguridad
              </p>

              <ul className="mt-3 space-y-2 text-sm leading-6 text-amber-900">
                {exercise.safety.map((item) => (
                  <li key={item}>⚠ {item}</li>
                ))}
              </ul>
            </section>

            <section className="rounded-2xl border border-rose-100 bg-rose-50 p-5">
              <p className="text-xs font-black uppercase tracking-wide text-rose-700">
                Detener si...
              </p>

              <ul className="mt-3 space-y-2 text-sm leading-6 text-rose-900">
                {exercise.stopIf.map((item) => (
                  <li key={item}>🛑 {item}</li>
                ))}
              </ul>
            </section>

            {exercise.contraindications?.length ? (
              <section className="rounded-2xl border border-red-200 bg-red-50 p-5">
                <p className="text-xs font-black uppercase tracking-wide text-red-700">
                  Precauciones especiales
                </p>

                <ul className="mt-3 space-y-2 text-sm leading-6 text-red-900">
                  {exercise.contraindications.map((item) => (
                    <li key={item}>• {item}</li>
                  ))}
                </ul>
              </section>
            ) : null}
          </div>
        </div>
      ) : null}
    </article>
  );
}