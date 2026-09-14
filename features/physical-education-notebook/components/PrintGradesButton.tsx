"use client";

function escapeHtml(value: string): string {
  return value.replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;").replaceAll('"', "&quot;");
}

export default function PrintGradesButton() {
  const handlePrint = () => {
    const summary = document.getElementById("grade-summary-print");
    if (!summary) return;

    const title = summary.querySelector("h2")?.textContent?.trim() ?? "Resumen trimestral";
    const studentName = summary.querySelector("h1")?.textContent?.trim() ?? "";
    const studentCode = Array.from(summary.querySelectorAll("p")).map((item) => item.textContent?.trim() ?? "").find((text) => /^EST-/i.test(text)) ?? "";
    const printDate = new Intl.DateTimeFormat("es-EC", { day: "2-digit", month: "2-digit", year: "numeric" }).format(new Date());
    const tableRows = Array.from(summary.querySelectorAll("tbody tr"));
    const courseReport = tableRows.some((row) => Boolean(row.querySelector("th a")));
    const rows = courseReport
      ? tableRows.map((row) => {
          const name = row.querySelector("th a")?.textContent?.trim() ?? "";
          const code = row.querySelector("th span")?.textContent?.trim() ?? "";
          const metrics = Array.from(row.querySelectorAll("td")).map((cell) => cell.textContent?.replace(/\s+/g, " ").trim() ?? "");
          return `<tr><th>${escapeHtml(code)}</th><th>${escapeHtml(name)}</th>${metrics.map((item) => `<td>${escapeHtml(item)}</td>`).join("")}</tr>`;
        })
      : Array.from(summary.querySelectorAll("article")).map((article) => {
          const period = article.querySelector("h2")?.textContent?.trim() ?? "";
          const values = Array.from(article.querySelectorAll("div:last-child > div")).map((metric) => metric.querySelectorAll("p")[1]?.textContent?.trim() ?? "Pendiente");
          return `<tr><th>${escapeHtml(period)}</th>${values.map((item) => `<td>${escapeHtml(item)}</td>`).join("")}</tr>`;
        });
    const tableHeader = courseReport
      ? "<th>C&oacute;digo</th><th>Estudiante</th><th>Cognitiva</th><th>Afectivo-social</th><th>Motriz</th><th>Formativa 70%</th><th>Proyecto 15%</th><th>Examen 15%</th><th>Nota final</th>"
      : "<th>Per&iacute;odo</th><th>Cognitiva</th><th>Afectivo-social</th><th>Motriz</th><th>Formativa 70%</th><th>Proyecto 15%</th><th>Examen 15%</th><th>Nota final</th>";
    const identity = studentName
      ? `<p>Estudiante: ${escapeHtml(studentName)}</p>${studentCode ? `<p>C&oacute;digo: ${escapeHtml(studentCode)}</p>` : ""}`
      : `<p>${escapeHtml(title)}</p>`;

    const frame = document.createElement("iframe");
    frame.setAttribute("title", "PDF del reporte");
    frame.style.position = "fixed";
    frame.style.width = "1px";
    frame.style.height = "1px";
    frame.style.opacity = "0";
    frame.style.pointerEvents = "none";
    frame.srcdoc = `<!doctype html><html><head><meta charset="utf-8"><title>Reporte de calificaciones</title><style>
      @page{size:A4 landscape;margin:12mm}
      *{box-sizing:border-box}
      body{margin:0;font-family:Arial,sans-serif;color:#0f172a;background:#fff}
      .header{display:flex;align-items:center;gap:14px;border-bottom:2px solid #1d4ed8;padding-bottom:10px;margin-bottom:14px}
      .header img{width:58px;height:58px;object-fit:contain}
      .header h1{margin:0;font-size:19px;color:#1d4ed8}
      .header p{margin:3px 0 0;font-size:11px;color:#475569}
      h2{margin:0 0 10px;font-size:15px;color:#1d4ed8}
      table{width:100%;border-collapse:collapse;font-size:10px}
      th,td{border:1px solid #94a3b8;padding:8px 6px;text-align:center}
      thead th{background:#dbeafe;color:#0f172a;font-weight:700}
      tbody th{background:#eff6ff;text-align:left;white-space:nowrap}
      tbody td:last-child{font-weight:700;color:#1d4ed8}
      .date{margin-top:16px;text-align:right;font-size:11px;color:#475569}
      .signature{width:250px;margin:38px 0 0 auto;text-align:center;font-size:11px}
      .signature-line{border-top:1px solid #0f172a;margin-bottom:5px}
    </style></head><body><header class="header"><img src="${window.location.origin}/logos/logo-profe-en-movimiento.png" alt="Profe en Movimiento"><div><h1>Profe en Movimiento 5.0</h1><p>Cuaderno Digital de Educaci&oacute;n F&iacute;sica - Reporte individual</p>${identity}</div></header><h2>Resumen trimestral de calificaciones - ${escapeHtml(title)}</h2><table><thead><tr>${tableHeader}</tr></thead><tbody>${rows.join("")}</tbody></table><p class="date">Fecha de emisi&oacute;n: ${printDate}</p><div class="signature"><div class="signature-line"></div><strong>Docente responsable</strong><br>Firma</div></body></html>`;
    frame.onload = () => {
      window.setTimeout(() => {
        frame.contentWindow?.focus();
        frame.contentWindow?.print();
        window.setTimeout(() => frame.remove(), 1200);
      }, 200);
    };
    document.body.appendChild(frame);
  };  return <button type="button" className="no-print inline-flex items-center rounded-xl border border-blue-300 bg-blue-500 px-4 py-2 text-sm font-black text-white shadow-sm transition hover:bg-blue-400" onClick={handlePrint}>Imprimir / guardar PDF</button>;
}