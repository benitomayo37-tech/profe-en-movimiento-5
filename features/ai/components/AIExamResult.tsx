import type {
  AIExamData,
  AIExamQuestion,
  AIExamQuestionType,
} from "@/features/ai/types/ai";

interface AIExamResultProps {
  exam: AIExamData;
}

const examTypeLabels: Record<
  AIExamData["examType"],
  string
> = {
  theoretical: "Teórico",
  practical: "Práctico",
  mixed: "Mixto",
};

const difficultyLabels: Record<
  AIExamData["difficulty"],
  string
> = {
  basic: "Básica",
  intermediate: "Intermedia",
  advanced: "Avanzada",
};

const questionTypeLabels: Record<
  AIExamQuestionType,
  string
> = {
  "multiple-choice": "Selección múltiple",
  "true-false": "Verdadero o falso",
  matching: "Relación de columnas",
  "fill-in-the-blank": "Completar espacios",
  "short-answer": "Respuesta corta",
  "applied-case": "Caso de aplicación",
  "practical-task": "Tarea práctica",
};

function formatGrade(
  value: number,
): string {
  return value
    .toFixed(2)
    .replace(/\.00$/, "")
    .replace(/(\.\d)0$/, "$1");
}

function cleanQuestionPrompt(
  question: AIExamQuestion,
): string {
  return question.prompt
    .replace(
      /^\s*\d+\s*[.)-]\s*/,
      "",
    )
    .replace(
      /^\s*\(\s*\d+\s*puntos?\s*\)\s*/i,
      "",
    )
    .trim();
}

function needsAnswerLines(
  question: AIExamQuestion,
): boolean {
  return [
    "matching",
    "fill-in-the-blank",
    "short-answer",
    "applied-case",
  ].includes(question.type);
}

function ExamQuestion({
  question,
}: {
  question: AIExamQuestion;
}) {
  return (
    <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-wrap items-center gap-2">
          <span className="inline-flex h-8 min-w-8 items-center justify-center rounded-full bg-blue-600 px-2 text-sm font-black text-white">
            {question.number}
          </span>

          <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-bold text-slate-700">
            {questionTypeLabels[
              question.type
            ]}
          </span>
        </div>

        <span className="text-sm font-black text-orange-600">
          {question.score}{" "}
          {question.score === 1
            ? "punto"
            : "puntos"}
        </span>
      </div>

      <p className="mt-4 whitespace-pre-line text-sm font-semibold leading-7 text-slate-900">
                {cleanQuestionPrompt(
          question,
        )}
      </p>

      {Array.isArray(question.options) &&
      question.options.length > 0 ? (
        <ul className="mt-4 grid gap-3">
          {question.options.map(
            (option, optionIndex) => (
              <li
                key={`${question.number}-${option.label}-${optionIndex}`}
                className="flex items-start gap-3 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm leading-6 text-slate-700"
              >
                <span className="font-black text-blue-700">
                  {option.label}.
                </span>

                <span>{option.text}</span>
              </li>
            ),
          )}
        </ul>
      ) : null}

      {question.type ===
      "true-false" ? (
        <div className="mt-4 flex flex-wrap gap-5 text-sm font-bold text-slate-700">
          <span>□ Verdadero</span>
          <span>□ Falso</span>
        </div>
      ) : null}

      {needsAnswerLines(question) ? (
        <div
          aria-label="Espacio para responder"
          className="mt-5 space-y-5"
        >
          <div className="border-b border-slate-300" />
          <div className="border-b border-slate-300" />
          <div className="border-b border-slate-300" />
        </div>
      ) : null}

            {question.type ===
        "practical-task" &&
      Array.isArray(
        question.evaluationCriteria,
      ) &&
      question.evaluationCriteria.length >
        0 ? (
        <div className="mt-5 rounded-xl border border-amber-200 bg-amber-50 p-4">
          <p className="text-xs font-black uppercase tracking-[0.14em] text-amber-800">
            Criterios de evaluación
          </p>

          <ul className="mt-3 space-y-2">
            {question.evaluationCriteria.map(
              (criterion, index) => (
                <li
                  key={`${criterion}-${index}`}
                  className="flex gap-2 text-sm leading-6 text-slate-700"
                >
                  <span
                    className="font-black text-amber-600"
                    aria-hidden="true"
                  >
                    •
                  </span>

                  <span>{criterion}</span>
                </li>
              ),
            )}
          </ul>
        </div>
      ) : null}
    </article>
  );
}

