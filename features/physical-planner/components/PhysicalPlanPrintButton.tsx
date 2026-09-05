"use client";

import type {
  GeneratedPhysicalPlan,
  PhysicalPlannerContext,
} from "@/features/physical-planner/types/physicalPlanner";

interface PhysicalPlanPrintButtonProps {
  plan: GeneratedPhysicalPlan;
  context: PhysicalPlannerContext;
}

function escapeHtml(value: string | number) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function formatSeconds(seconds: number) {
  if (seconds < 60) {
    return `${seconds} s`;
  }

  const minutes = Math.floor(seconds / 60);
  const remaining = seconds % 60;

  return remaining === 0
    ? `${minutes} min`
    : `${minutes} min ${remaining} s`;
}

function list(items: string[]) {
  return `<ul>${items
    .map((item) => `<li>${escapeHtml(item)}</li>`)
    .join("")}</ul>`;
}

function buildPrintableDocument(
  plan: GeneratedPhysicalPlan,
  context: PhysicalPlannerContext,
) {
  const logoUrl =
    `${window.location.origin}/logos/logo-profe-en-movimiento.png`;

  const contextLabel =
    context === "physical_education"
      ? "Educación Física"
      : "Preparación deportiva";

  const duaContent =
    context === "physical_education"
      ? `
        <section class="dua-section">
          <h2>Diseño Universal para el Aprendizaje</h2>

          <article class="dua commitment">
            <h3>🟢 Compromiso</h3>
            ${list(plan.dua.commitment)}
          </article>

          <article class="dua representation">
            <h3>🟣 Representación</h3>
            ${list(plan.dua.representation)}
          </article>

          <article class="dua action">
            <h3>🔵 Acción y Expresión</h3>
            ${list(plan.dua.actionExpression)}
          </article>
        </section>
      `
      : "";

  const paginatedBlocks =
    plan.blocks.flatMap(
      (block, blockIndex) => {
        const activityPages:
          Array<typeof block.activities> = [];

        let currentPage:
          typeof block.activities = [];

        let currentWeight = 0;

        for (const activity of block.activities) {
          const activityWeight =
            JSON.stringify(activity).length;

          const exceedsSafeLength =
            currentPage.length > 0 &&
            currentWeight + activityWeight > 5000;

          const exceedsSafeRows =
            currentPage.length >= 3;

          if (
            exceedsSafeLength ||
            exceedsSafeRows
          ) {
            activityPages.push(currentPage);
            currentPage = [];
            currentWeight = 0;
          }

          currentPage.push(activity);
          currentWeight += activityWeight;
        }

        if (currentPage.length > 0) {
          activityPages.push(currentPage);
        }

        return activityPages.map(
          (activities, partIndex) => ({
            block,
            blockIndex,
            activities,
            partIndex,
            partCount: activityPages.length,
          }),
        );
      },
    );

  const duaPageCount = 0;
  const totalPages =
    2 +
    duaPageCount +
    paginatedBlocks.length;

  const duaPage = "";
  const blockPages =
    paginatedBlocks
      .map(
        (
          {
            block,
            blockIndex,
            activities,
            partIndex,
            partCount,
          },
          pageIndex,
        ) => {
          const pageNumber =
            3 +
            duaPageCount +
            pageIndex;

          const continuationLabel =
            partCount > 1 && partIndex > 0
              ? ` · Continuación ${partIndex + 1} de ${partCount}`
              : "";

          return `
            <article class="page">
              <header class="brand">
                <img
                  src="${logoUrl}"
                  alt="Profe en Movimiento"
                />
                <div>
                  <strong>PROFE EN MOVIMIENTO 5.0</strong>
                  <span>Planificador Físico · ${escapeHtml(contextLabel)}</span>
                </div>
              </header>

              <main>
                <div class="block-title">
                  <div>
                    <p class="kicker">
                      BLOQUE ${blockIndex + 1}${continuationLabel}
                    </p>
                    <h1>${escapeHtml(block.name)}</h1>
                    <p>${escapeHtml(block.objective)}</p>
                  </div>

                  <strong class="time">
                    ${block.minutes} min
                  </strong>
                </div>

                <div class="table-frame">
                  <table>
                    <thead>
                      <tr>
                        <th>Actividad</th>
                        <th>Dosificación</th>
                        <th>Organización y ejecución</th>
                        <th>Seguridad</th>
                      </tr>
                    </thead>

                    <tbody>
                      ${activities
                        .map(
                          (activity) => `
                            <tr>
                              <td>
                                <strong>${escapeHtml(activity.name)}</strong>
                                <p>${escapeHtml(activity.description)}</p>
                              </td>

                              <td>
                                <p><strong>Series:</strong> ${activity.series}</p>
                                <p><strong>Repeticiones:</strong> ${escapeHtml(activity.repetitions)}</p>
                                <p><strong>Rondas:</strong> ${activity.rounds}</p>
                                <p><strong>Trabajo:</strong> ${formatSeconds(activity.workSeconds)}</p>
                                <p><strong>Recuperación:</strong> ${formatSeconds(activity.recoverySeconds)}</p>
                                <p><strong>Transición:</strong> ${formatSeconds(activity.transitionSeconds)}</p>
                                <p><strong>Total:</strong> ${formatSeconds(activity.totalSeconds)}</p>
                              </td>

                              <td>
                                <p>
                                  <strong>Intensidad:</strong>
                                  ${escapeHtml(activity.intensity)}
                                </p>

                                <p>${escapeHtml(activity.organization)}</p>

                                <strong>Consignas:</strong>
                                ${list(activity.coachingPoints)}
                              </td>

                              <td>
                                ${escapeHtml(activity.safety)}
                              </td>
                            </tr>
                          `,
                        )
                        .join("")}
                    </tbody>
                  </table>
                </div>
              </main>

              <footer>
                <span>Planificador Físico · Carga, tiempo y progresión bajo control</span>
                <span>Página ${pageNumber} de ${totalPages}</span>
              </footer>
            </article>
          `;
        },
      )
      .join("");
  const now = new Date();

  const padNumber = (value: number) =>
    String(value).padStart(2, "0");

  const printTimestamp = [
    now.getFullYear(),
    padNumber(now.getMonth() + 1),
    padNumber(now.getDate()),
  ].join("-") +
    "-" +
    [
      padNumber(now.getHours()),
      padNumber(now.getMinutes()),
      padNumber(now.getSeconds()),
    ].join("");

  const documentTitle =
    `planificacion-fisica-${printTimestamp}`;

  return `
    <!doctype html>
    <html lang="es">
      <head>
        <meta charset="utf-8" />
        <title>${escapeHtml(documentTitle)}</title>
        <style>
          @page {
            size: A4 portrait;
            margin: 11mm 10mm;
          }

          * {
            box-sizing: border-box;
          }

          html,
          body {
            margin: 0;
            padding: 0;
            color: #0f172a;
            background: #ffffff;
            font-family: Arial, Helvetica, sans-serif;
            -webkit-print-color-adjust: exact;
            print-color-adjust: exact;
          }

          .page {
            display: flex;
            height: 275mm;
            min-height: 275mm;
            flex-direction: column;
            break-after: page;
            page-break-after: always;
          }

          .page:last-child {
            break-after: auto;
            page-break-after: auto;
          }

          .brand {
            display: flex;
            align-items: center;
            gap: 3mm;
            padding-bottom: 3mm;
            border-bottom: 1px solid #cbd5e1;
          }

          .brand img {
            display: block;
            width: 13mm;
            height: 13mm;
            object-fit: contain;
          }

          .brand strong,
          .brand span {
            display: block;
          }

          .brand strong {
            color: #1d4ed8;
            font-size: 9pt;
            letter-spacing: .08em;
          }

          .brand span {
            margin-top: 1mm;
            color: #ea580c;
            font-size: 7pt;
            font-weight: 700;
          }

          .support-brand {
            margin-bottom: 4mm;
            break-inside: avoid;
            page-break-inside: avoid;
          }
          main {
            flex: 1;
            padding-top: 4mm;
          }

          h1 {
            margin: 1mm 0 2mm;
            font-size: 17pt;
            line-height: 1.15;
          }

          h2 {
            margin: 0 0 2mm;
            font-size: 10pt;
          }

          h3 {
            margin: 0 0 1.5mm;
            font-size: 8.5pt;
          }

          p,
          li,
          td,
          th {
            font-size: 7.5pt;
            line-height: 1.35;
          }

          p {
            margin: 0 0 1.5mm;
          }

          ul {
            margin: 1mm 0 0;
            padding-left: 4mm;
          }

          li {
            margin-bottom: 1mm;
          }

          .kicker {
            color: #ea580c;
            font-size: 7pt;
            font-weight: 800;
            letter-spacing: .12em;
          }

          .summary {
            color: #334155;
            font-size: 8.5pt;
            line-height: 1.45;
          }

          .objective,
          .load,
          .organization {
            margin-top: 3mm;
            padding: 3mm;
            border: 1px solid;
            border-radius: 2mm;
            break-inside: avoid;
          }

          .objective {
            border-color: #fdba74;
            background: #fff7ed;
          }

          .load {
            border-color: #c4b5fd;
            background: #f5f3ff;
          }

          .organization {
            border-color: #93c5fd;
            background: #eff6ff;
          }

          .metrics {
            display: grid;
            grid-template-columns: repeat(3, 1fr);
            gap: 2mm;
            margin-top: 3mm;
          }

          .metric {
            padding: 2.5mm;
            border: 1px solid #cbd5e1;
            border-radius: 2mm;
            background: #f8fafc;
          }

          .metric span,
          .metric strong {
            display: block;
          }

          .metric span {
            color: #64748b;
            font-size: 6.5pt;
            font-weight: 700;
            text-transform: uppercase;
          }

          .metric strong {
            margin-top: 1mm;
            font-size: 12pt;
          }

          .overview {
            width: 100%;
            margin-top: 4mm;
            border-collapse: collapse;
            table-layout: fixed;
          }

          table {
            width: 100%;
            border: 0;
            border-collapse: collapse;
            table-layout: fixed;
          }

          th,
          td {
            padding: 2mm;
            vertical-align: top;
            text-align: left;
            border: 1px solid #94a3b8;
            overflow-wrap: anywhere;
          }

          .table-frame {
            width: 100%;
            border: 1.5px solid #475569;
          }

          .table-frame table {
            border: 0;
          }

          .table-frame th:first-child,
          .table-frame td:first-child {
            border-left: 0;
          }

          .table-frame th:last-child,
          .table-frame td:last-child {
            border-right: 0;
          }

          .table-frame thead tr:first-child th {
            border-top: 0;
          }

          .table-frame tbody tr:last-child td {
            border-bottom: 0;
          }

          /* table-print-inset */
          .table-frame {
            width: calc(100% - 1mm);
            margin-right: 1mm;
          }

          /* independent-right-border */
          .table-frame {
            position: relative;
          }

          .table-frame::before {
            position: absolute;
            z-index: 10;
            top: 0;
            right: 0;
            bottom: 0;
            width: 1px;
            background: #64748b;
            content: "";
            pointer-events: none;
          }

          /* reliable-table-perimeter */
          .table-frame {
            border: 0;
          }

          table th:first-child,
          table td:first-child {
            border-left: 1.5px solid #475569 !important;
          }

          table th:last-child,
          table td:last-child {
            border-right: 1.5px solid #475569 !important;
          }

          table thead tr:first-child th {
            border-top: 1.5px solid #475569 !important;
          }

          table tbody tr:last-child td {
            border-bottom: 1.5px solid #475569 !important;
          }

          th {
            background: #e2e8f0;
            font-weight: 800;
          }

          tr {
            break-inside: avoid;
            page-break-inside: avoid;
          }

          .overview th:nth-child(1) {
            width: 24%;
          }

          .overview th:nth-child(2) {
            width: 60%;
          }

          .overview th:nth-child(3) {
            width: 16%;
          }

          .summary-grid {
            display: grid;
            grid-template-columns: repeat(2, 1fr);
            gap: 2mm;
            margin-top: 4mm;
          }

          .summary-card {
            padding: 2.5mm;
            border: 1px solid #cbd5e1;
            border-radius: 2mm;
            break-inside: avoid;
          }

          .dua-section {
            margin-top: 4mm;
          }

          .dua {
            margin-top: 2mm;
            padding: 2.5mm;
            border: 1px solid;
            border-radius: 2mm;
            break-inside: avoid;
          }

          .commitment {
            border-color: #34d399;
            background: #ecfdf5;
          }

          .representation {
            border-color: #e879f9;
            background: #fdf4ff;
          }

          .action {
            border-color: #60a5fa;
            background: #eff6ff;
          }

          .block-title {
            display: flex;
            justify-content: space-between;
            gap: 5mm;
            margin-bottom: 4mm;
          }

          .time {
            height: fit-content;
            padding: 2mm 3mm;
            border-radius: 5mm;
            background: #ffedd5;
            color: #9a3412;
            font-size: 8pt;
            white-space: nowrap;
          }

          .block-title + .table-frame th:nth-child(1) {
            width: 24%;
          }

          .block-title + .table-frame th:nth-child(2) {
            width: 21%;
          }

          .block-title + .table-frame th:nth-child(3) {
            width: 36%;
          }

          .block-title + .table-frame th:nth-child(4) {
            width: 19%;
          }

          /* block-table-print-fit */
          .block-title + .table-frame {
            font-size: 7.2pt;
            line-height: 1.2;
          }

          .block-title + .table-frame th,
          .block-title + .table-frame td {
            padding: 1.4mm;
          }

          .block-title + .table-frame p {
            margin-top: 0;
            margin-bottom: 1mm;
          }

          .block-title + .table-frame ul {
            margin-top: 1mm;
            margin-bottom: 0;
            padding-left: 4mm;
          }

          .block-title + .table-frame li {
            margin-bottom: 0.6mm;
          }

          /* support-page-fit */
          .summary-grid {
            gap: 1.5mm;
            margin-top: 2.5mm;
          }

          .summary-card {
            padding: 1.8mm;
            font-size: 7pt;
            line-height: 1.2;
          }

          .summary-card ul {
            margin-top: 1mm;
            margin-bottom: 0;
            padding-left: 4mm;
          }

          .summary-card li {
            margin-bottom: 0.5mm;
          }

          .dua-section {
            margin-top: 2.5mm;
            font-size: 7pt;
            line-height: 1.2;
          }

          .dua-section > h2 {
            margin-bottom: 1mm;
            font-size: 9pt;
          }

          .dua {
            margin-top: 1mm;
            padding: 1.6mm;
          }

          .dua h3 {
            margin-bottom: 0.8mm;
          }

          .dua ul {
            margin-top: 0.8mm;
            margin-bottom: 0;
            padding-left: 4mm;
          }

          .dua li {
            margin-bottom: 0.4mm;
          }

          footer {
            display: flex;
            justify-content: space-between;
            gap: 5mm;
            padding-top: 3mm;
            border-top: 1px solid #cbd5e1;
            color: #64748b;
            font-size: 6.5pt;
          }
        </style>
      </head>

      <body>
        <article class="page">
          <header class="brand">
            <img
              src="${logoUrl}"
              alt="Profe en Movimiento"
            />
            <div>
              <strong>PROFE EN MOVIMIENTO 5.0</strong>
              <span>Planificador Físico · ${escapeHtml(contextLabel)}</span>
            </div>
          </header>

          <main>
            <p class="kicker">
              PLANIFICACIÓN FÍSICA COMPLETADA
            </p>

            <h1>${escapeHtml(plan.title)}</h1>
            <p class="summary">${escapeHtml(plan.summary)}</p>

            <div class="metrics">
              <article class="metric">
                <span>Duración</span>
                <strong>${plan.totalMinutes} min</strong>
              </article>
              <article class="metric">
                <span>RPE</span>
                <strong>${plan.sessionRpe}/10</strong>
              </article>
              <article class="metric">
                <span>Carga estimada</span>
                <strong>${plan.estimatedLoad} UA</strong>
              </article>
            </div>

            <section class="objective">
              <h2>Objetivo operativo</h2>
              <p>${escapeHtml(plan.objective)}</p>
            </section>

            <section class="load">
              <h2>Orientación de la carga</h2>
              <p>${escapeHtml(plan.loadGuidance)}</p>
            </section>

            <section class="organization">
              <h2>Organización general</h2>
              <p>${escapeHtml(plan.organizationSummary)}</p>
            </section>

            <div class="table-frame overview-frame"><table class="overview">
              <thead>
                <tr>
                  <th>Bloque</th>
                  <th>Objetivo</th>
                  <th>Tiempo</th>
                </tr>
              </thead>
              <tbody>
                ${plan.blocks
                  .map(
                    (block, index) => `
                      <tr>
                        <td><strong>${index + 1}. ${escapeHtml(block.name)}</strong></td>
                        <td>${escapeHtml(block.objective)}</td>
                        <td>${block.minutes} min</td>
                      </tr>
                    `,
                  )
                  .join("")}
              </tbody>
            </table></div>


          </main>

          <footer>
            <span>Planificador Físico · Carga, tiempo y progresión bajo control</span>
            <span>Página 1 de ${totalPages}</span>
          </footer>
        </article>

        <article class="page">


          <main>
          <div class="brand support-brand">
            <img
              src="${logoUrl}"
              alt="Profe en Movimiento"
            />
            <div>
              <strong>PROFE EN MOVIMIENTO 5.0</strong>
              <span>Planificador Físico · ${escapeHtml(contextLabel)}</span>
            </div>
          </div>

            <p class="kicker">
              ORIENTACIONES PARA LA APLICACIÓN
            </p>

            <h1>Evaluación, seguridad y adaptación</h1>

            <p class="summary">
              Indicaciones complementarias para aplicar la sesión de forma accesible, observable y segura.
            </p>

            <div class="summary-grid">
              <section class="summary-card">
                <h2>Indicadores observables</h2>
                ${list(plan.observableIndicators)}
              </section>
              <section class="summary-card">
                <h2>Seguridad</h2>
                ${list(plan.safetyMeasures)}
              </section>
              <section class="summary-card">
                <h2>Adaptaciones</h2>
                ${list(plan.adaptationNotes)}
              </section>
              <section class="summary-card">
                <h2>${context === "physical_education" ? "Revisión del docente" : "Revisión del entrenador"}</h2>
                ${list(plan.teacherReview)}
              </section>
            </div>

                      ${duaContent}
          </main>

          <footer>
            <span>Planificador Físico · Carga, tiempo y progresión bajo control</span>
            <span>Página 2 de ${totalPages}</span>
          </footer>
        </article>
        ${duaPage}

        ${blockPages}
      </body>
    </html>
  `;
}

