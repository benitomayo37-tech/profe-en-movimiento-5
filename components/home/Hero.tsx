import Button from "../ui/Button";

export default function Hero() {
  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-blue-700 via-blue-800 to-slate-950 text-white">
      {/* Iluminación del fondo */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(250,204,21,0.22),transparent_35%)]" />

      <div className="relative mx-auto grid min-h-[620px] max-w-7xl items-center gap-12 px-6 py-20 lg:grid-cols-2 lg:px-8">
        {/* ===========================
            COLUMNA IZQUIERDA
        ============================ */}
        <div>
          <span className="inline-block rounded-full bg-yellow-300/20 px-4 py-2 text-sm font-semibold text-yellow-300">
            Educación Física • Tecnología • Innovación
          </span>

          <h1 className="mt-6 text-5xl font-black leading-tight lg:text-7xl">
            Lleva tus clases al siguiente nivel con
            <span className="block text-yellow-300">
              Profe en Movimiento
            </span>
          </h1>

          <p className="mt-6 max-w-xl text-lg leading-8 text-blue-100">
            Recursos educativos, inteligencia artificial,
            cursos, planificaciones, evaluaciones y
            herramientas digitales diseñadas
            especialmente para docentes.
          </p>

          {/* BOTONES */}
          <div className="mt-10 flex flex-wrap gap-4">
            <Button href="/resources">
              Explorar Recursos
            </Button>

            <Button
              href="/store"
              variant="secondary"
            >
              Visitar Tienda
            </Button>
          </div>

          {/* ESTADÍSTICAS */}
          <div className="mt-14 grid grid-cols-3 gap-8">
            <div>
              <h3 className="text-4xl font-black text-yellow-300">
                500+
              </h3>

              <p className="mt-2 text-blue-100">
                Recursos
              </p>
            </div>

            <div>
              <h3 className="text-4xl font-black text-yellow-300">
                IA
              </h3>

              <p className="mt-2 text-blue-100">
                Herramientas
              </p>
            </div>

            <div>
              <h3 className="text-4xl font-black text-yellow-300">
                24/7
              </h3>

              <p className="mt-2 text-blue-100">
                Disponible
              </p>
            </div>
          </div>
        </div>

        {/* ===========================
            COLUMNA DERECHA
        ============================ */}

        <div className="flex justify-center">
          <div className="w-full max-w-md rounded-3xl bg-white p-8 shadow-2xl">
            <h2 className="text-4xl font-black text-blue-700">
              Plataforma Integral
            </h2>

            <p className="mt-4 text-lg text-gray-600">
              Todo lo que un docente necesita
              en un solo lugar.
            </p>

            <div className="mt-8 space-y-5">
              <div className="rounded-xl bg-blue-50 p-5 font-semibold text-blue-900 shadow-sm">
                📚 Recursos Pedagógicos
              </div>

              <div className="rounded-xl bg-yellow-50 p-5 font-semibold text-yellow-900 shadow-sm">
                🤖 Inteligencia Artificial
              </div>

              <div className="rounded-xl bg-green-50 p-5 font-semibold text-green-900 shadow-sm">
                🎓 Academia Virtual
              </div>

              <div className="rounded-xl bg-purple-50 p-5 font-semibold text-purple-900 shadow-sm">
                🛒 Tienda Digital
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
