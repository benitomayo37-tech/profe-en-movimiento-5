import { AppLayout, Sidebar } from "@/components/layout";
import Container from "@/components/ui/Container";

import DashboardHeader from "./DashboardHeader";
import DashboardHero from "./DashboardHero";
import DashboardSection from "./DashboardSection";
import ProfeSOSCard from "./ProfeSOSCard";
import QuickActionsGrid from "./QuickActionsGrid";
import RecentActivity from "./RecentActivity";
import TipsPanel from "./TipsPanel";

function DashboardFooter() {
  return (
    <div className="px-6 py-4 text-center text-xs text-slate-500">
      Profe en Movimiento 5.0 · Proyecto FARO
    </div>
  );
}

export default function DashboardWorkspace() {
  return (
    <AppLayout
      sidebar={<Sidebar />}
      header={<DashboardHeader />}
      footer={<DashboardFooter />}
    >
      <Container size="wide" className="space-y-10 py-8">
        <DashboardHero />

        <QuickActionsGrid />

        <div className="grid gap-8 xl:grid-cols-2">
          <DashboardSection
            eyebrow="Tu trabajo"
            title="Actividad reciente"
            description="Aquí podrás retomar rápidamente tus planificaciones, recursos y consultas recientes."
          >
            <RecentActivity />
          </DashboardSection>

          <DashboardSection
            eyebrow="Seguridad"
            title="MueveSeguro"
            description="Acceso rápido a orientaciones de actuación inicial y protocolos básicos de seguridad para clases de Educación Física."
          >
            <ProfeSOSCard />
          </DashboardSection>
        </div>

        <DashboardSection
          eyebrow="Recomendaciones"
          title="Consejos para ti"
          description="Ideas prácticas para mejorar la planificación, la participación y la seguridad en tus clases."
        >
          <TipsPanel />
        </DashboardSection>
      </Container>
    </AppLayout>
  );
}
