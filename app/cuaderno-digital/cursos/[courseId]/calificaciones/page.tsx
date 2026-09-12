import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";

import {
  AccountBadge,
  AppLayout,
  Sidebar,
} from "@/components/layout";
import Container from "@/components/ui/Container";
import { getAuthAccess } from "@/features/auth/server/access";
import GradesWorkspace from "@/features/physical-education-notebook/components/GradesWorkspace";
import {
  getGradingActivities,
  getGradingPeriods,
  getGradingSettings,
} from "@/features/physical-education-notebook/server/gradingQueries";
import {
  getPeriodGradeSummariesAction,
} from "@/features/physical-education-notebook/server/gradingGradeActions";
import {
  getCourses,
  getStudentsByCourse,
} from "@/features/physical-education-notebook/server/queries";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Calificaciones | Cuaderno Digital",
  description:
    "Registra actividades y calificaciones trimestrales de Educación Física.",
};

interface GradesPageProps {
  params: Promise<{ courseId: string }>;
}

export default async function GradesPage({ params }: GradesPageProps) {
  const access = await getAuthAccess();

  if (!access.authenticated) {
    redirect("/login?next=/cuaderno-digital");
  }

  const { courseId } = await params;
  const coursesResult = await getCourses();

  if (!coursesResult.success) {
    return (
      <AppLayout
        sidebar={<Sidebar />}
        header={
          <div className="flex min-h-20 items-center justify-between gap-4 px-4 sm:px-6">
            <div>
              <h1 className="text-lg font-black text-slate-950">Cuaderno Digital</h1>
              <p className="text-sm text-slate-500">Calificaciones trimestrales</p>
            </div>
            <AccountBadge
              authenticated={access.authenticated}
              email={access.email}
              fullName={access.fullName}
              className="bg-blue-700"
            />
          </div>
        }
      >
        <Container className="py-8">
          <div role="alert" className="rounded-3xl border border-red-300 bg-red-50 p-6 text-red-900">
            <h1 className="text-lg font-black">No pudimos cargar el curso</h1>
            <p className="mt-2 text-sm">{coursesResult.message}</p>
          </div>
        </Container>
      </AppLayout>
    );
  }

  const course = coursesResult.data?.find(
    (item) => item.id === courseId,
  );

  if (!course) {
    notFound();
  }

  const [studentsResult, settingsResult, periodsResult] =
    await Promise.all([
      getStudentsByCourse(course.id),
      getGradingSettings(course.id),
      getGradingPeriods(course.id),
    ]);

  const periods = periodsResult.data ?? [];
  const summaryResults = await Promise.all(
    periods.map((period) =>
      getPeriodGradeSummariesAction(course.id, period.id),
    ),
  );

  const summariesByPeriod = Object.fromEntries(
    periods.map((period, index) => [
      period.id,
      summaryResults[index]?.data ?? [],
    ]),
  );

  const activityResults = await Promise.all(
    periods.map((period) =>
      getGradingActivities(course.id, period.id),
    ),
  );

  const activitiesByPeriod = Object.fromEntries(
    periods.map((period, index) => [
      period.id,
      activityResults[index]?.data ?? [],
    ]),
  );

  const initialError = [
    studentsResult.success ? "" : studentsResult.message,
    settingsResult.success ? "" : settingsResult.message,
    periodsResult.success ? "" : periodsResult.message,
    ...activityResults.map((result) =>
      result.success ? "" : result.message,
    ),
    ...summaryResults.map((result) =>
      result.success ? "" : result.message,
    ),
  ].filter(Boolean).join(" ");

  return (
    <AppLayout
      sidebar={<Sidebar />}
      header={
        <div className="flex min-h-20 items-center justify-between gap-4 px-4 sm:px-6">
          <div className="min-w-0">
            <h1 className="truncate text-lg font-black text-slate-950">{course.name}</h1>
            <p className="truncate text-sm text-slate-500">Calificaciones trimestrales</p>
          </div>
          <AccountBadge
            authenticated={access.authenticated}
            email={access.email}
            fullName={access.fullName}
            className="bg-blue-700"
          />
        </div>
      }
      footer={
        <div className="px-6 py-4 text-center text-xs text-slate-500">
          Profe en Movimiento 5.0 · Cuaderno Digital de Educación Física
        </div>
      }
    >
      <Container size="wide" className="py-6 sm:py-8">
        <GradesWorkspace
          course={course}
          students={studentsResult.data ?? []}
          settings={settingsResult.data ?? null}
          periods={periods}
          activitiesByPeriod={activitiesByPeriod}
          summariesByPeriod={summariesByPeriod}
          initialError={initialError}
        />
      </Container>
    </AppLayout>
  );
}
