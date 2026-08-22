import type { Metadata } from "next";

import PublicLandingPage from "@/components/home/PublicLandingPage";
import { getAuthAccess } from "@/features/auth/server/access";

export const dynamic = "force-dynamic";
export const metadata: Metadata = {
  title: "Profe en Movimiento | Plataforma educativa inteligente",
  description: "Planifica, crea recursos y evalúa con inteligencia artificial y herramientas diseñadas para docentes de Educación Física.",
};

export default async function HomePage() {
  const access = await getAuthAccess();
  return <PublicLandingPage authenticated={access.authenticated} />;
}
