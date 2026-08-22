import QuickActionCard from "./QuickActionCard";

const actions = [
  {
    title: "Profe IA",
    description:
      "Genera planificaciones, rúbricas, actividades y recursos educativos.",
    href: "/ai",
    icon: "✨",
  },
  {
    title: "Recursos",
    description:
      "Explora materiales, guías y contenidos listos para utilizar.",
    href: "/resources",
    icon: "📚",
  },
  {
    title: "App para profes",
    description:
      "Abre miniapps para organizar grupos, tiempos y actividades.",
    href: "/apps",
    icon: "🧰",
  },
  {
    title: "Exámenes estudiantiles",
    description:
      "Crea evaluaciones con código y consulta resultados y calificaciones.",
    href: "/examenes",
    icon: "📝",
  },
  {
    title: "Tienda",
    description:
      "Descubre productos digitales y herramientas para docentes.",
    href: "/store",
    icon: "🛍️",
  },
];

export default function QuickActionsGrid() {
  return (
    <section aria-labelledby="quick-actions-title">
      <div className="mb-5">
        <p className="text-sm font-semibold uppercase tracking-[0.16em] text-blue-700">
          Accesos rápidos
        </p>

        <h2
          id="quick-actions-title"
          className="mt-1 text-2xl font-black text-slate-900"
        >
          ¿Qué deseas hacer hoy?
        </h2>
      </div>

      <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-5">
        {actions.map((action) => (
          <QuickActionCard
            key={action.title}
            title={action.title}
            description={action.description}
            href={action.href}
            icon={action.icon}
          />
        ))}
      </div>
    </section>
  );
}
