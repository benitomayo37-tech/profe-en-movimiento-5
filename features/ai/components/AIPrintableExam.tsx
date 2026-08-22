import type {
  AIExamData,
  AIExamQuestion,
  AIExamQuestionType,
} from "@/features/ai/types/ai";
import type { PrintableExamPage } from "@/features/ai/utils/paginatePrintableExam";

interface AIPrintableExamProps {
  exam: AIExamData;
  pages: PrintableExamPage[];
  startingPageNumber: number;
  totalPages: number;
}

const questionTypeLabels: Record<AIExamQuestionType, string> = {
  "multiple-choice": "Selección múltiple",
  "true-false": "Verdadero o falso",
  matching: "Relación de columnas",
  "fill-in-the-blank": "Completar espacios",
  "short-answer": "Respuesta corta",
  "applied-case": "Caso de aplicación",
  "practical-task": "Tarea práctica",
};

function formatGrade(value: number): string {
  return value
    .toFixed(2)
    .replace(/\.00$/, "")
    .replace(/(\.\d)0$/, "$1");
}

function cleanQuestionPrompt(question: AIExamQuestion): string {
  return question.prompt
    .replace(/^\s*\d+\s*[.)-]\s*/, "")
    .replace(/^\s*\(\s*\d+\s*puntos?\s*\)\s*/i, "")
    .trim();
}

