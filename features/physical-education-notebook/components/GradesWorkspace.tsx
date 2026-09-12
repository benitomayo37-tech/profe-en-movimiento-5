"use client";

import Link from "next/link";
import GradeSummaryPanel from "./GradeSummaryPanel";
import { useMemo, useState } from "react";

import GradingActivityForm from "./GradingActivityForm";

import type {
  GradingActivity,
  GradingPeriod,
  GradingSettings,
  PhysicalEducationCourse,
  PhysicalEducationStudent,
  StudentPeriodGradeSummary,
} from "../types";

interface GradesWorkspaceProps {
  course: PhysicalEducationCourse;
  students: PhysicalEducationStudent[];
  settings: GradingSettings | null;
  periods: GradingPeriod[];
  activitiesByPeriod: Record<string, GradingActivity[]>;
  initialError: string;
  summariesByPeriod: Record<string, StudentPeriodGradeSummary[]>;
}

const componentLabels: Record<
  GradingActivity["component"],
  string
> = {
  formative: "Evaluación formativa",
  interdisciplinary_project: "Proyecto interdisciplinario",
  exam: "Examen",
};

const dimensionLabels: Record<
  NonNullable<GradingActivity["dimension"]>,
  string
> = {
  cognitive: "Cognitiva",
  affective_social: "Afectivo-social",
  motor: "Motriz",
};

function percentage(value: number): string {
  return `${Math.round(value * 100)}%`;
}

export default function GradesWorkspace({
  course,
  students,
  settings,
  periods,
  activitiesByPeriod,
  initialError,
  summariesByPeriod,
}: GradesWorkspaceProps) {
  const [selectedPeriodId, setSelectedPeriodId] =
    useState(periods[0]?.id ?? "");

  const [showActivityForm, setShowActivityForm] = useState(false);

  const selectedPeriod = periods.find(
    (period) => period.id === selectedPeriodId,
  );

  const activities = useMemo(
    () => activitiesByPeriod[selectedPeriodId] ?? [],
    [activitiesByPeriod, selectedPeriodId],
  );

  const activeStudents = students.filter(
    (student) => student.status === "active",
  );

  const formativeActivities = activities.filter(
    (activity) =>
      activity.active && activity.component === "formative",
  );
  const projectActivity = activities.find(
    (activity) =>
      activity.active
      && activity.component === "interdisciplinary_project",
  );
  const examActivity = activities.find(
    (activity) =>
      activity.active && activity.component === "exam",
  );

  return (
    <section className="space-y-6">
      <div className="flex flex-wrap gap-3">
        <Link
          href={`/cuaderno-digital/cursos/${course.id}`}
          className="inline-flex min-h-11 items-center justify-center rounded-xl border-2 border-slate-300 bg-white px-4 py-2 text-sm font-black text-slate-800 transition hover:border-blue-400 hover:bg-blue-50"
        >
          ← Volver a estudiantes
        </Link>

        <Link
          href={`/cuaderno-digital/cursos/${course.id}/asistencia`}
          className="inline-flex min-h-11 items-center justify-center rounded-xl border-2 border-emerald-300 bg-emerald-50 px-4 py-2 text-sm font-black text-emerald-900 transition hover:bg-emerald-100"
        >
          Ver asistencia
        </Link>
      </div>

      <div className="overflow-hidden rounded-3xl bg-gradient-to-br from-blue-950 via-blue-800 to-blue-600 p-6 text-white shadow-xl sm:p-8">
        <p className="inline-flex rounded-full border border-blue-300 bg-blue-700/70 px-3 py-1 text-xs font-black uppercase tracking-[0.18em]">
          Registro de calificaciones
        </p>

        <h2 className="mt-4 text-3xl font-black sm:text-4xl">
          {course.name}
        </h2>

        <p className="mt-2 text-sm text-blue-100 sm:text-base">
          {course.educationLevel} · {course.grade} · Paralelo {course.parallel}
        </p>

        <p className="mt-1 text-sm text-blue-200">
          {course.schoolYear}
          {course.shift ? ` · Jornada ${course.shift}` : ""}
        </p>

        <div className="mt-6 grid grid-cols-2 gap-3 lg:grid-cols-4">
          <div className="rounded-2xl border border-white/25 bg-white/10 p-4">
            <p className="text-2xl font-black">{activeStudents.length}</p>
            <p className="text-xs font-bold text-blue-100">Estudiantes activos</p>
          </div>
          <div className="rounded-2xl border border-white/25 bg-white/10 p-4">
            <p className="text-2xl font-black">{settings ? percentage(settings.formativeWeight) : "70%"}</p>
            <p className="text-xs font-bold text-blue-100">Formativa</p>
          </div>
          <div className="rounded-2xl border border-white/25 bg-white/10 p-4">
            <p className="text-2xl font-black">{settings ? percentage(settings.projectWeight) : "15%"}</p>
            <p className="text-xs font-bold text-blue-100">Proyecto</p>
          </div>
          <div className="rounded-2xl border border-white/25 bg-white/10 p-4">
            <p className="text-2xl font-black">{settings ? percentage(settings.examWeight) : "15%"}</p>
            <p className="text-xs font-bold text-blue-100">Examen</p>
          </div>
        </div>
      </div>

      {initialError ? (
        <div role="alert" className="rounded-2xl border-2 border-red-300 bg-red-50 px-5 py-4 text-sm font-bold text-red-900">
          {initialError}
        </div>
      ) : null}

      <div className="rounded-3xl border border-slate-300 bg-white p-5 shadow-sm sm:p-6">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.16em] text-blue-700">
              Período académico
            </p>
            <h3 className="mt-1 text-2xl font-black text-slate-950">
              Selecciona un trimestre
            </h3>
          </div>

          {selectedPeriod ? (
            <span className={`rounded-full px-3 py-1 text-xs font-black ${selectedPeriod.status === "closed" ? "bg-slate-200 text-slate-700" : "border-2 border-emerald-200 bg-emerald-500 text-white shadow-md"}`}>
              {selectedPeriod.status === "closed" ? "Cerrado" : "Abierto"}
            </span>
          ) : null}
        </div>

        <div className="mt-5 grid gap-3 sm:grid-cols-3">
          {periods.map((period) => {
            const selected = period.id === selectedPeriodId;

            return (
              <button
                key={period.id}
                type="button"
                onClick={() => setSelectedPeriodId(period.id)}
                className={`min-h-14 rounded-2xl border-2 px-4 py-3 text-sm font-black transition ${selected ? "border-blue-700 bg-blue-700 text-white shadow-lg" : "border-slate-300 bg-white text-slate-800 hover:border-blue-400 hover:bg-blue-50"}`}
              >
                {period.name}
              </button>
            );
          })}
        </div>

        {!periods.length ? (
          <p className="mt-5 rounded-2xl bg-amber-50 p-4 text-sm font-bold text-amber-900">
            No se encontraron períodos de evaluación para este curso.
          </p>
        ) : null}
      </div>

      <div className="grid gap-4 xl:grid-cols-3">
        <ActivityGroup
          title={componentLabels.formative}
          subtitle="Dimensiones cognitiva, afectivo-social y motriz"
          accent="blue"
          activities={formativeActivities}
        />
        <ActivityGroup
          title={componentLabels.interdisciplinary_project}
          subtitle="Aporte único del trimestre"
          accent="orange"
          activities={projectActivity ? [projectActivity] : []}
        />
        <ActivityGroup
          title={componentLabels.exam}
          subtitle="Evaluación sumativa del trimestre"
          accent="emerald"
          activities={examActivity ? [examActivity] : []}
        />
      </div>

      <div className="rounded-3xl border-2 border-dashed border-blue-300 bg-blue-50 p-6 text-center">
        <div className="flex flex-wrap items-center justify-center gap-3">
          <button
            type="button"
            onClick={() => setShowActivityForm((value) => !value)}
            disabled={!selectedPeriod || selectedPeriod.status === "closed"}
            className="inline-flex min-h-12 items-center justify-center rounded-xl border-2 border-blue-700 bg-blue-700 px-5 py-3 text-sm font-black text-white shadow-lg transition hover:bg-blue-800 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {showActivityForm ? "Cerrar formulario" : "+ Nueva actividad"}
          </button>
        </div>
        <p className="mx-auto mt-3 max-w-2xl text-sm font-bold text-blue-900">
          Registra las actividades de evaluaci&oacute;n del trimestre seleccionado.
        </p>
      </div>

      <GradeSummaryPanel
        courseId={course.id}
        periodName={selectedPeriod?.name ?? "Periodo"}
        students={activeStudents}
        summaries={summariesByPeriod[selectedPeriodId] ?? []}
      />

      {showActivityForm && selectedPeriod ? (
        <GradingActivityForm
          courseId={course.id}
          gradingPeriodId={selectedPeriod.id}
          displayOrder={activities.length}
          onCancel={() => setShowActivityForm(false)}
        />
      ) : null}
    </section>
  );
}

