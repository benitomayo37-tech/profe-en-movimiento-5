"use client";

import { MACROCYCLE_PRINT_ROOT_ID } from "./MacrocyclePrintable";

const PRINT_CSS = `
@page{size:A4 portrait;margin:0}
*{box-sizing:border-box}
html,body{margin:0;padding:0}
body{width:210mm;color:#0f172a;font-family:Arial,sans-serif;font-size:9pt;-webkit-print-color-adjust:exact;print-color-adjust:exact}
.macro-print-page{position:relative;display:block;width:210mm;height:297mm;min-height:297mm;max-height:297mm;overflow:hidden;padding:12mm 12mm 20mm;break-after:page;page-break-after:always;break-inside:avoid-page;page-break-inside:avoid}
.macro-print-page:last-child{break-after:auto;page-break-after:auto}
.macro-print-header{border-bottom:2px solid #059669;padding-bottom:6px;margin-bottom:10px;break-inside:avoid-page;page-break-inside:avoid}
.macro-print-header>div{display:flex;align-items:center;gap:8px}
.macro-print-header img{width:13mm;height:13mm;object-fit:contain}
.macro-print-header p{margin:0;color:#047857;font-size:8pt;font-weight:800;letter-spacing:.08em}
.macro-print-header span{color:#64748b;font-size:7pt}
.macro-print-header h1{margin:7px 0 0;font-size:16pt}
.macro-print-summary{font-size:10pt;line-height:1.45}
.macro-print-meta{display:flex;flex-wrap:wrap;gap:6px;margin:8px 0;break-inside:avoid-page;page-break-inside:avoid}
.macro-print-meta strong{border-radius:6px;background:#ecfdf5;padding:5px 8px;color:#065f46}
.macro-print-box{margin:5px 0;border:1px solid #cbd5e1;border-left:3px solid #10b981;border-radius:6px;padding:7px 9px;break-inside:avoid-page;page-break-inside:avoid}
.macro-print-box h2{margin:0 0 4px;font-size:10pt}
.macro-print-box p,.macro-print-box ul{margin:0;line-height:1.4;orphans:3;widows:3}
.macro-print-box li{margin:2px 0}
.macro-print-grid{display:grid;grid-template-columns:1fr 1fr;gap:5px;break-inside:avoid-page;page-break-inside:avoid}
table{width:100%;margin-top:8px;border-collapse:collapse;break-inside:avoid-page;page-break-inside:avoid}
th,td{border:1px solid #cbd5e1;padding:6px;text-align:left;vertical-align:top}
th{background:#ecfdf5;color:#065f46}
footer{position:absolute;right:12mm;bottom:12mm;left:12mm;border-top:1px solid #cbd5e1;padding-top:5px;color:#64748b;font-size:7pt;text-align:center}
`;

export default function MacrocyclePrintButton() {
  function printMacrocycle() {
    const source = document.getElementById(MACROCYCLE_PRINT_ROOT_ID);
    if (!source) return;

    const iframe = document.createElement("iframe");
    iframe.setAttribute("title", "Impresión del macrociclo");
    iframe.style.position = "fixed";
    iframe.style.width = "1px";
    iframe.style.height = "1px";
    iframe.style.opacity = "0";
    iframe.style.pointerEvents = "none";
    document.body.appendChild(iframe);

    const printDocument = iframe.contentDocument;
    if (!printDocument) {
      iframe.remove();
      return;
    }

    printDocument.open();
    printDocument.write(
      `<!doctype html><html lang="es"><head><meta charset="utf-8"><title>Macrociclo</title><style>${PRINT_CSS}</style></head><body>${source.innerHTML}</body></html>`,
    );
    printDocument.close();

    const images = Array.from(printDocument.images);
    const ready = Promise.all(
      images.map((image) =>
        image.complete
          ? Promise.resolve()
          : new Promise<void>((resolve) => {
              image.onload = () => resolve();
              image.onerror = () => resolve();
            }),
      ),
    );

    void ready.then(() => {
      const printWindow = iframe.contentWindow;
      if (!printWindow) {
        iframe.remove();
        return;
      }
      printWindow.focus();
      printWindow.print();
      window.setTimeout(() => iframe.remove(), 1500);
    });
  }

  return (
    <button
      type="button"
      onClick={printMacrocycle}
      className="shrink-0 rounded-xl bg-emerald-600 px-5 py-3 text-sm font-black text-white shadow-lg transition hover:bg-emerald-700"
    >
      Imprimir / guardar PDF
    </button>
  );
}
