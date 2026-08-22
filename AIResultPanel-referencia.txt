import type { GeneratedAIContent } from "@/features/ai/types/ai";

import AIEmptyState from "./AIEmptyState";
import AILoadingState from "./AILoadingState";
import AINotification from "./AINotification";
import AIResultContent from "./AIResultContent";
import CopyButton from "./CopyButton";
import PrintButton from "./PrintButton";
import AIPrintableResult from "./AIPrintableResult";
import WordButton from "./WordButton";

interface AIResultPanelProps {
  result: GeneratedAIContent | null;
  isGenerating: boolean;
  notification: string;
  onCopy: () => void | Promise<void>;
}

export default function AIResultPanel({
  result,
  isGenerating,
  notification,
  onCopy,
}: AIResultPanelProps) {
  return (
    <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
      <div className="flex flex-col gap-4 border-b border-slate-200 pb-6 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm font-bold uppercase tracking-[0.18em] text-violet-600">
            Resultado
          </p>

          <h2 className="mt-2 text-2xl font-black text-slate-950">
            Espacio de generación
          </h2>
        </div>

        {result && (
  <div className="flex shrink-0 flex-wrap gap-2">
    <CopyButton onCopy={onCopy} />
    <PrintButton />
    <WordButton result={result} />
  </div>
)}
      </div>

      {!result && !isGenerating && <AIEmptyState />}

      {isGenerating && <AILoadingState />}

      {result && !isGenerating && (
  <>
    <AIResultContent result={result} />
    <AIPrintableResult result={result} />
  </>
)}

      <AINotification message={notification} />
    </section>
  );
}