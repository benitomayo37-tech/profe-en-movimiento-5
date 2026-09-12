"use client";

export default function PrintGradesButton() {
  return (
    <button
      type="button"
      className="no-print inline-flex items-center rounded-xl border border-blue-300 bg-blue-500 px-4 py-2 text-sm font-black text-white shadow-sm transition hover:bg-blue-400"
      onClick={() => window.print()}
    >
      Imprimir / guardar PDF
    </button>
  );
}