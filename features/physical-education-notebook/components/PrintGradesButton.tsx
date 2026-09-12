"use client";

export default function PrintGradesButton() {
  const handlePrint = () => {
    const summary = document.getElementById("grade-summary-print");
    if (!summary) return;

    const frame = document.createElement("iframe");
    frame.setAttribute("title", "Vista previa del resumen");
    frame.style.position = "fixed";
    frame.style.right = "0";
    frame.style.bottom = "0";
    frame.style.width = "1px";
    frame.style.height = "1px";
    frame.style.border = "0";
    frame.style.opacity = "0";
    frame.srcdoc = `<!doctype html>
<html><head><meta charset="utf-8"><title>Resumen de calificaciones</title>
<style>
@page { size: A4 landscape; margin: 12mm; }
.print-header { display: flex; align-items: center; gap: 14px; border-bottom: 2px solid #1d4ed8; padding-bottom: 10px; margin-bottom: 14px; }
.print-header img { width: 64px; height: 64px; object-fit: contain; }
.print-header h1 { margin: 0; font-size: 18px; color: #1d4ed8; }
.print-header p { margin: 3px 0 0; font-size: 11px; color: #475569; }
* { box-sizing: border-box; }
body { margin: 0; font-family: Arial, sans-serif; color: #0f172a; background: #fff; }
.print-summary { width: 100%; color: #0f172a; background: #fff; }
.print-summary h2, .print-summary p, .print-summary th, .print-summary td, .print-summary span { color: #0f172a !important; }
.print-summary table { width: 100%; min-width: 0 !important; border-collapse: collapse; font-size: 10px; }
.print-summary th, .print-summary td { border: 1px solid #cbd5e1 !important; padding: 6px; background: #fff !important; }
.print-summary th { text-align: left; font-weight: 700; }
.print-summary .no-print { display: none !important; }
</style></head><body><header class="print-header"><img src="${window.location.origin}/logos/logo-profe-en-movimiento.png" alt="Profe en Movimiento" /><div><h1>Profe en Movimiento 5.0</h1><p>Cuaderno Digital de Educaci&oacute;n F&iacute;sica &middot; Resumen de calificaciones</p><p>Emitido: ${new Date().toLocaleDateString("es-EC")}</p></div></header>${summary.outerHTML}</body></html>`;
    frame.onload = () => {
      window.setTimeout(() => {
        frame.contentWindow?.focus();
        frame.contentWindow?.print();
        window.setTimeout(() => frame.remove(), 1000);
      }, 200);
    };
    document.body.appendChild(frame);
  };

  return (
    <button
      type="button"
      className="no-print inline-flex items-center rounded-xl border border-blue-300 bg-blue-500 px-4 py-2 text-sm font-black text-white shadow-sm transition hover:bg-blue-400"
      onClick={handlePrint}
    >
      Imprimir / guardar PDF
    </button>
  );
}