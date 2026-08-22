import Card from "@/components/ui/Card";

const tips = [
  {
    icon: "🎯",
    title: "Define el propósito de la clase",
    description:
      "Comienza cada planificación con un objetivo claro, observable y adecuado al nivel de tus estudiantes.",
  },
  {
    icon: "🤝",
    title: "Favorece la participación",
    description:
      "Organiza actividades que permitan que todos los estudiantes tengan oportunidades reales de participar.",
  },
  {
    icon: "🛡️",
    title: "Anticipa la seguridad",
    description:
      "Revisa el espacio, los materiales y los posibles riesgos antes de iniciar la actividad física.",
  },
];

export default function TipsPanel() {
  return (
    <Card hover={false} className="border-slate-200 p-6 sm:p-8">
      <div className="grid gap-6 lg:grid-cols-3">
        {tips.map((tip) => (
          <article
            key={tip.title}
            className="flex gap-4 rounded-2xl bg-slate-50 p-5"
          >
            <div
              className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-white text-xl shadow-sm"
              aria-hidden="true"
            >
              {tip.icon}
            </div>

            <div>
              <h3 className="font-bold text-slate-900">
                {tip.title}
              </h3>

              <p className="mt-2 text-sm leading-6 text-slate-600">
                {tip.description}
              </p>
            </div>
          </article>
        ))}
      </div>

      <div className="mt-6 border-t border-slate-200 pt-5">
        <p className="text-xs leading-5 text-slate-500">
          Próximamente, Profe IA podrá ofrecer recomendaciones
          personalizadas según tus clases y herramientas utilizadas.
        </p>
      </div>
    </Card>
  );
}