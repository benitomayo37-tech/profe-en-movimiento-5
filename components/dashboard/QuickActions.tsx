import Link from "next/link";

const actions = [
  {
    title: "Profe IA",
    description:
      "Genera planificaciones, rúbricas, actividades y recursos educativos.",
    href: "/ai",
    icon: "✨",
    access: "Free + Pro",
  },
  {
    title: "Entrenador IA",
    description:
      "Diseña sesiones, microciclos, mesociclos y macrociclos deportivos.",
    href: "/entrenador-ia",
    icon: "🏅",
    access: "Free + Pro",
  },
  {
    title: "Recursos",
    description:
      "Explora materiales, guías y contenidos listos para utilizar.",
    href: "/resources",
    icon: "📚",
    access: "Free + Pro",
  },
  {
    title: "MueveSeguro",
    description:
      "Recibe orientación educativa para prevenir riesgos y actuar con seguridad.",
    href: "/mueve-seguro",
    icon: "🛡️",
    access: "Free + Pro",
  },
  {
    title: "Exámenes estudiantiles",
    description:
      "Crea evaluaciones con código y consulta resultados y calificaciones.",
    href: "/examenes",
    icon: "📝",
    access: "Cuenta docente",
  },
  {
    title: "Academia",
    description:
      "Avanza en cursos breves, evaluaciones y certificados de formación docente.",
    href: "/academia",
    icon: "🎓",
    access: "Curso Free",
  },
  {
    title: "Tienda",
    description:
      "Descubre productos digitales y herramientas para docentes.",
    href: "/store",
    icon: "🛍️",
    access: "Catálogo",
  },
  {
    title: "Movimiento para Todos",
    description: "Actividad física adaptada, orientaciones para cuidadores y recursos inclusivos.",
    href: "/movimiento-para-todos",
    icon: "🌎",
    access: "Free + Pro",
  },
  {
    title: "App para profes",
    description: "Accede a 20 herramientas para organizar y dinamizar tus clases.",
    href: "/apps",
    icon: "📱",
    access: "Free + Pro",
  },
];

export default function QuickActions() {
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

      <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
        {actions.map((action) => (
          <Link
            key={action.title}
            href={action.href}
            className="group rounded-3xl border border-slate-200 bg-white p-6 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-blue-200 hover:shadow-xl focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-blue-100"
          >
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-50 text-2xl transition-transform duration-300 group-hover:scale-110">
              <span aria-hidden="true">{action.icon}</span>
            </div>

            <h3 className="mt-5 text-lg font-black text-slate-900">
              {action.title}
            </h3>

            <span className="mt-3 inline-flex rounded-full bg-slate-100 px-2.5 py-1 text-[10px] font-black uppercase tracking-wide text-slate-600">{action.access}</span>

            <p className="mt-2 text-sm leading-6 text-slate-600">
              {action.description}
            </p>

            <span className="mt-5 inline-flex items-center text-sm font-bold text-blue-700">
              Abrir
              <span
                aria-hidden="true"
                className="ml-2 transition-transform group-hover:translate-x-1"
              >
                →
              </span>
            </span>
          </Link>
        ))}
      </div>
    </section>
  );
}
