"use client";

interface ResultRow {
  studentName: string;
  institution: string;
  gradeCourse: string;
  score: number | null;
  status: string;
  startedAt: string;
  submittedAt: string;
}

function csvCell(value: string | number | null) {
  const normalized = value === null ? "" : String(value);
  return `"${normalized.replaceAll('"', '""')}"`;
}

export default function TeacherResultsActions({ title, code, rows }: { title: string; code: string; rows: ResultRow[] }) {
  function downloadCsv() {
    const header = ["Estudiante", "Unidad Educativa", "Grado y curso", "Nota", "Estado", "Inicio", "Entrega"];
    const body = rows.map((row) => [row.studentName, row.institution, row.gradeCourse, row.score, row.status, row.startedAt, row.submittedAt]);
    const csv = `\uFEFF${[header, ...body].map((line) => line.map(csvCell).join(",")).join("\r\n")}`;
    const url = URL.createObjectURL(new Blob([csv], { type: "text/csv;charset=utf-8" }));
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = `${title}-${code}-resultados.csv`.toLowerCase().replace(/[^a-z0-9áéíóúñ-]+/gi, "-");
    anchor.click();
    URL.revokeObjectURL(url);
  }

  return <div className="no-print flex flex-wrap gap-3"><button type="button" onClick={() => window.print()} className="rounded-xl bg-orange-500 px-5 py-3 text-sm font-black text-white shadow-sm">Imprimir reporte</button><button type="button" onClick={downloadCsv} className="rounded-xl border border-blue-300 bg-white px-5 py-3 text-sm font-black text-blue-800">Descargar CSV</button></div>;
}
