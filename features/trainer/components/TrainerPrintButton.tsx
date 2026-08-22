"use client";

const TRAINER_PRINT_FRAME_ID =
  "trainer-ia-print-frame";

const TRAINER_PRINT_STYLES = `
  @page {
    size: A4 portrait;
    margin: 11mm 10mm 11mm 10mm;
  }

  * {
    box-sizing: border-box;
  }

  html,
  body {
    margin: 0;
    padding: 0;
    background: #ffffff;
    font-family: Arial, Helvetica, sans-serif;
    color: #0f172a;
    -webkit-print-color-adjust: exact;
    print-color-adjust: exact;
  }

  #trainer-print-root {
    display: block;
    width: 100%;
    margin: 0;
    padding: 0;
    background: #ffffff;
  }

  .trainer-print-page {
    display: flex;
    flex-direction: column;
    position: relative;
    width: 100%;
    min-height: 275mm;
    margin: 0;
    padding: 0;
    background: #ffffff;
  }

  .trainer-print-page + .trainer-print-page {
    break-before: page;
    page-break-before: always;
  }

  .trainer-print-header {
    margin: 0 0 4mm 0;
    padding: 0 0 2.5mm 0;
    border-bottom: 1px solid #cbd5e1;
    break-inside: avoid;
    page-break-inside: avoid;
  }

  .trainer-print-brand-row {
    display: flex;
    align-items: center;
    gap: 2.5mm;
  }

  .trainer-print-logo {
    display: block;
    width: 12mm;
    height: 12mm;
    object-fit: contain;
  }

  .trainer-print-brand,
  .trainer-print-brand-secondary,
  .trainer-print-continuation {
    margin: 0;
  }

  .trainer-print-brand {
    font-size: 9pt;
    line-height: 1.1;
    font-weight: 800;
    letter-spacing: 0.08em;
    color: #1d4ed8;
  }

  .trainer-print-brand-secondary {
    margin-top: 1mm;
    font-size: 7.2pt;
    line-height: 1.2;
    font-weight: 700;
    color: #047857;
  }

  .trainer-print-continuation {
    margin-top: 1.5mm;
    font-size: 7pt;
    font-weight: 700;
    color: #64748b;
  }

  .trainer-print-main {
    flex: 1;
  }

  .trainer-print-main h1 {
    margin: 1.5mm 0 2mm 0;
    font-size: 16pt;
    line-height: 1.15;
    color: #0f172a;
  }

  .trainer-print-kicker {
    margin: 0;
    font-size: 7.2pt;
    line-height: 1.2;
    font-weight: 800;
    letter-spacing: 0.11em;
    color: #047857;
  }

  .trainer-print-summary {
    margin: 0 0 3mm 0;
    font-size: 8.4pt;
    line-height: 1.35;
    color: #334155;
  }

  .trainer-print-objective,
  .trainer-print-load {
    margin-bottom: 3mm;
    padding: 2.5mm 3mm;
    border: 1px solid;
    border-radius: 2mm;
    break-inside: avoid;
    page-break-inside: avoid;
  }

  .trainer-print-objective {
    border-color: #86efac;
    background: #ecfdf5;
  }

  .trainer-print-load {
    border-color: #bfdbfe;
    background: #eff6ff;
  }

  .trainer-print-objective h2,
  .trainer-print-load h2,
  .trainer-print-summary-card h2,
  .trainer-print-block-meta h2,
  .trainer-print-coaching h2,
  .trainer-print-recovery h2,
  .trainer-print-safety h2 {
    margin: 0 0 1mm 0;
    font-size: 8pt;
    line-height: 1.2;
    font-weight: 800;
  }

  .trainer-print-objective p,
  .trainer-print-load p,
  .trainer-print-block-meta p,
  .trainer-print-recovery p,
  .trainer-print-safety p {
    margin: 0;
    font-size: 7.6pt;
    line-height: 1.32;
  }

  .trainer-print-section-title {
    margin: 0 0 1.5mm 0;
    font-size: 9pt;
    line-height: 1.2;
    font-weight: 800;
    color: #0f172a;
  }

  .trainer-print-overview-table {
    width: 100%;
    border-collapse: collapse;
    table-layout: fixed;
    border: 1px solid #94a3b8;
  }

  .trainer-print-overview-table th,
  .trainer-print-overview-table td {
    border: 1px solid #94a3b8;
    padding: 1.5mm;
    vertical-align: top;
    text-align: left;
    font-size: 7.1pt;
    line-height: 1.25;
    overflow-wrap: anywhere;
  }

  .trainer-print-overview-table th {
    background: #f1f5f9;
    font-weight: 800;
  }

  .trainer-print-overview-table th:nth-child(1),
  .trainer-print-overview-table td:nth-child(1) {
    width: 25%;
  }

  .trainer-print-overview-table th:nth-child(2),
  .trainer-print-overview-table td:nth-child(2) {
    width: 49%;
  }

  .trainer-print-overview-table th:nth-child(3),
  .trainer-print-overview-table td:nth-child(3) {
    width: 15%;
  }

  .trainer-print-overview-table th:nth-child(4),
  .trainer-print-overview-table td:nth-child(4) {
    width: 11%;
    text-align: center;
  }

  .trainer-print-overview-table tr {
    break-inside: avoid;
    page-break-inside: avoid;
  }

  .trainer-print-summary-grid {
    display: grid;
    grid-template-columns: repeat(3, minmax(0, 1fr));
    gap: 2mm;
    margin-top: 3mm;
  }

  .trainer-print-summary-card {
    padding: 2.2mm;
    border: 1px solid;
    border-radius: 2mm;
    break-inside: avoid;
    page-break-inside: avoid;
  }

  .trainer-print-summary-card-blue {
    border-color: #bfdbfe;
    background: #eff6ff;
  }

  .trainer-print-summary-card-amber {
    border-color: #fde68a;
    background: #fffbeb;
  }

  .trainer-print-summary-card-emerald {
    border-color: #a7f3d0;
    background: #ecfdf5;
  }

  .trainer-print-summary-card ul,
  .trainer-print-coaching ul {
    margin: 0;
    padding-left: 4mm;
  }

  .trainer-print-summary-card li,
  .trainer-print-coaching li {
    margin: 0 0 1mm 0;
    font-size: 7pt;
    line-height: 1.25;
  }

  .trainer-print-block-heading {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    gap: 5mm;
    margin-bottom: 2.5mm;
  }

  .trainer-print-time-badge {
    flex: 0 0 auto;
    padding: 1.5mm 2.5mm;
    border-radius: 4mm;
    background: #e2e8f0;
    font-size: 8pt;
    font-weight: 800;
    color: #334155;
  }

  .trainer-print-block-meta {
    display: grid;
    grid-template-columns: 3fr 1fr;
    gap: 2mm;
    margin-bottom: 3mm;
  }

  .trainer-print-block-meta section {
    padding: 2mm;
    border: 1px solid #cbd5e1;
    border-radius: 1.5mm;
    background: #f8fafc;
    break-inside: avoid;
    page-break-inside: avoid;
  }

  .trainer-print-meta-wide {
    grid-column: 1 / -1;
  }

  .trainer-print-content-grid {
    display: grid;
    grid-template-columns: minmax(0, 2.2fr) minmax(0, 1fr);
    gap: 3mm;
    align-items: start;
  }

  .trainer-print-activities {
    display: grid;
    gap: 2mm;
  }

  .trainer-print-activity {
    padding: 2.2mm;
    border: 1px solid #cbd5e1;
    border-radius: 1.5mm;
    background: #ffffff;
    break-inside: avoid;
    page-break-inside: avoid;
  }

  .trainer-print-activity-heading {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    gap: 3mm;
    margin-bottom: 1mm;
  }

  .trainer-print-activity-heading h3 {
    margin: 0;
    font-size: 8.2pt;
    line-height: 1.2;
  }

  .trainer-print-activity-heading span {
    flex: 0 0 auto;
    font-size: 7.2pt;
    font-weight: 800;
    color: #047857;
  }

  .trainer-print-activity > p {
    margin: 0 0 1.5mm 0;
    font-size: 7.2pt;
    line-height: 1.28;
    color: #475569;
  }

  .trainer-print-segments {
    margin: 0;
    padding: 0 0 0 3.5mm;
    border-left: 2px solid #6ee7b7;
    list-style-position: outside;
  }

  .trainer-print-segments li {
    margin: 0 0 1.1mm 0;
    padding-left: 0.5mm;
    font-size: 7.1pt;
    line-height: 1.27;
  }

  .trainer-print-segment-time {
    margin-right: 1mm;
    font-weight: 800;
    color: #047857;
  }

  .trainer-print-coaching,
  .trainer-print-recovery,
  .trainer-print-safety {
    margin-bottom: 2mm;
    padding: 2.3mm;
    border: 1px solid;
    border-radius: 1.5mm;
    break-inside: avoid;
    page-break-inside: avoid;
  }

  .trainer-print-coaching {
    border-color: #bfdbfe;
    background: #eff6ff;
  }

  .trainer-print-recovery {
    border-color: #a7f3d0;
    background: #ecfdf5;
  }

  .trainer-print-safety {
    border-color: #fde68a;
    background: #fffbeb;
  }

  .trainer-print-footer {
    display: flex;
    justify-content: space-between;
    gap: 5mm;
    margin-top: auto;
    padding-top: 2mm;
    border-top: 1px solid #e2e8f0;
    font-size: 6.8pt;
    line-height: 1.2;
    color: #64748b;
    break-inside: avoid;
    page-break-inside: avoid;
  }
`;

