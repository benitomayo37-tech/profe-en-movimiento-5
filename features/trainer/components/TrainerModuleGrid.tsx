import type { TrainerModuleId } from "@/features/trainer/types/trainer";

interface TrainerModuleGridProps {
  selectedModule: TrainerModuleId;
  hasProAccess: boolean;
  onSelectModule: (moduleId: TrainerModuleId) => void;
  onProRequired: (toolName: string) => void;
}

const modules: Array<{
  id: TrainerModuleId;
  icon: string;
  title: string;
  description: string;
  badge: string;
}> = [
  {
    id: "training-session",
    icon: "🏃",
    title: "Sesión de entrenamiento",
    description:
      "Organiza objetivos, bloques de trabajo, pausas, recuperación y evaluación.",
    badge: "Free · 3/mes",
  },
  {
    id: "microcycle",
    icon: "📅",
    title: "Microciclo",
    description:
      "Distribuye sesiones, cargas y recuperaciones dentro de una semana o ciclo corto.",
    badge: "Pro 🔒",
  },
  {
    id: "mesocycle",
    icon: "📈",
    title: "Mesociclo",
    description:
      "Construye varias semanas progresivas alrededor de un objetivo deportivo.",
    badge: "Pro 🔒",
  },
  {
    id: "macrocycle",
    icon: "🏆",
    title: "Macrociclo",
    description:
      "Planifica la temporada y sus periodos preparatorio, competitivo y de transición.",
    badge: "Pro 🔒",
  },
];

export default function TrainerModuleGrid({
  selectedModule,
  hasProAccess,
  onSelectModule,
  onProRequired,
}: TrainerModuleGridProps) {
  return (
    <section aria-labelledby="trainer-modules-title">
      <p className="text-sm font-semibold uppercase tracking-[0.16em] text-emerald-700">
        Herramientas de planificación
      </p>
      <h2
        id="trainer-modules-title"
        className="mt-1 text-2xl font-black text-slate-950"
      >
        ¿Qué deseas planificar?
      </h2>

      <div className="mt-6 grid gap-5 md:grid-cols-2 xl:grid-cols-4">
        {modules.map((module) => {
          const isSelected = selectedModule === module.id;
          const isFreeModule = module.id === "training-session";
          const isLocked = !hasProAccess && !isFreeModule;
          return (
            <button
              key={module.id}
              type="button"
              onClick={() => {
                if (isLocked) {
                  onProRequired(module.title);
                  return;
                }
                onSelectModule(module.id);
              }}
              className={`rounded-3xl border bg-white p-6 text-left shadow-sm transition hover:-translate-y-1 hover:shadow-xl ${
                isSelected
                  ? "border-emerald-400 ring-4 ring-emerald-100"
                  : "border-slate-200"
              }`}
            >
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-50 text-2xl">
                <span aria-hidden="true">{module.icon}</span>
              </div>
              <p className={`mt-5 text-xs font-bold uppercase tracking-wide ${isFreeModule ? "text-emerald-700" : "text-orange-700"}`}>
                {isFreeModule ? module.badge : hasProAccess ? "Pro" : module.badge}
              </p>
              <h3 className="mt-2 text-lg font-black text-slate-950">
                {module.title}
              </h3>
              <p className="mt-2 text-sm leading-6 text-slate-600">
                {module.description}
              </p>
            </button>
          );
        })}
      </div>
    </section>
  );
}
