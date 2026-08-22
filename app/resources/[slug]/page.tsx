import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { AccountBadge, AppLayout, Sidebar } from "@/components/layout";
import ResourceHero from "@/components/resources/ResourceHero";
import ResourceOverview from "@/components/resources/ResourceOverview";
import ResourceSidebar from "@/components/resources/ResourceSidebar";
import ResourceViewTracker from "@/components/resources/ResourceViewTracker";
import { getAuthAccess } from "@/features/auth/server/access";
import { getLibraryResourceBySlug } from "@/features/resources/server/catalog";
import { getResourceLibraryState } from "@/features/resources/server/library";

export const dynamic = "force-dynamic";

interface ResourcePageProps {
  params: Promise<{
    slug: string;
  }>;
}

function ResourcePageHeader({ authenticated, email, fullName }: { authenticated: boolean; email: string | null; fullName: string | null }) {
  return (
    <div className="flex min-h-20 items-center justify-between gap-4 px-6">
      <div className="min-w-0">
        <h1 className="truncate text-lg font-bold text-slate-950">Ficha de recurso</h1>
        <p className="truncate text-sm text-slate-500">Biblioteca educativa profesional</p>
      </div>
      <AccountBadge authenticated={authenticated} email={email} fullName={fullName} className="bg-orange-500" />
    </div>
  );
}

function ResourcePageFooter() {
  return <div className="px-6 py-4 text-center text-xs text-slate-500">Profe en Movimiento 5.0 · Recursos educativos · Proyecto FARO</div>;
}

export async function generateMetadata({
  params,
}: ResourcePageProps): Promise<Metadata> {
  const { slug } = await params;
  const resource = await getLibraryResourceBySlug(slug);

  if (!resource) {
    return {
      title:
        "Recurso no encontrado | Profe en Movimiento",
      description:
        "El recurso educativo solicitado no se encuentra disponible.",
    };
  }

  return {
    title: `${resource.title} | Profe en Movimiento`,
    description: resource.summary,
    keywords: resource.tags,
    openGraph: {
      title: resource.title,
      description: resource.summary,
      type: "article",
    },
  };
}

export default async function ResourcePage({
  params,
}: ResourcePageProps) {
  const { slug } = await params;
  const access = await getAuthAccess();
  const resource = await getLibraryResourceBySlug(slug, access.role === "admin");

  if (!resource) {
    notFound();
  }

  const libraryState = await getResourceLibraryState(access.userId);
  const stats = libraryState.stats[resource.slug] ?? { views: 0, downloads: 0 };
  const initialFavorite = libraryState.favoriteSlugs.includes(resource.slug);

  return (
    <AppLayout
      sidebar={<Sidebar />}
      header={<ResourcePageHeader authenticated={access.authenticated} email={access.email} fullName={access.fullName} />}
      footer={<ResourcePageFooter />}
      mainClassName="flex-1 bg-slate-50 p-0"
    >
      <div className="min-h-screen bg-slate-50">
        <ResourceViewTracker slug={resource.slug} />
        <ResourceHero resource={resource} stats={stats} />

        <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8 lg:py-16">
          <div className="grid items-start gap-8 lg:grid-cols-[minmax(0,1fr)_360px]">
            <ResourceOverview resource={resource} />

            <ResourceSidebar
              resource={resource}
              authenticated={access.authenticated}
              initialFavorite={initialFavorite}
              stats={stats}
            />
          </div>
        </section>
      </div>
    </AppLayout>
  );
}
