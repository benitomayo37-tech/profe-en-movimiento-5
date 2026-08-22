export type MoveSafePatternRecord = {
  status: "pendiente" | "en_seguimiento" | "cerrado";
  situation: string;
  location: string;
  activity: string;
  incident_date: string;
};

export type MoveSafePatternSeverity =
  | "preventiva"
  | "moderada"
  | "alta"
  | "critica";

export type MoveSafePatternType =
  | "recurrencia_tipo"
  | "concentracion_lugar"
  | "recurrencia_actividad"
  | "seguimiento"
  | "concentracion_temporal";

export type MoveSafePattern = {
  type: MoveSafePatternType;
  severity: MoveSafePatternSeverity;
  title: string;
  description: string;
  recommendation: string;
  label: string;
  count: number;
};

export type MoveSafePatternAnalysis = {
  patterns: MoveSafePattern[];
  level: MoveSafePatternSeverity;
  score: number;
  signals: string[];
  recommendations: string[];
};

function clean(value: string | undefined, fallback: string) {
  return value?.trim() || fallback;
}

function countValues(
  records: MoveSafePatternRecord[],
  getValue: (record: MoveSafePatternRecord) => string,
) {
  const map = new Map<string, number>();

  for (const record of records) {
    const value = getValue(record);
    map.set(value, (map.get(value) ?? 0) + 1);
  }

  return Array.from(map.entries())
    .map(([label, count]) => ({ label, count }))
    .sort(
      (a, b) =>
        b.count - a.count ||
        a.label.localeCompare(b.label, "es"),
    );
}

function getSeverity(
  count: number,
): MoveSafePatternSeverity {
  if (count >= 4) return "critica";
  if (count >= 3) return "alta";
  if (count >= 2) return "moderada";

  return "preventiva";
}

function severityScore(
  severity: MoveSafePatternSeverity,
) {
  switch (severity) {
    case "critica":
      return 4;
    case "alta":
      return 3;
    case "moderada":
      return 2;
    default:
      return 1;
  }
}

export function analyzeMoveSafePatterns(
  records: MoveSafePatternRecord[],
): MoveSafePatternAnalysis {
  const patterns: MoveSafePattern[] = [];

  const situations = countValues(
    records,
    (record) =>
      clean(record.situation, "Sin especificar"),
  );

  const locations = countValues(
    records,
    (record) =>
      clean(record.location, "Sin especificar"),
  );

  const activities = countValues(
    records,
    (record) =>
      clean(record.activity, "Sin especificar"),
  );

  // 1. Recurrencia por tipo de situación
  for (const item of situations) {
    if (item.count < 2) continue;

    const severity = getSeverity(item.count);

    patterns.push({
      type: "recurrencia_tipo",
      severity,
      title: "Recurrencia por tipo",
      description:
        `El tipo "${item.label}" aparece ${item.count} veces en los registros.`,
      recommendation:
        "Revisar los factores preventivos relacionados con este tipo de incidente y valorar medidas específicas.",
      label: item.label,
      count: item.count,
    });
  }

  // 2. Concentración por lugar
  for (const item of locations) {
    if (item.count < 2) continue;

    const severity = getSeverity(item.count);

    patterns.push({
      type: "concentracion_lugar",
      severity,
      title: "Concentración por lugar",
      description:
        `Se registran ${item.count} incidentes en "${item.label}".`,
      recommendation:
        `Revisar las condiciones de seguridad, organización y supervisión en "${item.label}".`,
      label: item.label,
      count: item.count,
    });
  }

  // 3. Recurrencia por actividad
  for (const item of activities) {
    if (item.count < 2) continue;

    const severity = getSeverity(item.count);

    patterns.push({
      type: "recurrencia_actividad",
      severity,
      title: "Recurrencia por actividad",
      description:
        `La actividad "${item.label}" concentra ${item.count} incidentes.`,
      recommendation:
        `Revisar la organización, ejecución y medidas preventivas de "${item.label}".`,
      label: item.label,
      count: item.count,
    });
  }

  // 4. Incidentes en seguimiento
  const followup = records.filter(
    (record) =>
      record.status === "en_seguimiento",
  ).length;

  if (followup > 0) {
    const severity =
      followup >= 3
        ? "alta"
        : followup >= 2
          ? "moderada"
          : "preventiva";

    patterns.push({
      type: "seguimiento",
      severity,
      title: "Incidentes en seguimiento",
      description:
        `${followup} incidente${followup === 1 ? "" : "s"} permanece${
          followup === 1 ? "" : "n"
        } en seguimiento.`,
      recommendation:
        "Mantener el seguimiento actualizado y registrar cada nueva actuación.",
      label: "En seguimiento",
      count: followup,
    });
  }

  // 5. Concentración temporal básica
  const dates = countValues(
    records,
    (record) =>
      clean(record.incident_date, "Sin fecha"),
  ).filter(
    (item) => item.label !== "Sin fecha",
  );

  for (const item of dates) {
    if (item.count < 2) continue;

    const severity = getSeverity(item.count);

    patterns.push({
      type: "concentracion_temporal",
      severity,
      title: "Concentración temporal",
      description:
        `Se registran ${item.count} incidentes en la fecha ${item.label}.`,
      recommendation:
        "Revisar qué actividades, condiciones o circunstancias coinciden con este período.",
      label: item.label,
      count: item.count,
    });
  }

  patterns.sort(
    (a, b) =>
      severityScore(b.severity) -
        severityScore(a.severity) ||
      b.count - a.count,
  );

  const topPatterns = patterns.slice(0, 8);

  const score = topPatterns.reduce(
    (total, pattern) =>
      total + severityScore(pattern.severity),
    0,
  );

  let level: MoveSafePatternSeverity =
    "preventiva";

  if (
    score >= 8 ||
    topPatterns.some(
      (pattern) => pattern.severity === "critica",
    )
  ) {
    level = "critica";
  } else if (
    score >= 5 ||
    topPatterns.some(
      (pattern) => pattern.severity === "alta",
    )
  ) {
    level = "alta";
  } else if (score >= 2) {
    level = "moderada";
  }

  const signals = topPatterns
    .slice(0, 4)
    .map(
      (pattern) =>
        `${pattern.title}: ${pattern.description}`,
    );

  const recommendations = Array.from(
    new Set(
      topPatterns
        .slice(0, 4)
        .map(
          (pattern) =>
            pattern.recommendation,
        ),
    ),
  );

  if (signals.length === 0) {
    signals.push(
      "No se observan patrones de recurrencia con los registros disponibles.",
    );
  }

  if (recommendations.length === 0) {
    recommendations.push(
      "Continuar registrando los incidentes para fortalecer el análisis preventivo.",
    );
  }

  return {
    patterns: topPatterns,
    level,
    score,
    signals,
    recommendations,
  };
}