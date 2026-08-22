"use client";

const MICROCYCLE_PRINT_FRAME_ID = "microcycle-print-frame";

const MICROCYCLE_PRINT_STYLES = `
  @page {
    size: A4 portrait;
    margin: 12mm 9mm 12mm 9mm;
  }

  * { box-sizing: border-box; }

  html, body {
    margin: 0;
    padding: 0;
    background: #ffffff;
    color: #0f172a;
    font-family: Arial, Helvetica, sans-serif;
    -webkit-print-color-adjust: exact;
    print-color-adjust: exact;
  }

  #microcycle-print-root {
    display: block;
    width: 100%;
  }

  .micro-print-page {
    display: flex;
    flex-direction: column;
    width: 100%;
    min-height: 273mm;
    overflow: visible;
    background: #ffffff;
  }

  .micro-print-page + .micro-print-page {
    break-before: page;
    page-break-before: always;
  }

  .micro-print-header {
    margin-bottom: 5px;
    padding-bottom: 5px;
    border-bottom: 1px solid #cbd5e1;
  }

  .micro-print-brand-row {
    display: flex;
    align-items: center;
    gap: 7px;
  }

  .micro-print-logo {
    display: block;
    width: 10mm;
    height: 10mm;
    object-fit: contain;
  }

  .micro-print-brand {
    margin: 0;
    color: #1d4ed8;
    font-size: 8.5pt;
    font-weight: 800;
    letter-spacing: 0.08em;
  }

  .micro-print-brand-secondary,
  .micro-print-continuation {
    margin: 2px 0 0;
    color: #64748b;
    font-size: 7pt;
    font-weight: 700;
  }

  .micro-print-content {
    flex: 1;
  }

  .micro-print-kicker {
    margin: 7px 0 0;
    color: #047857;
    font-size: 7pt;
    font-weight: 900;
    letter-spacing: 0.14em;
  }

  h1 {
    margin: 5px 0 3px;
    font-size: 14pt;
    line-height: 1.15;
  }

  h2 {
    margin: 0;
    font-size: 8pt;
    line-height: 1.2;
  }

  h3 {
    margin: 0;
    font-size: 8.2pt;
    line-height: 1.2;
  }

  p, li, td, th {
    font-size: 7.3pt;
    line-height: 1.3;
  }

  p { margin: 0; }

  ul {
    margin: 3px 0 0;
    padding-left: 13px;
  }

  li + li { margin-top: 2px; }

  .micro-print-summary {
    margin-bottom: 6px;
    color: #475569;
  }

  .micro-print-section { margin-top: 6px; }

  .micro-print-section > h2 {
    margin-bottom: 4px;
    color: #0f172a;
    font-size: 9pt;
  }

  .micro-print-box {
    padding: 6px;
    border: 1px solid #dbe3ee;
    border-radius: 5px;
    background: #f8fafc;
    break-inside: avoid;
    page-break-inside: avoid;
  }

  .micro-print-box h2 { margin-bottom: 3px; }
  .micro-print-box-green { border-color: #a7f3d0; background: #ecfdf5; }
  .micro-print-box-blue { border-color: #bfdbfe; background: #eff6ff; }
  .micro-print-box-violet { border-color: #ddd6fe; background: #f5f3ff; }
  .micro-print-box-amber { border-color: #fde68a; background: #fffbeb; }

  .micro-print-two-columns,
  .micro-print-three-columns,
  .micro-print-detail-grid,
  .micro-print-day-meta {
    display: grid;
    gap: 5px;
    margin-top: 5px;
  }

  .micro-print-two-columns,
  .micro-print-day-meta,
  .micro-print-detail-grid { grid-template-columns: repeat(2, minmax(0, 1fr)); }
  .micro-print-three-columns { grid-template-columns: repeat(3, minmax(0, 1fr)); }

  .micro-print-table {
    width: 100%;
    border-collapse: collapse;
    table-layout: fixed;
  }

  .micro-print-table th,
  .micro-print-table td {
    padding: 4px;
    border: 1px solid #cbd5e1;
    text-align: left;
    vertical-align: top;
  }

  .micro-print-table th {
    background: #f1f5f9;
    font-weight: 800;
  }

  .micro-print-table th:nth-child(1) { width: 10%; }
  .micro-print-table th:nth-child(2) { width: 34%; }
  .micro-print-table th:nth-child(3) { width: 15%; }
  .micro-print-table th:nth-child(4) { width: 16%; }
  .micro-print-table th:nth-child(5) { width: 10%; }
  .micro-print-table th:nth-child(6) { width: 15%; }

  .micro-print-day-heading {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    gap: 8px;
  }

  .micro-print-duration {
    margin-top: 7px;
    padding: 4px 7px;
    border-radius: 12px;
    background: #e2e8f0;
    font-size: 8pt;
    font-weight: 900;
    white-space: nowrap;
  }

  .micro-print-day-meta section {
    padding: 5px;
    border: 1px solid #dbe3ee;
    border-radius: 5px;
  }

  .micro-print-day-meta h2 { margin-bottom: 2px; }

  .micro-print-segments {
    display: grid;
    gap: 4px;
  }

  .micro-print-segments article {
    padding: 5px 6px;
    border: 1px solid #dbe3ee;
    border-left: 3px solid #34d399;
    border-radius: 4px;
    break-inside: avoid;
    page-break-inside: avoid;
  }

  .micro-print-segment-title {
    display: flex;
    justify-content: space-between;
    gap: 6px;
  }

  .micro-print-segment-title strong {
    color: #047857;
    font-size: 7.5pt;
    white-space: nowrap;
  }

  .micro-print-segment-objective {
    margin: 2px 0;
    color: #334155;
    font-weight: 700;
  }

  .micro-print-footer {
    display: flex;
    justify-content: space-between;
    gap: 10px;
    margin-top: auto;
    padding-top: 5px;
    color: #64748b;
    font-size: 6.8pt;
  }
`;

