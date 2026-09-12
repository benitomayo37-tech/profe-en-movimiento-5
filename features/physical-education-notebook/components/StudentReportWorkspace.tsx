import Link from "next/link";

import PrintGradesButton from "./PrintGradesButton";
import type {
  GradingPeriod,
  PhysicalEducationCourse,
  PhysicalEducationStudent,
  StudentPeriodGradeSummary,
} from "../types";

interface StudentReportWorkspaceProps {
  course: PhysicalEducationCourse;
  student: PhysicalEducationStudent;
  periods: GradingPeriod[];
  summariesByPeriod: Record<string, StudentPeriodGradeSummary[]>;
}

function value(value: number | null): string {
  return value === null ? "Pendiente" : value.toFixed(2);
}

export default function StudentReportWorkspace({
  course,
  student,
  periods,
  summariesByPeriod,
}: StudentReportWorkspaceProps) {
  return (
    <section id="grade-summary-print" className="space-y-6 rounded-3xl border-2 border-blue-400 bg-slate-900/80 p-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="text-xs font-black uppercase tracking-[0.2em] text-blue-300">Reporte individual</p>
          <h1 className="mt-1 text-3xl font-black text-white">{student.lastNames}, {student.firstNames}</h1>
          <p className="mt-1 text-sm font-bold text-orange-400">{course.name} - {course.schoolYear}</p>
          {student.studentCode ? <p className="mt-1 text-xs font-bold text-slate-400">{student.studentCode}</p> : null}
        </div>
        <PrintGradesButton />
      </div>

      <div className="space-y-4">
        {periods.map((period) => {
          const summary = summariesByPeriod[period.id]?.find((item) => item.studentId === student.id);
          return (
            <article key={period.id} className="rounded-2xl border border-slate-500 bg-slate-900/90 p-4">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <h2 className="text-xl font-black text-white">{period.name}</h2>
                <span className={period.status === "open" ? "rounded-full border-2 border-emerald-200 bg-emerald-500 px-3 py-1 text-xs font-black uppercase text-white shadow-md" : "rounded-full border border-slate-500 bg-slate-700 px-3 py-1 text-xs font-black uppercase text-slate-200"}>{period.status === "open" ? "Abierto" : period.status === "closed" ? "Cerrado" : "Borrador"}</span>
              </div>
              <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                <Metric label="Cognitiva" value={value(summary?.cognitiveAverage ?? null)} />
                <Metric label="Afectivo-social" value={value(summary?.affectiveSocialAverage ?? null)} />
                <Metric label="Motriz" value={value(summary?.motorAverage ?? null)} />
                <Metric label="Formativa 70%" value={value(summary?.formativeContribution ?? null)} />
                <Metric label="Proyecto 15%" value={value(summary?.projectContribution ?? null)} />
                <Metric label="Examen 15%" value={value(summary?.examContribution ?? null)} />
                <Metric label="Nota final" value={value(summary?.finalScore ?? null)} emphasis />
              </div>
            </article>
          );
        })}
      </div>

      <Link href={`/cuaderno-digital/cursos/${course.id}/calificaciones`} className="no-print inline-flex rounded-xl border border-slate-500 px-4 py-2 text-sm font-black text-slate-200 hover:bg-slate-800">
        Volver a calificaciones
      </Link>
    </section>
  );
}

function Metric({ label, value, emphasis = false }: { label: string; value: string; emphasis?: boolean }) {
  return (
    <div className="rounded-xl border border-slate-600 bg-slate-800/90 p-3">
      <p className="text-xs font-black uppercase text-blue-200">{label}</p>
      <p className={value === "Pendiente" ? "mt-1 text-xl font-black text-orange-400" : emphasis ? "mt-1 text-2xl font-black text-blue-300" : "mt-1 text-xl font-black text-white"}>{value}</p>
    </div>
  );
}