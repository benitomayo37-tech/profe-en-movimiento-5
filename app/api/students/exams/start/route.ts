import { NextResponse } from "next/server";

import { getAuthAccess } from "@/features/auth/server/access";
import { buildExamVersion, cleanText, isQuestionBank, toPublicQuestions } from "@/features/student-exams/server/helpers";
import { getStudentSession } from "@/features/students/server/session";
import { createAdminClient } from "@/lib/supabase/admin";

export const runtime = "nodejs";

export async function POST(request: Request) {
  const [student, teacher] = await Promise.all([getStudentSession(), getAuthAccess()]);
  if (!student && !teacher.authenticated) return NextResponse.json({ error: "Debes ingresar al espacio estudiantil." }, { status: 401 });

  const body = await request.json().catch(() => null) as Record<string, unknown> | null;
  const code = cleanText(body?.code, 20).toUpperCase();
  const studentName = cleanText(body?.studentName, 160);
  const institution = cleanText(body?.institution, 160);
  const gradeCourse = cleanText(body?.gradeCourse, 80);
  if (!code || studentName.length < 3 || institution.length < 2 || !gradeCourse) {
    return NextResponse.json({ error: "Completa el código y todos tus datos." }, { status: 400 });
  }

  const admin = createAdminClient();
  if (!admin) return NextResponse.json({ error: "El servicio no está configurado." }, { status: 503 });

  const { data: exam } = await admin.from("student_exams")
    .select("id, title, topic, institution, grade_course, questions, active, expires_at")
    .eq("access_code", code).maybeSingle();

  if (!exam || !exam.active || new Date(exam.expires_at).getTime() <= Date.now()) {
    return NextResponse.json({ error: "El código no existe, venció o fue desactivado." }, { status: 404 });
  }
  if (!isQuestionBank(exam.questions)) return NextResponse.json({ error: "Este examen necesita ser regenerado por el docente." }, { status: 409 });

  const version = buildExamVersion(exam.questions);
  const { data: attempt, error } = await admin.from("student_exam_attempts").insert({
    exam_id: exam.id,
    student_id: student?.studentId ?? null,
    student_name: studentName,
    institution,
    grade_course: gradeCourse,
    version_questions: version,
  }).select("id, created_at").single();

  if (error || !attempt) {
    console.error("[Examen estudiantes] No se pudo iniciar:", error);
    return NextResponse.json({ error: "No pudimos iniciar el examen." }, { status: 500 });
  }

  return NextResponse.json({
    attemptId: attempt.id,
    title: exam.title,
    topic: exam.topic,
    expectedInstitution: exam.institution,
    expectedGradeCourse: exam.grade_course,
    startedAt: attempt.created_at,
    questions: toPublicQuestions(version),
  });
}
