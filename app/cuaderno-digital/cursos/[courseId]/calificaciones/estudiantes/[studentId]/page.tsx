import { notFound, redirect } from "next/navigation";

import StudentReportWorkspace from "@/features/physical-education-notebook/components/StudentReportWorkspace";
import { getCourses, getStudentsByCourse } from "@/features/physical-education-notebook/server/queries";
import { getGradingPeriods } from "@/features/physical-education-notebook/server/gradingQueries";
import { getPeriodGradeSummariesAction } from "@/features/physical-education-notebook/server/gradingGradeActions";

interface StudentReportPageProps {
  params: Promise<{ courseId: string; studentId: string }>;
}

export default async function StudentReportPage({ params }: StudentReportPageProps) {
  const { courseId, studentId } = await params;
  const [coursesResult, studentsResult, periodsResult] = await Promise.all([
    getCourses(),
    getStudentsByCourse(courseId),
    getGradingPeriods(courseId),
  ]);

  if (!coursesResult.success || !studentsResult.success || !periodsResult.success) {
    redirect("/cuaderno-digital");
  }

  const course = coursesResult.data?.find((item) => item.id === courseId);
  const student = studentsResult.data?.find((item) => item.id === studentId);
  if (!course || !student) notFound();

  const periods = periodsResult.data ?? [];
  const summaryResults = await Promise.all(
    periods.map((period) => getPeriodGradeSummariesAction(courseId, period.id)),
  );
  const summariesByPeriod = Object.fromEntries(
    periods.map((period, index) => [period.id, summaryResults[index]?.data ?? []]),
  );

  return (
    <StudentReportWorkspace
      course={course}
      student={student}
      periods={periods}
      summariesByPeriod={summariesByPeriod}
    />
  );
}