function waitForImages(
  targetDocument: Document,
): Promise<void> {
  const images = Array.from(
    targetDocument.images,
  );

  return Promise.all(
    images.map(
      (image) =>
        new Promise<void>((resolve) => {
          image.loading = "eager";
          image.decoding = "sync";

          if (image.complete) {
            resolve();
            return;
          }

          let completed = false;

          const finish = () => {
            if (completed) {
              return;
            }

            completed = true;

            window.clearTimeout(timeoutId);

            image.removeEventListener(
              "load",
              finish,
            );

            image.removeEventListener(
              "error",
              finish,
            );

            resolve();
          };

          const timeoutId = window.setTimeout(
            finish,
            2500,
          );

          image.addEventListener(
            "load",
            finish,
            { once: true },
          );

          image.addEventListener(
            "error",
            finish,
            { once: true },
          );

        }),
    ),
  ).then(() => undefined);
}

function waitForLayout(
  targetWindow: Window,
): Promise<void> {
  return new Promise((resolve) => {
    targetWindow.requestAnimationFrame(() => {
      targetWindow.requestAnimationFrame(() => {
        resolve();
      });
    });
  });
}

export default function TrainerPrintButton() {
  async function handlePrint() {
    const printableArea = document.getElementById(
      "trainer-printable-session",
    );

    if (!printableArea) {
      return;
    }

    document
      .getElementById(TRAINER_PRINT_FRAME_ID)
      ?.remove();

    const printClone =
      printableArea.cloneNode(true) as HTMLElement;

    printClone.id = "trainer-print-root";
    printClone.classList.remove("hidden");
       printClone.removeAttribute("aria-hidden");
    printClone.style.display = "block";

    printClone
      .querySelectorAll<HTMLImageElement>(
        "img",
      )
      .forEach((image) => {
        image.loading = "eager";
        image.decoding = "sync";
      });

    const iframe =
      document.createElement("iframe");

    iframe.id = TRAINER_PRINT_FRAME_ID;
    iframe.title =
      "Documento imprimible de Entrenador IA";

    Object.assign(iframe.style, {
      position: "fixed",
      top: "0",
      left: "-10000px",
      width: "210mm",
      height: "297mm",
      border: "0",
      pointerEvents: "none",
    });

    document.body.appendChild(iframe);

    const printDocument = iframe.contentDocument;
    const printWindow = iframe.contentWindow;

    if (!printDocument || !printWindow) {
      iframe.remove();
      return;
    }

    printDocument.open();
    printDocument.write(`
      <!doctype html>
      <html lang="es">
        <head>
          <meta charset="utf-8" />
          <title>Entrenador IA - Sesión de entrenamiento</title>
        </head>
        <body></body>
      </html>
    `);
    printDocument.close();

    const base = printDocument.createElement("base");
    base.href = document.baseURI;
    printDocument.head.appendChild(base);

    const style = printDocument.createElement("style");
    style.textContent = TRAINER_PRINT_STYLES;
    printDocument.head.appendChild(style);

    const importedResult = printDocument.importNode(
      printClone,
      true,
    );

    printDocument.body.appendChild(importedResult);

    try {
      await Promise.all([
        waitForImages(printDocument),
        printDocument.fonts.ready,
      ]);

      await waitForLayout(printWindow);
    } catch {
      iframe.remove();
      return;
    }

    let cleaned = false;

    const cleanup = () => {
      if (cleaned) {
        return;
      }

      cleaned = true;
      printWindow.removeEventListener(
        "afterprint",
        cleanup,
      );
      window.removeEventListener(
        "afterprint",
        cleanup,
      );
      iframe.remove();
    };

    printWindow.addEventListener(
      "afterprint",
      cleanup,
      { once: true },
    );

    window.addEventListener(
      "afterprint",
      cleanup,
      { once: true },
    );

    printWindow.focus();
    printWindow.print();
  }

  return (
    <button
      type="button"
      onClick={handlePrint}
      className="inline-flex min-h-10 items-center justify-center gap-2 rounded-xl border border-emerald-200 bg-white px-4 py-2 text-sm font-bold text-emerald-800 transition hover:border-emerald-300 hover:bg-emerald-50 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-emerald-100"
    >
      <span aria-hidden="true">🖨️</span>
      Imprimir / Guardar PDF
    </button>
  );
}
