"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  useMemo,
  useState,
  useTransition,
} from "react";

import {
  deleteStudentAction,
} from "../server/studentActions";
import type {
  PhysicalEducationCourse,
  PhysicalEducationStudent,
  StudentStatus,
} from "../types";
import CsvImportPanel from "./CsvImportPanel";
import StudentForm from "./StudentForm";

type StudentFilter = StudentStatus | "all";
type OpenPanel = "student" | "csv" | null;

interface StudentsWorkspaceProps {
  course: PhysicalEducationCourse;
  initialStudents: PhysicalEducationStudent[];
  initialError?: string;
}

const statusLabels: Record<StudentStatus, string> = {
  active: "Activo",
  inactive: "Inactivo",
  withdrawn: "Retirado",
};

const statusStyles: Record<StudentStatus, string> = {
  active:
    "border-emerald-400 bg-emerald-700 text-white",
  inactive:
    "border-slate-400 bg-slate-700 text-white",
  withdrawn:
    "border-amber-400 bg-amber-600 text-white",
};

export default function StudentsWorkspace({
  course,
  initialStudents,
  initialError = "",
}: StudentsWorkspaceProps) {
  const router = useRouter();

  const [search, setSearch] = useState("");
  const [filter, setFilter] =
    useState<StudentFilter>("active");

  const [openPanel, setOpenPanel] =
    useState<OpenPanel>(null);

  const [editingStudent, setEditingStudent] =
    useState<PhysicalEducationStudent | null>(null);

  const [notice, setNotice] = useState("");
  const [error, setError] = useState(initialError);
  const [isPending, startTransition] =
    useTransition();

  const visibleStudents = useMemo(() => {
    const query = search
      .trim()
      .toLocaleLowerCase("es");

    return initialStudents.filter((student) => {
      const matchesFilter =
        filter === "all"
        || student.status === filter;

      if (!matchesFilter) return false;
      if (!query) return true;

      const searchable = [
        student.firstNames,
        student.lastNames,
        student.studentCode ?? "",
        student.listNumber?.toString() ?? "",
      ]
        .join(" ")
        .toLocaleLowerCase("es");

      return searchable.includes(query);
    });
  }, [filter, initialStudents, search]);

  const totals = useMemo(
    () => ({
      all: initialStudents.length,
      active: initialStudents.filter(
        (student) => student.status === "active",
      ).length,
      inactive: initialStudents.filter(
        (student) => student.status === "inactive",
      ).length,
      withdrawn: initialStudents.filter(
        (student) =>
          student.status === "withdrawn",
      ).length,
    }),
    [initialStudents],
  );

  function openCreateStudent() {
    setEditingStudent(null);
    setOpenPanel("student");
    setNotice("");
    setError("");
  }

  function openEditStudent(
    student: PhysicalEducationStudent,
  ) {
    setEditingStudent(student);
    setOpenPanel("student");
    setNotice("");
    setError("");
  }

  function closePanel() {
    setOpenPanel(null);
    setEditingStudent(null);
  }

  function handleCompleted(message: string) {
    closePanel();
    setError("");
    setNotice(message);
    router.refresh();
  }

  function deleteStudent(
    student: PhysicalEducationStudent,
  ) {
    const fullName =
      `${student.firstNames} ${student.lastNames}`;

    const confirmed = window.confirm(
      `¿Eliminar definitivamente a ${fullName}?`,
    );

    if (!confirmed) return;

    setNotice("");
    setError("");

    startTransition(async () => {
      const result = await deleteStudentAction(
        student.id,
        course.id,
      );

      if (!result.success) {
        setError(result.message);
        return;
      }

      setNotice(result.message);
      router.refresh();
    });
  }

  return (
    <section className="space-y-6">
      <div>
        <Link
          href="/cuaderno-digital"
          className="inline-flex min-h-11 items-center rounded-xl border border-slate-300 bg-white px-4 py-2 text-sm font-bold text-slate-700 transition hover:bg-slate-100"
        >
          ← Volver a cursos
        </Link>
      </div>

      <div className="overflow-hidden rounded-3xl bg-gradient-to-br from-blue-950 via-blue-900 to-blue-700 p-6 text-white shadow-xl sm:p-8">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <span className="inline-flex rounded-full border border-blue-300/50 bg-blue-800 px-3 py-1 text-xs font-black uppercase tracking-[0.16em] text-white">
              {course.active
                ? "Curso activo"
                : "Curso archivado"}
            </span>

            <h2 className="mt-4 text-3xl font-black tracking-tight sm:text-4xl">
              {course.name}
            </h2>

            <p className="mt-2 text-blue-100">
              {course.educationLevel} · {course.grade}
              {" · "}Paralelo {course.parallel}
            </p>

            <p className="mt-1 text-sm text-blue-200">
              {course.schoolYear}
              {course.shift
                ? ` · Jornada ${course.shift}`
                : ""}
            </p>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <button
              type="button"
              onClick={openCreateStudent}
              disabled={!course.active}
              className="min-h-12 rounded-xl bg-orange-600 px-5 py-3 text-sm font-black text-white shadow-lg transition hover:bg-orange-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
              + Registrar estudiante
            </button>

            <button
              type="button"
              onClick={() => {
                setOpenPanel("csv");
                setNotice("");
                setError("");
              }}
              disabled={!course.active}
              className="min-h-12 rounded-xl border border-white/50 bg-white px-5 py-3 text-sm font-black text-blue-950 shadow-lg transition hover:bg-blue-50 disabled:cursor-not-allowed disabled:opacity-50"
            >
              Importar CSV
            </button>
          </div>
        </div>

        <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
          {(
            [
              ["all", "Total"],
              ["active", "Activos"],
              ["inactive", "Inactivos"],
              ["withdrawn", "Retirados"],
            ] as const
          ).map(([key, label]) => (
            <div
              key={key}
              className="rounded-2xl border border-white/20 bg-white/10 p-3 backdrop-blur"
            >
              <p className="text-2xl font-black">
                {totals[key]}
              </p>
              <p className="text-xs font-bold text-blue-100">
                {label}
              </p>
            </div>
          ))}
        </div>
      </div>

      {notice ? (
        <div
          role="status"
          className="rounded-2xl border border-emerald-300 bg-emerald-50 px-4 py-3 text-sm font-bold text-emerald-900"
        >
          {notice}
        </div>
      ) : null}

      {error ? (
        <div
          role="alert"
          className="rounded-2xl border border-red-300 bg-red-50 px-4 py-3 text-sm font-bold text-red-900"
        >
          {error}
        </div>
      ) : null}

      <div className="rounded-3xl border border-slate-200 bg-white p-4 shadow-sm sm:p-6">
        <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-end">
          <div>
            <label
              htmlFor="student-search"
              className="text-sm font-bold text-slate-800"
            >
              Buscar estudiantes
            </label>

            <input
              id="student-search"
              type="search"
              value={search}
              onChange={(event) =>
                setSearch(event.target.value)
              }
              placeholder="Nombre, apellido, código o lista"
              className="mt-2 min-h-12 w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-base text-slate-950 outline-none transition placeholder:text-slate-400 focus:border-blue-600 focus:ring-4 focus:ring-blue-100"
            />
          </div>

          <div
            className="grid grid-cols-2 gap-2 sm:grid-cols-4"
            aria-label="Filtrar estudiantes"
          >
            {(
              [
                ["active", "Activos"],
                ["inactive", "Inactivos"],
                ["withdrawn", "Retirados"],
                ["all", "Todos"],
              ] as const
            ).map(([value, label]) => (
              <button
                key={value}
                type="button"
                onClick={() => setFilter(value)}
                aria-pressed={filter === value}
                className={
                  "min-h-12 rounded-xl px-3 py-2 text-sm font-bold transition "
                  + (
                    filter === value
                      ? "bg-blue-700 text-white shadow-sm"
                      : "border border-slate-300 bg-white text-slate-700 hover:bg-slate-100"
                  )
                }
              >
                {label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {visibleStudents.length ? (
        <div className="grid gap-3">
          {visibleStudents.map((student) => {
            const fullName =
              `${student.lastNames}, ${student.firstNames}`;

            return (
              <article
                key={student.id}
                className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5"
              >
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                  <div className="flex min-w-0 items-start gap-3">
                    <div className="flex h-12 min-w-12 items-center justify-center rounded-2xl bg-blue-100 text-base font-black text-blue-800">
                      {student.listNumber ?? "—"}
                    </div>

                    <div className="min-w-0">
                      <h3 className="font-black text-slate-950">
                        {fullName}
                      </h3>

                      <div className="mt-2 flex flex-wrap items-center gap-2">
                        <span
                          className={
                            "rounded-full border px-2.5 py-1 text-xs font-black "
                            + statusStyles[student.status]
                          }
                        >
                          {statusLabels[student.status]}
                        </span>

                        {student.studentCode ? (
                          <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-bold text-slate-700">
                            Código: {student.studentCode}
                          </span>
                        ) : null}
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2 sm:flex">
                    <button
                      type="button"
                      onClick={() =>
                        openEditStudent(student)
                      }
                      className="min-h-11 rounded-xl border border-slate-300 bg-white px-4 py-2 text-sm font-bold text-slate-700 transition hover:bg-slate-100"
                    >
                      Editar
                    </button>

                    <button
                      type="button"
                      onClick={() =>
                        deleteStudent(student)
                      }
                      disabled={isPending}
                      className="min-h-11 rounded-xl border border-red-300 bg-red-50 px-4 py-2 text-sm font-bold text-red-800 transition hover:bg-red-100 disabled:opacity-50"
                    >
                      Eliminar
                    </button>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      ) : (
        <div className="rounded-3xl border border-dashed border-slate-300 bg-white px-6 py-14 text-center">
          <div
            className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-blue-100 text-3xl"
            aria-hidden="true"
          >
            👥
          </div>

          <h3 className="mt-5 text-xl font-black text-slate-950">
            No hay estudiantes para mostrar
          </h3>

          <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-600">
            Ajusta los filtros, registra un estudiante
            manualmente o importa la lista desde CSV.
          </p>
        </div>
      )}

      {openPanel ? (
        <div
          role="dialog"
          aria-modal="true"
          aria-label={
            openPanel === "csv"
              ? "Importar estudiantes"
              : editingStudent
                ? "Editar estudiante"
                : "Registrar estudiante"
          }
          className="fixed inset-0 z-50 flex items-end justify-center bg-slate-950/60 p-0 backdrop-blur-sm sm:items-center sm:p-6"
        >
          <button
            type="button"
            aria-label="Cerrar panel"
            onClick={closePanel}
            className="absolute inset-0"
          />

          <div className="relative max-h-[94vh] w-full overflow-y-auto rounded-t-3xl bg-white p-5 shadow-2xl sm:max-w-3xl sm:rounded-3xl sm:p-7">
            {openPanel === "csv" ? (
              <CsvImportPanel
                courseId={course.id}
                onCancel={closePanel}
                onImported={handleCompleted}
              />
            ) : (
              <StudentForm
                courseId={course.id}
                student={editingStudent}
                onCancel={closePanel}
                onSaved={handleCompleted}
              />
            )}
          </div>
        </div>
      ) : null}
    </section>
  );
}
