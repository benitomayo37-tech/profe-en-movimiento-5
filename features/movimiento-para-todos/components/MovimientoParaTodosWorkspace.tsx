"use client";

import Link from "next/link";
import { useState } from "react";
import { useSearchParams } from "next/navigation";

import { movementCategories } from "../data/categories";
import { movementLibraryResources } from "../data/library";
import MovementExerciseCard from "./MovementExerciseCard";
import ProUpgradeDialog from "@/features/auth/components/ProUpgradeDialog";
import {
  isFreeCaregiverGuidance,
  isFreeExercise,
} from "../data/access";
import {
  olderAdultsFallPrevention,
  olderAdultsFlexibility,
  olderAdultsSafety,
} from "../data/olderAdults";
import {
  caregiverSafetyNotice,
  movementDisclaimer,
  movementSafetyNotice,
} from "../utils/safety";
import type {
  MovementAudience,
  MovementExercise,
  MovementManeuver,
} from "../types";

const quickOptions = [
  {
    label: "Ejercicios",
    description: "Ideas prácticas de actividad física adaptada.",
    href: "#categorias",
  },
  {
    label: "Ayudar a una persona",
    description: "Orientaciones generales para acompañar y movilizar.",
    href: "#movilidad-reducida",
  },
  {
    label: "Prevención",
    description: "Recomendaciones para reducir riesgos durante el movimiento.",
    href: "#seguridad",
  },
  {
    label: "Movilidad",
    description: "Propuestas para conservar o favorecer el movimiento.",
    href: "#categorias",
  },
  {
    label: "Cuidados",
    description: "Orientaciones para personas que acompañan o cuidan.",
    href: "#movilidad-reducida",
  },
  {
    label: "Seguridad",
    description: "Señales para detenerse y pedir ayuda adecuada.",
    href: "#seguridad",
  },
];

const categoryStyles: Record<
  MovementAudience,
  { border: string; background: string; iconBackground: string }
> = {
  "older-adults": {
    border: "border-emerald-200",
    background: "bg-emerald-50/60",
    iconBackground: "bg-emerald-100",
  },
  "chronic-diseases": {
    border: "border-rose-200",
    background: "bg-rose-50/60",
    iconBackground: "bg-rose-100",
  },
  prenatal: {
    border: "border-violet-200",
    background: "bg-violet-50/60",
    iconBackground: "bg-violet-100",
  },
  "reduced-mobility": {
    border: "border-blue-200",
    background: "bg-blue-50/60",
    iconBackground: "bg-blue-100",
  },
};

interface MovimientoParaTodosWorkspaceProps {
  hasProAccess: boolean;
  olderAdultsExercises: MovementExercise[];
  chronicDiseasesExercises: MovementExercise[];
  prenatalExercises: MovementExercise[];
  reducedMobilityExercises: MovementExercise[];
  caregiverGuidance: MovementManeuver[];
}

