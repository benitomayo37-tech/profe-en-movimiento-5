export interface AcademyProgress {
  completedLessons: string[];
  quizScore: number | null;
  certificateEarnedAt: string | null;
  updatedAt: string | null;
}

export const emptyAcademyProgress: AcademyProgress = {
  completedLessons: [],
  quizScore: null,
  certificateEarnedAt: null,
  updatedAt: null,
};
