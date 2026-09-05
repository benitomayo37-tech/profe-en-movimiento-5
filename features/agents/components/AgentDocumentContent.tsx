import type { ReactNode } from "react";

function duaLineClass(line: string): string {
  const normalized = line
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/^[^a-z]+/, "");
  const trimmed = line.trimStart();

  if (
    normalized.startsWith("compromiso")
    || normalized.startsWith(
      "proporcionar multiples formas de compromiso",
    )
  ) {
    return "agent-dua-compromiso";
  }

  if (
    normalized.startsWith("representacion")
    || normalized.startsWith(
      "proporcionar multiples formas de representacion",
    )
  ) {
    return "agent-dua-representacion";
  }

  if (
    normalized.startsWith("accion y expresion")
    || normalized.startsWith(
      "proporcionar multiples formas de accion y expresion",
    )
  ) {
    return "agent-dua-accion-expresion";
  }

  if (trimmed.startsWith("🟢")) return "agent-dua-compromiso";
  if (trimmed.startsWith("🟣")) return "agent-dua-representacion";
  if (trimmed.startsWith("🔵")) return "agent-dua-accion-expresion";

  return "";
}

function tableCells(line: string) {
  return line
    .trim()
    .replace(/^\|/, "")
    .replace(/\|$/, "")
    .split("|")
    .map((cell) => cell.trim());
}

function isTableSeparator(line: string) {
  const cells = tableCells(line);

  return (
    cells.length > 1
    && cells.every((cell) => /^:?-{3,}:?$/.test(cell))
  );
}

