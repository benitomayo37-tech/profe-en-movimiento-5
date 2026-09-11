"use client";

import {
  useMemo,
  useState,
  useTransition,
} from "react";

import {
  getAttendanceReportAction,
} from "../server/attendanceActions";
import type {
  AttendanceSession,
  AttendanceStatus,
  PhysicalEducationCourse,
  PhysicalEducationStudent,
} from "../types";

type ReportMode = "monthly" | "period";

interface AttendanceReportPanelProps {
  course: PhysicalEducationCourse;
  students: PhysicalEducationStudent[];
  initialDate: string;
}

const statusCodes: Record<
  AttendanceStatus,
  string
> = {
  present: "P",
  absent: "A",
  late: "T",
  excused: "J",
};

function escapeReportHtml(value: string): string {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function getMonthRange(monthValue: string) {
  const [year, month] = monthValue
    .split("-")
    .map(Number);

  const lastDay = new Date(
    Date.UTC(year, month, 0),
  ).getUTCDate();

  return {
    startDate: `${monthValue}-01`,
    endDate:
      `${monthValue}-${String(lastDay).padStart(2, "0")}`,
  };
}

function formatDate(value: string): string {
  return value.split("-").reverse().join("/");
}

function formatShortDate(value: string): string {
  const [, month, day] = value.split("-");
  return `${day}/${month}`;
}

function splitSessions(
  sessions: AttendanceSession[],
  size: number,
): AttendanceSession[][] {
  const chunks: AttendanceSession[][] = [];

  for (
    let index = 0;
    index < sessions.length;
    index += size
  ) {
    chunks.push(
      sessions.slice(index, index + size),
    );
  }

  return chunks;
}

export default function AttendanceReportPanel({
  course,
  students,
  initialDate,
}: AttendanceReportPanelProps) {
  const [mode, setMode] =
    useState<ReportMode>("monthly");

  const [month, setMonth] = useState(
    initialDate.slice(0, 7),
  );

  const [startDate, setStartDate] =
    useState(initialDate);

  const [endDate, setEndDate] =
    useState(initialDate);

  const [sessions, setSessions] = useState<
    AttendanceSession[]
  >([]);

  const [reportTitle, setReportTitle] =
    useState("");

  const [notice, setNotice] = useState("");
  const [error, setError] = useState("");

  const [isPending, startTransition] =
    useTransition();

  const reportStudentIds = useMemo(
    () =>
      new Set(
        sessions.flatMap((session) =>
          session.records.map(
            (record) => record.studentId,
          ),
        ),
      ),
    [sessions],
  );

  const reportStudents = useMemo(
    () =>
      students.filter(
        (student) =>
          student.status === "active"
          || reportStudentIds.has(student.id),
      ),
    [reportStudentIds, students],
  );

  const recordCount = useMemo(
    () =>
      sessions.reduce(
        (total, session) =>
          total + session.records.length,
        0,
      ),
    [sessions],
  );

  function loadReport() {
    setNotice("");
    setError("");

    let rangeStart = startDate;
    let rangeEnd = endDate;
    let title = "Reporte por período";

    if (mode === "monthly") {
      if (!month) {
        setError("Selecciona un mes.");
        return;
      }

      const range = getMonthRange(month);
      rangeStart = range.startDate;
      rangeEnd = range.endDate;

      const monthLabel = new Date(
        `${rangeStart}T00:00:00Z`,
      ).toLocaleDateString(
        "es-EC",
        {
          month: "long",
          year: "numeric",
          timeZone: "UTC",
        },
      );

      title =
        `Reporte mensual · ${
          monthLabel.charAt(0).toUpperCase()
          + monthLabel.slice(1)
        }`;
    } else {
      title =
        `Reporte del ${formatDate(rangeStart)}`
        + ` al ${formatDate(rangeEnd)}`;
    }

    startTransition(async () => {
      const result =
        await getAttendanceReportAction(
          course.id,
          rangeStart,
          rangeEnd,
        );

      if (!result.success) {
        setSessions([]);
        setReportTitle("");
        setError(result.message);
        return;
      }

      const loadedSessions = result.data ?? [];

      setSessions(loadedSessions);
      setReportTitle(title);
      setNotice(result.message);
    });
  }

  function printReport() {
    setError("");

    if (!sessions.length) {
      setError(
        "Primero carga un período con asistencias.",
      );
      return;
    }

    const printFrame =
      document.createElement("iframe");

    printFrame.title =
      "Reporte consolidado de asistencia";

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
        "No pudimos preparar el reporte.",
      );
      return;
    }

    printWindow.addEventListener(
      "afterprint",
      () => printFrame.remove(),
      { once: true },
    );

    const recordMap = new Map<string, {
      status: AttendanceStatus;
      observation: string | null;
    }>();

    sessions.forEach((session) => {
      session.records.forEach((record) => {
        recordMap.set(
          `${session.id}:${record.studentId}`,
          {
            status: record.status,
            observation: record.observation,
          },
        );
      });
    });

    const sessionChunks =
      splitSessions(sessions, 15);

    const pages = sessionChunks
      .map((chunk, pageIndex) => {
        const dateHeaders = chunk
          .map(
            (session) =>
              `<th class="date">${formatShortDate(
                session.attendanceDate,
              )}</th>`,
          )
          .join("");

        const rows = reportStudents
          .map((student, index) => {
            const totals = {
              present: 0,
              absent: 0,
              late: 0,
              excused: 0,
            };

            sessions.forEach((session) => {
              const record = recordMap.get(
                `${session.id}:${student.id}`,
              );

              if (record) {
                totals[record.status] += 1;
              }
            });

            const attendanceCells = chunk
              .map((session) => {
                const record = recordMap.get(
                  `${session.id}:${student.id}`,
                );

                const code = record
                  ? statusCodes[record.status]
                  : "—";

                return `<td class="status">${code}</td>`;
              })
              .join("");

            const fullName = escapeReportHtml(
              `${student.lastNames}, ${student.firstNames}`,
            );

            return `
              <tr>
                <td class="number">
                  ${student.listNumber ?? index + 1}
                </td>
                <td class="student">${fullName}</td>
                ${attendanceCells}
                <td class="total">${totals.present}</td>
                <td class="total">${totals.absent}</td>
                <td class="total">${totals.late}</td>
                <td class="total">${totals.excused}</td>
              </tr>
            `;
          })
          .join("");

        return `
          <section class="page${pageIndex === sessionChunks.length - 1 ? " page-last" : ""}">
            <div class="page-heading">
              <strong>${escapeReportHtml(
                reportTitle,
              )}</strong>
              <span>
                Bloque ${pageIndex + 1}
                de ${sessionChunks.length}
              </span>
            </div>

            <table>
              <thead>
                <tr>
                  <th class="number">N.º</th>
                  <th class="student">Estudiante</th>
                  ${dateHeaders}
                  <th class="total">P</th>
                  <th class="total">A</th>
                  <th class="total">T</th>
                  <th class="total">J</th>
                </tr>
              </thead>

              <tbody>${rows}</tbody>
            </table>
          </section>
        `;
      })
      .join("");

    const observations = sessions
      .flatMap((session) =>
        session.records
          .filter((record) => record.observation)
          .map((record) => {
            const student = students.find(
              (item) =>
                item.id === record.studentId,
            );

            if (!student) return "";

            return `
              <li>
                <strong>
                  ${formatDate(
                    session.attendanceDate,
                  )} ·
                  ${escapeReportHtml(
                    `${student.lastNames}, ${student.firstNames}`,
                  )}
                </strong>
                — ${escapeReportHtml(
                  record.observation ?? "",
                )}
              </li>
            `;
          }),
      )
      .filter(Boolean)
      .join("");

    const safeCourseName =
      escapeReportHtml(course.name);

    const safeDetails = escapeReportHtml(
      `${course.educationLevel} · ${course.grade}`
      + ` · Paralelo ${course.parallel}`,
    );

    const safeYear = escapeReportHtml(
      `${course.schoolYear}${
        course.shift
          ? ` · Jornada ${course.shift}`
          : ""
      }`,
    );

    const logoUrl =
      `${window.location.origin}/logos/logo-profe-en-movimiento.png`;

    const safeLogoUrl =
      escapeReportHtml(logoUrl);

    printWindow.document.open();

    printWindow.document.write(`
      <!doctype html>
      <html lang="es">
        <head>
          <meta charset="utf-8" />
          <title>${escapeReportHtml(
            reportTitle,
          )}</title>

          <style>
            @page {
              size: A4 landscape;
              margin: 9mm;
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

            header {
              border: 2px solid #1d4ed8;
              border-radius: 12px;
              padding: 12px 15px;
            }

            .header-main {
              display: flex;
              align-items: center;
              gap: 14px;
            }

            .logo {
              width: 70px;
              height: 70px;
              flex: 0 0 70px;
              object-fit: contain;
            }

            .header-copy {
              min-width: 0;
              flex: 1;
            }

            .brand {
              margin: 0 0 5px;
              color: #1d4ed8;
              font-size: 11px;
              font-weight: 800;
              letter-spacing: 1px;
              text-transform: uppercase;
            }

            h1 {
              margin: 0;
              font-size: 20px;
            }

            .details {
              margin: 4px 0 0;
              font-size: 11px;
            }

            .legend {
              margin-top: 7px;
              font-size: 10px;
              font-weight: 700;
            }

            .page {
              margin-top: 12px;
              break-after: page;
            }

            .page.page-last {
              break-after: auto;
            }

            .page-heading {
              display: flex;
              justify-content: space-between;
              margin-bottom: 5px;
              font-size: 11px;
            }

            table {
              width: 100%;
              border-collapse: collapse;
              table-layout: fixed;
              font-size: 9px;
            }

            th,
            td {
              border: 1px solid #94a3b8;
              padding: 5px 3px;
              text-align: center;
            }

            th {
              background: #e2e8f0;
              font-weight: 800;
            }

            tr {
              break-inside: avoid;
            }

            .number {
              width: 24px;
            }

            th.student,
            td.student {
              width: 145px;
              text-align: left;
              font-weight: 700;
            }

            .date {
              width: 29px;
              writing-mode: vertical-rl;
              transform: rotate(180deg);
              white-space: nowrap;
              font-weight: 600;
              letter-spacing: 0.15px;
            }

            .status {
              width: 29px;
              font-weight: 800;
            }

            .total {
              width: 22px;
              font-weight: 800;
            }

            .observations {
              margin-top: 14px;
            }

            .observations h2 {
              font-size: 15px;
            }

            .observations li {
              margin-bottom: 7px;
              font-size: 11px;
              line-height: 1.4;
            }

            .signatures {
              display: grid;
              grid-template-columns: 1fr 1fr;
              gap: 80px;
              margin-top: 45px;
              text-align: center;
              font-size: 11px;
            }

            .signature {
              border-top: 1px solid #334155;
              padding-top: 5px;
            }
          </style>
        </head>

        <body>
          <header>
            <div class="header-main">
              <img
                id="report-logo"
                class="logo"
                src="${safeLogoUrl}"
                alt="Profe en Movimiento"
              />

              <div class="header-copy">
                <p class="brand">
                  Profe en Movimiento · Cuaderno Digital
                </p>

                <h1>${safeCourseName}</h1>

                <p class="details">${safeDetails}</p>
                <p class="details">${safeYear}</p>
              </div>
            </div>

            <p class="legend">
              ${escapeReportHtml(reportTitle)}
              · P = Presente
              · A = Ausente
              · T = Atraso
              · J = Justificado
            </p>
          </header>

          ${pages}

          <section class="observations">
            <h2>Observaciones del período</h2>

            ${
              observations
                ? `<ul>${observations}</ul>`
                : "<p>Sin observaciones registradas.</p>"
            }

            <div class="signatures">
              <div class="signature">Docente</div>
              <div class="signature">Firma</div>
            </div>
          </section>

          <script>
            let printStarted = false;

            const startPrint = () => {
              if (printStarted) return;
              printStarted = true;
              window.focus();
              window.print();
            };

            const logo =
              document.getElementById("report-logo");

            if (logo && !logo.complete) {
              logo.addEventListener(
                "load",
                startPrint,
                { once: true },
              );

              logo.addEventListener(
                "error",
                startPrint,
                { once: true },
              );

              window.setTimeout(
                startPrint,
                1500,
              );
            } else {
              window.setTimeout(
                startPrint,
                250,
              );
            }
          </script>
        </body>
      </html>
    `);

    printWindow.document.close();
  }

  return (
    <section className="rounded-3xl border border-slate-200 bg-white p-4 shadow-sm sm:p-6">
      <div>
        <span className="inline-flex rounded-full border-2 border-blue-300 bg-blue-700 px-3 py-1 text-xs font-black uppercase tracking-[0.14em] text-white shadow-sm">
          Reportes consolidados
        </span>

        <h2 className="mt-3 text-2xl font-black text-slate-950">
          Asistencia mensual o por período
        </h2>

        <p className="mt-2 text-sm text-slate-600">
          Genera una matriz imprimible para el mes
          completo o para un trimestre de hasta 120 días.
        </p>
      </div>

      <div className="mt-5 grid grid-cols-2 gap-2 sm:w-fit">
        <button
          type="button"
          onClick={() => setMode("monthly")}
          aria-pressed={mode === "monthly"}
          className={
            "min-h-11 rounded-xl border-2 px-4 py-2 text-sm font-black transition "
            + (
              mode === "monthly"
                ? "border-blue-400 bg-blue-700 text-white"
                : "border-slate-400 bg-slate-100 text-slate-900"
            )
          }
        >
          Mensual
        </button>

        <button
          type="button"
          onClick={() => setMode("period")}
          aria-pressed={mode === "period"}
          className={
            "min-h-11 rounded-xl border-2 px-4 py-2 text-sm font-black transition "
            + (
              mode === "period"
                ? "border-blue-400 bg-blue-700 text-white"
                : "border-slate-400 bg-slate-100 text-slate-900"
            )
          }
        >
          Por período
        </button>
      </div>

      <div className="mt-5 grid gap-4 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_auto] lg:items-end">
        {mode === "monthly" ? (
          <div className="lg:col-span-2">
            <label
              htmlFor="attendance-report-month"
              className="text-sm font-bold text-slate-800"
            >
              Mes
            </label>

            <input
              id="attendance-report-month"
              type="month"
              value={month}
              onChange={(event) =>
                setMonth(event.target.value)
              }
              className="mt-2 min-h-12 w-full rounded-xl border-2 border-slate-400 bg-white px-4 py-3 text-slate-950 outline-none focus:border-blue-600 focus:ring-4 focus:ring-blue-100"
            />
          </div>
        ) : (
          <>
            <div>
              <label
                htmlFor="attendance-report-start"
                className="text-sm font-bold text-slate-800"
              >
                Fecha inicial
              </label>

              <input
                id="attendance-report-start"
                type="date"
                value={startDate}
                onChange={(event) =>
                  setStartDate(event.target.value)
                }
                className="mt-2 min-h-12 w-full rounded-xl border-2 border-slate-400 bg-white px-4 py-3 text-slate-950 outline-none focus:border-blue-600 focus:ring-4 focus:ring-blue-100"
              />
            </div>

            <div>
              <label
                htmlFor="attendance-report-end"
                className="text-sm font-bold text-slate-800"
              >
                Fecha final
              </label>

              <input
                id="attendance-report-end"
                type="date"
                value={endDate}
                onChange={(event) =>
                  setEndDate(event.target.value)
                }
                className="mt-2 min-h-12 w-full rounded-xl border-2 border-slate-400 bg-white px-4 py-3 text-slate-950 outline-none focus:border-blue-600 focus:ring-4 focus:ring-blue-100"
              />
            </div>
          </>
        )}

        <button
          type="button"
          onClick={loadReport}
          disabled={isPending}
          className="min-h-12 rounded-xl border-2 border-blue-400 bg-blue-700 px-5 py-3 text-sm font-black text-white shadow-md transition hover:bg-blue-800 disabled:border-slate-500 disabled:bg-slate-600"
        >
          {isPending
            ? "Consultando..."
            : "Cargar reporte"}
        </button>
      </div>

      {notice ? (
        <div className="mt-5 rounded-2xl border border-emerald-300 bg-emerald-50 px-4 py-3 text-sm font-bold text-emerald-900">
          {notice}
        </div>
      ) : null}

      {error ? (
        <div
          role="alert"
          className="mt-5 rounded-2xl border border-red-300 bg-red-50 px-4 py-3 text-sm font-bold text-red-900"
        >
          {error}
        </div>
      ) : null}

      {reportTitle ? (
        <div className="mt-5 rounded-2xl border-2 border-slate-300 bg-slate-50 p-4">
          <h3 className="font-black text-slate-950">
            {reportTitle}
          </h3>

          <div className="mt-3 grid grid-cols-3 gap-3">
            <div>
              <p className="text-2xl font-black text-blue-800">
                {sessions.length}
              </p>
              <p className="text-xs font-bold text-slate-600">
                Jornadas
              </p>
            </div>

            <div>
              <p className="text-2xl font-black text-blue-800">
                {reportStudents.length}
              </p>
              <p className="text-xs font-bold text-slate-600">
                Estudiantes
              </p>
            </div>

            <div>
              <p className="text-2xl font-black text-blue-800">
                {recordCount}
              </p>
              <p className="text-xs font-bold text-slate-600">
                Registros
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={printReport}
            disabled={!sessions.length}
            className="mt-4 min-h-12 w-full rounded-xl border-2 border-orange-300 bg-orange-600 px-5 py-3 text-sm font-black text-white shadow-md transition hover:bg-orange-700 disabled:border-slate-500 disabled:bg-slate-600 sm:w-auto"
          >
            Imprimir reporte consolidado
          </button>
        </div>
      ) : null}
    </section>
  );
}