export default function PhysicalPlanPrintButton({
  plan,
  context,
}: PhysicalPlanPrintButtonProps) {
  function handlePrint() {
    const originalDocumentTitle =
      document.title;

    const frame =
      document.createElement("iframe");

    frame.setAttribute(
      "aria-hidden",
      "true",
    );

    frame.style.position = "fixed";
    frame.style.right = "0";
    frame.style.bottom = "0";
    frame.style.width = "1px";
    frame.style.height = "1px";
    frame.style.border = "0";
    frame.style.opacity = "0";
    frame.style.pointerEvents = "none";

    const removeFrame = () => {
      document.title =
        originalDocumentTitle;

      if (frame.isConnected) {
        frame.remove();
      }
    };

    frame.onload = () => {
      const printWindow =
        frame.contentWindow;

      if (!printWindow) {
        removeFrame();
        return;
      }

      const startPrinting = () => {
        document.title =
          printWindow.document.title;

        printWindow.addEventListener(
          "afterprint",
          removeFrame,
          { once: true },
        );

        window.setTimeout(() => {
          try {
            printWindow.focus();
            printWindow.print();
          } catch {
            removeFrame();

            window.alert(
              "No se pudo abrir la impresión. Intenta nuevamente.",
            );
          }
        }, 250);
      };

      const images = Array.from(
        printWindow.document.images,
      );

      if (
        images.length === 0 ||
        images.every((image) => image.complete)
      ) {
        startPrinting();
        return;
      }

      Promise.all(
        images.map(
          (image) =>
            new Promise<void>((resolve) => {
              if (image.complete) {
                resolve();
                return;
              }

              image.addEventListener(
                "load",
                () => resolve(),
                { once: true },
              );

              image.addEventListener(
                "error",
                () => resolve(),
                { once: true },
              );
            }),
        ),
      ).then(startPrinting);
    };

    document.body.appendChild(frame);

    frame.srcdoc =
      buildPrintableDocument(
        plan,
        context,
      );
  }
  return (
    <button
      type="button"
      onClick={handlePrint}
      className="mt-5 inline-flex min-h-11 items-center justify-center rounded-xl border border-blue-300 bg-white px-5 text-sm font-black text-blue-700 transition hover:bg-blue-50 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-blue-100"
    >
      Imprimir o guardar como PDF
    </button>
  );
}