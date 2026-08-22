import "server-only";

import type { ExamQuestionType, PublicExamQuestion, StoredExamQuestion } from "@/features/student-exams/types";

const expectedTypes: ExamQuestionType[] = ["multiple_choice", "structured_base", "metacognition"];

function nonEmpty(value: unknown, minimum = 1) {
  return typeof value === "string" && value.trim().length >= minimum;
}

export function isQuestionBank(value: unknown): value is StoredExamQuestion[] {
  if (!Array.isArray(value) || value.length !== 15) return false;
  const counts: Record<ExamQuestionType, number> = { multiple_choice: 0, structured_base: 0, metacognition: 0 };

  for (const item of value) {
    if (!item || typeof item !== "object") return false;
    const question = item as Partial<StoredExamQuestion>;
    if (!question.type || !expectedTypes.includes(question.type)) return false;
    if (!nonEmpty(question.id) || !nonEmpty(question.prompt, 8) || !nonEmpty(question.explanation, 8)) return false;
    if (!Array.isArray(question.options) || question.options.length !== 4) return false;
    if (!question.options.every((option) => nonEmpty(option?.id) && nonEmpty(option?.text, 1))) return false;
    const optionIds = new Set(question.options.map((option) => option.id));
    if (optionIds.size !== 4 || !question.correctOptionId || !optionIds.has(question.correctOptionId)) return false;
    counts[question.type] += 1;
  }

  return counts.multiple_choice === 9 && counts.structured_base === 3 && counts.metacognition === 3;
}

export function shuffle<T>(items: T[]): T[] {
  const copy = [...items];
  for (let index = copy.length - 1; index > 0; index -= 1) {
    const target = Math.floor(Math.random() * (index + 1));
    [copy[index], copy[target]] = [copy[target], copy[index]];
  }
  return copy;
}

export function buildExamVersion(bank: StoredExamQuestion[]): StoredExamQuestion[] {
  const choose = (type: ExamQuestionType, amount: number) => shuffle(bank.filter((question) => question.type === type)).slice(0, amount);
  return shuffle([
    ...choose("multiple_choice", 6),
    ...choose("structured_base", 2),
    ...choose("metacognition", 2),
  ]).map((question) => ({ ...question, options: shuffle(question.options) }));
}

export function toPublicQuestions(questions: StoredExamQuestion[]): PublicExamQuestion[] {
  return questions.map((question) => ({
    id: question.id,
    type: question.type,
    context: question.context,
    prompt: question.prompt,
    options: question.options,
  }));
}

export function cleanText(value: unknown, maximum: number) {
  return typeof value === "string" ? value.trim().replace(/\s+/g, " ").slice(0, maximum) : "";
}
