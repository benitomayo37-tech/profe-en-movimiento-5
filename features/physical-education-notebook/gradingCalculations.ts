import type {
  FormativeDimension,
  GradingActivity,
  GradingSettings,
  StudentGrade,
  StudentPeriodGradeSummary,
} from "./types";

type StudentReference = {
  id: string;
};

function truncateToTwo(value: number): number {
  return Math.trunc((value + Number.EPSILON) * 100) / 100;
}

function average(values: number[]): number | null {
  if (!values.length) {
    return null;
  }

  return truncateToTwo(
    values.reduce((total, value) => total + value, 0)
      / values.length,
  );
}

function normalizedScore(
  grade: StudentGrade | undefined,
  activity: GradingActivity,
): number | null {
  if (
    !grade
    || grade.status !== "graded"
    || grade.score === null
    || activity.maxScore <= 0
  ) {
    return null;
  }

  return truncateToTwo(
    (grade.score / activity.maxScore) * 10,
  );
}

export function calculateStudentPeriodSummaries(
  settings: GradingSettings,
  students: StudentReference[],
  activities: GradingActivity[],
  grades: StudentGrade[],
): StudentPeriodGradeSummary[] {
  const activeActivities = activities.filter(
    (activity) => activity.active,
  );

  const gradesByStudentAndActivity = new Map<
    string,
    StudentGrade
  >();

  for (const grade of grades) {
    gradesByStudentAndActivity.set(
      `${grade.studentId}:${grade.gradingActivityId}`,
      grade,
    );
  }

  const formativeByDimension = new Map<
    FormativeDimension,
    GradingActivity[]
  >([
    ["cognitive", []],
    ["affective_social", []],
    ["motor", []],
  ]);

  for (const activity of activeActivities) {
    if (
      activity.component === "formative"
      && activity.dimension !== null
    ) {
      formativeByDimension
        .get(activity.dimension)
        ?.push(activity);
    }
  }

  const projectActivity = activeActivities.find(
    (activity) =>
      activity.component === "interdisciplinary_project",
  );

  const examActivity = activeActivities.find(
    (activity) => activity.component === "exam",
  );

  return students.map((student) => {
    const dimensionAverage = (
      dimension: FormativeDimension,
    ) => {
      const scores = (
        formativeByDimension.get(dimension) ?? []
      )
        .map((activity) =>
          normalizedScore(
            gradesByStudentAndActivity.get(
              `${student.id}:${activity.id}`,
            ),
            activity,
          ),
        )
        .filter((score): score is number => score !== null);

      return average(scores);
    };

    const cognitiveAverage =
      dimensionAverage("cognitive");
    const affectiveSocialAverage =
      dimensionAverage("affective_social");
    const motorAverage = dimensionAverage("motor");

    const hasCompleteFormative =
      cognitiveAverage !== null
      && affectiveSocialAverage !== null
      && motorAverage !== null;

    const formativeAverage = hasCompleteFormative
      ? truncateToTwo(
          cognitiveAverage * settings.cognitiveWeight
          + affectiveSocialAverage
            * settings.affectiveSocialWeight
          + motorAverage * settings.motorWeight,
        )
      : null;

    const formativeContribution =
      formativeAverage === null
        ? null
        : truncateToTwo(
            formativeAverage * settings.formativeWeight,
          );

    const interdisciplinaryProjectScore = projectActivity
      ? normalizedScore(
          gradesByStudentAndActivity.get(
            `${student.id}:${projectActivity.id}`,
          ),
          projectActivity,
        )
      : null;

    const projectContribution =
      interdisciplinaryProjectScore === null
        ? null
        : truncateToTwo(
            interdisciplinaryProjectScore
              * settings.projectWeight,
          );

    const examScore = examActivity
      ? normalizedScore(
          gradesByStudentAndActivity.get(
            `${student.id}:${examActivity.id}`,
          ),
          examActivity,
        )
      : null;

    const examContribution =
      examScore === null
        ? null
        : truncateToTwo(
            examScore * settings.examWeight,
          );

    const finalScore =
      formativeContribution !== null
      && projectContribution !== null
      && examContribution !== null
        ? truncateToTwo(
            formativeContribution
              + projectContribution
              + examContribution,
          )
        : null;

    return {
      studentId: student.id,
      cognitiveAverage,
      affectiveSocialAverage,
      motorAverage,
      formativeAverage,
      formativeContribution,
      interdisciplinaryProjectScore,
      projectContribution,
      examScore,
      examContribution,
      finalScore,
    };
  });
}
