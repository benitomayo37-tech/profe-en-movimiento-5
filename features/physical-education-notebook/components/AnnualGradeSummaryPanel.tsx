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
    const section = document.getElementById("annual-grade-summary-print");
    if (!section) return;
    const logoUrl = `${window.location.origin}/logos/logo-profe-en-movimiento.png`;
    const printDate = new Intl.DateTimeFormat("es-EC", { day: "2-digit", month: "2-digit", year: "numeric" }).format(new Date());
    const frame = document.createElement("iframe");
    frame.style.position = "fixed";
    frame.style.right = "0";
    frame.style.bottom = "0";
    frame.style.width = "0";
    frame.style.height = "0";
    frame.style.border = "0";
    document.body.appendChild(frame);
    const frameDocument = frame.contentDocument;
    if (!frameDocument) { frame.remove(); return; }
    frame.onload = () => {
      window.setTimeout(() => {
        frame.contentWindow?.focus();
        frame.contentWindow?.print();
        window.setTimeout(() => frame.remove(), 1500);
      }, 200);
    };
    frameDocument.open();
    frameDocument.write(`<!doctype html><html><head><meta charset="utf-8"><title>Resumen anual</title><style>
      @page{size:A4 landscape;margin:12mm}
      *{box-sizing:border-box}
      body{font-family:Arial,sans-serif;color:#0f172a;margin:0;background:#fff}
      .print-header{display:flex;align-items:center;gap:16px;border-bottom:3px solid #173b78;padding-bottom:12px;margin-bottom:16px}
      .print-header img{width:72px;height:72px;object-fit:contain}
      .print-header h1{margin:0;color:#173b78;font-size:22px}
      .print-header h2{margin:8px 0 0;font-size:18px}
      .print-header p{margin:3px 0 0;color:#64748b;font-size:12px}
      button{display:none!important}
      .overflow-x-auto{overflow:visible!important}
      table{width:100%!important;min-width:0!important;border-collapse:collapse;margin-top:16px}
      th,td{border:1px solid #cbd5e1;padding:8px;text-align:left}
      th{background:#e0e7ff;color:#1e1b4b}
      td{font-weight:700}
      .print-date{margin-top:18px;text-align:right;font-size:12px;color:#475569}
      .print-signature{width:260px;margin:42px 0 0 auto;text-align:center;font-size:12px;color:#0f172a}
      .print-signature-line{border-top:1px solid #0f172a;margin-bottom:6px}
    </style></head><body><header class="print-header"><img src="${logoUrl}" alt="Profe en Movimiento"><div><h1>Profe en Movimiento</h1><p>Plataforma educativa inteligente</p><h2>Resumen anual de calificaciones</h2></div></header>${section.innerHTML}<p class="print-date">Fecha de emisiÃ³n: ${printDate}</p><div class="print-signature"><div class="print-signature-line"></div><strong>Docente responsable</strong><br>Firma</div></body></html>`);
    frameDocument.close();
  }  return (
    <section id="annual-grade-summary-print" className="print-summary rounded-3xl border-2 border-indigo-300 bg-indigo-50 p-5 text-slate-950 shadow-sm">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div><p className="text-xs font-black uppercase tracking-[0.16em] text-indigo-700">Cierre acad&eacute;mico</p><h2 className="mt-1 text-2xl font-black">Resumen anual</h2><p className="mt-1 text-sm font-bold text-slate-600">Promedio de las notas finales de los tres trimestres.</p></div>
        <button type="button" onClick={printAnnual} className="rounded-xl border-2 border-indigo-600 bg-indigo-600 px-4 py-2 text-sm font-black text-white hover:bg-indigo-700">Imprimir resumen anual</button>
      </div>
      <div className="mt-4 overflow-x-auto rounded-2xl border border-indigo-200 bg-white">
        <table className="min-w-[760px] w-full text-left text-sm"><thead className="bg-indigo-100 text-indigo-950"><tr><th className="px-4 py-3 font-black">Estudiante</th><th className="px-4 py-3 font-black">1.&ordm; trimestre</th><th className="px-4 py-3 font-black">2.&ordm; trimestre</th><th className="px-4 py-3 font-black">3.&ordm; trimestre</th><th className="px-4 py-3 font-black">Promedio anual</th></tr></thead><tbody>{students.filter((student) => student.status === "active").map((student) => { const scores = orderedPeriods.map((period) => { if (!period) return null; return summariesByPeriod[period.id]?.find((summary) => summary.studentId === student.id)?.finalScore ?? null; }); const complete = scores.every((score) => score !== null); const average = complete ? scores.reduce((sum, score) => sum + (score ?? 0), 0) / 3 : null; return <tr key={student.id} className="border-t border-slate-200"><th className="px-4 py-3 font-black">{student.lastNames}, {student.firstNames}</th>{scores.map((score, index) => <td key={index} className={score === null ? "px-4 py-3 font-black text-orange-500" : "px-4 py-3 font-black text-slate-900"}>{value(score)}</td>)}<td className={average === null ? "px-4 py-3 font-black text-orange-500" : "px-4 py-3 text-lg font-black text-indigo-700"}>{value(average)}</td></tr>; })}</tbody></table>
      </div>
    </section>
  );
}
