"use client";

import {
  useEffect,
  useState,
  useTransition,
} from "react";

import {
  createCourseAction,
  updateCourseAction,
} from "../server/courseActions";
import type {
  CreateCourseInput,
  PhysicalEducationCourse,
} from "../types";

interface CourseFormProps {
  course?: PhysicalEducationCourse | null;
  onCancel: () => void;
  onSaved: (message: string) => void;
}

function currentSchoolYear(): string {
  const year = new Date().getFullYear();
  return `${year}-${year + 1}`;
}

const emptyCourse: CreateCourseInput = {
  name: "",
  educationLevel: "Bachillerato General Unificado",
  grade: "",
  parallel: "",
  schoolYear: currentSchoolYear(),
  shift: "Vespertina",
};

export default function CourseForm({
  course,
  onCancel,
  onSaved,
}: CourseFormProps) {
  const [values, setValues] =
    useState<CreateCourseInput>(emptyCourse);

  const [fieldErrors, setFieldErrors] = useState<
    Record<string, string>
  >({});

  const [message, setMessage] = useState("");
  const [isPending, startTransition] =
    useTransition();

  useEffect(() => {
    if (course) {
      setValues({
        name: course.name,
        educationLevel: course.educationLevel,
        grade: course.grade,
        parallel: course.parallel,
        schoolYear: course.schoolYear,
        shift: course.shift,
      });
    } else {
      setValues({
        ...emptyCourse,
        schoolYear: currentSchoolYear(),
      });
    }

    setFieldErrors({});
    setMessage("");
  }, [course]);

  function updateValue(
    field: keyof CreateCourseInput,
    value: string,
  ) {
    setValues((current) => ({
      ...current,
      [field]: value,
    }));

    setFieldErrors((current) => {
      if (!current[field]) return current;

      const next = { ...current };
      delete next[field];
      return next;
    });
  }

  function handleSubmit(
    event: React.FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();
    setFieldErrors({});
    setMessage("");

    startTransition(async () => {
      const result = course
        ? await updateCourseAction({
            ...values,
            id: course.id,
            active: course.active,
          })
        : await createCourseAction(values);

      if (!result.success) {
        setFieldErrors(result.fieldErrors ?? {});
        setMessage(result.message);
        return;
      }

      onSaved(result.message);
    });
  }

  const inputClassName =
    "mt-2 min-h-12 w-full rounded-xl border "
    + "border-slate-300 bg-white px-4 py-3 "
    + "text-base text-slate-950 outline-none "
    + "transition placeholder:text-slate-400 "
    + "focus:border-blue-600 focus:ring-4 "
    + "focus:ring-blue-100 disabled:opacity-60";

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-5"
    >
      <div>
        <h2 className="text-xl font-black text-slate-950">
          {course ? "Editar curso" : "Crear curso"}
        </h2>

        <p className="mt-1 text-sm leading-6 text-slate-600">
          Registra el curso y su paralelo para
          organizar a tus estudiantes.
        </p>
      </div>

      {message ? (
        <div
          role="alert"
          className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-800"
        >
          {message}
        </div>
      ) : null}

      <div>
        <label
          htmlFor="course-name"
          className="text-sm font-bold text-slate-800"
        >
          Nombre del curso
        </label>

        <input
          id="course-name"
          value={values.name}
          onChange={(event) =>
            updateValue("name", event.target.value)
          }
          placeholder="Ej.: 3ro BGU Vespertina"
          autoComplete="off"
          disabled={isPending}
          className={inputClassName}
        />

        {fieldErrors.name ? (
          <p className="mt-1 text-sm text-red-700">
            {fieldErrors.name}
          </p>
        ) : null}
      </div>

      <div>
        <label
          htmlFor="education-level"
          className="text-sm font-bold text-slate-800"
        >
          Nivel educativo
        </label>

        <select
          id="education-level"
          value={values.educationLevel}
          onChange={(event) =>
            updateValue(
              "educationLevel",
              event.target.value,
            )
          }
          disabled={isPending}
          className={inputClassName}
        >
          <option>Educación General Básica Media</option>
          <option>Educación General Básica Superior</option>
          <option>Bachillerato General Unificado</option>
          <option>Entrenamiento deportivo</option>
          <option>Otro</option>
        </select>

        {fieldErrors.educationLevel ? (
          <p className="mt-1 text-sm text-red-700">
            {fieldErrors.educationLevel}
          </p>
        ) : null}
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label
            htmlFor="course-grade"
            className="text-sm font-bold text-slate-800"
          >
            Grado o curso
          </label>

          <input
            id="course-grade"
            value={values.grade}
            onChange={(event) =>
              updateValue("grade", event.target.value)
            }
            placeholder="Ej.: 3ro BGU"
            autoComplete="off"
            disabled={isPending}
            className={inputClassName}
          />

          {fieldErrors.grade ? (
            <p className="mt-1 text-sm text-red-700">
              {fieldErrors.grade}
            </p>
          ) : null}
        </div>

        <div>
          <label
            htmlFor="course-parallel"
            className="text-sm font-bold text-slate-800"
          >
            Paralelo
          </label>

          <input
            id="course-parallel"
            value={values.parallel}
            onChange={(event) =>
              updateValue(
                "parallel",
                event.target.value,
              )
            }
            placeholder="Ej.: A"
            autoComplete="off"
            disabled={isPending}
            className={inputClassName}
          />

          {fieldErrors.parallel ? (
            <p className="mt-1 text-sm text-red-700">
              {fieldErrors.parallel}
            </p>
          ) : null}
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label
            htmlFor="school-year"
            className="text-sm font-bold text-slate-800"
          >
            Año lectivo
          </label>

          <input
            id="school-year"
            value={values.schoolYear}
            onChange={(event) =>
              updateValue(
                "schoolYear",
                event.target.value,
              )
            }
            placeholder="Ej.: 2026-2027"
            autoComplete="off"
            disabled={isPending}
            className={inputClassName}
          />

          {fieldErrors.schoolYear ? (
            <p className="mt-1 text-sm text-red-700">
              {fieldErrors.schoolYear}
            </p>
          ) : null}
        </div>

        <div>
          <label
            htmlFor="course-shift"
            className="text-sm font-bold text-slate-800"
          >
            Jornada
          </label>

          <select
            id="course-shift"
            value={values.shift ?? ""}
            onChange={(event) =>
              updateValue("shift", event.target.value)
            }
            disabled={isPending}
            className={inputClassName}
          >
            <option value="">Sin especificar</option>
            <option>Matutina</option>
            <option>Vespertina</option>
            <option>Nocturna</option>
            <option>Otra</option>
          </select>

          {fieldErrors.shift ? (
            <p className="mt-1 text-sm text-red-700">
              {fieldErrors.shift}
            </p>
          ) : null}
        </div>
      </div>

      <div className="flex flex-col-reverse gap-3 pt-2 sm:flex-row sm:justify-end">
        <button
          type="button"
          onClick={onCancel}
          disabled={isPending}
          className="min-h-12 rounded-xl border border-slate-300 bg-white px-5 py-3 text-sm font-bold text-slate-700 transition hover:bg-slate-100 disabled:opacity-60"
        >
          Cancelar
        </button>

        <button
          type="submit"
          disabled={isPending}
          className="min-h-12 rounded-xl bg-blue-700 px-5 py-3 text-sm font-black text-white shadow-sm transition hover:bg-blue-800 focus:outline-none focus:ring-4 focus:ring-blue-200 disabled:cursor-wait disabled:opacity-60"
        >
          {isPending
            ? "Guardando…"
            : course
              ? "Guardar cambios"
              : "Crear curso"}
        </button>
      </div>
    </form>
  );
}
