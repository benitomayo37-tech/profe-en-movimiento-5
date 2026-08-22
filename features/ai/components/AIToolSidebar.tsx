import type { AIToolId } from "@/features/ai/types/ai";
import { aiTools } from "@/features/ai/data/aiTools";

interface AIToolSidebarProps {
  selectedToolId: AIToolId;
  onSelectTool: (toolId: AIToolId) => void;
}

export default function AIToolSidebar({
  selectedToolId,
  onSelectTool,
}: AIToolSidebarProps) {
  return (
    <aside>
      <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
        <p className="text-sm font-bold uppercase tracking-[0.18em] text-sky-700">
          Herramientas
        </p>

        <h2 className="mt-2 text-2xl font-black text-slate-950">
          ¿Qué deseas crear?
        </h2>

        <div className="mt-6 space-y-3">
          {aiTools.map((tool) => {
            const isSelected = selectedToolId === tool.id;

            return (
              <button
                key={tool.id}
                type="button"
                onClick={() => onSelectTool(tool.id as AIToolId)}
                aria-pressed={isSelected}
                className={`w-full rounded-2xl border p-4 text-left transition ${
                  isSelected
                    ? "border-sky-300 bg-sky-50 shadow-sm"
                    : "border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50"
                }`}
              >
                <div className="flex gap-3">
                  <span className="text-2xl" aria-hidden="true">
                    {tool.icon}
                  </span>

                  <div>
                    <p className="font-bold text-slate-950">
                      {tool.title}
                    </p>

                    <p className="mt-1 text-xs leading-5 text-slate-600">
                      {tool.description}
                    </p>
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </aside>
  );
}