function PrintableBrand() {
  return (
    <div className="ai-print-brand-row">
      {/* La impresión en una ventana aislada requiere una etiqueta img estándar. */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src="/logos/logo-profe-en-movimiento.png"
        alt="Profe en Movimiento"
        width={48}
        height={48}
        loading="eager"
        decoding="sync"
        className="ai-print-logo"
      />

      <div>
        <p className="ai-print-brand">PROFE EN MOVIMIENTO 5.0</p>

        <p className="ai-print-brand-secondary">
          PROFE IA - ASISTENTE INTELIGENTE PARA DOCENTES
        </p>
      </div>
    </div>
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
    <footer className="ai-print-footer">
      <span>Profe en Movimiento 5.0 - Proyecto FARO - Profe IA</span>

      <span>
        Página {pageNumber} de {totalPages}
      </span>
    </footer>
  );
}

function PrintableQuestion({ question }: { question: AIExamQuestion }) {
  const needsAnswerLines = [
    "matching",
    "fill-in-the-blank",
    "short-answer",
    "applied-case",
  ].includes(question.type);

  return (
    <section className="ai-print-exam-question">
      <div className="ai-print-exam-question-heading">
        <span>
          Pregunta {question.number} - {questionTypeLabels[question.type]}
        </span>

        <strong>
          {question.score} {question.score === 1 ? "punto" : "puntos"}
        </strong>
      </div>

      <p className="ai-print-exam-prompt">{cleanQuestionPrompt(question)}</p>

      {Array.isArray(question.options) && question.options.length > 0 ? (
        <ul className="ai-print-exam-options">
          {question.options.map((option, index) => (
            <li key={`${question.number}-${option.label}-${index}`}>
              <span className="ai-print-exam-option-box">□</span>
              <strong>{option.label}.</strong> {option.text}
            </li>
          ))}
        </ul>
      ) : null}

      {question.type === "true-false" ? (
        <p className="ai-print-exam-true-false">
          □ Verdadero &nbsp;&nbsp;&nbsp;&nbsp; □ Falso
        </p>
      ) : null}

      {needsAnswerLines ? (
        <div className="ai-print-exam-answer-lines">
          <div />
          <div />
          <div />
        </div>
      ) : null}

      {question.type === "practical-task" &&
      Array.isArray(question.evaluationCriteria) &&
      question.evaluationCriteria.length > 0 ? (
        <div className="ai-print-exam-criteria">
          <strong>Criterios de evaluación:</strong>

          <ul>
            {question.evaluationCriteria.map((criterion, index) => (
              <li key={`${criterion}-${index}`}>{criterion}</li>
            ))}
          </ul>
        </div>
      ) : null}
    </section>
  );
}

export default function AIPrintableExam({
  exam,
  pages,
  startingPageNumber,
  totalPages,
}: AIPrintableExamProps) {
  return (
    <>
      {pages.map((page, index) => {
        const pageNumber = startingPageNumber + index;

        if (page.kind === "version") {
          return (
            <article
              key={`exam-version-${page.versionLabel}-${index}`}
              className="ai-print-page ai-print-exam-page"
            >
              <header className="ai-print-header">
                <PrintableBrand />

                <h1>{exam.title}</h1>

                <div className="ai-print-exam-meta">
                  <span>Versión {page.versionLabel}</span>

                  <span>Puntaje total: {exam.totalScore}</span>

                  {page.continuation ? <span>Continuación</span> : null}
                </div>
              </header>

              {page.showInstructions ? (
                <>
                  <div className="ai-print-exam-identification">
                    <span>Nombre: ____________________</span>

                    <span>Curso: ____________________</span>

                    <span>Fecha: ____________________</span>
                  </div>

                  <div className="ai-print-exam-instructions">
                    <strong>Instrucciones generales</strong>

                    <ul>
                      {exam.generalInstructions.map(
                        (instruction, instructionIndex) => (
                          <li key={`${instruction}-${instructionIndex}`}>
                            {instruction}
                          </li>
                        ),
                      )}
                    </ul>
                  </div>
                </>
              ) : null}

              <div className="ai-print-exam-questions">
                {page.questions.map((question) => (
                  <PrintableQuestion
                    key={`${page.versionLabel}-${question.number}`}
                    question={question}
                  />
                ))}
              </div>

              <PrintableFooter
                pageNumber={pageNumber}
                totalPages={totalPages}
              />
            </article>
          );
        }

        if (page.kind === "answers" || page.kind === "answers-grading") {
          const isCombinedPage = page.kind === "answers-grading";

          return (
            <article
              key={`exam-answers-${index}`}
              className="ai-print-page ai-print-exam-page"
            >
              <header className="ai-print-header">
                <PrintableBrand />

                <h1>
                  {isCombinedPage
                    ? "Solucionario y tabla de calificación"
                    : "Solucionario"}
                  {!isCombinedPage && page.continuation
                    ? " - continuación"
                    : ""}
                </h1>

                <p className="ai-print-introduction">
                  {exam.title} - Material para uso docente.
                </p>
              </header>

              <table className="ai-print-exam-answer-table">
                <thead>
                  <tr>
                    <th>Versión</th>
                    <th>Pregunta</th>
                    <th>Respuesta</th>
                    <th>Orientación</th>
                  </tr>
                </thead>

                <tbody>
                  {page.answers.map((answer, answerIndex) => (
                    <tr
                      key={`${answer.version}-${answer.questionNumber}-${answerIndex}`}
                    >
                      <td>{answer.version}</td>

                      <td>{answer.questionNumber}</td>

                      <td>{answer.answer}</td>

                      <td>{answer.explanation ?? "-"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {page.kind === "answers-grading" ? (
                <section className="mt-5">
                  <h2 className="mb-3 text-lg font-black text-slate-950">
                    Tabla de calificación
                  </h2>

                  {page.showFormula && exam.ruleOfThreeFormula ? (
                    <div className="ai-print-exam-formula">
                      <strong>Regla de tres:</strong> {exam.ruleOfThreeFormula}
                    </div>
                  ) : null}

                  <table className="ai-print-exam-grade-table">
                    <thead>
                      <tr>
                        <th>Puntaje obtenido</th>

                        <th>Calificación sobre 10</th>
                      </tr>
                    </thead>

                    <tbody>
                      {page.rows.map((row) => (
                        <tr key={row.earnedScore}>
                          <td>{row.earnedScore}</td>

                          <td>{formatGrade(row.finalGrade)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </section>
              ) : null}

              <PrintableFooter
                pageNumber={pageNumber}
                totalPages={totalPages}
              />
            </article>
          );
        }

        return (
          <article
            key={`exam-grading-${index}`}
            className="ai-print-page ai-print-exam-page"
          >
            <header className="ai-print-header">
              <PrintableBrand />

              <h1>
                Tabla de calificación
                {page.continuation ? " - continuación" : ""}
              </h1>

              <p className="ai-print-introduction">{exam.title}</p>
            </header>

            {page.showFormula && exam.ruleOfThreeFormula ? (
              <div className="ai-print-exam-formula">
                <strong>Regla de tres:</strong> {exam.ruleOfThreeFormula}
              </div>
            ) : null}

            <table className="ai-print-exam-grade-table">
              <thead>
                <tr>
                  <th>Puntaje obtenido</th>

                  <th>Calificación sobre 10</th>
                </tr>
              </thead>

              <tbody>
                {page.rows.map((row) => (
                  <tr key={row.earnedScore}>
                    <td>{row.earnedScore}</td>

                    <td>{formatGrade(row.finalGrade)}</td>
                  </tr>
                ))}
              </tbody>
            </table>

            <PrintableFooter pageNumber={pageNumber} totalPages={totalPages} />
          </article>
        );
      })}
    </>
  );
}
