export type ExamQuestionType = "multiple_choice" | "structured_base" | "metacognition";

export interface ExamOption {
  id: string;
  text: string;
}

export interface StoredExamQuestion {
  id: string;
  type: ExamQuestionType;
  context: string;
  prompt: string;
  options: ExamOption[];
  correctOptionId: string;
  explanation: string;
}

export interface PublicExamQuestion {
  id: string;
  type: ExamQuestionType;
  context: string;
  prompt: string;
  options: ExamOption[];
}

export interface ExamFeedback {
  questionId: string;
  prompt: string;
  selectedOptionId: string | null;
  selectedAnswer: string;
  correctOptionId: string;
  correctAnswer: string;
  explanation: string;
  isCorrect: boolean;
}
