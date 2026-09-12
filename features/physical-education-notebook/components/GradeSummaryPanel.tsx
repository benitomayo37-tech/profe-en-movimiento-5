import Link from "next/link";
import PrintGradesButton from "./PrintGradesButton";

import type {
  PhysicalEducationStudent,
  StudentPeriodGradeSummary,
} from "../types";

interface GradeSummaryPanelProps {
  courseId: string;
  periodName: string;
  students: PhysicalEducationStudent[];
  summaries: StudentPeriodGradeSummary[];
}

function formatValue(value: number | null): string {
  return value === null ? "Pendiente" : value.toFixed(2);
}

export default function GradeSummaryPanel({
  courseId,
  periodName,
  students,
  summaries,
}: GradeSummaryPanelProps) {
  const summaryByStudent = new Map(
    summaries.map((summary) => [summary.studentId, summary]),
  );

  return (
    <section id="grade-summary-print" className="print-summary rounded-3xl border-2 border-slate-300 bg-slate-950/30 p-5 shadow-sm">
      <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-xs font-black uppercase tracking-[0.2em] text-blue-300">
            Resumen del periodo
          </p>
          <h2 className="mt-1 text-2xl font-black text-white">
            {periodName}
          </h2>
          <div className="mt-3"><PrintGradesButton /></div>
        </div>
        <p className="text-sm font-bold text-slate-300">
          Valores sobre 10 puntos
        </p>
      </div>

      <div className="overflow-x-auto rounded-2xl border border-slate-700">
        <table className="min-w-[980px] w-full border-collapse text-left text-sm">
          <thead className="bg-slate-800 text-xs font-black uppercase tracking-wide text-slate-200">
            <tr>
              <th className="sticky left-0 z-10 bg-slate-800 px-4 py-3">Estudiante</th>
              <th className="px-4 py-3">Cognitiva</th>
              <th className="px-4 py-3">Afectivo-social</th>
              <th className="px-4 py-3">Motriz</th>
              <th className="px-4 py-3">Formativa 70%</th>
              <th className="px-4 py-3">Proyecto 15%</th>
              <th className="px-4 py-3">Examen 15%</th>
              <th className="px-4 py-3">Nota final</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800">
            {students.map((student) => {
              const summary = summaryByStudent.get(student.id);
              const name = summary
                ? `${student.lastNames}, ${student.firstNames}`
                : `${student.lastNames}, ${student.firstNames}`;

              return (
                <tr key={student.id} className="bg-slate-950/20 text-slate-100">
                  <th className="sticky left-0 bg-slate-950/95 px-4 py-3 font-black">
                    <Link href={`/cuaderno-digital/cursos/${courseId}/calificaciones/estudiantes/${student.id}`} className="block whitespace-nowrap hover:text-blue-300">{name}</Link>
                    {student.studentCode ? (
                      <span className="mt-1 block text-xs font-bold text-slate-400">
                        {student.studentCode}
                      </span>
                    ) : null}
                  </th>
                  <td className="px-4 py-3 font-bold">{formatValue(summary?.cognitiveAverage ?? null)}</td>
                  <td className="px-4 py-3 font-bold">{formatValue(summary?.affectiveSocialAverage ?? null)}</td>
                  <td className="px-4 py-3 font-bold">{formatValue(summary?.motorAverage ?? null)}</td>
                  <td className="px-4 py-3 font-bold">{formatValue(summary?.formativeContribution ?? null)}</td>
                  <td className="px-4 py-3 font-bold">{formatValue(summary?.projectContribution ?? null)}</td>
                  <td className="px-4 py-3 font-bold">{formatValue(summary?.examContribution ?? null)}</td>
                  <td className="px-4 py-3 text-base font-black text-blue-300">{formatValue(summary?.finalScore ?? null)}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <p className="mt-3 text-xs font-bold text-slate-400">
        Pendiente indica que todav&iacute;a falta registrar una calificaci&oacute;n evaluada.
      </p>
      <style dangerouslySetInnerHTML={{ __html: `
@media print {
  body { background: #fff !important; color: #0f172a !important; }
  .no-print { display: none !important; }
  .print-summary { margin: 0 !important; width: 100% !important; background: #fff !important; color: #0f172a !important; border: 0 !important; box-shadow: none !important; }
  .print-summary h2, .print-summary p, .print-summary th, .print-summary td, .print-summary span { color: #0f172a !important; }
  .print-summary table, .print-summary th, .print-summary td { border-color: #cbd5e1 !important; background: #fff !important; }
  .print-summary .sticky { position: static !important; }
}
` }} />
    </section>
  );
}