function waitForImages(targetDocument: Document): Promise<void> {
  const images = Array.from(targetDocument.images);

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

          let complete = false;

          const finish = () => {
            if (complete) return;
            complete = true;
            window.clearTimeout(timeoutId);
            image.removeEventListener("load", finish);
            image.removeEventListener("error", finish);
            resolve();
          };

          const timeoutId = window.setTimeout(finish, 2500);
          image.addEventListener("load", finish, { once: true });
          image.addEventListener("error", finish, { once: true });
        }),
    ),
  ).then(() => undefined);
}

function waitForLayout(targetWindow: Window): Promise<void> {
  return new Promise((resolve) => {
    targetWindow.requestAnimationFrame(() => {
      targetWindow.requestAnimationFrame(() => resolve());
    });
  });
}

export default function MicrocyclePrintButton() {
  async function handlePrint() {
    const printable = document.getElementById("microcycle-printable");
    if (!printable) return;

    document.getElementById(MICROCYCLE_PRINT_FRAME_ID)?.remove();

    const clone = printable.cloneNode(true) as HTMLElement;
    clone.id = "microcycle-print-root";
    clone.classList.remove("hidden");
    clone.removeAttribute("aria-hidden");
    clone.style.display = "block";
    clone.querySelectorAll<HTMLImageElement>("img").forEach((image) => {
      image.loading = "eager";
      image.decoding = "sync";
    });

    const iframe = document.createElement("iframe");
    iframe.id = MICROCYCLE_PRINT_FRAME_ID;
    iframe.title = "Microciclo imprimible de Entrenador IA";
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
    printDocument.write(`<!doctype html><html lang="es"><head><meta charset="utf-8"><title>Entrenador IA - Microciclo</title></head><body></body></html>`);
    printDocument.close();

    const base = printDocument.createElement("base");
    base.href = document.baseURI;
    printDocument.head.appendChild(base);

    const style = printDocument.createElement("style");
    style.textContent = MICROCYCLE_PRINT_STYLES;
    printDocument.head.appendChild(style);
    printDocument.body.appendChild(printDocument.importNode(clone, true));

    try {
      await Promise.all([waitForImages(printDocument), printDocument.fonts.ready]);
      await waitForLayout(printWindow);
    } catch {
      iframe.remove();
      return;
    }

    let cleaned = false;
    const cleanup = () => {
      if (cleaned) return;
      cleaned = true;
      printWindow.removeEventListener("afterprint", cleanup);
      window.removeEventListener("afterprint", cleanup);
      iframe.remove();
    };

    printWindow.addEventListener("afterprint", cleanup, { once: true });
    window.addEventListener("afterprint", cleanup, { once: true });
    printWindow.focus();
    printWindow.print();
  }

  return (
    <button
      type="button"
      onClick={handlePrint}
      className="inline-flex min-h-10 shrink-0 items-center justify-center gap-2 rounded-xl border border-emerald-200 bg-white px-4 py-2 text-sm font-bold text-emerald-800 transition hover:border-emerald-300 hover:bg-emerald-50 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-emerald-100"
    >
      <span aria-hidden="true">🖨️</span>
      Imprimir / Guardar PDF
    </button>
  );
}
