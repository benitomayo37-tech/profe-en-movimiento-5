import Image from "next/image";

import type { GeneratedMicrocycle } from "@/features/trainer/types/trainer";
import {
  DAY_LABELS,
  FOCUS_LABELS,
  INTENSITY_LABELS,
} from "@/features/trainer/utils/microcycleLabels";

interface MicrocyclePrintableProps {
  microcycle: GeneratedMicrocycle;
}

function PrintHeader({ continuation }: { continuation?: boolean }) {
  return (
    <header className="micro-print-header">
      <div className="micro-print-brand-row">
        <Image
          src="/logos/logo-profe-en-movimiento.png"
          alt="Profe en Movimiento"
          width={56}
          height={56}
          priority
          className="micro-print-logo"
        />
        <div>
          <p className="micro-print-brand">PROFE EN MOVIMIENTO 5.0</p>
          <p className="micro-print-brand-secondary">
            Entrenador IA · Planificación inteligente del entrenamiento deportivo
          </p>
        </div>
      </div>
      {continuation ? (
        <p className="micro-print-continuation">Microciclo · Continuación</p>
      ) : null}
    </header>
  );
}

function PrintFooter({ page, total }: { page: number; total: number }) {
  return (
    <footer className="micro-print-footer">
      <span>Profe en Movimiento 5.0 · Entrenador IA · Proyecto FARO</span>
      <span>Página {page} de {total}</span>
    </footer>
  );
}

export default function MicrocyclePrintable({
  microcycle,
}: MicrocyclePrintableProps) {
  const totalPages = microcycle.days.length + 1;

  return (
    <div id="microcycle-printable" className="hidden" aria-hidden="true">
      <article className="micro-print-page">
        <PrintHeader />
        <main className="micro-print-content">
          <p className="micro-print-kicker">
            MICROCICLO COMPLETADO · {microcycle.totalSessions} SESIONES · {microcycle.totalMinutes} MINUTOS
          </p>
          <h1>{microcycle.title}</h1>
          <p className="micro-print-summary">{microcycle.summary}</p>

          <section className="micro-print-box micro-print-box-green">
            <h2>Objetivo semanal</h2>
            <p>{microcycle.weeklyObjective}</p>
          </section>

          <div className="micro-print-two-columns">
            <section className="micro-print-box micro-print-box-blue">
              <h2>Orientación de la fase</h2>
              <p>{microcycle.phaseGuidance}</p>
            </section>
            <section className="micro-print-box micro-print-box-violet">
              <h2>Distribución de la carga</h2>
              <p>{microcycle.weeklyLoadSummary}</p>
            </section>
          </div>

          <section className="micro-print-section">
            <h2>Calendario del microciclo</h2>
            <table className="micro-print-table">
              <thead>
                <tr>
                  <th>Día</th>
                  <th>Sesión</th>
                  <th>Enfoque</th>
                  <th>Intensidad</th>
                  <th>Carga</th>
                  <th>Tiempo</th>
                </tr>
              </thead>
              <tbody>
                {microcycle.days.map((day) => (
                  <tr key={day.day}>
                    <td>{DAY_LABELS[day.day]}</td>
                    <td>{day.title}</td>
                    <td>{FOCUS_LABELS[day.focus]}</td>
                    <td>{INTENSITY_LABELS[day.intensity]}</td>
                    <td>{day.loadLevel}/5</td>
                    <td>{day.minutes} min</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </section>

          <div className="micro-print-three-columns">
            <PrintList title="Evaluación observable" items={microcycle.evaluationCriteria} color="blue" />
            <PrintList title="Seguridad" items={microcycle.safetyMeasures} color="amber" />
            <PrintList title="Adaptaciones" items={microcycle.adaptationNotes} color="green" />
          </div>
        </main>
        <PrintFooter page={1} total={totalPages} />
      </article>

      {microcycle.days.map((day, index) => (
        <article key={day.day} className="micro-print-page">
          <PrintHeader continuation />
          <main className="micro-print-content">
            <div className="micro-print-day-heading">
              <div>
                <p className="micro-print-kicker">SESIÓN {day.sessionNumber} · {DAY_LABELS[day.day].toUpperCase()}</p>
                <h1>{day.title}</h1>
              </div>
              <span className="micro-print-duration">{day.minutes} min</span>
            </div>

            <div className="micro-print-day-meta">
              <section>
                <h2>Objetivo</h2>
                <p>{day.objective}</p>
              </section>
              <section>
                <h2>Enfoque e intensidad</h2>
                <p>{FOCUS_LABELS[day.focus]} · {INTENSITY_LABELS[day.intensity]} · Carga {day.loadLevel}/5</p>
              </section>
            </div>

            <section className="micro-print-box">
              <h2>Organización</h2>
              <p>{day.organization}</p>
            </section>

            <section className="micro-print-section">
              <h2>Desarrollo de la sesión</h2>
              <div className="micro-print-segments">
                {day.segments.map((segment) => (
                  <article key={segment.name}>
                    <div className="micro-print-segment-title">
                      <h3>{segment.name}</h3>
                      <strong>{segment.minutes} min</strong>
                    </div>
                    <p className="micro-print-segment-objective">{segment.objective}</p>
                    <p>{segment.content}</p>
                  </article>
                ))}
              </div>
            </section>

            <div className="micro-print-detail-grid">
              <PrintList title="Consignas del entrenador" items={day.coachingPoints} color="blue" />
              <section className="micro-print-box micro-print-box-green">
                <h2>Recuperación</h2>
                <p>{day.recovery}</p>
              </section>
              <section className="micro-print-box micro-print-box-violet">
                <h2>Control y seguimiento</h2>
                <p>{day.monitoring}</p>
              </section>
              <section className="micro-print-box micro-print-box-amber">
                <h2>Seguridad</h2>
                <p>{day.safety}</p>
              </section>
            </div>
          </main>
          <PrintFooter page={index + 2} total={totalPages} />
        </article>
      ))}
    </div>
  );
}

function PrintList({
  title,
  items,
  color,
}: {
  title: string;
  items: string[];
  color: "blue" | "amber" | "green";
}) {
  return (
    <section className={`micro-print-box micro-print-box-${color}`}>
      <h2>{title}</h2>
      <ul>
        {items.map((item) => (
          <li key={item}>{item}</li>
        ))}
      </ul>
    </section>
  );
}