export function getPrintableAgentResult(
  content: string,
  fallbackTitle: string,
) {
  const lines = content.split("\n");
  const tableStart = lines.findIndex(
    (line, index) =>
      line.includes("|")
      && index + 1 < lines.length
      && isTableSeparator(lines[index + 1]),
  );
  const meaningfulBeforeTable =
    tableStart >= 0
      ? lines
          .slice(0, tableStart)
          .filter(
            (line) =>
              line.trim()
              && !/^#{1,6}\s+/.test(line.trim()),
          )
      : [];

  if (tableStart >= 0 && meaningfulBeforeTable.length <= 2) {
    let tableEnd = tableStart + 2;

    while (
      tableEnd < lines.length
      && lines[tableEnd].includes("|")
      && lines[tableEnd].trim()
    ) {
      tableEnd += 1;
    }

    let headingIndex = tableStart - 1;

    while (headingIndex >= 0 && !lines[headingIndex].trim()) {
      headingIndex -= 1;
    }

    const heading =
      headingIndex >= 0 && /rúbrica/i.test(lines[headingIndex])
        ? lines[headingIndex]
            .replace(/^[-*#\s]+/, "")
            .trim()
        : "Rúbrica de evaluación";

    return {
      title: heading,
      content: lines.slice(tableStart, tableEnd).join("\n"),
    };
  }

  const firstHeading = lines.findIndex((line) =>
    /^#\s+/.test(line.trim())
  );
  const productTitle = lines.findIndex((line) =>
    /^(Microciclo|Mesociclo|Macrociclo|Sesión de entrenamiento)\b/i.test(
      line.replace(/^#{1,6}\s+/, "").trim(),
    )
  );
  const titleIndex =
    firstHeading >= 0 ? firstHeading : productTitle;
  const fallbackContent = `${fallbackTitle}
${content}`;
  const defaultTitle =
    /\b(microciclo|mesociclo|macrociclo|sesión de entrenamiento)\b/i.test(
      fallbackContent,
    )
      ? "Plan de entrenamiento deportivo"
      : /\b(clase|educación física|dua|estudiantes)\b/i.test(
            fallbackContent,
          )
        ? "Planificación de clase de Educación Física"
        : fallbackTitle.length <= 90
          ? fallbackTitle
          : "Recurso docente";
  const title =
    titleIndex >= 0
      ? lines[titleIndex]
          .replace(/^#{1,6}\s+/, "")
          .trim()
      : defaultTitle;
  const withoutTitle =
    titleIndex >= 0
      ? lines.filter((_, index) => index !== titleIndex)
      : lines;
  const processStart = withoutTitle.findIndex((line) =>
    /^(especialista consultado|resumen del aporte|revisión del docente|revisión del entrenador)/i.test(
      line.replace(/^#{1,6}\s+/, "").trim(),
    )
  );
  const printableLines = (
    processStart >= 0
      ? withoutTitle.slice(0, processStart)
      : withoutTitle
  ).filter(
    (line) =>
      !/^(especialistas consultados|decisión final y responsabilidad|(?:[-*]\s*)?supuestos?(?:\s+(?:breves?|pedagógicos?))?\b)/i.test(
        line.replace(/^#{1,6}\s+/, "").trim(),
      ),
  );

  return {
    title,
    content: printableLines.join("\n").trim(),
  };
}

export function AgentDocumentContent({
  content,
}: {
  content: string;
}) {
  const lines = content.split("\n");
  const blocks: ReactNode[] = [];

  for (let index = 0; index < lines.length;) {
    const rawLine = lines[index];
    const line = rawLine
      .replace(
        /^(\s*[-*]?\s*)🔵(\s+Representación\b)/i,
        "$1🟣$2",
      )
      .replace(
        /^(\s*[-*]?\s*)🟣(\s+Acción y Expresión\b)/i,
        "$1🔵$2",
      );

    if (/^\s*---+\s*$/.test(line)) {
      blocks.push(
        <hr key={index} className="agent-section-divider" />,
      );
      index += 1;
      continue;
    }

    if (
      line.includes("|")
      && index + 1 < lines.length
      && isTableSeparator(lines[index + 1])
    ) {
      const headers = tableCells(line);
      const isRubric = headers.some((header) =>
        /Excelente\s*\(10\)/i.test(header)
      );
      const rows: string[][] = [];
      index += 2;

      while (
        index < lines.length
        && lines[index].includes("|")
        && lines[index].trim()
      ) {
        rows.push(tableCells(lines[index]));
        index += 1;
      }

      blocks.push(
        <div
          key={`table-${index}`}
          className={`agent-table-wrap my-4 overflow-x-auto rounded-xl border ${
            isRubric ? "agent-rubric-wrap" : "agent-plan-wrap"
          }`}
        >
          <table
            className={`agent-content-table w-full border-collapse text-left text-xs leading-5 ${
              isRubric
                ? "agent-rubric-table min-w-[900px]"
                : "agent-plan-table min-w-[720px]"
            }`}
          >
            <thead>
              <tr>
                {headers.map((header, cellIndex) => (
                  <th
                    key={cellIndex}
                    className="px-3 py-2 font-black"
                  >
                    {header}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map((row, rowIndex) => (
                <tr key={rowIndex}>
                  {headers.map((_, cellIndex) => (
                    <td
                      key={cellIndex}
                      className="px-3 py-2 align-top"
                    >
                      {row[cellIndex] ?? ""}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>,
      );
      continue;
    }

    const duaClass = duaLineClass(line);
    const heading = line.match(/^(#{2,4})\s+(.+)$/);
    const sessionHeading = line.match(
      /^(Sesión\s+\d+|Semana\s+\d+|Periodo\s+\d+)(?:\s*[-—:]\s*)?(.+)?$/i,
    );

    blocks.push(
      !line ? (
        <div key={index} className="h-3" aria-hidden="true" />
      ) : heading ? (
        <h3 key={index} className="agent-content-heading">
          {heading[2]}
        </h3>
      ) : sessionHeading ? (
        <h4 key={index} className="agent-session-heading">
          {line}
        </h4>
      ) : (
        <div
          key={index}
          className={
            duaClass
              ? `my-1 rounded-xl border px-3 py-2 font-semibold ${duaClass}`
              : "agent-content-line whitespace-pre-wrap"
          }
        >
          {line}
        </div>
      ),
    );

    index += 1;
  }

  return <div className="mt-3 text-sm leading-7">{blocks}</div>;
}