interface ActivityGroupProps {
  title: string;
  subtitle: string;
  accent: "blue" | "orange" | "emerald";
  activities: GradingActivity[];
}

function ActivityGroup({
  title,
  subtitle,
  accent,
  activities,
}: ActivityGroupProps) {
  const accentClasses = {
    blue: "border-blue-300 bg-blue-50 text-blue-950",
    orange: "border-orange-300 bg-orange-50 text-orange-950",
    emerald: "border-emerald-300 bg-emerald-50 text-emerald-950",
  }[accent];

  return (
    <div className={`rounded-3xl border-2 p-5 ${accentClasses}`}>
      <h3 className="text-lg font-black">{title}</h3>
      <p className="mt-1 text-xs font-bold opacity-75">{subtitle}</p>

      <div className="mt-4 space-y-3">
        {activities.length ? (
          activities.map((activity) => (
                        <Link
              key={activity.id}
              href={`/cuaderno-digital/cursos/${activity.courseId}/calificaciones/${activity.id}`}
              className="block rounded-2xl border-2 border-current/30 bg-white p-4 shadow-sm transition hover:-translate-y-0.5 hover:shadow-lg"
            >
              <p className="font-black text-slate-950">{activity.name}</p>
              <p className="mt-1 text-xs font-bold text-slate-600">
                {activity.dimension ? dimensionLabels[activity.dimension] : "Componente sumativo"}
              {activity.activityDate ? ` \u00b7 ${activity.activityDate}` : ""}
              </p>
            <p className="mt-3 text-xs font-black text-blue-700">Registrar notas &rarr;</p>
            </Link>
          ))
        ) : (
          <p className="rounded-2xl border-2 border-current/30 bg-white p-4 text-sm font-black text-slate-950 shadow-sm">
            Todavía no hay actividades registradas.
          </p>
        )}
      </div>
    </div>
  );
}
