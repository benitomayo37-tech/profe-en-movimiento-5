"use client";

import {
  useRef,
  useState,
  useTransition,
} from "react";

import { parseStudentCsv } from "../csv";
import { importStudentsAction } from "../server/importActions";
import type {
  StudentCsvRow,
  StudentCsvRowError,
} from "../types";

interface CsvImportPanelProps {
  courseId: string;
  onCancel: () => void;
  onImported: (message: string) => void;
}

export default function CsvImportPanel({
  courseId,
  onCancel,
  onImported,
}: CsvImportPanelProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  const [fileName, setFileName] = useState("");
  const [rows, setRows] = useState<StudentCsvRow[]>(
    [],
  );

  const [errors, setErrors] = useState<
    StudentCsvRowError[]
  >([]);

  const [message, setMessage] = useState("");
  const [isPending, startTransition] =
    useTransition();

  async function handleFile(
    event: React.ChangeEvent<HTMLInputElement>,
  ) {
    const file = event.target.files?.[0];

    setRows([]);
    setErrors([]);
    setMessage("");
    setFileName(file?.name ?? "");

    if (!file) return;

    if (
      !file.name.toLowerCase().endsWith(".csv")
    ) {
      setErrors([
        {
          rowNumber: 1,
          message:
            "Selecciona un archivo con extensión CSV.",
        },
      ]);
      return;
    }

    try {
      const source = await file.text();
      const result = parseStudentCsv(source);

      setRows(result.rows);
      setErrors(result.errors);
    } catch (error) {
      console.error(
        "No se pudo leer el archivo CSV:",
        error,
      );

      setErrors([
        {
          rowNumber: 1,
          message:
            "No pudimos leer el archivo seleccionado.",
        },
      ]);
    }
  }

  function resetFile() {
    setFileName("");
    setRows([]);
    setErrors([]);
    setMessage("");

    if (inputRef.current) {
      inputRef.current.value = "";
    }
  }

  function handleImport() {
    if (!rows.length) {
      setMessage(
        "No hay estudiantes válidos para importar.",
      );
      return;
    }

    setMessage("");

    startTransition(async () => {
      const result = await importStudentsAction(
        courseId,
        rows,
      );

      if (!result.success) {
        setMessage(result.message);

        if (result.data?.errors) {
          setErrors(result.data.errors);
        }

        return;
      }

      onImported(result.message);
    });
  }

  return (
    <section className="space-y-5">
      <div>
        <h2 className="text-xl font-black text-slate-950">
          Importar estudiantes
        </h2>

        <p className="mt-1 text-sm leading-6 text-slate-600">
          Utiliza un archivo CSV con las columnas
          nombres y apellidos. Código y número de
          lista son opcionales.
        </p>
      </div>

      <div className="rounded-2xl border border-blue-200 bg-blue-50 p-4">
        <p className="text-sm font-black text-blue-950">
          Formato recomendado
        </p>

        <code className="mt-2 block overflow-x-auto rounded-xl bg-white px-3 py-2 text-xs text-slate-800">
          nombres,apellidos,codigo,numero_lista
        </code>
      </div>

      <div>
        <label
          htmlFor="student-csv"
          className="block text-sm font-bold text-slate-800"
        >
          Archivo CSV
        </label>

        <input
          ref={inputRef}
          id="student-csv"
          type="file"
          accept=".csv,text/csv"
          onChange={handleFile}
          disabled={isPending}
          className="mt-2 block min-h-12 w-full cursor-pointer rounded-xl border border-slate-300 bg-white text-sm text-slate-700 file:mr-4 file:min-h-12 file:border-0 file:bg-blue-700 file:px-4 file:font-black file:text-white hover:file:bg-blue-800 disabled:opacity-60"
        />

        {fileName ? (
          <p className="mt-2 text-sm text-slate-600">
            Archivo:{" "}
            <span className="font-bold">
              {fileName}
            </span>
          </p>
        ) : null}
      </div>

      {message ? (
        <div
          role="alert"
          className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-800"
        >
          {message}
        </div>
      ) : null}

      {rows.length ? (
        <div className="rounded-2xl border border-emerald-300 bg-emerald-50 p-4">
          <p className="font-black text-emerald-950">
            {rows.length} estudiantes listos
          </p>

          <p className="mt-1 text-sm text-emerald-800">
            Revisa la vista previa antes de confirmar.
          </p>
        </div>
      ) : null}

      {errors.length ? (
        <div className="rounded-2xl border border-amber-300 bg-amber-50 p-4">
          <p className="font-black text-amber-950">
            {errors.length} observaciones
          </p>

          <ul className="mt-3 max-h-40 space-y-2 overflow-y-auto text-sm text-amber-900">
            {errors.slice(0, 50).map((error, index) => (
              <li
                key={`${error.rowNumber}-${index}`}
                className="rounded-lg bg-white/80 px-3 py-2"
              >
                <span className="font-black">
                  Fila {error.rowNumber}:
                </span>{" "}
                {error.message}
              </li>
            ))}
          </ul>

          {errors.length > 50 ? (
            <p className="mt-3 text-sm font-bold text-amber-900">
              Se muestran las primeras 50 observaciones.
            </p>
          ) : null}
        </div>
      ) : null}

      {rows.length ? (
        <div>
          <h3 className="text-sm font-black text-slate-900">
            Vista previa
          </h3>

          <div className="mt-2 max-h-64 overflow-auto rounded-2xl border border-slate-200">
            <table className="w-full min-w-[560px] border-collapse text-left text-sm">
              <thead className="sticky top-0 bg-slate-100 text-slate-700">
                <tr>
                  <th className="px-3 py-3">Fila</th>
                  <th className="px-3 py-3">Apellidos</th>
                  <th className="px-3 py-3">Nombres</th>
                  <th className="px-3 py-3">Código</th>
                  <th className="px-3 py-3">Lista</th>
                </tr>
              </thead>

              <tbody>
                {rows.slice(0, 100).map((row) => (
                  <tr
                    key={row.rowNumber}
                    className="border-t border-slate-200 bg-white"
                  >
                    <td className="px-3 py-3">
                      {row.rowNumber}
                    </td>
                    <td className="px-3 py-3 font-bold">
                      {row.lastNames}
                    </td>
                    <td className="px-3 py-3">
                      {row.firstNames}
                    </td>
                    <td className="px-3 py-3">
                      {row.studentCode ?? "—"}
                    </td>
                    <td className="px-3 py-3">
                      {row.listNumber ?? "—"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {rows.length > 100 ? (
            <p className="mt-2 text-xs text-slate-500">
              Se muestran los primeros 100 estudiantes.
            </p>
          ) : null}
        </div>
      ) : null}

      <div className="flex flex-col-reverse gap-3 pt-2 sm:flex-row sm:justify-between">
        <button
          type="button"
          onClick={
            rows.length || errors.length
              ? resetFile
              : onCancel
          }
          disabled={isPending}
          className="min-h-12 rounded-xl border border-slate-300 bg-white px-5 py-3 text-sm font-bold text-slate-700 transition hover:bg-slate-100 disabled:opacity-60"
        >
          {rows.length || errors.length
            ? "Elegir otro archivo"
            : "Cancelar"}
        </button>

        <div className="flex flex-col-reverse gap-3 sm:flex-row">
          <button
            type="button"
            onClick={onCancel}
            disabled={isPending}
            className="min-h-12 rounded-xl border border-slate-300 bg-white px-5 py-3 text-sm font-bold text-slate-700 transition hover:bg-slate-100 disabled:opacity-60"
          >
            Cerrar
          </button>

          <button
            type="button"
            onClick={handleImport}
            disabled={isPending || !rows.length}
            className="min-h-12 rounded-xl bg-emerald-700 px-5 py-3 text-sm font-black text-white shadow-sm transition hover:bg-emerald-800 focus:outline-none focus:ring-4 focus:ring-emerald-200 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isPending
              ? "Importando…"
              : `Importar ${rows.length || ""}`}
          </button>
        </div>
      </div>
    </section>
  );
}
