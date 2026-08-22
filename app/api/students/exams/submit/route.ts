import { NextResponse } from "next/server";

import { getAuthAccess } from "@/features/auth/server/access";
import { cleanText } from "@/features/student-exams/server/helpers";
import type { ExamFeedback, StoredExamQuestion } from "@/features/student-exams/types";
import { getStudentSession } from "@/features/students/server/session";
import { createAdminClient } from "@/lib/supabase/admin";

export const runtime = "nodejs";

export async function POST(request: Request) {
  const [student, teacher] = await Promise.all([getStudentSession(), getAuthAccess()]);
  if (!student && !teacher.authenticated) return NextResponse.json({ error: "Sesión no válida." }, { status: 401 });

  const body = await request.json().catch(() => null) as Record<string, unknown> | null;
  const attemptId = cleanText(body?.attemptId, 80);
  const answers = body?.answers && typeof body.answers === "object" ? body.answers as Record<string, unknown> : {};
  if (!attemptId) return NextResponse.json({ error: "Intento no válido." }, { status: 400 });

  const admin = createAdminClient();
  if (!admin) return NextResponse.json({ error: "El servicio no está configurado." }, { status: 503 });

  const { data: attempt } = await admin.from("student_exam_attempts")
    .select("id, student_id, student_name, institution, grade_course, version_questions, score, submitted_at, created_at, student_exams(title, topic)")
    .eq("id", attemptId).maybeSingle();

  if (!attempt) return NextResponse.json({ error: "No encontramos este examen." }, { status: 404 });
  if (attempt.student_id && student?.studentId && attempt.student_id !== student.studentId) return NextResponse.json({ error: "Este examen pertenece a otra sesión." }, { status: 403 });
  if (attempt.submitted_at) return NextResponse.json({ error: "Este examen ya fue entregado." }, { status: 409 });

  const questions = attempt.version_questions as StoredExamQuestion[];
  if (!Array.isArray(questions) || questions.length !== 10) return NextResponse.json({ error: "La versión del examen no es válida." }, { status: 409 });

  let score = 0;
  const normalizedAnswers: Record<string, string | null> = {};
  const feedback: ExamFeedback[] = questions.map((question) => {
    const selectedOptionId = typeof answers[question.id] === "string" ? String(answers[question.id]) : null;
    const selected = question.options.find((option) => option.id === selectedOptionId);
    const correct = question.options.find((option) => option.id === question.correctOptionId);
    const isCorrect = selectedOptionId === question.correctOptionId;
    if (isCorrect) score += 1;
    normalizedAnswers[question.id] = selectedOptionId;
    return {
      questionId: question.id,
      prompt: question.prompt,
      selectedOptionId,
      selectedAnswer: selected?.text || "Sin respuesta",
      correctOptionId: question.correctOptionId,
      correctAnswer: correct?.text || "",
      explanation: question.explanation,
      isCorrect,
    };
  });

  const submittedAt = new Date().toISOString();
  const { error } = await admin.from("student_exam_attempts").update({ answers: normalizedAnswers, score, submitted_at: submittedAt }).eq("id", attemptId).is("submitted_at", null);
  if (error) return NextResponse.json({ error: "No pudimos guardar el resultado." }, { status: 500 });

  const relation = Array.isArray(attempt.student_exams) ? attempt.student_exams[0] : attempt.student_exams;
  return NextResponse.json({
    score,
    total: 10,
    feedback,
    submittedAt,
    student: { fullName: attempt.student_name, institution: attempt.institution, gradeCourse: attempt.grade_course },
    exam: { title: relation?.title || "Examen", topic: relation?.topic || "Educación Física" },
  });
}
