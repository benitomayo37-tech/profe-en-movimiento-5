import type { Metadata } from "next";
import {
  notFound,
  redirect,
} from "next/navigation";

import {
  AccountBadge,
  AppLayout,
  Sidebar,
} from "@/components/layout";
import Container from "@/components/ui/Container";
import AttendanceWorkspace from "@/features/physical-education-notebook/components/AttendanceWorkspace";
import { getAuthAccess } from "@/features/auth/server/access";
import {
  getAttendanceByDateAction,
} from "@/features/physical-education-notebook/server/attendanceActions";
import {
  getCourses,
  getStudentsByCourse,
} from "@/features/physical-education-notebook/server/queries";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Asistencia | Cuaderno Digital",
  description:
    "Registra asistencia y observaciones por fecha.",
};

interface AttendancePageProps {
  params: Promise<{
    courseId: string;
  }>;
}

function getEcuadorDate(): string {
  const parts = new Intl.DateTimeFormat(
    "en-US",
    {
      timeZone: "America/Guayaquil",
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    },
  ).formatToParts(new Date());

  const year =
    parts.find((part) => part.type === "year")
      ?.value ?? "";

  const month =
    parts.find((part) => part.type === "month")
      ?.value ?? "";

  const day =
    parts.find((part) => part.type === "day")
      ?.value ?? "";

  return `${year}-${month}-${day}`;
}

export default async function AttendancePage({
  params,
}: AttendancePageProps) {
  const access = await getAuthAccess();

  if (!access.authenticated) {
    redirect(
      "/login?next=/cuaderno-digital",
    );
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
              <h1 className="text-lg font-black text-slate-950">
                Cuaderno Digital
              </h1>

              <p className="text-sm text-slate-500">
                Control de asistencia
              </p>
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
          <div
            role="alert"
            className="rounded-3xl border border-red-300 bg-red-50 p-6 text-red-900"
          >
            <h2 className="text-lg font-black">
              No pudimos cargar el curso
            </h2>

            <p className="mt-2 text-sm">
              {coursesResult.message}
            </p>
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

  const initialDate = getEcuadorDate();

  const [
    studentsResult,
    attendanceResult,
  ] = await Promise.all([
    getStudentsByCourse(course.id),
    getAttendanceByDateAction(
      course.id,
      initialDate,
    ),
  ]);

  const initialError = [
    studentsResult.success
      ? ""
      : studentsResult.message,
    attendanceResult.success
      ? ""
      : attendanceResult.message,
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <AppLayout
      sidebar={<Sidebar />}
      header={
        <div className="flex min-h-20 items-center justify-between gap-4 px-4 sm:px-6">
          <div className="min-w-0">
            <h1 className="truncate text-lg font-black text-slate-950">
              {course.name}
            </h1>

            <p className="truncate text-sm text-slate-500">
              Asistencia y observaciones
            </p>
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
          Profe en Movimiento 5.0 · Cuaderno Digital
          de Educación Física
        </div>
      }
    >
      <Container
        size="wide"
        className="py-6 sm:py-8"
      >
        <AttendanceWorkspace
          course={course}
          students={studentsResult.data ?? []}
          initialDate={initialDate}
          initialSession={
            attendanceResult.data ?? null
          }
          initialError={initialError}
        />
      </Container>
    </AppLayout>
  );
}
