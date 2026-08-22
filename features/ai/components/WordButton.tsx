"use client";

import type { GeneratedAIContent } from "@/features/ai/types/ai";
import { exportResultToWord } from "@/features/ai/utils/exportResultToWord";

interface WordButtonProps {
  result: GeneratedAIContent;
}

export default function WordButton({
  result,
}: WordButtonProps) {
  async function handleExport() {
    try {
      await exportResultToWord(result);
    } catch (error) {
      console.error(
        "No fue posible exportar el documento Word:",
        error,
      );
    }
  }

  return (
    <button
      type="button"
      onClick={handleExport}
      className="inline-flex min-h-10 items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-bold text-slate-700 transition hover:border-blue-300 hover:bg-blue-50 hover:text-blue-700 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-blue-100"
    >
      <span aria-hidden="true">📄</span>
      Descargar Word
    </button>
  );
}