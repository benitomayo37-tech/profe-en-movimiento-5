import Image from "next/image";
import Link from "next/link";

interface PublicLandingPageProps { authenticated: boolean }

const featureCards = [
  { icon: "✨", title: "Crea tu planificación con Profe IA", text: "Genera sesiones completas, adaptadas al nivel, tiempo, materiales y metodología de tu clase.", href: "/ai", image: "/images/profe-ia-robot.png" },
  { icon: "🏅", title: "Diseña entrenamientos con Entrenador IA", text: "Crea sesiones, microciclos, mesociclos y macrociclos de forma guiada y profesional.", href: "/entrenador-ia", image: "/images/landing-entrenador-armando.png" },
  { icon: "📝", title: "Evalúa sin repetir la misma prueba", text: "Prepara exámenes, rúbricas y evaluaciones con criterios claros y versiones equivalentes.", href: "/examenes", image: "/images/landing-evaluacion-v2.png" },
];

const featuredTools = [
  { icon: "📋", title: "Planificador", detail: "Organiza tus clases", color: "bg-blue-100 text-blue-700" },
  { icon: "👥", title: "Grupos y equipos", detail: "Distribución inmediata", color: "bg-violet-100 text-violet-700" },
  { icon: "✅", title: "Asistencia", detail: "Registro más ágil", color: "bg-emerald-100 text-emerald-700" },
  { icon: "⏱️", title: "Cronómetro Pro", detail: "Controla cada actividad", color: "bg-orange-100 text-orange-700" },
  { icon: "📝", title: "Rúbricas", detail: "Evalúa con claridad", color: "bg-sky-100 text-sky-700" },
  { icon: "🏟️", title: "Pizarra táctica", detail: "Explica movimientos", color: "bg-rose-100 text-rose-700" },
  { icon: "📊", title: "Estadísticas", detail: "Visualiza progresos", color: "bg-indigo-100 text-indigo-700" },
  { icon: "🎲", title: "Ideas de juegos", detail: "Activa tu creatividad", color: "bg-amber-100 text-amber-700" },
];

const faqs = [
  ["¿Cómo funciona Profe en Movimiento?", "Creas una cuenta y accedes desde el Dashboard a las herramientas, asistentes de IA y recursos disponibles para tu plan."],
  ["¿Necesito pagar para usarla?", "No. Puedes comenzar con una cuenta Free y activar funciones Pro cuando las necesites."],
  ["¿Puedo usarla con mis estudiantes?", "Sí. La plataforma incluye acceso estudiantil, evaluaciones con código y recursos educativos específicos."],
  ["¿Qué incluye el plan Pro?", "Amplía el acceso a asistentes, miniapps y recursos Premium. Los detalles vigentes se muestran antes de contratar."],
];

function ArrowIcon() {
  return <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-5 w-5"><path d="M5 12h14M13 6l6 6-6 6" /></svg>;
}

