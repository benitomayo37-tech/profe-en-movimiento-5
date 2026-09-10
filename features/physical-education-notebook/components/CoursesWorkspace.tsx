"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  useMemo,
  useState,
  useTransition,
} from "react";

import {
  setCourseActiveAction,
} from "../server/courseActions";
import type {
  PhysicalEducationCourse,
} from "../types";
import CourseForm from "./CourseForm";

type CourseFilter = "active" | "archived" | "all";

interface CoursesWorkspaceProps {
  initialCourses: PhysicalEducationCourse[];
  initialError?: string;
}

export default function CoursesWorkspace({
  initialCourses,
  initialError = "",
}: CoursesWorkspaceProps) {
  const router = useRouter();

  const [search, setSearch] = useState("");
  const [filter, setFilter] =
    useState<CourseFilter>("active");

  const [formOpen, setFormOpen] = useState(false);
  const [editingCourse, setEditingCourse] =
    useState<PhysicalEducationCourse | null>(null);

  const [notice, setNotice] = useState("");
  const [error, setError] = useState(initialError);
  const [isPending, startTransition] =
    useTransition();

  const visibleCourses = useMemo(() => {
    const query = search
      .trim()
      .toLocaleLowerCase("es");

    return initialCourses.filter((course) => {
      const matchesFilter =
        filter === "all"
        || (
          filter === "active"
            ? course.active
            : !course.active
        );

      if (!matchesFilter) return false;
      if (!query) return true;

      const searchable = [
        course.name,
        course.educationLevel,
        course.grade,
        course.parallel,
        course.schoolYear,
        course.shift ?? "",
      ]
        .join(" ")
        .toLocaleLowerCase("es");

      return searchable.includes(query);
    });
  }, [filter, initialCourses, search]);

  function openCreateForm() {
    setEditingCourse(null);
    setFormOpen(true);
    setNotice("");
    setError("");
  }

  function openEditForm(
    course: PhysicalEducationCourse,
  ) {
    setEditingCourse(course);
    setFormOpen(true);
    setNotice("");
    setError("");
  }

  function closeForm() {
    setFormOpen(false);
    setEditingCourse(null);
  }

  function handleSaved(message: string) {
    closeForm();
    setError("");
    setNotice(message);
    router.refresh();
  }

  function toggleCourse(
    course: PhysicalEducationCourse,
  ) {
    const action = course.active
      ? "archivar"
      : "reactivar";

    const confirmed = window.confirm(
      `¿Deseas ${action} el curso "${course.name}"?`,
    );

    if (!confirmed) return;

    setNotice("");
    setError("");

    startTransition(async () => {
      const result = await setCourseActiveAction(
        course.id,
        !course.active,
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
      <div className="overflow-hidden rounded-3xl bg-gradient-to-br from-blue-950 via-blue-900 to-blue-700 p-6 text-white shadow-xl sm:p-8">
        <div className="max-w-3xl">
          <span className="inline-flex rounded-full border border-blue-300/50 bg-blue-800 px-3 py-1 text-xs font-black uppercase tracking-[0.16em] text-white">
            Cuaderno Digital
          </span>

          <h2 className="mt-4 text-3xl font-black tracking-tight sm:text-4xl">
            Tus cursos, siempre a mano
          </h2>

          <p className="mt-3 max-w-2xl text-sm leading-6 text-blue-100 sm:text-base">
            Organiza cursos y estudiantes desde el
            teléfono para ahorrar tiempo durante la
            clase de Educación Física.
          </p>

          <button
            type="button"
            onClick={openCreateForm}
            className="mt-6 min-h-12 w-full rounded-xl bg-orange-600 px-5 py-3 text-sm font-black text-white shadow-lg transition hover:bg-orange-700 focus:outline-none focus:ring-4 focus:ring-orange-200 sm:w-auto"
          >
            + Crear curso
          </button>
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
              htmlFor="course-search"
              className="text-sm font-bold text-slate-800"
            >
              Buscar cursos
            </label>

            <input
              id="course-search"
              type="search"
              value={search}
              onChange={(event) =>
                setSearch(event.target.value)
              }
              placeholder="Nombre, curso, paralelo o jornada"
              className="mt-2 min-h-12 w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-base text-slate-950 outline-none transition placeholder:text-slate-400 focus:border-blue-600 focus:ring-4 focus:ring-blue-100"
            />
          </div>

          <div
            className="grid grid-cols-3 gap-2"
            aria-label="Filtrar cursos"
          >
            {(
              [
                ["active", "Activos"],
                ["archived", "Archivados"],
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

      {visibleCourses.length ? (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {visibleCourses.map((course) => (
            <article
              key={course.id}
              className={
                "flex min-h-full flex-col rounded-3xl border bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-lg "
                + (
                  course.active
                    ? "border-slate-200"
                    : "border-slate-300 opacity-80"
                )
              }
            >
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <span
                    className={
                      "inline-flex rounded-full px-3 py-1 text-xs font-black "
                      + (
                        course.active
                          ? "border border-emerald-400 bg-emerald-700 text-white"
                          : "border border-slate-400 bg-slate-700 text-white"
                      )
                    }
                  >
                    {course.active
                      ? "Activo"
                      : "Archivado"}
                  </span>

                  <h3 className="mt-3 text-xl font-black text-slate-950">
                    {course.name}
                  </h3>
                </div>

                <div className="flex h-12 min-w-12 items-center justify-center rounded-2xl border border-blue-400 bg-blue-700 text-xl font-black text-white shadow-sm shadow-blue-950/25">
                  {course.parallel}
                </div>
              </div>

              <dl className="mt-5 grid grid-cols-2 gap-3 text-sm">
                <div className="rounded-2xl bg-slate-50 p-3">
                  <dt className="font-semibold text-slate-500">
                    Curso
                  </dt>
                  <dd className="mt-1 font-black text-slate-900">
                    {course.grade}
                  </dd>
                </div>

                <div className="rounded-2xl bg-slate-50 p-3">
                  <dt className="font-semibold text-slate-500">
                    Estudiantes
                  </dt>
                  <dd className="mt-1 font-black text-slate-900">
                    {course.studentCount}
                  </dd>
                </div>

                <div className="rounded-2xl bg-slate-50 p-3">
                  <dt className="font-semibold text-slate-500">
                    Año lectivo
                  </dt>
                  <dd className="mt-1 font-black text-slate-900">
                    {course.schoolYear}
                  </dd>
                </div>

                <div className="rounded-2xl bg-slate-50 p-3">
                  <dt className="font-semibold text-slate-500">
                    Jornada
                  </dt>
                  <dd className="mt-1 font-black text-slate-900">
                    {course.shift ?? "Sin especificar"}
                  </dd>
                </div>
              </dl>

              <p className="mt-4 text-sm leading-6 text-slate-600">
                {course.educationLevel}
              </p>

              <div className="mt-auto grid gap-2 pt-5 sm:grid-cols-3">
                <Link
                  href={`/cuaderno-digital/cursos/${course.id}`}
                  className="flex min-h-12 items-center justify-center rounded-xl bg-blue-700 px-3 py-2 text-center text-sm font-black text-white transition hover:bg-blue-800"
                >
                  Estudiantes
                </Link>

                <button
                  type="button"
                  onClick={() => openEditForm(course)}
                  className="min-h-12 rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm font-bold text-slate-700 transition hover:bg-slate-100"
                >
                  Editar
                </button>

                <button
                  type="button"
                  onClick={() => toggleCourse(course)}
                  disabled={isPending}
                  className="min-h-12 rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm font-bold text-slate-700 transition hover:bg-slate-100 disabled:opacity-60"
                >
                  {course.active
                    ? "Archivar"
                    : "Reactivar"}
                </button>
              </div>
            </article>
          ))}
        </div>
      ) : (
        <div className="rounded-3xl border border-dashed border-slate-300 bg-white px-6 py-14 text-center">
          <div
            className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-blue-100 text-3xl"
            aria-hidden="true"
          >
            📘
          </div>

          <h3 className="mt-5 text-xl font-black text-slate-950">
            No hay cursos para mostrar
          </h3>

          <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-600">
            Ajusta la búsqueda o crea tu primer curso
            para comenzar el Cuaderno Digital.
          </p>

          <button
            type="button"
            onClick={openCreateForm}
            className="mt-5 min-h-12 rounded-xl bg-blue-700 px-5 py-3 text-sm font-black text-white transition hover:bg-blue-800"
          >
            Crear mi primer curso
          </button>
        </div>
      )}

      {formOpen ? (
        <div
          role="dialog"
          aria-modal="true"
          aria-label={
            editingCourse
              ? "Editar curso"
              : "Crear curso"
          }
          className="fixed inset-0 z-50 flex items-end justify-center bg-slate-950/60 p-0 backdrop-blur-sm sm:items-center sm:p-6"
        >
          <button
            type="button"
            aria-label="Cerrar formulario"
            onClick={closeForm}
            className="absolute inset-0"
          />

          <div className="relative max-h-[92vh] w-full overflow-y-auto rounded-t-3xl bg-white p-5 shadow-2xl sm:max-w-2xl sm:rounded-3xl sm:p-7">
            <CourseForm
              course={editingCourse}
              onCancel={closeForm}
              onSaved={handleSaved}
            />
          </div>
        </div>
      ) : null}
    </section>
  );
}