export default function MovimientoParaTodosWorkspace({
  hasProAccess,
  olderAdultsExercises,
  chronicDiseasesExercises,
  prenatalExercises,
  reducedMobilityExercises,
  caregiverGuidance,
}: MovimientoParaTodosWorkspaceProps) {
  const searchParams = useSearchParams();
  const [openExerciseId, setOpenExerciseId] = useState<string | null>(null);
  const [openCaregiverId, setOpenCaregiverId] = useState<string | null>(null);
  const [lockedContentTitle, setLockedContentTitle] = useState<string | null>(null);
  const selectedCategory = searchParams.get("categoria") as MovementAudience | null;

  const selected = movementCategories.find(
    (category) => category.id === selectedCategory,
  );

  return (
    <div className="space-y-8">
      <section className="relative overflow-hidden rounded-[2rem] bg-gradient-to-br from-[#071532] via-[#0b3c67] to-emerald-700 px-6 py-10 text-white shadow-2xl sm:px-10 lg:px-12 lg:py-14">
        <div className="absolute -right-20 -top-24 h-80 w-80 rounded-full border-[50px] border-white/5" />
        <div className="absolute -bottom-28 -left-20 h-72 w-72 rounded-full border-[45px] border-emerald-300/10" />

        <div className="relative max-w-4xl">
          <span className="inline-flex rounded-full border border-emerald-200/30 bg-emerald-300/10 px-4 py-2 text-xs font-black uppercase tracking-[0.2em] text-emerald-200">
            Actividad física adaptada
          </span>

          <h1 className="mt-5 text-4xl font-black tracking-tight sm:text-5xl">
            Movimiento para Todos
          </h1>

          <p className="mt-3 text-xl font-black text-orange-300">
            Movimiento seguro, adaptado e inclusivo.
          </p>

          <p className="mt-5 max-w-3xl text-base leading-8 text-blue-100 sm:text-lg">
            Un espacio educativo para encontrar orientaciones prácticas sobre
            actividad física, movilidad y acompañamiento de diferentes personas,
            respetando sus posibilidades y necesidades.
          </p>

          <div className="mt-7 flex flex-col gap-3 sm:flex-row">
            <Link
              href="#categorias"
              className="inline-flex min-h-12 items-center justify-center rounded-xl bg-orange-500 px-6 py-3 text-sm font-black text-white shadow-lg transition hover:bg-orange-600"
            >
              Explorar categorías
            </Link>

            <Link
              href="#seguridad"
              className="inline-flex min-h-12 items-center justify-center rounded-xl border border-white/20 bg-white/10 px-6 py-3 text-sm font-black text-white backdrop-blur transition hover:bg-white/20"
            >
              Antes de comenzar
            </Link>
          </div>
        </div>
      </section>

      <section
        id="seguridad"
        className="rounded-3xl border border-amber-200 bg-amber-50 p-6 shadow-sm"
      >
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-amber-100 text-xl">
            ⚠️
          </div>

          <div>
            <h2 className="text-lg font-black text-amber-950">
              {movementSafetyNotice.title}
            </h2>

            <p className="mt-2 max-w-4xl text-sm leading-7 text-amber-900">
              {movementSafetyNotice.description}
            </p>
          </div>
        </div>
      </section>

      <section>
        <div className="mb-5">
          <p className="text-xs font-black uppercase tracking-[0.16em] text-emerald-600">
            Explora
          </p>

          <h2 className="mt-2 text-2xl font-black tracking-tight text-slate-950">
            ¿Qué estás buscando?
          </h2>

          <p className="mt-2 max-w-2xl text-sm leading-7 text-slate-500">
            Empieza por el tipo de orientación que necesitas.
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {quickOptions.map((option) => (
            <Link
              key={option.label}
              href={option.href}
              className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:border-emerald-200 hover:shadow-md"
            >
              <h3 className="font-black text-slate-950">{option.label}</h3>
              <p className="mt-2 text-sm leading-6 text-slate-500">
                {option.description}
              </p>
            </Link>
          ))}
        </div>
      </section>

      <section id="categorias">
        <div className="mb-5">
          <p className="text-xs font-black uppercase tracking-[0.16em] text-emerald-600">
            Poblaciones
          </p>

          <h2 className="mt-2 text-2xl font-black tracking-tight text-slate-950">
            ¿A quién quieres ayudar?
          </h2>

          <p className="mt-2 max-w-3xl text-sm leading-7 text-slate-500">
            Selecciona una población para descubrir posteriormente ejercicios,
            adaptaciones, recomendaciones y contenidos específicos.
          </p>
        </div>

        <div className="grid gap-5 md:grid-cols-2">
          {movementCategories.map((category) => {
            const styles = categoryStyles[category.id];
            const isSelected = selectedCategory === category.id;

            return (
              <Link
                key={category.id}
                href={`/movimiento-para-todos?categoria=${category.id}`}
                className={`group rounded-3xl border p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-lg ${styles.border} ${styles.background} ${
                  isSelected ? "ring-2 ring-emerald-500 ring-offset-2" : ""
                }`}
              >
                <div className="flex items-start gap-4">
                  <div
                    className={`flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl text-2xl ${styles.iconBackground}`}
                  >
                    {category.icon}
                  </div>

                  <div>
                    <h3 className="text-xl font-black text-slate-950">
                      {category.title}
                    </h3>

                    <p className="mt-2 text-sm leading-7 text-slate-600">
                      {category.description}
                    </p>

                    <span className="mt-4 inline-flex text-sm font-black text-slate-700 group-hover:text-emerald-700">
                      Explorar →
                    </span>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      </section>

           {selected && (
        <section
          className="space-y-6"
          aria-live="polite"
        >
          <div className="rounded-3xl border border-emerald-200 bg-emerald-50 p-6">
            <p className="text-xs font-black uppercase tracking-[0.16em] text-emerald-700">
              Categoría seleccionada
            </p>

            <h2 className="mt-2 text-2xl font-black text-emerald-950">
              {selected.title}
            </h2>

            <p className="mt-2 max-w-3xl text-sm leading-7 text-emerald-900">
              {selected.description}
            </p>
          </div>

          {selected.id === "older-adults" && (
            <>
              <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
                <div className="mb-6">
                  <p className="text-xs font-black uppercase tracking-[0.16em] text-emerald-600">
                    Ejercicios prácticos
                  </p>

                  <h3 className="mt-2 text-2xl font-black tracking-tight text-slate-950">
                    Movimiento para adultos mayores
                  </h3>

                  <p className="mt-2 max-w-3xl text-sm leading-7 text-slate-600">
                    Propuestas adaptables para trabajar fuerza, movilidad,
                    equilibrio, coordinación, resistencia y autonomía funcional.
                  </p>
                </div>

                <div className="grid gap-5 lg:grid-cols-2">
                  {olderAdultsExercises.map((exercise) => {
  const isOpen = openExerciseId === exercise.id;
  const isLocked = !isFreeExercise(exercise.id) && !hasProAccess;

  return (
    <article
      key={exercise.id}
      className={`overflow-hidden rounded-2xl border bg-white shadow-sm transition ${
        isOpen
          ? "border-emerald-300 ring-2 ring-emerald-100"
          : "border-slate-200 hover:border-emerald-200"
      }`}
    >
     <button
  type="button"
  aria-expanded={isOpen}
  aria-controls={`exercise-${exercise.id}`}
  onClick={() => {
    if (isLocked) {
      setLockedContentTitle(exercise.title);
      return;
    }
    setOpenExerciseId(isOpen ? null : exercise.id);
  }}
  className="flex w-full items-center justify-between gap-4 p-5 text-left transition hover:bg-slate-50 focus:outline-none focus:ring-4 focus:ring-emerald-100 sm:p-6"
>
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <h4 className="text-lg font-black text-slate-950">
              {exercise.title}
            </h4>

            <span className="rounded-full bg-emerald-100 px-3 py-1 text-[10px] font-black uppercase tracking-wide text-emerald-700">
              {exercise.difficulty === "basic"
                ? "Básico"
                : exercise.difficulty === "intermediate"
                  ? "Intermedio"
                  : "Avanzado"}
            </span>

            <span className={`rounded-full px-3 py-1 text-[10px] font-black uppercase tracking-wide ${isFreeExercise(exercise.id) ? "bg-emerald-100 text-emerald-700" : "bg-violet-100 text-violet-700"}`}>
              {isFreeExercise(exercise.id) ? "Free" : "Pro"}
            </span>
          </div>

          <p className="mt-2 text-sm leading-6 text-slate-600">
            {exercise.objective}
          </p>

          <div className="mt-3 flex flex-wrap gap-2">
            {exercise.goals.map((goal) => {
              const labels: Record<string, string> = {
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

              return (
                <span
                  key={goal}
                  className="rounded-full bg-slate-100 px-2.5 py-1 text-[10px] font-bold text-slate-600"
                >
                  {labels[goal] ?? goal}
                </span>
              );
            })}
          </div>
        </div>

        <span
          aria-hidden="true"
          className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full font-black transition ${
            isOpen
              ? "bg-emerald-600 text-white"
              : "bg-emerald-50 text-emerald-700"
          }`}
        >
          {isLocked ? "🔒" : isOpen ? "−" : "+"}
        </span>
      </button>

      {isOpen && !isLocked && (
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
              <section className="rounded-2xl border border-emerald-100 bg-emerald-50 p-5">
                <p className="text-xs font-black uppercase tracking-wide text-emerald-700">
                  Beneficios
                </p>

                <ul className="mt-3 space-y-2 text-sm leading-6 text-emerald-900">
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
      )}
    </article>
  );
})}
                
</div>
</section>

              <section className="rounded-3xl border border-violet-200 bg-violet-50 p-6 shadow-sm sm:p-8">
                <p className="text-xs font-black uppercase tracking-[0.16em] text-violet-700">
                  Movilidad y flexibilidad
                </p>

                <h3 className="mt-2 text-2xl font-black text-violet-950">
                  Movimiento suave
                </h3>

                <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {olderAdultsFlexibility.map((item) => (
                    <article
                      key={item.id}
                      className="rounded-2xl border border-violet-200 bg-white p-5"
                    >
                      <h4 className="font-black text-slate-950">
                        {item.title}
                      </h4>

                      <p className="mt-2 text-sm leading-6 text-slate-600">
                        {item.description}
                      </p>
                    </article>
                  ))}
                </div>

                <p className="mt-5 rounded-2xl border border-violet-200 bg-white p-4 text-sm font-semibold leading-6 text-violet-900">
                  Realiza los movimientos lentamente y dentro de un rango
                  cómodo. No fuerces ni rebotes durante los estiramientos.
                </p>
              </section>

              <section className="rounded-3xl border border-orange-200 bg-orange-50 p-6 shadow-sm sm:p-8">
                <p className="text-xs font-black uppercase tracking-[0.16em] text-orange-700">
                  Prevención
                </p>

                <h3 className="mt-2 text-2xl font-black text-orange-950">
                  {olderAdultsFallPrevention.title}
                </h3>

                <p className="mt-3 max-w-3xl text-sm leading-7 text-orange-900">
                  {olderAdultsFallPrevention.description}
                </p>

                <ul className="mt-5 grid gap-3 sm:grid-cols-2">
                  {olderAdultsFallPrevention.recommendations.map(
                    (recommendation) => (
                      <li
                        key={recommendation}
                        className="rounded-xl border border-orange-200 bg-white p-4 text-sm leading-6 text-slate-700"
                      >
                        <span className="font-black text-orange-600">✓</span>{" "}
                        {recommendation}
                      </li>
                    ),
                  )}
                </ul>
              </section>

              <section className="rounded-3xl border border-amber-200 bg-amber-50 p-6 shadow-sm sm:p-8">
                <p className="text-xs font-black uppercase tracking-[0.16em] text-amber-700">
                  Seguridad
                </p>

                <h3 className="mt-2 text-2xl font-black text-amber-950">
                  {olderAdultsSafety.title}
                </h3>

                <ul className="mt-5 grid gap-3 sm:grid-cols-2">
                  {olderAdultsSafety.recommendations.map((recommendation) => (
                    <li
                      key={recommendation}
                      className="rounded-xl border border-amber-200 bg-white p-4 text-sm leading-6 text-slate-700"
                    >
                      <span className="font-black text-amber-600">✓</span>{" "}
                      {recommendation}
                    </li>
                  ))}
                </ul>

                <div className="mt-6 rounded-2xl border border-rose-200 bg-rose-50 p-5">
                  <p className="text-sm font-black uppercase tracking-wide text-rose-700">
                    Detén la actividad si aparece:
                  </p>

                  <ul className="mt-3 grid gap-2 sm:grid-cols-2">
                    {olderAdultsSafety.stopIf.map((signal) => (
                      <li
                        key={signal}
                        className="text-sm leading-6 text-rose-900"
                      >
                        • {signal}
                      </li>
                    ))}
                  </ul>
                </div>
              </section>
            </>
          )}
        </section>
      )}

      {selected?.id === "chronic-diseases" && (
        <>
          <section className="rounded-3xl border border-rose-200 bg-rose-50 p-6 shadow-sm sm:p-8">
            <p className="text-xs font-black uppercase tracking-[0.16em] text-rose-700">
              Enfermedades crónicas
            </p>

            <h3 className="mt-2 text-2xl font-black text-rose-950">
              Movimiento adaptado para cuidar la salud
            </h3>

            <p className="mt-3 max-w-3xl text-sm leading-7 text-rose-900">
              La actividad física regular puede formar parte del cuidado de
              personas con hipertensión, diabetes tipo 2 u obesidad. No es
              necesario comenzar con grandes cantidades de ejercicio: cuando
              existe poca actividad, pequeñas cantidades de movimiento también
              aportan beneficios y pueden aumentarse progresivamente según las
              capacidades y condiciones individuales.
            </p>

            <div className="mt-5 rounded-2xl border border-rose-200 bg-white p-5">
              <p className="font-black text-slate-950">
                Importante
              </p>

              <p className="mt-2 text-sm leading-7 text-slate-600">
                Esta herramienta ofrece orientación educativa general. No
                diagnostica, no modifica medicamentos, no establece tratamientos
                y no sustituye una valoración ni las indicaciones de un
                profesional de salud.
              </p>

              <p className="mt-3 text-sm leading-7 text-slate-600">
                Si tienes una enfermedad crónica, complicaciones, síntomas
                nuevos o dudas sobre qué actividad puedes realizar, consulta
                con tu equipo sanitario.
              </p>
            </div>
          </section>

          <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
            <p className="text-xs font-black uppercase tracking-[0.16em] text-emerald-600">
              🚦 Seguridad
            </p>

            <h3 className="mt-2 text-2xl font-black text-slate-950">
              Semáforo de seguridad
            </h3>

            <p className="mt-2 max-w-3xl text-sm leading-7 text-slate-600">
              Utiliza estas señales como una guía general para regular la
              actividad. La respuesta individual puede variar según la
              condición de salud, los medicamentos y la capacidad funcional.
            </p>

            <div className="mt-5 grid gap-4 md:grid-cols-3">
              <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-5">
                <p className="font-black text-emerald-800">
                  🟢 Puedes continuar
                </p>

                <ul className="mt-3 space-y-2 text-sm leading-6 text-emerald-900">
                  <li>• Respiras de forma cómoda y controlada.</li>
                  <li>• El esfuerzo resulta tolerable.</li>
                  <li>• Puedes hablar mientras realizas la actividad.</li>
                  <li>• Mantienes un movimiento estable y controlado.</li>
                  <li>• No aparecen síntomas preocupantes.</li>
                </ul>
              </div>

              <div className="rounded-2xl border border-amber-200 bg-amber-50 p-5">
                <p className="font-black text-amber-800">
                  🟡 Reduce o pausa
                </p>

                <ul className="mt-3 space-y-2 text-sm leading-6 text-amber-900">
                  <li>• La fatiga es mayor de la esperada.</li>
                  <li>• Necesitas recuperar el aliento.</li>
                  <li>• Aparece sensación de debilidad o inestabilidad.</li>
                  <li>• El esfuerzo empieza a resultar excesivo.</li>
                  <li>• Aparece un malestar que mejora al reducir la actividad.</li>
                </ul>
              </div>

              <div className="rounded-2xl border border-rose-200 bg-rose-50 p-5">
                <p className="font-black text-rose-800">
                  🔴 Detén la actividad
                </p>

                <ul className="mt-3 space-y-2 text-sm leading-6 text-rose-900">
                  <li>• Dolor o presión en el pecho.</li>
                  <li>• Dificultad respiratoria intensa o inusual.</li>
                  <li>• Mareo importante, desmayo o sensación de desmayo.</li>
                  <li>• Confusión o debilidad repentina.</li>
                  <li>• Palpitaciones acompañadas de malestar importante.</li>
                  <li>• Cualquier síntoma intenso, nuevo o preocupante.</li>
                </ul>
              </div>
            </div>
          </section>

          <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
            <p className="text-xs font-black uppercase tracking-[0.16em] text-rose-600">
              Orientaciones por condición
            </p>

            <div className="mt-5 grid gap-5 md:grid-cols-2">
              <article className="rounded-2xl border border-rose-100 bg-rose-50 p-5">
                <h4 className="text-lg font-black text-rose-950">
                  🫀 Hipertensión
                </h4>

                <p className="mt-2 text-sm leading-6 text-rose-900">
                  La actividad física regular puede formar parte del cuidado de
                  la presión arterial y de la salud cardiovascular. Comienza
                  con actividades tolerables y aumenta progresivamente la
                  duración y la exigencia según tu capacidad.
                </p>

                <ul className="mt-4 space-y-2 text-sm leading-6 text-rose-900">
                  <li>• Prioriza actividades moderadas y sostenibles.</li>
                  <li>• Realiza calentamiento y vuelta a la calma.</li>
                  <li>• Evita esfuerzos máximos sin orientación profesional.</li>
                  <li>• No contengas voluntariamente la respiración durante los ejercicios de fuerza.</li>
                  <li>• Sigue las indicaciones individualizadas de tu equipo sanitario.</li>
                </ul>
              </article>

              <article className="rounded-2xl border border-blue-100 bg-blue-50 p-5">
                <h4 className="text-lg font-black text-blue-950">
                  🩸 Diabetes tipo 2
                </h4>

                <p className="mt-2 text-sm leading-6 text-blue-900">
                  La actividad física puede contribuir al control de la glucosa,
                  la salud cardiovascular, la fuerza y la capacidad funcional.
                  La cantidad y el tipo de actividad deben adaptarse al nivel
                  actual de actividad, tratamiento y posibles complicaciones.
                </p>

                <ul className="mt-4 space-y-2 text-sm leading-6 text-blue-900">
                  <li>• Evita permanecer sentado durante períodos prolongados.</li>
                  <li>• Interrumpe el tiempo sentado con breves períodos de movimiento.</li>
                  <li>• Incorpora actividad aeróbica y ejercicios de fuerza adaptados.</li>
                  <li>• Si utilizas medicamentos con riesgo de hipoglucemia, sigue las indicaciones recibidas sobre ejercicio y control de glucosa.</li>
                  <li>• Utiliza calzado adecuado y revisa regularmente tus pies.</li>
                  <li>• Si tienes pérdida importante de sensibilidad, heridas, úlceras o complicaciones en los pies, consulta antes de realizar actividades con carga sobre ellos.</li>
                </ul>
              </article>

              <article className="rounded-2xl border border-violet-100 bg-violet-50 p-5">
                <h4 className="text-lg font-black text-violet-950">
                  ⚖️ Obesidad
                </h4>

                <p className="mt-2 text-sm leading-6 text-violet-900">
                  La actividad física puede mejorar la capacidad cardiovascular,
                  la fuerza, la movilidad y la autonomía. El progreso no debe
                  medirse únicamente por el peso corporal.
                </p>

                <ul className="mt-4 space-y-2 text-sm leading-6 text-violet-900">
                  <li>• Comienza con actividades que puedas realizar de forma segura.</li>
                  <li>• Utiliza actividades de bajo impacto cuando sea necesario.</li>
                  <li>• Los ejercicios sentados o con apoyo pueden ser buenas alternativas.</li>
                  <li>• Aumenta gradualmente la duración, frecuencia o intensidad.</li>
                  <li>• Incorpora ejercicios de fuerza adaptados.</li>
                  <li>• Valora también como progreso caminar con menos fatiga, levantarte con mayor facilidad y realizar actividades cotidianas con mayor autonomía.</li>
                </ul>
              </article>

              <article className="rounded-2xl border border-emerald-100 bg-emerald-50 p-5">
                <h4 className="text-lg font-black text-emerald-950">
                  🔄 Condiciones combinadas
                </h4>

                <p className="mt-2 text-sm leading-6 text-emerald-900">
                  Cuando una persona presenta varias enfermedades crónicas al
                  mismo tiempo, la actividad física puede seguir formando parte
                  de un estilo de vida saludable, pero la selección, intensidad
                  y progresión deben adaptarse a sus capacidades, síntomas,
                  medicamentos y posibles complicaciones.
                </p>

                <ul className="mt-4 space-y-2 text-sm leading-6 text-emerald-900">
                  <li>• Comienza con actividades sencillas y de baja a moderada exigencia.</li>
                  <li>• Aumenta progresivamente el tiempo de actividad.</li>
                  <li>• Prioriza ejercicios que puedas realizar con seguridad.</li>
                  <li>• Considera las limitaciones cardiovasculares, metabólicas, articulares y funcionales.</li>
                  <li>• Presta especial atención a los pies si existe diabetes.</li>
                  <li>• Evita esfuerzos máximos sin orientación profesional.</li>
                  <li>• Si existen varias enfermedades, complicaciones o dudas sobre la seguridad, consulta con tu equipo sanitario antes de aumentar significativamente la actividad.</li>
                </ul>
              </article>
            </div>
          </section>
          <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
            <div className="mb-6">
              <p className="text-xs font-black uppercase tracking-[0.16em] text-rose-600">
                Ejercicios prácticos
              </p>

              <h3 className="mt-2 text-2xl font-black text-slate-950">
                Actividad física progresiva y adaptable
              </h3>

              <p className="mt-2 max-w-3xl text-sm leading-7 text-slate-600">
                Selecciona una propuesta y consulta sus instrucciones,
                beneficios, adaptaciones y recomendaciones de seguridad.
              </p>
            </div>

            <div className="grid gap-5 lg:grid-cols-2">
              {chronicDiseasesExercises.map((exercise) => (
 <MovementExerciseCard
  key={exercise.id}
  exercise={exercise}
  accent="rose"
  isOpen={openExerciseId === exercise.id}
  onToggle={() =>
    setOpenExerciseId(
      openExerciseId === exercise.id ? null : exercise.id
    )
  }
  accessLevel={isFreeExercise(exercise.id) ? "free" : "pro"}
  isLocked={!isFreeExercise(exercise.id) && !hasProAccess}
/>
))}
            </div>
          </section>
        </>
      )}
  
      {selected?.id === "prenatal" && (
        <>
          <section className="rounded-3xl border border-violet-200 bg-violet-50 p-6 shadow-sm sm:p-8">
            <p className="text-xs font-black uppercase tracking-[0.16em] text-violet-700">
              Actividad física durante el embarazo
            </p>

            <h3 className="mt-2 text-2xl font-black text-violet-950">
              Movimiento seguro durante el embarazo
            </h3>

            <p className="mt-3 max-w-3xl text-sm leading-7 text-violet-900">
              La actividad física puede formar parte de un embarazo saludable
              cuando no existen contraindicaciones. Las propuestas de esta
              sección son orientaciones educativas generales y deben adaptarse
              a las características, experiencia, tolerancia y recomendaciones
              del equipo sanitario.
            </p>

            <div className="mt-5 rounded-2xl border border-violet-200 bg-white p-5">
              <p className="font-black text-slate-950">Importante</p>
              <p className="mt-2 text-sm leading-7 text-slate-600">
                Esta herramienta no diagnostica, no establece tratamientos y no
                sustituye la valoración ni las indicaciones del equipo sanitario.
              </p>
            </div>
          </section>

          <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
            <p className="text-xs font-black uppercase tracking-[0.16em] text-emerald-600">
              Orientaciones generales
            </p>

            <h3 className="mt-2 text-2xl font-black text-slate-950">
              Muévete de forma progresiva y adaptable
            </h3>

            <div className="mt-5 grid gap-4 md:grid-cols-2">
              <article className="rounded-2xl border border-emerald-100 bg-emerald-50 p-5">
                <h4 className="text-lg font-black text-emerald-950">
                  Actividad regular
                </h4>
                <ul className="mt-3 space-y-2 text-sm leading-6 text-emerald-900">
                  <li>Prioriza actividades que puedas realizar con comodidad.</li>
                  <li>Comienza progresivamente si eras poco activa.</li>
                  <li>Realiza pausas cuando las necesites.</li>
                  <li>Adapta la actividad a tu tolerancia.</li>
                </ul>
              </article>

              <article className="rounded-2xl border border-blue-100 bg-blue-50 p-5">
                <h4 className="text-lg font-black text-blue-950">
                  Durante la actividad
                </h4>
                <ul className="mt-3 space-y-2 text-sm leading-6 text-blue-900">
                  <li>Mantén una hidratación adecuada.</li>
                  <li>Evita ambientes excesivamente calurosos.</li>
                  <li>Mantén una intensidad confortable.</li>
                  <li>Realiza pausas cuando las necesites.</li>
                </ul>
              </article>

              <article className="rounded-2xl border border-amber-100 bg-amber-50 p-5">
                <h4 className="text-lg font-black text-amber-950">
                  Adaptación
                </h4>
                <ul className="mt-3 space-y-2 text-sm leading-6 text-amber-900">
                  <li>Ajusta duración e intensidad según tu tolerancia.</li>
                  <li>Utiliza apoyos cuando mejoren la estabilidad.</li>
                  <li>Evita aumentos bruscos de carga.</li>
                  <li>Respeta las indicaciones del equipo sanitario.</li>
                </ul>
              </article>

              <article className="rounded-2xl border border-rose-100 bg-rose-50 p-5">
                <h4 className="text-lg font-black text-rose-950">
                  Situaciones especiales
                </h4>
                <p className="mt-3 text-sm leading-6 text-rose-900">
                  Si existe una complicación del embarazo, una condición médica
                  o una restricción obstétrica, consulta al equipo sanitario
                  antes de iniciar o aumentar el ejercicio.
                </p>
              </article>
            </div>
          </section>

          <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
            <p className="text-xs font-black uppercase tracking-[0.16em] text-emerald-600">
              Seguridad
            </p>

            <h3 className="mt-2 text-2xl font-black text-slate-950">
              Semáforo de seguridad
            </h3>

            <div className="mt-5 grid gap-4 md:grid-cols-3">
              <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-5">
                <p className="font-black text-emerald-800">Puedes continuar</p>
                <ul className="mt-3 space-y-2 text-sm leading-6 text-emerald-900">
                  <li>Esfuerzo cómodo o moderado.</li>
                  <li>Respiración controlada.</li>
                  <li>Puedes conversar con relativa comodidad.</li>
                  <li>No aparecen síntomas preocupantes.</li>
                </ul>
              </div>

              <div className="rounded-2xl border border-amber-200 bg-amber-50 p-5">
                <p className="font-black text-amber-800">Reduce o pausa</p>
                <ul className="mt-3 space-y-2 text-sm leading-6 text-amber-900">
                  <li>Fatiga excesiva.</li>
                  <li>Necesidad de recuperar la respiración.</li>
                  <li>Incomodidad persistente.</li>
                  <li>Sensación de inestabilidad.</li>
                </ul>
              </div>

              <div className="rounded-2xl border border-rose-200 bg-rose-50 p-5">
                <p className="font-black text-rose-800">Detén la actividad</p>
                <ul className="mt-3 space-y-2 text-sm leading-6 text-rose-900">
                  <li>Sangrado vaginal.</li>
                  <li>Pérdida de líquido.</li>
                  <li>Contracciones dolorosas o regulares.</li>
                  <li>Dolor en el pecho, mareo intenso o desmayo.</li>
                  <li>Dificultad respiratoria importante.</li>
                </ul>
              </div>
            </div>
          </section>

          <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
            <div className="mb-6">
              <p className="text-xs font-black uppercase tracking-[0.16em] text-violet-600">
                Ejercicios prácticos
              </p>

              <h3 className="mt-2 text-2xl font-black text-slate-950">
                Movimiento progresivo y adaptable
              </h3>

              <p className="mt-2 max-w-3xl text-sm leading-7 text-slate-600">
                Selecciona una propuesta y consulta sus instrucciones,
                beneficios, adaptaciones y recomendaciones de seguridad.
              </p>
            </div>

            <div className="grid gap-5 lg:grid-cols-2">
              {prenatalExercises.map((exercise) => (
                <MovementExerciseCard
  key={exercise.id}
  exercise={exercise}
  accent="violet"
  isOpen={openExerciseId === exercise.id}
  onToggle={() =>
    setOpenExerciseId(
      openExerciseId === exercise.id ? null : exercise.id,
    )
  }
  accessLevel={isFreeExercise(exercise.id) ? "free" : "pro"}
  isLocked={!isFreeExercise(exercise.id) && !hasProAccess}
/>
              ))}
            </div>
          </section>
        </>
      )}
      {selected?.id === "reduced-mobility" && (
        <>
          <section className="rounded-3xl border border-blue-200 bg-blue-50 p-6 shadow-sm sm:p-8">
            <p className="text-xs font-black uppercase tracking-[0.16em] text-blue-700">
              Movilidad adaptada
            </p>

            <h3 className="mt-2 text-2xl font-black text-blue-950">
              Movimiento seguro con movilidad reducida
            </h3>

            <p className="mt-3 max-w-3xl text-sm leading-7 text-blue-900">
              Estas propuestas están pensadas para favorecer el movimiento
              disponible y la participación activa de personas con movilidad
              reducida. Cada actividad debe adaptarse a las capacidades,
              comodidad y recomendaciones del equipo sanitario cuando
              corresponda.
            </p>

            <div className="mt-5 rounded-2xl border border-blue-200 bg-white p-5">
              <p className="font-black text-slate-950">
                Importante
              </p>

              <p className="mt-2 text-sm leading-7 text-slate-600">
                Las propuestas son orientaciones educativas generales. No
                sustituyen una valoración profesional ni deben utilizarse para
                realizar transferencias, movilizaciones pasivas o maniobras
                clínicas sin la capacitación correspondiente.
              </p>
            </div>
          </section>

          <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
            <div className="mb-6">
              <p className="text-xs font-black uppercase tracking-[0.16em] text-blue-600">
                Ejercicios adaptados
              </p>

              <h3 className="mt-2 text-2xl font-black text-slate-950">
                8 propuestas de movilidad
              </h3>

              <p className="mt-2 max-w-3xl text-sm leading-7 text-slate-600">
                Selecciona una propuesta para consultar instrucciones,
                beneficios, adaptaciones y recomendaciones de seguridad.
              </p>
            </div>

            <div className="grid gap-5 lg:grid-cols-2">
              {reducedMobilityExercises.map((exercise) => (
                <MovementExerciseCard
  key={exercise.id}
  exercise={exercise}
  accent="blue"
  isOpen={openExerciseId === exercise.id}
  onToggle={() =>
    setOpenExerciseId(
      openExerciseId === exercise.id ? null : exercise.id,
    )
  }
  accessLevel={isFreeExercise(exercise.id) ? "free" : "pro"}
  isLocked={!isFreeExercise(exercise.id) && !hasProAccess}
/>
              ))}
            </div>
          </section>
        </>
      )}
 <section
        id="movilidad-reducida"
        className="rounded-3xl border border-blue-200 bg-blue-50 p-6 sm:p-8"
      >
        <div className="max-w-4xl">
          <p className="text-xs font-black uppercase tracking-[0.16em] text-blue-700">
            Acompañamiento
          </p>

          <h2 className="mt-2 text-2xl font-black text-blue-950">
            También pensamos en quienes ayudan
          </h2>

          <p className="mt-3 text-sm leading-7 text-blue-900">
            La sección de movilidad reducida incluirá orientaciones educativas
            para familiares y cuidadores sobre preparación del entorno,
            movilización, incorporación, transferencias, higiene y uso
            responsable de ayudas técnicas.
          </p>

          <div className="mt-5 rounded-2xl border border-blue-200 bg-white p-5">
            <p className="font-black text-slate-950">
              {caregiverSafetyNotice.title}
            </p>

            <p className="mt-2 text-sm leading-7 text-slate-600">
              {caregiverSafetyNotice.description}
            </p>
          </div>
        </div>
      </section>

      <section className="mt-6 rounded-3xl border border-blue-100 bg-white p-6 shadow-sm sm:p-8">
        <div className="mb-6">
          <p className="text-xs font-black uppercase tracking-[0.16em] text-blue-600">
            Orientaciones para cuidadores
          </p>

          <h3 className="mt-2 text-2xl font-black text-slate-950">
            Movilización segura y acompañamiento
          </h3>

          <p className="mt-2 max-w-3xl text-sm leading-7 text-slate-600">
            Consulta estas orientaciones antes de acompañar movimientos,
            cambios de posición o transferencias. Prioriza siempre la
            seguridad, la comunicación y la participación de la persona.
          </p>
        </div>

        <div className="grid gap-5 lg:grid-cols-2">
          {caregiverGuidance.map((item) => {
            const isLocked = !isFreeCaregiverGuidance(item.id) && !hasProAccess;

            return (
            <article
              key={item.id}
              className="rounded-2xl border border-blue-100 bg-blue-50/50 p-5"
            >
              <p className="text-xs font-black uppercase tracking-[0.12em] text-blue-600">
                Orientación
              </p>

              <h4 className="mt-2 text-lg font-black text-blue-950">
                {item.title}
              </h4>

              <span className={`mt-3 inline-flex rounded-full px-3 py-1 text-[10px] font-black uppercase tracking-wide ${isLocked ? "bg-violet-100 text-violet-700" : "bg-emerald-100 text-emerald-700"}`}>
                {isLocked ? "Pro" : "Free"}
              </span>

              <p className="mt-2 text-sm leading-6 text-slate-700">
                {item.objective}
              </p>

              {isLocked ? (
                <button
                  type="button"
                  onClick={() => setLockedContentTitle(item.title)}
                  className="mt-4 flex w-full items-center justify-between rounded-xl border border-violet-200 bg-violet-50 p-4 text-left text-sm font-black text-violet-800 hover:bg-violet-100"
                >
                  <span>Contenido disponible en el Plan Pro</span>
                  <span aria-hidden="true">🔒</span>
                </button>
              ) : (
              <div className="mt-4 overflow-hidden rounded-xl border border-blue-100 bg-white">
                <button
                  type="button"
                  aria-expanded={openCaregiverId === item.id}
                  aria-controls={`caregiver-guidance-${item.id}`}
                  onClick={() =>
                    setOpenCaregiverId(
                      openCaregiverId === item.id ? null : item.id,
                    )
                  }
                  className="flex w-full items-center justify-between gap-4 p-4 text-left text-sm font-black text-slate-900 transition hover:bg-blue-50 focus:outline-none focus:ring-4 focus:ring-inset focus:ring-blue-100"
                >
                  <span>
                    {openCaregiverId === item.id
                      ? "Ocultar orientación"
                      : "Ver orientación"}
                  </span>
                  <span aria-hidden="true" className="text-lg text-blue-700">
                    {openCaregiverId === item.id ? "−" : "+"}
                  </span>
                </button>

                {openCaregiverId === item.id ? (
                <div
                  id={`caregiver-guidance-${item.id}`}
                  className="space-y-4 border-t border-blue-100 p-4 text-sm leading-6"
                >
                  <div>
                    <p className="font-black text-slate-900">
                      Preparación
                    </p>

                    <ul className="mt-2 list-disc space-y-1 pl-5 text-slate-600">
                      {item.preparation.map((step) => (
                        <li key={step}>{step}</li>
                      ))}
                    </ul>
                  </div>

                  <div>
                    <p className="font-black text-slate-900">
                      Orientación
                    </p>

                    <ul className="mt-2 list-disc space-y-1 pl-5 text-slate-600">
                      {item.steps.map((step) => (
                        <li key={step}>{step}</li>
                      ))}
                    </ul>
                  </div>

                  {item.personPosition && (
                    <div>
                      <p className="font-black text-slate-900">
                        Posición de la persona
                      </p>

                      <p className="mt-1 text-slate-600">
                        {item.personPosition}
                      </p>
                    </div>
                  )}

                  {item.caregiverPosition && (
                    <div>
                      <p className="font-black text-slate-900">
                        Posición del cuidador
                      </p>

                      <p className="mt-1 text-slate-600">
                        {item.caregiverPosition}
                      </p>
                    </div>
                  )}

                  <div>
                    <p className="font-black text-emerald-800">
                      Seguridad
                    </p>

                    <ul className="mt-2 list-disc space-y-1 pl-5 text-slate-600">
                      {item.safety.map((step) => (
                        <li key={step}>{step}</li>
                      ))}
                    </ul>
                  </div>

                  <div>
                    <p className="font-black text-rose-800">
                      No intentar si...
                    </p>

                    <ul className="mt-2 list-disc space-y-1 pl-5 text-slate-600">
                      {item.doNotAttemptIf.map((step) => (
                        <li key={step}>{step}</li>
                      ))}
                    </ul>
                  </div>

                  {item.assistiveDevices && (
                    <div>
                      <p className="font-black text-slate-900">
                        Ayudas técnicas
                      </p>

                      <ul className="mt-2 list-disc space-y-1 pl-5 text-slate-600">
                        {item.assistiveDevices.map((device) => (
                          <li key={device}>{device}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
                ) : null}
              </div>
              )}
            </article>
            );
          })}
        </div>
      </section>
      <section
        id="biblioteca"
        className="rounded-3xl border border-orange-100 bg-orange-50/40 p-6 shadow-sm sm:p-8"
      >
        <div className="mb-6">
          <p className="text-xs font-black uppercase tracking-[0.16em] text-orange-600">
            Recursos educativos
          </p>

          <h2 className="mt-2 text-2xl font-black text-slate-950">
            Biblioteca Movimiento Para Todos
          </h2>

          <p className="mt-3 max-w-3xl text-sm leading-7 text-slate-600">
            Un espacio para reunir materiales educativos, fichas, guías y
            recursos prácticos relacionados con el movimiento, la autonomía,
            la actividad física adaptada y el acompañamiento seguro.
          </p>
        </div>

        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {movementLibraryResources.map((resource) => (
            <article
              key={resource.id}
              className="flex h-full flex-col rounded-2xl border border-orange-100 bg-white p-5 shadow-sm"
            >
              <div className="flex items-start justify-between gap-3">
                <span className="text-3xl" aria-hidden="true">
                  {resource.icon}
                </span>

                <span className="rounded-full bg-orange-100 px-3 py-1 text-[10px] font-black uppercase tracking-[0.1em] text-orange-700">
                  {resource.status === "available"
                    ? "Disponible"
                    : "Próximamente"}
                </span>
              </div>

              <h3 className="mt-4 text-lg font-black text-slate-950">
                {resource.title}
              </h3>

              <p className="mt-2 flex-1 text-sm leading-6 text-slate-600">
                {resource.description}
              </p>

              <div className="mt-5">
                {resource.status === "available" && resource.href ? (
                  <a
                    href={resource.href}
                    className="inline-flex rounded-xl bg-orange-600 px-4 py-2 text-sm font-black text-white transition hover:bg-orange-700"
                  >
                    Abrir recurso
                  </a>
                ) : (
                  <span className="inline-flex rounded-xl border border-slate-200 bg-slate-50 px-4 py-2 text-sm font-bold text-slate-500">
                    Recurso en preparación
                  </span>
                )}
              </div>
            </article>
          ))}
        </div>

        <div className="mt-6 rounded-2xl border border-orange-100 bg-white p-5">
          <p className="font-black text-slate-950">
            Biblioteca en crecimiento
          </p>

          <p className="mt-2 text-sm leading-6 text-slate-600">
            Incorporaremos nuevos materiales progresivamente para que este
            espacio se convierta en un punto de referencia práctico para
            personas, familias, cuidadores y profesionales.
          </p>
        </div>
      </section>
      <section
        id="comunidad"
        className="rounded-3xl bg-slate-950 p-6 text-white shadow-xl sm:p-8"
      >
        <div className="mb-6">
          <p className="text-xs font-black uppercase tracking-[0.16em] text-orange-300">
            Comunidad
          </p>

          <h2 className="mt-2 text-2xl font-black">
            Construyamos Movimiento Para Todos juntos
          </h2>

          <p className="mt-3 max-w-3xl text-sm leading-7 text-slate-300">
            Este espacio está pensado para escuchar a nuestra comunidad,
            recoger experiencias y descubrir nuevas necesidades relacionadas
            con el movimiento, la actividad física adaptada y el acompañamiento.
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <article className="rounded-2xl border border-white/10 bg-white/5 p-5">
            <span className="text-3xl" aria-hidden="true">
              💡
            </span>

            <h3 className="mt-4 text-lg font-black">
              Sugerir un tema
            </h3>

            <p className="mt-2 text-sm leading-6 text-slate-300">
              Propón un tema que te gustaría encontrar en Movimiento Para
              Todos.
            </p>

            <Link href="/comunidad?type=topic" className="mt-4 inline-flex rounded-xl bg-orange-500 px-4 py-2 text-xs font-black uppercase tracking-[0.08em] text-white hover:bg-orange-600">
              Enviar propuesta →
            </Link>
          </article>

          <article className="rounded-2xl border border-white/10 bg-white/5 p-5">
            <span className="text-3xl" aria-hidden="true">
              📝
            </span>

            <h3 className="mt-4 text-lg font-black">
              Compartir una experiencia
            </h3>

            <p className="mt-2 text-sm leading-6 text-slate-300">
              Comparte experiencias, prácticas o ideas que puedan ayudar a
              otras personas.
            </p>

            <Link href="/comunidad?type=experience" className="mt-4 inline-flex rounded-xl bg-orange-500 px-4 py-2 text-xs font-black uppercase tracking-[0.08em] text-white hover:bg-orange-600">
              Compartir experiencia →
            </Link>
          </article>

          <article className="rounded-2xl border border-white/10 bg-white/5 p-5">
            <span className="text-3xl" aria-hidden="true">
              ❓
            </span>

            <h3 className="mt-4 text-lg font-black">
              Enviar una pregunta
            </h3>

            <p className="mt-2 text-sm leading-6 text-slate-300">
              Ayúdanos a identificar las preguntas que más necesita responder
              nuestra comunidad.
            </p>

            <Link href="/comunidad?type=question" className="mt-4 inline-flex rounded-xl bg-orange-500 px-4 py-2 text-xs font-black uppercase tracking-[0.08em] text-white hover:bg-orange-600">
              Enviar pregunta →
            </Link>
          </article>

          <article className="rounded-2xl border border-white/10 bg-white/5 p-5">
            <span className="text-3xl" aria-hidden="true">
              ❤️
            </span>

            <h3 className="mt-4 text-lg font-black">
              Proponer una mejora
            </h3>

            <p className="mt-2 text-sm leading-6 text-slate-300">
              Cuéntanos qué podríamos mejorar para hacer esta sección más útil
              y accesible.
            </p>

            <Link href="/comunidad?type=improvement" className="mt-4 inline-flex rounded-xl bg-orange-500 px-4 py-2 text-xs font-black uppercase tracking-[0.08em] text-white hover:bg-orange-600">
              Proponer mejora →
            </Link>
          </article>
        </div>

        <div className="mt-6 rounded-2xl border border-orange-300/20 bg-orange-400/10 p-5">
          <p className="font-black text-orange-200">
            Una comunidad que participa, crece
          </p>

          <p className="mt-2 text-sm leading-6 text-slate-300">
            Queremos que Movimiento Para Todos evolucione a partir de las
            necesidades reales de las personas, familias, cuidadores y
            profesionales que utilizan estos recursos.
          </p>
        </div>

        <p className="mt-5 text-sm font-semibold text-slate-400">
          {movementDisclaimer}
        </p>
      </section>

      <ProUpgradeDialog
        open={lockedContentTitle !== null}
        toolName={lockedContentTitle ?? "Contenido de Movimiento para Todos"}
        onClose={() => setLockedContentTitle(null)}
      />
    </div>
  );
}


