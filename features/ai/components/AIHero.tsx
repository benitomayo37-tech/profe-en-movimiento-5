import Image from "next/image";

interface AIHeroProps {
  sourceResourceSlug?: string;
  userName?: string;
}

export default function AIHero({
  sourceResourceSlug,
  userName = "profe",
}: AIHeroProps) {
  return (
    <section className="relative overflow-hidden rounded-3xl border border-blue-700/20 bg-gradient-to-br from-blue-950 via-blue-800 to-blue-600 text-white shadow-xl print:break-inside-avoid print:rounded-2xl print:shadow-none">
      <div className="grid min-h-[280px] items-center gap-6 px-6 py-8 md:grid-cols-[180px_minmax(0,1fr)] lg:grid-cols-[190px_minmax(0,1fr)] lg:px-10 lg:py-0 print:min-h-[210px] print:grid-cols-[120px_minmax(0,1fr)] print:gap-4 print:px-5 print:py-4">
        {/* Profe IA */}
        <div className="hidden items-center justify-center md:flex print:flex">
          <Image
            src="/images/profe-ia-robot.png"
            alt="Profe IA"
            width={220}
            height={280}
            priority
            className="h-auto max-h-[210px] w-auto object-contain print:max-h-[160px]"
          />
        </div>

        {/* Mensaje */}
        <div className="relative z-10 py-6 print:py-2">
          <p className="text-xs font-black uppercase tracking-[0.2em] text-orange-300">
            ✨ Profe IA
          </p>

          <h1 className="mt-4 text-3xl font-black tracking-tight text-white sm:text-4xl print:mt-2 print:text-2xl">
            ¡Hola {userName}! 👋
          </h1>

          <p className="mt-4 max-w-xl text-base leading-7 text-blue-100 print:mt-2 print:text-sm print:leading-5">
            Soy Profe IA, tu asistente inteligente.
            <br />
            Estoy aquí para ayudarte a crear recursos,
            planificaciones y mucho más.
          </p>

          <div className="mt-6 flex max-w-lg items-start gap-3 text-sm leading-6 text-blue-100 print:mt-3 print:gap-2 print:text-xs print:leading-5">
            <span className="text-xl" aria-hidden="true">
              💡
            </span>

            <p>
              Ahorra tiempo, inspira a tus estudiantes y lleva
              tu enseñanza al siguiente nivel.
            </p>
          </div>

          {sourceResourceSlug && (
            <div className="mt-5 max-w-lg rounded-xl border border-orange-200 bg-orange-50 px-4 py-3 print:mt-3 print:px-3 print:py-2">
              <p className="text-xs font-bold uppercase tracking-wide text-orange-600">
                Recurso de origen conectado
              </p>

              <p className="mt-1 truncate text-sm text-slate-600">
                {sourceResourceSlug}
              </p>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