export default function PublicLandingPage({ authenticated }: PublicLandingPageProps) {
  const primaryHref = authenticated ? "/dashboard" : "/registro";
  const primaryLabel = authenticated ? "Ir al Dashboard" : "Comenzar gratis";
  const heroHref = authenticated ? "/dashboard" : "/login";
  const heroLabel = authenticated ? "Ir al Dashboard" : "Iniciar sesión";
  const memberHref = (destination: string) => authenticated
    ? destination
    : `/login?next=${encodeURIComponent(destination)}`;

  return (
    <main className="overflow-hidden bg-white text-slate-950">
      <header className="sticky top-0 z-50 border-b border-white/10 bg-[#071532]/95 text-white shadow-lg backdrop-blur">
        <div className="mx-auto flex min-h-16 max-w-7xl items-center justify-between gap-5 px-4 sm:px-6 lg:px-8">
          <Link href="/" className="flex items-center gap-2" aria-label="Profe en Movimiento, inicio">
            <Image src="/logos/logo-profe-en-movimiento.png" alt="Profe en Movimiento" width={58} height={58} priority className="h-12 w-12 rounded-lg bg-white object-contain p-1" />
            <span className="hidden text-sm font-black leading-tight sm:block">PROFE<br/><span className="text-orange-400">EN MOVIMIENTO</span></span>
          </Link>
          <nav className="hidden items-center gap-7 text-sm font-bold lg:flex" aria-label="Navegación pública">
            <a href="#inicio" className="hover:text-orange-300">Inicio</a><a href="#producto" className="hover:text-orange-300">Producto</a><a href="#herramientas" className="hover:text-orange-300">Herramientas</a><a href="/#biblioteca" className="hover:text-orange-300">Biblioteca</a><a href="#preguntas" className="hover:text-orange-300">Preguntas</a>
          </nav>
          <div className="flex items-center gap-2">
            {!authenticated && <Link href="/login" className="hidden rounded-xl px-4 py-2.5 text-sm font-black hover:bg-white/10 sm:inline-flex">Iniciar sesión</Link>}
            <Link href={primaryHref} className="inline-flex min-h-11 items-center rounded-xl bg-orange-500 px-4 py-2.5 text-sm font-black text-white shadow-lg shadow-orange-950/30 transition hover:-translate-y-0.5 hover:bg-orange-600">{primaryLabel}</Link>
          </div>
        </div>
      </header>

      <section id="inicio" className="relative isolate bg-[#071532] text-white">
        <div className="absolute inset-0 -z-20 bg-[radial-gradient(circle_at_80%_20%,rgba(37,99,235,.55),transparent_35%),linear-gradient(115deg,#071532_15%,#0b2b68_100%)]" />
        <div className="mx-auto grid min-h-[610px] max-w-7xl items-center gap-10 px-4 py-14 sm:px-6 lg:grid-cols-[.9fr_1.1fr] lg:px-8 lg:py-16">
          <div className="relative order-2 h-[410px] overflow-hidden rounded-[2rem] border border-white/10 bg-gradient-to-br from-blue-900 to-slate-950 shadow-2xl lg:order-1 lg:h-[500px]">
            <Image src="/images/landing-hero-clase-v2.png" alt="Docente observando y orientando una clase activa de Educación Física" fill priority sizes="(max-width: 1024px) 100vw, 45vw" className="object-cover object-center" />
            <div className="absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-[#071532] to-transparent" />
            <div className="absolute bottom-5 left-5 rounded-2xl border border-white/15 bg-slate-950/70 p-4 backdrop-blur"><p className="text-xs font-black uppercase tracking-[.18em] text-orange-300">Creado por docentes</p><p className="mt-1 font-bold">Para la realidad de tus clases</p></div>
          </div>
          <div className="order-1 lg:order-2">
            <span className="inline-flex rounded-full border border-orange-300/30 bg-orange-400/10 px-4 py-2 text-xs font-black uppercase tracking-[.18em] text-orange-300">Educación Física + Inteligencia Artificial</span>
            <h1 className="mt-6 max-w-2xl text-5xl font-black leading-[1.02] tracking-tight sm:text-6xl lg:text-7xl">Haz realidad tu <span className="text-orange-400">clase ideal</span></h1>
            <p className="mt-6 max-w-xl text-lg leading-8 text-blue-100">Planifica, enseña y evalúa con inteligencia artificial. Ahorra tiempo y transforma la experiencia de tus estudiantes sin perder tu criterio docente.</p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row"><Link href={heroHref} className="inline-flex min-h-14 items-center justify-center gap-2 rounded-xl bg-orange-500 px-7 py-3 font-black text-white shadow-xl shadow-orange-950/30 transition hover:-translate-y-0.5 hover:bg-orange-600">{heroLabel}<ArrowIcon /></Link><Link href="/login?rol=estudiante" className="inline-flex min-h-14 items-center justify-center rounded-xl border border-white/25 bg-white/10 px-7 py-3 font-black backdrop-blur transition hover:bg-white/20">Acceso estudiantil</Link></div>
            <p className="mt-4 flex items-center gap-2 text-sm font-semibold text-blue-100"><span className="text-orange-300">✓</span> Acceso Free disponible · Sin tarjeta de crédito</p>
          </div>
        </div>
      </section>

      <section className="relative z-10 mx-auto -mt-7 max-w-6xl px-4 sm:px-6"><div className="grid overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xl sm:grid-cols-3">{[["19", "Herramientas para profes"], ["3", "Asistentes inteligentes"], ["1", "Biblioteca profesional"]].map(([number, label], index) => <div key={label} className={`flex items-center justify-center gap-4 px-6 py-6 ${index ? "border-t border-slate-200 sm:border-l sm:border-t-0" : ""}`}><span className="text-3xl font-black text-blue-800">{number}</span><span className="max-w-36 text-sm font-bold text-slate-600">{label}</span></div>)}</div></section>

            {/* =========================
          MUEVESEGURO — ACCESO FREE
      ========================== */}
      <section className="px-4 py-16 sm:px-6">
        <div className="mx-auto max-w-7xl">
          <div className="relative overflow-hidden rounded-[2rem] border border-orange-200 bg-gradient-to-br from-orange-50 via-white to-blue-50 p-7 shadow-xl sm:p-10 lg:p-12">
            <div className="absolute -right-20 -top-20 h-56 w-56 rounded-full bg-orange-200/40 blur-3xl" />
            <div className="absolute -bottom-24 -left-20 h-64 w-64 rounded-full bg-blue-200/40 blur-3xl" />

            <div className="relative grid items-center gap-8 lg:grid-cols-[1fr_auto]">
              <div>
                <div className="flex flex-wrap items-center gap-3">
                  <span className="inline-flex items-center rounded-full bg-orange-100 px-3 py-1.5 text-xs font-black uppercase tracking-[0.18em] text-orange-700">
                    🛡️ MueveSeguro
                  </span>

                  <span className="inline-flex items-center rounded-full bg-emerald-100 px-3 py-1.5 text-xs font-black uppercase tracking-[0.12em] text-emerald-700">
                    Acceso gratuito
                  </span>
                </div>

                <h2 className="mt-5 max-w-3xl text-3xl font-black leading-tight tracking-tight text-slate-950 sm:text-4xl lg:text-5xl">
                  Seguridad para tus clases.
                  <span className="block text-blue-800">
                    Respuesta cuando más la necesitas.
                  </span>
                </h2>

                <p className="mt-5 max-w-2xl text-base leading-7 text-slate-600 sm:text-lg">
                  Consulta rápidamente orientaciones preventivas y
                  recomendaciones para actuar ante situaciones que puedan
                  presentarse durante la actividad física.
                </p>

                <div className="mt-6 flex flex-wrap gap-x-5 gap-y-2 text-sm font-bold text-slate-600">
                  <span>✓ Sin registro</span>
                  <span>✓ Acceso inmediato</span>
                  <span>✓ Gratis</span>
                </div>

                <div className="mt-8">
                  <Link
                    href="/mueve-seguro"
                    className="inline-flex min-h-12 items-center gap-2 rounded-xl bg-orange-500 px-6 py-3 font-black text-white shadow-lg shadow-orange-900/20 transition hover:-translate-y-0.5 hover:bg-orange-600"
                  >
                    Acceder gratis
                    <ArrowIcon />
                  </Link>
                </div>

                <p className="mt-4 text-sm font-semibold text-slate-500">
                  🔒 Registro de incidentes, historial y seguimiento disponibles
                  en MueveSeguro PRO.
                </p>
              </div>

              <div className="relative flex justify-center lg:justify-end">
  <div className="flex h-40 w-40 items-center justify-center rounded-[2rem] border border-white bg-white/90 shadow-2xl sm:h-48 sm:w-48">
    <svg
      viewBox="0 0 64 64"
      className="h-24 w-24 sm:h-28 sm:w-28"
      aria-hidden="true"
    >
      <path
        d="M32 5 52 12v17c0 13.5-8.2 24.1-20 30C20.2 53.1 12 42.5 12 29V12L32 5Z"
        fill="#EAF2FF"
        stroke="#0B2050"
        strokeWidth="3"
      />
      <path
        d="M32 11 46 16v13c0 9.6-5.4 17.5-14 22.3C23.4 46.5 18 38.6 18 29V16l14-5Z"
        fill="#FC7000"
        opacity="0.95"
      />
      <path
        d="M32 16 42 20v9c0 6.8-3.6 12.5-10 16.5C25.6 41.5 22 35.8 22 29v-9l10-4Z"
        fill="#FFFFFF"
      />
      <path
        d="M32 20 39 23v6c0 4.4-2.3 8.1-7 10.9C27.3 37.1 25 33.4 25 29v-6l7-3Z"
        fill="#3B82F6"
      />
    </svg>
  </div>
</div>
            </div>
          </div>
        </div>
      </section>

      <section id="producto" className="px-4 py-24 sm:px-6"><div className="mx-auto max-w-7xl"><div className="mx-auto max-w-3xl text-center"><p className="text-xs font-black uppercase tracking-[.22em] text-orange-600">Una plataforma, múltiples soluciones</p><h2 className="mt-4 text-4xl font-black tracking-tight sm:text-5xl">Tu próxima clase comienza aquí</h2><p className="mt-5 text-lg leading-8 text-slate-600">Elige la herramienta, agrega el contexto de tu grupo y mantén siempre el control pedagógico.</p></div><div className="mt-14 grid gap-6 lg:grid-cols-3">{featureCards.map(feature => <article key={feature.title} className="group overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm transition hover:-translate-y-2 hover:shadow-xl"><div className="relative h-52 overflow-hidden bg-gradient-to-br from-blue-100 to-slate-100"><Image src={feature.image} alt="" fill sizes="(max-width:1024px) 100vw, 33vw" className={`transition duration-500 group-hover:scale-105 ${feature.image.includes("profe-ia") ? "object-contain object-top" : "object-cover object-center"}`} /></div><div className="p-7"><span className="text-2xl" aria-hidden="true">{feature.icon}</span><h3 className="mt-3 text-xl font-black">{feature.title}</h3><p className="mt-3 leading-7 text-slate-600">{feature.text}</p><Link href={memberHref(feature.href)} className="mt-6 inline-flex items-center gap-2 font-black text-blue-700">Descubrir más <ArrowIcon /></Link></div></article>)}</div></div></section>

      <section className="bg-[#071532] px-4 py-20 text-white sm:px-6">
        <div className="mx-auto grid max-w-7xl items-center gap-12 lg:grid-cols-[.8fr_1.2fr]">
          <div>
            <p className="text-xs font-black uppercase tracking-[.22em] text-orange-300">Inteligencia aplicada</p>
            <h2 className="mt-4 text-4xl font-black leading-tight sm:text-5xl">Tú te enfocas en enseñar. Profe en Movimiento te ayuda a organizar.</h2>
            <p className="mt-6 text-lg leading-8 text-blue-100">Genera una primera versión en segundos, revísala con tu experiencia y exporta un resultado listo para llevar a clase.</p>
            <Link href={primaryHref} className="mt-8 inline-flex min-h-12 items-center gap-2 rounded-xl bg-orange-500 px-6 py-3 font-black hover:bg-orange-600">Probar la plataforma <ArrowIcon /></Link>
          </div>
          <div className="relative rounded-[2rem] border border-white/15 bg-white/5 p-5 shadow-2xl">
            <div className="rounded-2xl bg-slate-50 p-5 text-slate-950 sm:p-8">
              <div className="flex items-center justify-between border-b border-slate-200 pb-5">
                <div><p className="text-xs font-black uppercase tracking-[.16em] text-blue-700">Profe IA</p><h3 className="mt-1 text-xl font-black">Planificación de clase</h3></div>
                <Image src="/images/profe-ia-robot.png" alt="Robot de Profe IA" width={58} height={58} className="h-14 w-14 object-contain" />
              </div>
              <div className="mt-6 grid gap-3 sm:grid-cols-2">
                {["Todos los niveles", "Duración: 45 minutos", "Metodología: Cooperativa", "DUA: Incluido", "Evaluación: Rúbrica", "Materiales: 4 balones"].map(item => <div key={item} className="rounded-xl border border-slate-200 bg-white p-3 text-sm font-bold text-slate-600">✓ {item}</div>)}
              </div>
              <div className="mt-6 h-3 rounded-full bg-blue-100"><div className="h-3 w-4/5 rounded-full bg-gradient-to-r from-blue-700 to-orange-500" /></div>
            </div>
          </div>
        </div>
      </section>

      <section id="biblioteca" className="scroll-mt-20 bg-white px-4 py-24 sm:px-6">
        <div className="mx-auto max-w-7xl">
          <div className="grid items-end gap-8 lg:grid-cols-[1fr_auto]">
            <div>
              <p className="text-xs font-black uppercase tracking-[.22em] text-orange-600">Biblioteca Educativa Profesional</p>
              <h2 className="mt-4 max-w-3xl text-4xl font-black leading-tight sm:text-5xl">Recursos creados para llevarlos directamente a tu clase</h2>
              <p className="mt-5 max-w-3xl text-lg leading-8 text-slate-600">Explora planificaciones, rúbricas, juegos, evaluaciones y materiales organizados por nivel, temática y formato.</p>
            </div>
            <Link href={memberHref("/resources")} className="inline-flex min-h-12 w-fit items-center gap-2 rounded-xl bg-blue-700 px-6 py-3 font-black text-white transition hover:-translate-y-0.5 hover:bg-blue-800">Explorar la biblioteca completa <ArrowIcon /></Link>
          </div>

          <div className="mt-12 grid gap-5 md:grid-cols-3">
            {[
              { icon: "🏀", label: "Planificación", title: "Planificación de Baloncesto", text: "Sesiones estructuradas y adaptables para desarrollar fundamentos técnicos.", color: "from-orange-50 to-amber-50 text-orange-700" },
              { icon: "🏃", label: "Técnica deportiva", title: "Carreras de velocidad", text: "Materiales para enseñar fases, ejecución técnica y evaluación del movimiento.", color: "from-blue-50 to-sky-50 text-blue-700" },
              { icon: "🤝", label: "Juegos educativos", title: "Banco de juegos cooperativos", text: "Propuestas para fortalecer participación, cooperación e inclusión en clase.", color: "from-emerald-50 to-teal-50 text-emerald-700" },
            ].map((resource) => (
              <article key={resource.title} className="group rounded-3xl border border-slate-200 bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-xl">
                <div className={`flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br text-2xl ${resource.color}`} aria-hidden="true">{resource.icon}</div>
                <p className="mt-6 text-xs font-black uppercase tracking-[.16em] text-blue-700">{resource.label}</p>
                <h3 className="mt-2 text-2xl font-black text-slate-950">{resource.title}</h3>
                <p className="mt-3 leading-7 text-slate-600">{resource.text}</p>
                <Link href={memberHref("/resources")} className="mt-6 inline-flex items-center gap-2 text-sm font-black text-orange-600 group-hover:text-orange-700">Ver recursos <ArrowIcon /></Link>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section id="herramientas" className="bg-slate-50 px-4 py-24 sm:px-6">
        <div className="mx-auto grid max-w-7xl items-center gap-12 lg:grid-cols-[.65fr_1.35fr]">
          <div>
            <p className="text-xs font-black uppercase tracking-[.22em] text-orange-600">App para profes</p>
            <h2 className="mt-4 text-4xl font-black leading-tight">Menos tiempo organizando. Más tiempo enseñando.</h2>
            <p className="mt-5 leading-8 text-slate-600">Una caja de herramientas digital para resolver las tareas cotidianas de tu clase desde un solo lugar.</p>
            <Link href={memberHref("/apps")} className="mt-7 inline-flex min-h-12 items-center gap-2 rounded-xl bg-orange-500 px-6 py-3 font-black text-white hover:bg-orange-600">Explorar App para profes <ArrowIcon /></Link>
          </div>

          <div className="overflow-hidden rounded-[2rem] border border-slate-200 bg-white shadow-xl shadow-slate-200/60">
            <div className="flex flex-col gap-4 border-b border-slate-200 bg-gradient-to-r from-[#0b2050] to-blue-800 px-6 py-6 text-white sm:flex-row sm:items-center sm:justify-between">
              <div><p className="text-xs font-black uppercase tracking-[.18em] text-orange-300">Tu espacio de trabajo</p><h3 className="mt-1 text-2xl font-black">Herramientas listas para tu clase</h3></div>
              <span className="w-fit rounded-full border border-white/20 bg-white/10 px-4 py-2 text-xs font-black">19 soluciones integradas</span>
            </div>
            <div className="grid gap-3 p-5 sm:grid-cols-2 xl:grid-cols-4">
              {featuredTools.map((tool) => (
                <div key={tool.title} className="group rounded-2xl border border-slate-200 bg-white p-4 transition hover:-translate-y-1 hover:border-blue-200 hover:shadow-lg">
                  <span className={`flex h-11 w-11 items-center justify-center rounded-xl text-xl ${tool.color}`} aria-hidden="true">{tool.icon}</span>
                  <p className="mt-4 text-sm font-black text-slate-900">{tool.title}</p>
                  <p className="mt-1 text-xs leading-5 text-slate-500">{tool.detail}</p>
                </div>
              ))}
            </div>
            <div className="flex flex-col gap-3 border-t border-slate-100 bg-slate-50 px-6 py-4 text-sm sm:flex-row sm:items-center sm:justify-between">
              <p className="font-semibold text-slate-600"><span className="font-black text-blue-700">Y mucho más:</span> exámenes, informes, biblioteca, videos y recursos.</p>
              <Link href={memberHref("/apps")} className="shrink-0 font-black text-blue-700 hover:text-orange-600">Ver todas →</Link>
            </div>
          </div>
        </div>
      </section>

      <section id="tienda" className="scroll-mt-20 bg-white px-4 py-24 sm:px-6">
        <div className="mx-auto max-w-7xl">
          <div className="grid items-center gap-12 lg:grid-cols-[.9fr_1.1fr]">
            <div className="order-2 grid gap-4 sm:grid-cols-2 lg:order-1">
              <div className="rounded-3xl bg-gradient-to-br from-blue-700 to-blue-950 p-7 text-white shadow-xl sm:row-span-2">
                <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white/15 text-3xl" aria-hidden="true">📘</span>
                <p className="mt-8 text-xs font-black uppercase tracking-[.18em] text-orange-300">Material profesional</p>
                <h3 className="mt-3 text-3xl font-black">Ebooks y bancos de juegos</h3>
                <p className="mt-4 leading-7 text-blue-100">Contenidos organizados para consultar, adaptar y aplicar en tus clases.</p>
              </div>
              <div className="rounded-3xl border border-slate-200 bg-orange-50 p-6">
                <span className="text-3xl" aria-hidden="true">📱</span><h3 className="mt-4 text-xl font-black">Apps docentes</h3><p className="mt-2 text-sm leading-6 text-slate-600">Herramientas digitales para simplificar tareas cotidianas.</p>
              </div>
              <div className="rounded-3xl border border-slate-200 bg-emerald-50 p-6">
                <span className="text-3xl" aria-hidden="true">📦</span><h3 className="mt-4 text-xl font-black">Paquetes educativos</h3><p className="mt-2 text-sm leading-6 text-slate-600">Recursos complementarios reunidos por temática y necesidad.</p>
              </div>
            </div>
            <div className="order-1 lg:order-2">
              <p className="text-xs font-black uppercase tracking-[.22em] text-orange-600">Tienda Digital</p>
              <h2 className="mt-4 text-4xl font-black leading-tight sm:text-5xl">Materiales que continúan acompañándote fuera de la plataforma</h2>
              <p className="mt-6 text-lg leading-8 text-slate-600">Encuentra productos educativos creados para docentes y entrenadores: materiales descargables, aplicaciones, ebooks y paquetes especializados.</p>
              <Link href={memberHref("/store")} className="mt-8 inline-flex min-h-12 items-center gap-2 rounded-xl bg-orange-500 px-6 py-3 font-black text-white transition hover:-translate-y-0.5 hover:bg-orange-600">Visitar la tienda completa <ArrowIcon /></Link>
            </div>
          </div>
        </div>
      </section>

      <section className="relative isolate overflow-hidden bg-[#0b2050] px-4 py-16 text-white sm:px-6"><div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_80%_50%,rgba(249,115,22,.25),transparent_35%)]"/><div className="mx-auto flex max-w-6xl flex-col items-start justify-between gap-8 md:flex-row md:items-center"><div><p className="text-xs font-black uppercase tracking-[.2em] text-orange-300">Empieza hoy</p><h2 className="mt-3 max-w-3xl text-4xl font-black">Tu experiencia docente, potenciada por herramientas creadas para moverse contigo.</h2></div><Link href={primaryHref} className="inline-flex min-h-14 shrink-0 items-center gap-2 rounded-xl bg-orange-500 px-7 py-3 font-black hover:bg-orange-600">{primaryLabel}<ArrowIcon /></Link></div></section>

      <section id="preguntas" className="px-4 py-20 sm:px-6"><div className="mx-auto max-w-5xl"><div className="text-center"><p className="text-xs font-black uppercase tracking-[.22em] text-blue-700">Información clara</p><h2 className="mt-3 text-4xl font-black">¿Tienes dudas? Te las aclaramos</h2></div><div className="mt-10 grid gap-3 md:grid-cols-2">{faqs.map(([question, answer]) => <details key={question} className="group rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"><summary className="flex cursor-pointer list-none items-center justify-between gap-4 font-black">{question}<span className="text-xl text-blue-700 group-open:rotate-45">+</span></summary><p className="mt-4 border-t border-slate-100 pt-4 text-sm leading-7 text-slate-600">{answer}</p></details>)}</div></div></section>

      <footer className="bg-[#061027] px-4 py-12 text-white sm:px-6"><div className="mx-auto grid max-w-7xl gap-10 md:grid-cols-4"><div className="md:col-span-2"><div className="flex items-center gap-3"><Image src="/logos/logo-profe-en-movimiento.png" alt="Profe en Movimiento" width={70} height={70} className="h-16 w-16 rounded-xl bg-white object-contain p-1"/><div><p className="font-black">Profe en Movimiento</p><p className="text-xs font-bold uppercase tracking-[.16em] text-orange-300">Educación física, deporte y salud</p></div></div><p className="mt-5 max-w-md text-sm leading-7 text-slate-300">Plataforma educativa inteligente creada para docentes que enseñan con pasión y movimiento.</p></div><div><p className="font-black text-orange-300">Plataforma</p><div className="mt-4 grid gap-3 text-sm text-slate-300"><Link href="/#biblioteca">Biblioteca</Link><Link href="/#herramientas">App para profes</Link><Link href="/#tienda">Tienda</Link><Link href="/login">Iniciar sesión</Link></div></div><div><p className="font-black text-orange-300">Legal</p><div className="mt-4 grid gap-3 text-sm text-slate-300"><Link href="/terms">Términos de uso</Link><Link href="/privacy">Privacidad</Link><Link href="/refunds">Pagos y reembolsos</Link><Link href="/contact">Contacto</Link></div></div></div><div className="mx-auto mt-10 max-w-7xl border-t border-white/10 pt-6 text-center text-xs text-slate-400">© {new Date().getFullYear()} Profe en Movimiento. Todos los derechos reservados.</div></footer>
    </main>
  );
}
