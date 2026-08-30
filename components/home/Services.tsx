const services = [
  {
    title: "Recursos educativos",
    description:
      "Planificaciones, rúbricas, evaluaciones, juegos y materiales descargables para tus clases.",
    icon: "📚",
    href: "/resources",
    color: "bg-blue-50 text-blue-900",
  },
  {
    title: "App para profes",
    description:
      "Veinte herramientas activas para organizar, evaluar y acompañar tus clases.",
    icon: "📱",
    href: "/apps",
    color: "bg-emerald-50 text-emerald-900",
  },
  {
    title: "IA educativa",
    description:
      "Herramientas inteligentes para planificar, evaluar y crear contenido en menos tiempo.",
    icon: "🤖",
    href: "/ai",
    color: "bg-yellow-50 text-yellow-900",
  },
  {
    title: "Tienda digital",
    description:
      "Aplicaciones, ebooks, bancos de juegos y productos creados especialmente para docentes.",
    icon: "🛒",
    href: "/store",
    color: "bg-purple-50 text-purple-900",
  },
];

export default function Services() {
  return (
    <section className="bg-white px-6 py-20">
      <div className="mx-auto max-w-7xl">
        <div className="mx-auto max-w-3xl text-center">
          <span className="text-sm font-bold uppercase tracking-[0.25em] text-blue-700">
            Todo en un solo lugar
          </span>

          <h2 className="mt-4 text-4xl font-black text-slate-900 sm:text-5xl">
            Herramientas para enseñar mejor
          </h2>

          <p className="mt-5 text-lg leading-8 text-slate-600">
            Una plataforma creada para acompañar al docente antes, durante y
            después de cada clase.
          </p>
        </div>

        <div className="mt-14 grid gap-6 md:grid-cols-2 xl:grid-cols-4">
          {services.map((service) => (
            <a
              key={service.title}
              href={service.href}
              className="group rounded-3xl border border-slate-200 bg-white p-7 shadow-sm transition duration-300 hover:-translate-y-2 hover:shadow-xl"
            >
              <div
                className={`flex h-14 w-14 items-center justify-center rounded-2xl text-2xl ${service.color}`}
              >
                {service.icon}
              </div>

              <h3 className="mt-6 text-2xl font-black text-slate-900">
                {service.title}
              </h3>

              <p className="mt-3 leading-7 text-slate-600">
                {service.description}
              </p>

              <span className="mt-6 inline-flex font-bold text-blue-700 transition group-hover:translate-x-1">
                Explorar →
              </span>
            </a>
          ))}
        </div>
      </div>
    </section>
  );
}
