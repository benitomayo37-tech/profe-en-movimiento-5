"use client";

function escapeHtml(value: string): string {
  return value.replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;").replaceAll('"', "&quot;");
}

export default function PrintGradesButton() {
  const handlePrint = () => {
    const summary = document.getElementById("grade-summary-print");
    if (!summary) return;

    const title = summary.querySelector("h1")?.textContent?.trim() ?? "Reporte individual";
    const course = summary.querySelector("h1")?.parentElement?.querySelector("p")?.textContent?.trim() ?? "";
    const rows = Array.from(summary.querySelectorAll("article")).map((article) => {
      const period = article.querySelector("h2")?.textContent?.trim() ?? "";
      const values = Array.from(article.querySelectorAll("div:last-child > div")).map((metric) => metric.querySelectorAll("p")[1]?.textContent?.trim() ?? "Pendiente");
      return `<tr><th>${escapeHtml(period)}</th>${values.map((item) => `<td>${escapeHtml(item)}</td>`).join("")}</tr>`;
    });

    const frame = document.createElement("iframe");
    frame.setAttribute("title", "PDF del reporte individual");
    frame.style.position = "fixed";
    frame.style.width = "1px";
    frame.style.height = "1px";
    frame.style.opacity = "0";
    frame.style.pointerEvents = "none";
    frame.srcdoc = `<!doctype html><html><head><meta charset="utf-8"><title>Reporte individual</title><style>
@page { size: A4 landscape; margin: 12mm; }
* { box-sizing: border-box; }
body { margin: 0; font-family: Arial, sans-serif; color: #0f172a; background: #fff; }
.header { display: flex; align-items: center; gap: 14px; border-bottom: 2px solid #1d4ed8; padding-bottom: 10px; margin-bottom: 14px; }
.header img { width: 58px; height: 58px; object-fit: contain; }
.header h1 { margin: 0; font-size: 19px; color: #1d4ed8; }
.header p { margin: 3px 0 0; font-size: 11px; color: #475569; }
h2 { margin: 0 0 10px; font-size: 15px; color: #1d4ed8; }
table { width: 100%; border-collapse: collapse; font-size: 10px; }
th, td { border: 1px solid #94a3b8; padding: 8px 6px; text-align: center; }
thead th { background: #dbeafe; color: #0f172a; font-weight: 700; }
tbody th { background: #eff6ff; text-align: left; white-space: nowrap; }
tbody td:last-child { font-weight: 700; color: #1d4ed8; }
</style></head><body><header class="header"><img src="${window.location.origin}/logos/logo-profe-en-movimiento.png" alt="Profe en Movimiento"><div><h1>Profe en Movimiento 5.0</h1><p>Cuaderno Digital de Educaci&oacute;n F&iacute;sica - Reporte individual</p><p>${escapeHtml(title)} - ${escapeHtml(course)}</p></div></header><h2>Resumen trimestral de calificaciones</h2><table><thead><tr><th>Periodo</th><th>Cognitiva</th><th>Afectivo-social</th><th>Motriz</th><th>Formativa 70%</th><th>Proyecto 15%</th><th>Examen 15%</th><th>Nota final</th></tr></thead><tbody>${rows.join("")}</tbody></table></body></html>`;
    frame.onload = () => {
      window.setTimeout(() => {
        frame.contentWindow?.focus();
        frame.contentWindow?.print();
        window.setTimeout(() => frame.remove(), 1000);
      }, 200);
    };
    document.body.appendChild(frame);
  };

  return <button type="button" className="no-print inline-flex items-center rounded-xl border border-blue-300 bg-blue-500 px-4 py-2 text-sm font-black text-white shadow-sm transition hover:bg-blue-400" onClick={handlePrint}>Imprimir / guardar PDF</button>;
}