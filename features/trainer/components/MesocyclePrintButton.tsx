"use client";

import { MESOCYCLE_PRINT_ROOT_ID } from "./MesocyclePrintable";

const PRINT_CSS = `
@page{size:A4 portrait;margin:12mm}*{box-sizing:border-box}body{margin:0;color:#0f172a;font-family:Arial,sans-serif;font-size:9pt}.meso-print-page{position:relative;display:flex;min-height:273mm;flex-direction:column;break-after:page;page-break-after:always}.meso-print-page:last-child{break-after:auto;page-break-after:auto}.meso-print-header{border-bottom:2px solid #059669;padding-bottom:6px;margin-bottom:10px}.meso-print-header>div{display:flex;align-items:center;gap:8px}.meso-print-header img{width:13mm;height:13mm;object-fit:contain}.meso-print-header p{margin:0;color:#047857;font-size:8pt;font-weight:800;letter-spacing:.08em}.meso-print-header span{color:#64748b;font-size:7pt}.meso-print-header h1{margin:7px 0 0;font-size:16pt}.meso-print-summary{font-size:10pt;line-height:1.45}.meso-print-meta{display:flex;flex-wrap:wrap;gap:6px;margin:8px 0}.meso-print-meta strong{border-radius:6px;background:#ecfdf5;padding:5px 8px;color:#065f46}.meso-print-box{margin:5px 0;border:1px solid #cbd5e1;border-left:3px solid #10b981;border-radius:6px;padding:7px 9px;break-inside:avoid}.meso-print-box h2{margin:0 0 4px;font-size:10pt}.meso-print-box p,.meso-print-box ul{margin:0;line-height:1.4}.meso-print-box li{margin:2px 0}.meso-print-grid{display:grid;grid-template-columns:1fr 1fr;gap:5px}table{width:100%;margin-top:8px;border-collapse:collapse}th,td{border:1px solid #cbd5e1;padding:6px;text-align:left;vertical-align:top}th{background:#ecfdf5;color:#065f46}footer{margin-top:auto;border-top:1px solid #cbd5e1;padding-top:5px;color:#64748b;font-size:7pt;text-align:center}`;

export default function MesocyclePrintButton() {
  function printMesocycle() {
    const source = document.getElementById(MESOCYCLE_PRINT_ROOT_ID);
    if (!source) return;

    const iframe = document.createElement("iframe");
    iframe.setAttribute("title", "Impresión del mesociclo");
    iframe.style.position = "fixed";
    iframe.style.width = "1px";
    iframe.style.height = "1px";
    iframe.style.opacity = "0";
    iframe.style.pointerEvents = "none";
    document.body.appendChild(iframe);

    const printDocument = iframe.contentDocument;
    if (!printDocument) { iframe.remove(); return; }
    printDocument.open();
    printDocument.write(`<!doctype html><html lang="es"><head><meta charset="utf-8"><title>Mesociclo</title><style>${PRINT_CSS}</style></head><body>${source.innerHTML}</body></html>`);
    printDocument.close();

    const images = Array.from(printDocument.images);
    const ready = Promise.all(images.map((image) => image.complete ? Promise.resolve() : new Promise<void>((resolve) => { image.onload = () => resolve(); image.onerror = () => resolve(); })));
    void ready.then(() => {
      const printWindow = iframe.contentWindow;
      if (!printWindow) { iframe.remove(); return; }
      printWindow.focus();
      printWindow.print();
      window.setTimeout(() => iframe.remove(), 1500);
    });
  }

  return <button type="button" onClick={printMesocycle} className="shrink-0 rounded-xl bg-emerald-600 px-5 py-3 text-sm font-black text-white shadow-lg transition hover:bg-emerald-700">Imprimir / guardar PDF</button>;
}
