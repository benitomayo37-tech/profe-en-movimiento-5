import type { AIToolId } from "@/features/ai/types/ai";

interface AIQuickActionsProps {
  hasProAccess: boolean;
  onSelectTool: (toolId: AIToolId) => void;
  onProRequired: (toolName: string) => void;
}

const actions: Array<{
  title: string;
  description: string;
  toolId: AIToolId;
  icon: string;
  accent: string;
}> = [
  {
    title: "Crear planificación",
    description: "Genera planificaciones completas y listas para usar.",
    toolId: "lesson-plan",
    icon: "📅",
    accent: "bg-emerald-50 text-emerald-700",
  },
  {
    title: "Crear evaluación",
    description: "Diseña evaluaciones con criterios e indicadores.",
    toolId: "assessment",
    icon: "📋",
    accent: "bg-blue-50 text-blue-700",
  },
  {
    title: "Crear rúbrica",
    description: "Crea rúbricas personalizadas con facilidad.",
    toolId: "rubric",
    icon: "🏆",
    accent: "bg-amber-50 text-amber-700",
  },
  {
    title: "Banco de juegos",
    description: "Crea juegos y actividades adaptadas para tus clases.",
    toolId: "game",
    icon: "🏃",
    accent: "bg-violet-50 text-violet-700",
  },
  {
    title: "Circuito físico",
    description: "Organiza estaciones, ejercicios, tiempos y rotaciones.",
    toolId: "physical-circuit",
    icon: "⚡",
    accent: "bg-cyan-50 text-cyan-700",
  },
];

export default function AIQuickActions({
  hasProAccess,
  onSelectTool,
  onProRequired,
}: AIQuickActionsProps) {
  return (
    <section aria-labelledby="ai-quick-actions-title">
      <div className="mb-5 flex items-center gap-3">
        <span className="text-xl" aria-hidden="true">
          ⚡
        </span>

        <h2
          id="ai-quick-actions-title"
          className="text-xl font-black tracking-tight text-slate-950"
        >
          Acciones rápidas
        </h2>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {actions.map((action) => {
          const isFreeTool = action.toolId === "lesson-plan";
          const isLocked = !hasProAccess && !isFreeTool;

          return (
          <button
            key={action.title}
            type="button"
            onClick={() => {
              if (isLocked) {
                onProRequired(action.title);
                return;
              }
              onSelectTool(action.toolId);
            }}
            className="group flex min-h-[190px] flex-col rounded-3xl border border-slate-200 bg-white p-5 text-left shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-blue-200 hover:shadow-xl focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-blue-100"
          >
            <div
              className={`flex h-12 w-12 items-center justify-center rounded-2xl text-2xl ${action.accent}`}
            >
              <span aria-hidden="true">{action.icon}</span>
            </div>

            <h3 className="mt-5 text-base font-black text-slate-950">
              {action.title}
            </h3>

            <span className={`mt-2 w-fit rounded-full px-2.5 py-1 text-[10px] font-black uppercase tracking-wide ${isFreeTool ? "bg-emerald-100 text-emerald-800" : "bg-orange-100 text-orange-800"}`}>
              {isFreeTool ? "Free · 3/mes" : hasProAccess ? "Pro" : "Pro 🔒"}
            </span>

            <p className="mt-2 text-sm leading-6 text-slate-600">
              {action.description}
            </p>

            <span className="mt-auto pt-4 text-sm font-bold text-blue-700">
              Seleccionar →
            </span>
          </button>
          );
        })}
      </div>
    </section>
  );
}