export default function AIExamResult({
  exam,
}: AIExamResultProps) {
  return (
    <section className="mt-8 space-y-7">
      <header className="overflow-hidden rounded-2xl border border-orange-200 bg-gradient-to-r from-orange-50 to-amber-50 p-6">
        <p className="text-xs font-black uppercase tracking-[0.18em] text-orange-600">
          Examen estructurado
        </p>

        <h3 className="mt-2 text-2xl font-black text-slate-950">
          {exam.title}
        </h3>

        <div className="mt-4 flex flex-wrap gap-3">
          <span className="rounded-full bg-white px-3 py-1.5 text-xs font-bold text-slate-700 shadow-sm">
            Tipo:{" "}
            {examTypeLabels[exam.examType]}
          </span>

          <span className="rounded-full bg-white px-3 py-1.5 text-xs font-bold text-slate-700 shadow-sm">
            Dificultad:{" "}
            {
              difficultyLabels[
                exam.difficulty
              ]
            }
          </span>

          <span className="rounded-full bg-white px-3 py-1.5 text-xs font-bold text-slate-700 shadow-sm">
            Puntaje: {exam.totalScore}
          </span>
        </div>
      </header>

      <div className="rounded-2xl border border-slate-200 bg-white p-5">
        <div className="grid gap-3 rounded-xl bg-slate-50 p-4 text-sm font-bold text-slate-800 md:grid-cols-3">
          <span>
            Nombre: ____________________
          </span>

          <span>
            Curso: ____________________
          </span>

          <span>
            Fecha: ____________________
          </span>
        </div>

        <h4 className="mt-5 font-black text-slate-950">
          Instrucciones generales
        </h4>

        <ul className="mt-3 space-y-2">
          {exam.generalInstructions.map(
            (instruction, index) => (
              <li
                key={`${instruction}-${index}`}
                className="flex gap-3 text-sm leading-6 text-slate-700"
              >
                <span
                  className="font-black text-orange-500"
                  aria-hidden="true"
                >
                  •
                </span>

                <span>{instruction}</span>
              </li>
            ),
          )}
        </ul>
      </div>

      {exam.versions.map((version) => (
        <section
          key={version.label}
          className="rounded-3xl border border-blue-200 bg-blue-50/30 p-5 sm:p-6"
        >
          <div className="flex flex-col gap-2 border-b border-blue-200 pb-4 sm:flex-row sm:items-center sm:justify-between">
            <h4 className="text-xl font-black text-slate-950">
              Versión {version.label}
            </h4>

            <span className="text-sm font-bold text-blue-700">
              {version.questions.length}{" "}
              preguntas · {exam.totalScore}{" "}
              puntos
            </span>
          </div>

          <div className="mt-5 grid gap-5">
            {version.questions.map(
              (question) => (
                <ExamQuestion
                  key={`${version.label}-${question.number}`}
                  question={question}
                />
              ),
            )}
          </div>
        </section>
      ))}

      {Array.isArray(exam.answerKey) &&
      exam.answerKey.length > 0 ? (
        <section className="rounded-3xl border border-emerald-200 bg-emerald-50/40 p-5 sm:p-6">
          <p className="text-xs font-black uppercase tracking-[0.18em] text-emerald-700">
            Material para el docente
          </p>

          <h4 className="mt-2 text-xl font-black text-slate-950">
            Solucionario
          </h4>

          <div className="mt-5 overflow-x-auto rounded-xl border border-emerald-200 bg-white">
            <table className="min-w-[700px] w-full border-collapse text-sm">
              <thead className="bg-emerald-100 text-slate-950">
                <tr>
                  <th className="border-b border-r border-emerald-200 px-4 py-3 text-left">
                    Versión
                  </th>

                  <th className="border-b border-r border-emerald-200 px-4 py-3 text-left">
                    Pregunta
                  </th>

                  <th className="border-b border-r border-emerald-200 px-4 py-3 text-left">
                    Respuesta
                  </th>

                  <th className="border-b border-emerald-200 px-4 py-3 text-left">
                    Orientación
                  </th>
                </tr>
              </thead>

              <tbody>
                {exam.answerKey.map(
                  (answer, index) => (
                    <tr
                      key={`${answer.version}-${answer.questionNumber}-${index}`}
                      className="align-top even:bg-emerald-50/40"
                    >
                      <td className="border-b border-r border-emerald-100 px-4 py-3 font-black">
                        {answer.version}
                      </td>

                      <td className="border-b border-r border-emerald-100 px-4 py-3">
                        {answer.questionNumber}
                      </td>

                      <td className="border-b border-r border-emerald-100 px-4 py-3 font-semibold">
                        {answer.answer}
                      </td>

                      <td className="border-b border-emerald-100 px-4 py-3 text-slate-600">
                        {answer.explanation ??
                          "—"}
                      </td>
                    </tr>
                  ),
                )}
              </tbody>
            </table>
          </div>
        </section>
      ) : null}

      {Array.isArray(
        exam.gradingTable,
      ) &&
      exam.gradingTable.length > 0 ? (
        <section className="rounded-3xl border border-blue-200 bg-blue-50/40 p-5 sm:p-6">
          <h4 className="text-xl font-black text-slate-950">
            Tabla de calificación
          </h4>

          <div className="mt-5 overflow-x-auto rounded-xl border border-blue-200 bg-white">
            <table className="w-full min-w-[420px] border-collapse text-sm">
              <thead className="bg-blue-100">
                <tr>
                  <th className="border-b border-r border-blue-200 px-4 py-3 text-left">
                    Puntaje obtenido
                  </th>

                  <th className="border-b border-blue-200 px-4 py-3 text-left">
                    Calificación sobre 10
                  </th>
                </tr>
              </thead>

              <tbody>
                {exam.gradingTable.map(
                  (row) => (
                    <tr
                      key={row.earnedScore}
                      className="even:bg-blue-50/40"
                    >
                      <td className="border-b border-r border-blue-100 px-4 py-2.5 font-bold">
                        {row.earnedScore}
                      </td>

                      <td className="border-b border-blue-100 px-4 py-2.5">
                        {formatGrade(
                          row.finalGrade,
                        )}
                      </td>
                    </tr>
                  ),
                )}
              </tbody>
            </table>
          </div>
        </section>
      ) : null}

      {exam.ruleOfThreeFormula ? (
        <section className="rounded-2xl border border-purple-200 bg-purple-50 p-5">
          <p className="text-xs font-black uppercase tracking-[0.16em] text-purple-700">
            Regla de tres
          </p>

          <p className="mt-3 font-bold leading-7 text-slate-800">
            {exam.ruleOfThreeFormula}
          </p>
        </section>
      ) : null}
    </section>
  );
}