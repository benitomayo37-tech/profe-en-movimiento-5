import Image from "next/image";

import type { GeneratedMacrocycle } from "@/features/trainer/types/trainer";
import {
  formatMacrocycleWeekLabel,
  formatMacrocycleWeekRange,
  MACROCYCLE_FOCUS_LABELS,
  MACROCYCLE_INTENSITY_LABELS,
  MACROCYCLE_PERIOD_LABELS,
} from "@/features/trainer/utils/macrocycleLabels";

export const MACROCYCLE_PRINT_ROOT_ID = "macrocycle-print-root";

export default function MacrocyclePrintable({
  macrocycle,
}: {
  macrocycle: GeneratedMacrocycle;
}) {
  return (
    <div id={MACROCYCLE_PRINT_ROOT_ID} className="hidden">
      <article className="macro-print-page">
        <PrintHeader title={macrocycle.title} />
        <p className="macro-print-summary">{macrocycle.summary}</p>
        <div className="macro-print-meta">
          <strong>{macrocycle.totalWeeks} semanas</strong>
          <strong>{macrocycle.totalSessions} sesiones</strong>
          <strong>{macrocycle.totalMinutes} minutos</strong>
        </div>
        <PrintBox title="Objetivo de temporada" text={macrocycle.seasonObjective} />
        <PrintBox
          title="Justificación de la periodización"
          text={macrocycle.periodizationRationale}
        />
        <PrintBox
          title="Distribución global de la carga"
          text={macrocycle.annualLoadSummary}
        />
        <PrintBox
          title="Competencia principal"
          text={macrocycle.mainCompetitionGuidance}
        />
        <table>
          <thead>
            <tr>
              <th>Periodo</th>
              <th>Semanas</th>
              <th>Enfoque</th>
              <th>Intensidad</th>
              <th>Carga</th>
              <th>Sesiones</th>
            </tr>
          </thead>
          <tbody>
            {macrocycle.periods.map((period) => (
              <tr key={period.periodNumber}>
                <td>{MACROCYCLE_PERIOD_LABELS[period.type]}</td>
                <td>
                  {formatMacrocycleWeekRange(
                    period.weekStart,
                    period.weekEnd,
                  )}
                </td>
                <td>{MACROCYCLE_FOCUS_LABELS[period.focus]}</td>
                <td>{MACROCYCLE_INTENSITY_LABELS[period.intensity]}</td>
                <td>{period.loadLevel}/5</td>
                <td>{period.sessionCount}</td>
              </tr>
            ))}
          </tbody>
        </table>
        <PrintFooter />
      </article>

      {macrocycle.periods.map((period) => (
        <article key={period.periodNumber} className="macro-print-page">
          <PrintHeader
            title={`${MACROCYCLE_PERIOD_LABELS[period.type]} · ${period.title}`}
          />
          <div className="macro-print-meta">
            <strong>
              {formatMacrocycleWeekLabel(
                period.weekStart,
                period.weekEnd,
              )}
            </strong>
            <strong>{MACROCYCLE_FOCUS_LABELS[period.focus]}</strong>
            <strong>{MACROCYCLE_INTENSITY_LABELS[period.intensity]}</strong>
            <strong>Carga {period.loadLevel}/5</strong>
            <strong>{period.sessionCount} sesiones</strong>
            <strong>{period.totalMinutes} minutos</strong>
          </div>
          <PrintBox title="Objetivo" text={period.objective} />
          <PrintBox title="Organización" text={period.organization} />
          <PrintList title="Contenidos clave" items={period.keyContents} />
          <div className="macro-print-grid">
            <PrintBox title="Progresión" text={period.progression} />
            <PrintBox title="Recuperación" text={period.recovery} />
            <PrintBox title="Control" text={period.monitoring} />
            <PrintBox title="Seguridad" text={period.safety} />
          </div>
          <PrintFooter />
        </article>
      ))}

      <article className="macro-print-page">
        <PrintHeader title="Evaluación, seguridad y adaptación" />
        <PrintList
          title="Criterios observables"
          items={macrocycle.evaluationCriteria}
        />
        <PrintList
          title="Medidas de seguridad"
          items={macrocycle.safetyMeasures}
        />
        <PrintList
          title="Opciones de adaptación"
          items={macrocycle.adaptationNotes}
        />
        <PrintFooter />
      </article>
    </div>
  );
}

function PrintHeader({ title }: { title: string }) {
  return (
    <header className="macro-print-header">
      <div>
        <Image
          src="/logos/logo-profe-en-movimiento.png"
          alt="Profe en Movimiento"
          width={54}
          height={54}
          priority
        />
        <p>
          PROFE EN MOVIMIENTO 5.0
          <br />
          <span>Entrenador IA · Macrociclo</span>
        </p>
      </div>
      <h1>{title}</h1>
    </header>
  );
}

function PrintFooter() {
  return (
    <footer>
      Profe en Movimiento 5.0 · Entrenador IA · Planificación responsable
    </footer>
  );
}

function PrintBox({ title, text }: { title: string; text: string }) {
  return (
    <section className="macro-print-box">
      <h2>{title}</h2>
      <p>{text}</p>
    </section>
  );
}

function PrintList({ title, items }: { title: string; items: string[] }) {
  return (
    <section className="macro-print-box">
      <h2>{title}</h2>
      <ul>
        {items.map((item) => (
          <li key={item}>{item}</li>
        ))}
      </ul>
    </section>
  );
}
