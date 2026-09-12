import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";

import { AccountBadge, AppLayout, Sidebar } from "@/components/layout";
import Container from "@/components/ui/Container";
import { getAuthAccess } from "@/features/auth/server/access";
import GradeEntryWorkspace from "@/features/physical-education-notebook/components/GradeEntryWorkspace";
import { getGradesByActivity, getGradingActivities, getGradingPeriods } from "@/features/physical-education-notebook/server/gradingQueries";
import { getCourses, getStudentsByCourse } from "@/features/physical-education-notebook/server/queries";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Registro de notas | Cuaderno Digital", description: "Registra calificaciones por estudiante." };

interface Props { params: Promise<{ courseId: string; activityId: string }> }

export default async function GradeEntryPage({ params }: Props) {
  const access = await getAuthAccess();
  if (!access.authenticated) redirect("/login?next=/cuaderno-digital");
  const { courseId, activityId } = await params;
  const coursesResult = await getCourses();
  const course = coursesResult.data?.find((item) => item.id === courseId);
  if (!course) notFound();
  const [periodsResult, studentsResult] = await Promise.all([getGradingPeriods(course.id), getStudentsByCourse(course.id)]);
  const periods = periodsResult.data ?? [];
  const activityResults = await Promise.all(periods.map((period) => getGradingActivities(course.id, period.id)));
  const activity = activityResults.flatMap((result) => result.data ?? []).find((item) => item.id === activityId);
  if (!activity) notFound();
  const [gradesResult] = await Promise.all([getGradesByActivity(course.id, activity.id)]);

  return (
    <AppLayout sidebar={<Sidebar />} header={<div className="flex min-h-20 items-center justify-between gap-4 px-4 sm:px-6"><div className="min-w-0"><h1 className="truncate text-lg font-black text-slate-950">{course.name}</h1><p className="truncate text-sm text-slate-500">Registro de calificaciones</p></div><AccountBadge authenticated={access.authenticated} email={access.email} fullName={access.fullName} className="bg-blue-700" /></div>} footer={<div className="px-6 py-4 text-center text-xs text-slate-500">Profe en Movimiento 5.0 · Cuaderno Digital de Educación Física</div>}>
      <Container size="wide" className="py-6 sm:py-8"><div className="mb-5"><a href={`/cuaderno-digital/cursos/${course.id}/calificaciones`} className="text-sm font-black text-blue-700 hover:underline">← Volver a calificaciones</a></div><GradeEntryWorkspace courseId={course.id} activity={activity} students={(studentsResult.data ?? []).filter((student) => student.status === "active")} initialGrades={gradesResult.data ?? []} /></Container>
    </AppLayout>
  );
}
