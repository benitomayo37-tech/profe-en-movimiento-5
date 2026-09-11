"use client";

import Link from "next/link";
import {
  useMemo,
  useState,
  useTransition,
} from "react";

import {
  getAttendanceByDateAction,
  saveAttendanceAction,
} from "../server/attendanceActions";
import type {
  AttendanceSession,
  AttendanceStatus,
  PhysicalEducationCourse,
  PhysicalEducationStudent,
} from "../types";

import AttendanceReportPanel from "./AttendanceReportPanel";

interface AttendanceWorkspaceProps {
  course: PhysicalEducationCourse;
  students: PhysicalEducationStudent[];
  initialDate: string;
  initialSession: AttendanceSession | null;
  initialError?: string;
}

interface EditableEntry {
  status: AttendanceStatus;
  observation: string;
}

const statusOptions: Array<{
  value: AttendanceStatus;
  label: string;
}> = [
  { value: "present", label: "Presente" },
  { value: "absent", label: "Ausente" },
  { value: "late", label: "Atraso" },
  { value: "excused", label: "Justificado" },
];

const statusStyles: Record<
  AttendanceStatus,
  string
> = {
  present:
    "border-emerald-500 bg-emerald-50 text-emerald-900",
  absent:
    "border-red-400 bg-red-50 text-red-900",
  late:
    "border-amber-400 bg-amber-50 text-amber-900",
  excused:
    "border-blue-400 bg-blue-50 text-blue-900",
};

const attendanceStatusLabels: Record<
  AttendanceStatus,
  string
> = {
  present: "Presente",
  absent: "Ausente",
  late: "Atraso",
  excused: "Justificado",
};

function createEntries(
  students: PhysicalEducationStudent[],
  session: AttendanceSession | null,
): Record<string, EditableEntry> {
  const savedRecords = new Map(
    (session?.records ?? []).map((record) => [
      record.studentId,
      record,
    ]),
  );

  const entries: Record<string, EditableEntry> = {};

  students.forEach((student) => {
    const savedRecord = savedRecords.get(student.id);

    if (
      student.status !== "active"
      && !savedRecord
    ) {
      return;
    }

    entries[student.id] = {
      status: savedRecord?.status ?? "present",
      observation: savedRecord?.observation ?? "",
    };
  });

  return entries;
}

