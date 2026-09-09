"use client";

import {
  useEffect,
  useState,
  useTransition,
} from "react";

import {
  createStudentAction,
  updateStudentAction,
} from "../server/studentActions";
import type {
  PhysicalEducationStudent,
  StudentStatus,
} from "../types";

interface StudentFormProps {
  courseId: string;
  student?: PhysicalEducationStudent | null;
  onCancel: () => void;
  onSaved: (message: string) => void;
}

interface StudentFormValues {
  firstNames: string;
  lastNames: string;
  studentCode: string;
  listNumber: string;
  status: StudentStatus;
}

const emptyStudent: StudentFormValues = {
  firstNames: "",
  lastNames: "",
  studentCode: "",
  listNumber: "",
  status: "active",
};

export default function StudentForm({
  courseId,
  student,
  onCancel,
  onSaved,
}: StudentFormProps) {
  const [values, setValues] =
    useState<StudentFormValues>(emptyStudent);

  const [fieldErrors, setFieldErrors] = useState<
    Record<string, string>
  >({});

  const [message, setMessage] = useState("");
  const [isPending, startTransition] =
    useTransition();

  useEffect(() => {
    if (student) {
      setValues({
        firstNames: student.firstNames,
        lastNames: student.lastNames,
        studentCode: student.studentCode ?? "",
        listNumber:
          student.listNumber?.toString() ?? "",
        status: student.status,
      });
    } else {
      setValues(emptyStudent);
    }

    setFieldErrors({});
    setMessage("");
  }, [student]);

  function updateValue(
    field: keyof StudentFormValues,
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

    const normalizedListNumber =
      values.listNumber.trim()
        ? Number(values.listNumber)
        : null;

    const baseInput = {
      courseId,
      firstNames: values.firstNames,
      lastNames: values.lastNames,
      studentCode:
        values.studentCode.trim() || null,
      listNumber: normalizedListNumber,
    };

    startTransition(async () => {
      const result = student
        ? await updateStudentAction({
            ...baseInput,
            id: student.id,
            status: values.status,
          })
        : await createStudentAction(baseInput);

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
          {student
            ? "Editar estudiante"
            : "Registrar estudiante"}
        </h2>

        <p className="mt-1 text-sm leading-6 text-slate-600">
          Los nombres y apellidos son obligatorios.
          El código y número de lista son opcionales.
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
          htmlFor="student-first-names"
          className="text-sm font-bold text-slate-800"
        >
          Nombres
        </label>

        <input
          id="student-first-names"
          value={values.firstNames}
          onChange={(event) =>
            updateValue(
              "firstNames",
              event.target.value,
            )
          }
          placeholder="Ej.: María Fernanda"
          autoComplete="off"
          disabled={isPending}
          className={inputClassName}
        />

        {fieldErrors.firstNames ? (
          <p className="mt-1 text-sm text-red-700">
            {fieldErrors.firstNames}
          </p>
        ) : null}
      </div>

      <div>
        <label
          htmlFor="student-last-names"
          className="text-sm font-bold text-slate-800"
        >
          Apellidos
        </label>

        <input
          id="student-last-names"
          value={values.lastNames}
          onChange={(event) =>
            updateValue(
              "lastNames",
              event.target.value,
            )
          }
          placeholder="Ej.: Pérez García"
          autoComplete="off"
          disabled={isPending}
          className={inputClassName}
        />

        {fieldErrors.lastNames ? (
          <p className="mt-1 text-sm text-red-700">
            {fieldErrors.lastNames}
          </p>
        ) : null}
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label
            htmlFor="student-code"
            className="text-sm font-bold text-slate-800"
          >
            Código o identificación
          </label>

          <input
            id="student-code"
            value={values.studentCode}
            onChange={(event) =>
              updateValue(
                "studentCode",
                event.target.value,
              )
            }
            placeholder="Opcional"
            autoComplete="off"
            disabled={isPending}
            className={inputClassName}
          />

          {fieldErrors.studentCode ? (
            <p className="mt-1 text-sm text-red-700">
              {fieldErrors.studentCode}
            </p>
          ) : null}
        </div>

        <div>
          <label
            htmlFor="student-list-number"
            className="text-sm font-bold text-slate-800"
          >
            Número de lista
          </label>

          <input
            id="student-list-number"
            type="number"
            min="1"
            max="999"
            inputMode="numeric"
            value={values.listNumber}
            onChange={(event) =>
              updateValue(
                "listNumber",
                event.target.value,
              )
            }
            placeholder="Opcional"
            disabled={isPending}
            className={inputClassName}
          />

          {fieldErrors.listNumber ? (
            <p className="mt-1 text-sm text-red-700">
              {fieldErrors.listNumber}
            </p>
          ) : null}
        </div>
      </div>

      {student ? (
        <div>
          <label
            htmlFor="student-status"
            className="text-sm font-bold text-slate-800"
          >
            Estado
          </label>

          <select
            id="student-status"
            value={values.status}
            onChange={(event) =>
              updateValue(
                "status",
                event.target.value,
              )
            }
            disabled={isPending}
            className={inputClassName}
          >
            <option value="active">Activo</option>
            <option value="inactive">
              Inactivo
            </option>
            <option value="withdrawn">
              Retirado
            </option>
          </select>
        </div>
      ) : null}

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
            : student
              ? "Guardar cambios"
              : "Registrar estudiante"}
        </button>
      </div>
    </form>
  );
}
