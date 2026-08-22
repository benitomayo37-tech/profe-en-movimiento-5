import Image from "next/image";
import Link from "next/link";
import Container from "../ui/Container";

const platformLinks = [
  { name: "Recursos", href: "/resources" },
  { name: "IA Educativa", href: "/ai" },
  { name: "Tienda Digital", href: "/store" },
];

const resourceLinks = [
  { name: "Biblioteca educativa", href: "/resources" },
  { name: "App para profes", href: "/apps" },
];

const legalLinks = [
  { name: "Política de privacidad", href: "/privacy" },
  { name: "Términos y condiciones", href: "/terms" },
  { name: "Pagos y reembolsos", href: "/refunds" },
  { name: "Contacto", href: "/contact" },
];

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-slate-950 text-white">
      <Container>
        <div className="grid gap-12 py-16 md:grid-cols-2 lg:grid-cols-4">
          {/* MARCA */}
          <div className="lg:col-span-1">
            <Link
              href="/"
              className="inline-flex items-center gap-3"
              aria-label="Ir al inicio"
            >
              <Image
                src="/logos/logo-profe-en-movimiento.png"
                alt="Logo de Profe en Movimiento"
                width={64}
                height={64}
                className="h-16 w-16 object-contain"
              />

              <div>
                <p className="text-lg font-black">
                  Profe en Movimiento
                </p>

                <p className="mt-1 text-xs font-bold uppercase tracking-[0.18em] text-orange-400">
                  Plataforma educativa
                </p>
              </div>
            </Link>

            <p className="mt-6 max-w-sm leading-7 text-slate-300">
              Recursos, formación, inteligencia artificial y herramientas
              digitales para transformar la enseñanza de la Educación Física.
            </p>
          </div>

          {/* PLATAFORMA */}
          <div>
            <h3 className="text-sm font-black uppercase tracking-[0.2em] text-orange-400">
              Plataforma
            </h3>

            <ul className="mt-6 space-y-4">
              {platformLinks.map((link) => (
                <li key={link.name}>
                  <Link
                    href={link.href}
                    className="text-slate-300 transition-colors hover:text-white"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* RECURSOS */}
          <div>
            <h3 className="text-sm font-black uppercase tracking-[0.2em] text-orange-400">
              Recursos
            </h3>

            <ul className="mt-6 space-y-4">
              {resourceLinks.map((link) => (
                <li key={link.name}>
                  <Link
                    href={link.href}
                    className="text-slate-300 transition-colors hover:text-white"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* INFORMACIÓN */}
          <div>
            <h3 className="text-sm font-black uppercase tracking-[0.2em] text-orange-400">
              Información
            </h3>

            <ul className="mt-6 space-y-4">
              {legalLinks.map((link) => (
                <li key={link.name}>
                  <Link
                    href={link.href}
                    className="text-slate-300 transition-colors hover:text-white"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>

            <div className="mt-8">
              <p className="text-sm font-bold text-white">
                Síguenos
              </p>

              <div className="mt-4 flex flex-wrap gap-3">
                <a
                  href="#"
                  aria-label="Facebook"
                  className="flex h-11 w-11 items-center justify-center rounded-xl bg-white/10 text-lg transition hover:bg-orange-500"
                >
                  f
                </a>

                <a
                  href="#"
                  aria-label="YouTube"
                  className="flex h-11 w-11 items-center justify-center rounded-xl bg-white/10 text-lg transition hover:bg-orange-500"
                >
                  ▶
                </a>

                <a
                  href="#"
                  aria-label="Instagram"
                  className="flex h-11 w-11 items-center justify-center rounded-xl bg-white/10 text-lg transition hover:bg-orange-500"
                >
                  ◎
                </a>

                <a
                  href="#"
                  aria-label="TikTok"
                  className="flex h-11 w-11 items-center justify-center rounded-xl bg-white/10 text-lg transition hover:bg-orange-500"
                >
                  ♪
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* LÍNEA INFERIOR */}
        <div className="flex flex-col gap-4 border-t border-white/10 py-6 text-sm text-slate-400 md:flex-row md:items-center md:justify-between">
          <p>
            © {currentYear} Profe en Movimiento. Todos los derechos reservados.
          </p>

          <p>
            Creado para docentes que enseñan con pasión y movimiento.
          </p>
        </div>
      </Container>
    </footer>
  );
}