function escapeHtml(value: string): string {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

export default function AttendanceWorkspace({
  course,
  students,
  initialDate,
  initialSession,
  initialError = "",
}: AttendanceWorkspaceProps) {
  const [selectedDate, setSelectedDate] =
    useState(initialDate);

  const [loadedDate, setLoadedDate] =
    useState(initialDate);

  const [classNote, setClassNote] = useState(
    initialSession?.classNote ?? "",
  );

  const [entries, setEntries] = useState<
    Record<string, EditableEntry>
  >(() => createEntries(students, initialSession));

  const [notice, setNotice] = useState("");
  const [error, setError] = useState(initialError);
  const [isPending, startTransition] =
    useTransition();

  const roster = useMemo(
    () =>
      students.filter(
        (student) =>
          student.status === "active"
          || Boolean(entries[student.id]),
      ),
    [entries, students],
  );

  const totals = useMemo(() => {
    const result = {
      total: roster.length,
      present: 0,
      absent: 0,
      late: 0,
      excused: 0,
    };

    roster.forEach((student) => {
      const status =
        entries[student.id]?.status ?? "present";

      result[status] += 1;
    });

    return result;
  }, [entries, roster]);

  function updateStatus(
    studentId: string,
    status: AttendanceStatus,
  ) {
    setEntries((current) => ({
      ...current,
      [studentId]: {
        status,
        observation:
          current[studentId]?.observation ?? "",
      },
    }));
  }

  function updateObservation(
    studentId: string,
    observation: string,
  ) {
    setEntries((current) => ({
      ...current,
      [studentId]: {
        status:
          current[studentId]?.status ?? "present",
        observation,
      },
    }));
  }

  function markAllPresent() {
    setEntries((current) => {
      const next = { ...current };

      roster.forEach((student) => {
        next[student.id] = {
          status: "present",
          observation:
            current[student.id]?.observation ?? "",
        };
      });

      return next;
    });

    setNotice(
      "Todos los estudiantes fueron marcados presentes.",
    );
    setError("");
  }

  function printAttendance() {
    setError("");

    const printFrame =
      document.createElement("iframe");

    printFrame.title =
      "Impresión de asistencia";

    printFrame.style.position = "fixed";
    printFrame.style.right = "0";
    printFrame.style.bottom = "0";
    printFrame.style.width = "1px";
    printFrame.style.height = "1px";
    printFrame.style.border = "0";
    printFrame.style.zIndex = "-1";

    document.body.appendChild(printFrame);

    const printWindow =
      printFrame.contentWindow;

    if (!printWindow) {
      printFrame.remove();

      setError(
        "No pudimos preparar la impresión. Inténtalo nuevamente.",
      );
      return;
    }

    printWindow.addEventListener(
      "afterprint",
      () => printFrame.remove(),
      { once: true },
    );

    const rows = roster
      .map((student, index) => {
        const entry = entries[student.id];
        const number =
          student.listNumber ?? index + 1;

        const fullName = escapeHtml(
          `${student.lastNames}, ${student.firstNames}`,
        );

        const status = escapeHtml(
          attendanceStatusLabels[
            entry?.status ?? "present"
          ],
        );

        const observation = escapeHtml(
          entry?.observation.trim() || "—",
        );

        return `
          <tr>
            <td>${number}</td>
            <td class="student">${fullName}</td>
            <td>${status}</td>
            <td>${observation}</td>
          </tr>
        `;
      })
      .join("");

    const formattedDate =
      loadedDate.split("-").reverse().join("/");

    const safeCourseName =
      escapeHtml(course.name);

    const safeCourseDetails = escapeHtml(
      `${course.educationLevel} · ${course.grade} · Paralelo ${course.parallel}`,
    );

    const safeSchoolYear = escapeHtml(
      `${course.schoolYear}${
        course.shift
          ? ` · Jornada ${course.shift}`
          : ""
      }`,
    );

    const safeClassNote = escapeHtml(
      classNote.trim() || "Sin novedades.",
    );

    printWindow.document.open();

    printWindow.document.write(`
      <!doctype html>
      <html lang="es">
        <head>
          <meta charset="utf-8" />
          <title>Asistencia - ${safeCourseName}</title>

          <style>
            @page {
              size: A4 portrait;
              margin: 12mm;
            }

            * {
              box-sizing: border-box;
            }

            body {
              margin: 0;
              color: #0f172a;
              background: white;
              font-family: Arial, Helvetica, sans-serif;
            }

            .header {
              border: 2px solid #1d4ed8;
              border-radius: 14px;
              padding: 18px;
            }

            .brand {
              margin: 0 0 8px;
              color: #1d4ed8;
              font-size: 13px;
              font-weight: 800;
              letter-spacing: 1px;
              text-transform: uppercase;
            }

            h1 {
              margin: 0;
              font-size: 25px;
            }

            .details {
              margin: 6px 0 0;
              font-size: 13px;
            }

            .date {
              margin-top: 12px;
              font-size: 14px;
              font-weight: 700;
            }

            .totals {
              display: grid;
              grid-template-columns: repeat(5, 1fr);
              gap: 7px;
              margin-top: 14px;
            }

            .total {
              border: 1px solid #94a3b8;
              border-radius: 8px;
              padding: 8px;
              text-align: center;
            }

            .total strong {
              display: block;
              font-size: 18px;
            }

            .total span {
              font-size: 10px;
              font-weight: 700;
            }

            table {
              width: 100%;
              margin-top: 18px;
              border-collapse: collapse;
              font-size: 11px;
            }

            th,
            td {
              border: 1px solid #94a3b8;
              padding: 7px;
              text-align: left;
              vertical-align: top;
            }

            th {
              background: #e2e8f0;
              font-weight: 800;
            }

            .student {
              font-weight: 700;
            }

            tr {
              break-inside: avoid;
            }

            .note {
              margin-top: 16px;
              border: 1px solid #94a3b8;
              border-radius: 8px;
              padding: 10px;
              font-size: 12px;
            }

            .signatures {
              display: grid;
              grid-template-columns: 1fr 1fr;
              gap: 70px;
              margin-top: 55px;
              text-align: center;
              font-size: 12px;
            }

            .signature {
              border-top: 1px solid #334155;
              padding-top: 7px;
            }
          </style>
        </head>

        <body>
          <header class="header">
            <p class="brand">
              Profe en Movimiento · Cuaderno Digital
            </p>

            <h1>${safeCourseName}</h1>

            <p class="details">
              ${safeCourseDetails}
            </p>

            <p class="details">
              ${safeSchoolYear}
            </p>

            <p class="date">
              Fecha de asistencia: ${formattedDate}
            </p>

            <div class="totals">
              <div class="total">
                <strong>${totals.total}</strong>
                <span>Total</span>
              </div>

              <div class="total">
                <strong>${totals.present}</strong>
                <span>Presentes</span>
              </div>

              <div class="total">
                <strong>${totals.absent}</strong>
                <span>Ausentes</span>
              </div>

              <div class="total">
                <strong>${totals.late}</strong>
                <span>Atrasos</span>
              </div>

              <div class="total">
                <strong>${totals.excused}</strong>
                <span>Justificados</span>
              </div>
            </div>
          </header>

          <table>
            <thead>
              <tr>
                <th>N.º</th>
                <th>Estudiante</th>
                <th>Estado</th>
                <th>Observación</th>
              </tr>
            </thead>

            <tbody>
              ${rows}
            </tbody>
          </table>

          <div class="note">
            <strong>Nota general:</strong>
            ${safeClassNote}
          </div>

          <div class="signatures">
            <div class="signature">Docente</div>
            <div class="signature">Firma</div>
          </div>

          <script>
            window.setTimeout(() => {
              window.focus();
              window.print();
            }, 250);
          </script>
        </body>
      </html>
    `);

    printWindow.document.close();
  }

  function loadDate() {
    setNotice("");
    setError("");

    startTransition(async () => {
      const result =
        await getAttendanceByDateAction(
          course.id,
          selectedDate,
        );

      if (!result.success) {
        setError(result.message);
        return;
      }

      const session = result.data ?? null;

      setLoadedDate(selectedDate);
      setClassNote(session?.classNote ?? "");
      setEntries(createEntries(students, session));

      setNotice(
        session
          ? "Asistencia cargada correctamente."
          : "Fecha preparada para registrar asistencia.",
      );
    });
  }

  function saveAttendance() {
    setNotice("");
    setError("");

    const attendanceEntries = roster.map(
      (student) => ({
        studentId: student.id,
        status:
          entries[student.id]?.status ?? "present",
        observation:
          entries[student.id]?.observation.trim()
          || null,
      }),
    );

    startTransition(async () => {
      const result = await saveAttendanceAction({
        courseId: course.id,
        attendanceDate: loadedDate,
        classNote: classNote.trim() || null,
        entries: attendanceEntries,
      });

      if (!result.success) {
        setError(result.message);
        return;
      }

      setNotice(result.message);
    });
  }

  return (
    <section className="space-y-6">
      <div className="flex flex-wrap gap-3">
        <Link
          href={`/cuaderno-digital/cursos/${course.id}`}
          className="inline-flex min-h-11 items-center rounded-xl border-2 border-slate-400 bg-slate-100 px-4 py-2 text-sm font-black text-slate-950 shadow-sm transition hover:border-blue-500 hover:bg-blue-50 hover:text-blue-900"
        >
          ← Volver a estudiantes
        </Link>

        <Link
          href="/cuaderno-digital"
          className="inline-flex min-h-11 items-center rounded-xl border-2 border-slate-400 bg-slate-100 px-4 py-2 text-sm font-black text-slate-950 shadow-sm transition hover:border-blue-500 hover:bg-blue-50 hover:text-blue-900"
        >
          Ver cursos
        </Link>
      </div>

      <div className="overflow-hidden rounded-3xl bg-gradient-to-br from-blue-950 via-blue-900 to-blue-700 p-6 text-white shadow-xl sm:p-8">
        <span className="inline-flex rounded-full border border-blue-300/50 bg-blue-800 px-3 py-1 text-xs font-black uppercase tracking-[0.16em] text-white">
          Control de asistencia
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

        <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-5">
          {[
            ["total", "Total"],
            ["present", "Presentes"],
            ["absent", "Ausentes"],
            ["late", "Atrasos"],
            ["excused", "Justificados"],
          ].map(([key, label]) => (
            <div
              key={key}
              className="rounded-2xl border border-white/20 bg-white/10 p-3 backdrop-blur"
            >
              <p className="text-2xl font-black">
                {
                  totals[
                    key as keyof typeof totals
                  ]
                }
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
        <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_auto_auto_auto] lg:items-end">
          <div>
            <label
              htmlFor="attendance-date"
              className="text-sm font-bold text-slate-800"
            >
              Fecha de asistencia
            </label>

            <input
              id="attendance-date"
              type="date"
              min="2000-01-01"
              max="2100-12-31"
              value={selectedDate}
              onChange={(event) =>
                setSelectedDate(event.target.value)
              }
              className="mt-2 min-h-12 w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-base text-slate-950 outline-none transition focus:border-blue-600 focus:ring-4 focus:ring-blue-100"
            />
          </div>

          <button
            type="button"
            onClick={loadDate}
            disabled={isPending || !selectedDate}
            className="min-h-12 rounded-xl border-2 border-blue-400 bg-blue-700 px-5 py-3 text-sm font-black text-white shadow-md transition hover:border-blue-300 hover:bg-blue-800 disabled:border-slate-500 disabled:bg-slate-600 disabled:text-white disabled:opacity-100"
          >
            Cargar fecha
          </button>

          <button
            type="button"
            onClick={markAllPresent}
            disabled={!roster.length || isPending}
            className="min-h-12 rounded-xl border-2 border-emerald-300 bg-emerald-700 px-5 py-3 text-sm font-black text-white shadow-md transition hover:bg-emerald-800 disabled:border-slate-500 disabled:bg-slate-600 disabled:text-white disabled:opacity-100"
          >
            Todos presentes
          </button>

          <button
            type="button"
            onClick={printAttendance}
            className="min-h-12 rounded-xl border-2 border-orange-300 bg-orange-600 px-5 py-3 text-sm font-black text-white shadow-md transition hover:bg-orange-700"
          >
            Imprimir / Guardar PDF
          </button>
        </div>

        {selectedDate !== loadedDate ? (
          <p className="mt-3 text-sm font-bold text-amber-700">
            Pulsa “Cargar fecha” antes de editar o
            guardar el nuevo día.
          </p>
        ) : null}
      </div>

      {roster.length ? (
        <div className="grid gap-3">
          {roster.map((student) => {
            const entry = entries[student.id];
            const fullName =
              `${student.lastNames}, ${student.firstNames}`;

            return (
              <article
                key={student.id}
                className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5"
              >
                <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_220px]">
                  <div className="flex min-w-0 items-start gap-3">
                    <div className="flex h-12 min-w-12 items-center justify-center rounded-2xl border-2 border-blue-300 bg-blue-700 font-black text-white shadow-sm">
                      {student.listNumber ?? "—"}
                    </div>

                    <div className="min-w-0">
                      <h3 className="font-black text-slate-950">
                        {fullName}
                      </h3>

                      <p className="mt-1 text-xs font-bold text-slate-500">
                        {student.studentCode
                          ? `Código: ${student.studentCode}`
                          : "Sin código"}
                      </p>
                    </div>
                  </div>

                  <div>
                    <label
                      htmlFor={`status-${student.id}`}
                      className="text-xs font-black uppercase tracking-wide text-slate-600"
                    >
                      Estado
                    </label>

                    <select
                      id={`status-${student.id}`}
                      value={entry?.status ?? "present"}
                      onChange={(event) =>
                        updateStatus(
                          student.id,
                          event.target
                            .value as AttendanceStatus,
                        )
                      }
                      disabled={
                        isPending
                        || selectedDate !== loadedDate
                        || !course.active
                      }
                      className={
                        "mt-2 min-h-11 w-full rounded-xl border px-3 py-2 text-sm font-black outline-none focus:ring-4 focus:ring-blue-100 disabled:cursor-not-allowed disabled:border-slate-500 disabled:bg-slate-700 disabled:text-white disabled:opacity-100 "
                        + statusStyles[
                          entry?.status ?? "present"
                        ]
                      }
                    >
                      {statusOptions.map((option) => (
                        <option
                          key={option.value}
                          value={option.value}
                        >
                          {option.label}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="mt-4">
                  <label
                    htmlFor={`observation-${student.id}`}
                    className="text-sm font-bold text-slate-700"
                  >
                    Observación rápida
                  </label>

                  <input
                    id={`observation-${student.id}`}
                    type="text"
                    maxLength={500}
                    value={entry?.observation ?? ""}
                    onChange={(event) =>
                      updateObservation(
                        student.id,
                        event.target.value,
                      )
                    }
                    disabled={
                      isPending
                      || selectedDate !== loadedDate
                      || !course.active
                    }
                    placeholder="Opcional: lesión, justificación, participación..."
                    className="mt-2 min-h-11 w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm text-slate-950 outline-none transition placeholder:text-slate-400 focus:border-blue-600 focus:ring-4 focus:ring-blue-100 disabled:bg-slate-100"
                  />
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
            📋
          </div>

          <h3 className="mt-5 text-xl font-black text-slate-950">
            No hay estudiantes para registrar
          </h3>

          <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-600">
            Primero registra estudiantes activos en
            este curso.
          </p>
        </div>
      )}

      <div className="rounded-3xl border border-slate-200 bg-white p-4 shadow-sm sm:p-6">
        <label
          htmlFor="class-note"
          className="text-sm font-bold text-slate-800"
        >
          Nota general de la clase
        </label>

        <textarea
          id="class-note"
          rows={3}
          maxLength={500}
          value={classNote}
          onChange={(event) =>
            setClassNote(event.target.value)
          }
          disabled={
            isPending
            || selectedDate !== loadedDate
            || !course.active
          }
          placeholder="Opcional: tema trabajado, novedades o incidencias generales."
          className="mt-2 w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-950 outline-none transition placeholder:text-slate-400 focus:border-blue-600 focus:ring-4 focus:ring-blue-100 disabled:bg-slate-100"
        />

        <button
          type="button"
          onClick={saveAttendance}
          disabled={
            isPending
            || !course.active
            || !roster.length
            || selectedDate !== loadedDate
          }
          className="mt-4 min-h-12 w-full rounded-xl border-2 border-blue-400 bg-blue-700 px-5 py-3 text-sm font-black text-white shadow-lg transition hover:bg-blue-800 disabled:border-slate-500 disabled:bg-slate-600 disabled:text-white disabled:opacity-100 sm:w-auto"
        >
          {isPending
            ? "Procesando..."
            : "Guardar asistencia"}
        </button>

        {!course.active ? (
          <p className="mt-3 text-sm font-bold text-amber-700">
            Este curso está archivado y permanece en
            modo de consulta.
          </p>
        ) : null}
      </div>
      <AttendanceReportPanel
        course={course}
        students={students}
        initialDate={initialDate}
      />

    </section>
  );
}
