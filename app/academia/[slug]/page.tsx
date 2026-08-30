import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";

import { AppLayout, Sidebar } from "@/components/layout";
import Container from "@/components/ui/Container";
import { AcademyHeader } from "@/features/academy/components/AcademyHeader";
import { CourseWorkspace } from "@/features/academy/components/CourseWorkspace";
import { academyCourse } from "@/features/academy/data/courses";
import { getAcademyProgress } from "@/features/academy/server/progress";
import { getAuthAccess } from "@/features/auth/server/access";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: `${academyCourse.title} | Academia` };

export default async function CoursePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  if (slug !== academyCourse.slug) notFound();
  const access = await getAuthAccess();
  if (!access.authenticated) redirect(`/login?next=/academia/${slug}`);
  const progress = await getAcademyProgress(access.userId);
  return <AppLayout sidebar={<Sidebar />} header={<AcademyHeader access={access} title="Curso en progreso" />} footer={<div className="px-6 py-4 text-center text-xs text-slate-500">Academia · {academyCourse.title}</div>}><Container className="py-8"><CourseWorkspace initialProgress={progress} /></Container></AppLayout>;
}
