"use client";

import type { GradingPeriod, PhysicalEducationStudent, StudentPeriodGradeSummary } from "../types";

interface Props {
  students: PhysicalEducationStudent[];
  periods: GradingPeriod[];
  summariesByPeriod: Record<string, StudentPeriodGradeSummary[]>;
}

function value(score: number | null): string {
  return score === null ? "Pendiente" : score.toFixed(2);
}

export default function AnnualGradeSummaryPanel({ students, periods, summariesByPeriod }: Props) {
  const orderedPeriods = [1, 2, 3].map((number) => periods.find((period) => period.periodNumber === number));
  function printAnnual() {
    const printWindow = window.open("", "_blank", "width=1100,height=800");
    if (!printWindow) return;
    const section = document.getElementById("annual-grade-summary-print");
    if (!section) return;
    printWindow.document.write(`<!doctype html><html><head><title>Resumen anual</title><style>body{font-family:Arial,sans-serif;color:#0f172a;padding:24px}h2{margin:0 0 8px}p{color:#475569}table{width:100%;border-collapse:collapse;margin-top:20px}th,td{border:1px solid #cbd5e1;padding:10px;text-align:left}th{background:#e0e7ff;color:#1e1b4b}td{font-weight:700}@media print{body{padding:0}}</style></head><body>${section.innerHTML}</body></html>`);
    printWindow.document.close();
    printWindow.focus();
    window.setTimeout(() => printWindow.print(), 400);
  }
  return (
    <section id="annual-grade-summary-print" className="print-summary rounded-3xl border-2 border-indigo-300 bg-indigo-50 p-5 text-slate-950 shadow-sm">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div><p className="text-xs font-black uppercase tracking-[0.16em] text-indigo-700">Cierre acad&eacute;mico</p><h2 className="mt-1 text-2xl font-black">Resumen anual</h2><p className="mt-1 text-sm font-bold text-slate-600">Promedio de las notas finales de los tres trimestres.</p></div>
        <button type="button" onClick={printAnnual} className="rounded-xl border-2 border-indigo-600 bg-indigo-600 px-4 py-2 text-sm font-black text-white hover:bg-indigo-700">Imprimir resumen anual</button>
      </div>
      <div className="mt-4 overflow-x-auto rounded-2xl border border-indigo-200 bg-white">
        <table className="min-w-[760px] w-full text-left text-sm"><thead className="bg-indigo-100 text-indigo-950"><tr><th className="px-4 py-3 font-black">Estudiante</th><th className="px-4 py-3 font-black">1.&ordm; trimestre</th><th className="px-4 py-3 font-black">2.&ordm; trimestre</th><th className="px-4 py-3 font-black">3.&ordm; trimestre</th><th className="px-4 py-3 font-black">Promedio anual</th></tr></thead><tbody>{students.filter((student) => student.status === "active").map((student) => { const scores = orderedPeriods.map((period) => { if (!period) return null; return summariesByPeriod[period.id]?.find((summary) => summary.studentId === student.id)?.finalScore ?? null; }); const complete = scores.every((score) => score !== null); const average = complete ? scores.reduce((sum, score) => sum + (score ?? 0), 0) / 3 : null; return <tr key={student.id} className="border-t border-slate-200"><th className="px-4 py-3 font-black">{student.lastNames}, {student.firstNames}</th>{scores.map((score, index) => <td key={index} className={score === null ? "px-4 py-3 font-black text-orange-500" : "px-4 py-3 font-black text-slate-900"}>{value(score)}</td>)}<td className={average === null ? "px-4 py-3 font-black text-orange-500" : "px-4 py-3 text-lg font-black text-indigo-700"}>{value(average)}</td></tr>; })}</tbody></table>
      </div>
      <p className="mt-3 text-xs font-bold text-slate-600">El promedio anual se calcula &uacute;nicamente cuando existen las tres notas trimestrales.</p>
    </section>
  );
}
