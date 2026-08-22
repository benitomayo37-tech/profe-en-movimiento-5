import Image from "next/image";

import type { GeneratedMesocycle } from "@/features/trainer/types/trainer";
import { MESOCYCLE_FOCUS_LABELS, MESOCYCLE_INTENSITY_LABELS } from "@/features/trainer/utils/mesocycleLabels";

export const MESOCYCLE_PRINT_ROOT_ID = "mesocycle-print-root";

export default function MesocyclePrintable({ mesocycle }: { mesocycle: GeneratedMesocycle }) {
  return (
    <div id={MESOCYCLE_PRINT_ROOT_ID} className="hidden">
      <article className="meso-print-page">
        <PrintHeader title={mesocycle.title} />
        <p className="meso-print-summary">{mesocycle.summary}</p>
        <div className="meso-print-meta"><strong>{mesocycle.totalWeeks} semanas</strong><strong>{mesocycle.totalSessions} sesiones</strong><strong>{mesocycle.totalMinutes} minutos</strong></div>
        <section className="meso-print-box"><h2>Objetivo principal</h2><p>{mesocycle.mainObjective}</p></section>
        <section className="meso-print-box"><h2>Orientación de la fase</h2><p>{mesocycle.phaseGuidance}</p></section>
        <section className="meso-print-box"><h2>Distribución general de la carga</h2><p>{mesocycle.overallLoadSummary}</p></section>
        <table><thead><tr><th>Semana</th><th>Enfoque</th><th>Intensidad</th><th>Carga</th><th>Minutos</th></tr></thead><tbody>{mesocycle.weeks.map((week) => <tr key={week.weekNumber}><td>{week.weekNumber}. {week.title}</td><td>{MESOCYCLE_FOCUS_LABELS[week.focus]}</td><td>{MESOCYCLE_INTENSITY_LABELS[week.intensity]}</td><td>{week.loadLevel}/5</td><td>{week.totalMinutes}</td></tr>)}</tbody></table>
        <PrintFooter />
      </article>

      {mesocycle.weeks.map((week) => (
        <article key={week.weekNumber} className="meso-print-page">
          <PrintHeader title={`Semana ${week.weekNumber} · ${week.title}`} />
          <div className="meso-print-meta"><strong>{MESOCYCLE_FOCUS_LABELS[week.focus]}</strong><strong>{MESOCYCLE_INTENSITY_LABELS[week.intensity]}</strong><strong>Carga {week.loadLevel}/5</strong><strong>{week.sessionCount} sesiones de {week.sessionDurationMinutes} min</strong></div>
          <section className="meso-print-box"><h2>Objetivo</h2><p>{week.objective}</p></section>
          <section className="meso-print-box"><h2>Organización</h2><p>{week.organization}</p></section>
          <section className="meso-print-box"><h2>Contenidos clave</h2><ul>{week.keyContents.map((content) => <li key={content}>{content}</li>)}</ul></section>
          <div className="meso-print-grid"><section className="meso-print-box"><h2>Orientación de carga</h2><p>{week.loadGuidance}</p></section><section className="meso-print-box"><h2>Recuperación</h2><p>{week.recovery}</p></section><section className="meso-print-box"><h2>Control</h2><p>{week.monitoring}</p></section><section className="meso-print-box"><h2>Seguridad</h2><p>{week.safety}</p></section></div>
          <PrintFooter />
        </article>
      ))}

      <article className="meso-print-page">
        <PrintHeader title="Evaluación, seguridad y adaptación" />
        <PrintList title="Criterios observables" items={mesocycle.evaluationCriteria} />
        <PrintList title="Medidas de seguridad" items={mesocycle.safetyMeasures} />
        <PrintList title="Opciones de adaptación" items={mesocycle.adaptationNotes} />
        <PrintFooter />
      </article>
    </div>
  );
}

function PrintHeader({ title }: { title: string }) { return <header className="meso-print-header"><div><Image src="/logos/logo-profe-en-movimiento.png" alt="Profe en Movimiento" width={54} height={54} priority /><p>PROFE EN MOVIMIENTO 5.0<br /><span>Entrenador IA · Mesociclo</span></p></div><h1>{title}</h1></header>; }
function PrintFooter() { return <footer>Profe en Movimiento 5.0 · Entrenador IA · Planificación responsable</footer>; }
function PrintList({ title, items }: { title: string; items: string[] }) { return <section className="meso-print-box"><h2>{title}</h2><ul>{items.map((item) => <li key={item}>{item}</li>)}</ul></section>; }
