import type { AIToolId } from "@/features/ai/types/ai";
import { aiTools } from "@/features/ai/data/aiTools";

interface AIToolsGridProps {
  selectedToolId: AIToolId;
  hasProAccess: boolean;
  onSelectTool: (toolId: AIToolId) => void;
  onProRequired: (toolName: string) => void;
}

export default function AIToolsGrid({
  selectedToolId,
  hasProAccess,
  onSelectTool,
  onProRequired,
}: AIToolsGridProps) {
  return (
    <section
      aria-labelledby="ai-tools-grid-title"
      className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6"
    >
      <div className="mb-5">
        <p className="text-xs font-black uppercase tracking-[0.18em] text-blue-700">
          Herramientas
        </p>

        <h2
          id="ai-tools-grid-title"
          className="mt-1 text-2xl font-black tracking-tight text-slate-950"
        >
          ¿Qué deseas crear?
        </h2>
      </div>

      <div className="space-y-3">
        {aiTools.map((tool) => {
          const isSelected = tool.id === selectedToolId;
          const isFreeTool = tool.id === "lesson-plan";
          const isLocked = !hasProAccess && !isFreeTool;

          return (
            <button
              key={tool.id}
              type="button"
              data-selected={isSelected}
              onClick={() => {
                if (isLocked) {
                  onProRequired(tool.title);
                  return;
                }
                onSelectTool(tool.id);
              }}
              className={[
                "theme-selectable-card flex w-full items-start gap-4 rounded-2xl border p-4 text-left transition-all",
                "focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-blue-100",
                isSelected
                  ? "border-cyan-400 bg-cyan-50/60 shadow-sm"
                  : "border-slate-200 bg-white hover:border-blue-200 hover:bg-slate-50",
              ].join(" ")}
            >
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-xl">
                <span aria-hidden="true">{tool.icon}</span>
              </div>

              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <h3 className="font-black text-slate-950">
                    {tool.title}
                  </h3>
                  <span className={`rounded-full px-2.5 py-1 text-[10px] font-black uppercase tracking-wide ${isFreeTool ? "bg-emerald-100 text-emerald-800" : "bg-orange-100 text-orange-800"}`}>
                    {isFreeTool ? "Free · 3/mes" : hasProAccess ? "Pro" : "Pro 🔒"}
                  </span>
                </div>

                <p className="mt-1 text-sm leading-6 text-slate-600">
                  {tool.description}
                </p>
              </div>

              {isSelected && (
                <span
                  className="mt-1 text-sm font-black text-cyan-700"
                  aria-hidden="true"
                >
                  ✓
                </span>
              )}
            </button>
          );
        })}
      </div>
    </section>
  );
}
