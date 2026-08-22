import Image from "next/image";

import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";

interface DashboardHeroProps {
  userName?: string;
}

export default function DashboardHero({
  userName = "Armando",
}: DashboardHeroProps) {
  return (
    <Card className="relative overflow-hidden border-0 bg-gradient-to-br from-blue-950 via-blue-800 to-blue-600 p-0 text-white">
      <section className="relative min-h-[330px] overflow-hidden px-7 py-9 sm:px-10 lg:px-8 lg:py-0 md:pr-72 lg:pr-80">
        <div
          aria-hidden="true"
          className="absolute -right-24 -top-28 h-72 w-72 rounded-full border border-cyan-300/20 bg-cyan-300/10 blur-2xl"
        />

        <div className="relative z-10 grid min-h-[330px] items-center gap-6 md:grid-cols-[135px_minmax(0,1fr)] lg:grid-cols-[150px_minmax(0,1fr)_255px]">
          <div className="hidden items-center justify-center md:flex">
            <Image
              src="/images/profe-ia-robot.png"
              alt="Robot de Profe en Movimiento"
              width={190}
              height={270}
              priority
              className="h-auto max-h-[205px] w-auto object-contain drop-shadow-2xl"
            />
          </div>

          <div className="py-4">
            <span className="inline-flex rounded-full border border-white/20 bg-white/10 px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.18em] text-blue-100">
              Centro de operaciones
            </span>

            <h2 className="mt-5 text-3xl font-black tracking-tight sm:text-4xl">
              ¡Hola {userName}! 👋
            </h2>

            <p className="mt-4 max-w-2xl text-sm leading-7 text-blue-100 sm:text-base">
              Organiza tus clases, crea recursos educativos y utiliza Profe IA
              desde un solo lugar.
            </p>

            <div className="mt-7 flex flex-wrap gap-3">
              <Button href="/ai" variant="primary">
                Abrir Profe IA
              </Button>

              <Button href="/resources" variant="outline">
                <span className="text-blue-700">Explorar recursos</span>
              </Button>
            </div>
          </div>
</div>
      </section>
    
      {/* FOTO EXCLUSIVA DEL DASHBOARD: INICIO */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute bottom-0 right-4 z-20 hidden h-[94%] w-[250px] items-end justify-center md:flex lg:right-8 lg:w-[300px]"
      >
        <Image
          src="/images/profe-armando-hero.png"
          alt=""
          width={320}
          height={520}
          priority
          className="h-full w-auto object-contain object-bottom drop-shadow-[0_14px_18px_rgba(0,0,0,0.28)]"
        />
      </div>
      {/* FOTO EXCLUSIVA DEL DASHBOARD: FIN */}</Card>
  );
}
