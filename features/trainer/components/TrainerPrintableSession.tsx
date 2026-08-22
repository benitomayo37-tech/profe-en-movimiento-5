import Image from "next/image";

import type {
  GeneratedTrainingSession,
} from "@/features/trainer/types/trainer";

interface TrainerPrintableSessionProps {
  session: GeneratedTrainingSession;
}

function formatSegmentDuration(
  seconds: number,
): string {
  if (seconds < 60) {
    return `${seconds} s`;
  }
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;

  return remainingSeconds === 0
    ? `${minutes} min`
    : `${minutes} min ${remainingSeconds} s`;
}

function PrintableBrand({
  continuation,
}: {
  continuation?: boolean;
}) {
  return (
    <header className="trainer-print-header">
      <div className="trainer-print-brand-row">
               <Image
          src="/logos/logo-profe-en-movimiento.png"
          alt="Profe en Movimiento"
          width={56}
          height={56}
          priority
          className="trainer-print-logo"
        />

        <div>
          <p className="trainer-print-brand">
            PROFE EN MOVIMIENTO 5.0
          </p>
          <p className="trainer-print-brand-secondary">
            Entrenador IA · Planificación inteligente del entrenamiento deportivo
          </p>
        </div>
      </div>

      {continuation && (
        <p className="trainer-print-continuation">
          Sesión de entrenamiento · Continuación
        </p>
      )}
    </header>
  );
}

function PrintableFooter({
  pageNumber,
  totalPages,
}: {
  pageNumber: number;
  totalPages: number;
}) {
  return (
    <footer className="trainer-print-footer">
      <span>Profe en Movimiento 5.0 · Entrenador IA · Proyecto FARO</span>
      <span>
        Página {pageNumber} de {totalPages}
      </span>
    </footer>
  );
}

export default function TrainerPrintableSession({
  session,
}: TrainerPrintableSessionProps) {
  const totalPages = session.blocks.length + 1;

  return (
    <div
      id="trainer-printable-session"
      className="hidden"
      aria-hidden="true"
    >
      <article className="trainer-print-page trainer-print-cover">
        <PrintableBrand />

        <main className="trainer-print-main">
          <p className="trainer-print-kicker">
            PLANIFICACIÓN COMPLETADA · {session.totalMinutes} MINUTOS
          </p>

          <h1>{session.title}</h1>

          <p className="trainer-print-summary">
            {session.summary}
          </p>

          <section className="trainer-print-objective">
            <h2>Objetivo principal</h2>
            <p>{session.objective}</p>
          </section>

          <section className="trainer-print-load">
            <h2>Orientación de la carga</h2>
            <p>{session.loadGuidance}</p>
          </section>

          <section>
            <h2 className="trainer-print-section-title">
              Distribución de la sesión
            </h2>

            <table className="trainer-print-overview-table">
              <thead>
                <tr>
                  <th>Bloque</th>
                  <th>Propósito</th>
                  <th>Intensidad</th>
                  <th>Tiempo</th>
                </tr>
              </thead>
              <tbody>
                {session.blocks.map((block, index) => (
                  <tr key={`${block.name}-${index}`}>
                    <td>
                      <strong>{index + 1}. {block.name}</strong>
                    </td>
                    <td>{block.objective}</td>
                    <td>{block.intensity}</td>
                    <td>{block.minutes} min</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </section>

          <div className="trainer-print-summary-grid">
            <section className="trainer-print-summary-card trainer-print-summary-card-blue">
              <h2>Evaluación observable</h2>
              <ul>
                {session.evaluationCriteria.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </section>

            <section className="trainer-print-summary-card trainer-print-summary-card-amber">
              <h2>Medidas de seguridad</h2>
              <ul>
                {session.safetyMeasures.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </section>

            <section className="trainer-print-summary-card trainer-print-summary-card-emerald">
              <h2>Opciones de adaptación</h2>
              <ul>
                {session.adaptationNotes.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </section>
          </div>
        </main>

        <PrintableFooter
          pageNumber={1}
          totalPages={totalPages}
        />
      </article>

      {session.blocks.map((block, blockIndex) => (
        <article
          key={`${block.name}-${blockIndex}`}
          className="trainer-print-page trainer-print-block-page"
        >
          <PrintableBrand continuation />

          <main className="trainer-print-main">
            <div className="trainer-print-block-heading">
              <div>
                <p className="trainer-print-kicker">
                  BLOQUE {blockIndex + 1}
                </p>
                <h1>{block.name}</h1>
              </div>

              <span className="trainer-print-time-badge">
                {block.minutes} min
              </span>
            </div>

            <div className="trainer-print-block-meta">
              <section>
                <h2>Objetivo</h2>
                <p>{block.objective}</p>
              </section>
              <section>
                <h2>Intensidad</h2>
                <p>{block.intensity}</p>
              </section>
              <section className="trainer-print-meta-wide">
                <h2>Organización</h2>
                <p>{block.organization}</p>
              </section>
            </div>

            <div className="trainer-print-content-grid">
              <section>
                <h2 className="trainer-print-section-title">
                  Actividades y segmentos
                </h2>

                <div className="trainer-print-activities">
                  {block.activities.map((activity) => (
                    <article
                      key={`${activity.name}-${activity.minutes}`}
                      className="trainer-print-activity"
                    >
                      <div className="trainer-print-activity-heading">
                        <h3>{activity.name}</h3>
                        <span>{activity.minutes} min</span>
                      </div>

                      <p>{activity.description}</p>

                      <ol className="trainer-print-segments">
                        {activity.segments.map(
                          (segment, segmentIndex) => (
                            <li
                              key={`${segment.name}-${segmentIndex}`}
                            >
                              <span className="trainer-print-segment-time">
                                {formatSegmentDuration(segment.seconds)}
                              </span>
                              <strong>{segment.name}:</strong>{" "}
                              {segment.description}
                            </li>
                          ),
                        )}
                      </ol>
                    </article>
                  ))}
                </div>
              </section>

              <aside>
                <section className="trainer-print-coaching">
                  <h2>Consignas del entrenador</h2>
                  <ul>
                    {block.coachingPoints.map((point) => (
                      <li key={point}>{point}</li>
                    ))}
                  </ul>
                </section>

                <section className="trainer-print-recovery">
                  <h2>Recuperación</h2>
                  <p>{block.recovery}</p>
                </section>

                <section className="trainer-print-safety">
                  <h2>Seguridad</h2>
                  <p>{block.safety}</p>
                </section>
              </aside>
            </div>
          </main>

          <PrintableFooter
            pageNumber={blockIndex + 2}
            totalPages={totalPages}
          />
        </article>
      ))}
    </div>
  );
}

