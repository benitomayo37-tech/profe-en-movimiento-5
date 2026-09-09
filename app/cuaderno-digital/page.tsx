import type { Metadata } from "next";
import { redirect } from "next/navigation";

import {
  AccountBadge,
  AppLayout,
  Sidebar,
} from "@/components/layout";
import Container from "@/components/ui/Container";
import CoursesWorkspace from "@/features/physical-education-notebook/components/CoursesWorkspace";
import { getAuthAccess } from "@/features/auth/server/access";
import { getCourses } from "@/features/physical-education-notebook/server/queries";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title:
    "Cuaderno Digital | Profe en Movimiento",
  description:
    "Administra cursos y estudiantes de Educación Física desde cualquier dispositivo.",
};

export default async function DigitalNotebookPage() {
  const access = await getAuthAccess();

  if (!access.authenticated) {
    redirect(
      "/login?next=/cuaderno-digital",
    );
  }

  const coursesResult = await getCourses();

  return (
    <AppLayout
      sidebar={<Sidebar />}
      header={
        <div className="flex min-h-20 items-center justify-between gap-4 px-4 sm:px-6">
          <div className="min-w-0">
            <h1 className="truncate text-lg font-black text-slate-950">
              Cuaderno Digital
            </h1>

            <p className="truncate text-sm text-slate-500">
              Cursos y estudiantes
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
        <CoursesWorkspace
          initialCourses={
            coursesResult.data ?? []
          }
          initialError={
            coursesResult.success
              ? ""
              : coursesResult.message
          }
        />
      </Container>
    </AppLayout>
  );
}
