import type { Metadata } from "next";

import PublicLandingPage from "@/components/home/PublicLandingPage";
import { getAuthAccess } from "@/features/auth/server/access";

export const dynamic = "force-dynamic";
export const metadata: Metadata = {
  title: "Profe en Movimiento | Plataforma educativa inteligente",
  description: "Planifica, crea recursos y evalúa con inteligencia artificial y herramientas diseñadas para docentes de Educación Física.",
  alternates: { canonical: "/" },
  openGraph: {
    title: "Profe en Movimiento | Plataforma educativa inteligente",
    description: "Planifica, enseña y evalúa con inteligencia artificial y herramientas creadas para Educación Física.",
    url: "/",
    siteName: "Profe en Movimiento",
    locale: "es_EC",
    type: "website",
    images: [{ url: "/images/landing-hero-clase-v2.webp", alt: "Profe en Movimiento: Educación Física e inteligencia artificial" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Profe en Movimiento | Plataforma educativa inteligente",
    description: "Herramientas, recursos e inteligencia artificial para Educación Física.",
    images: ["/images/landing-hero-clase-v2.webp"],
  },
};

export default async function HomePage() {
  const access = await getAuthAccess();
  return <PublicLandingPage authenticated={access.authenticated} />;
}
