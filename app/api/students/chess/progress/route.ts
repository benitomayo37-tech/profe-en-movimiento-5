import { NextResponse } from "next/server";
import { getStudentSession } from "@/features/students/server/session";
import { createAdminClient } from "@/lib/supabase/admin";

export const dynamic = "force-dynamic";

export async function GET() {
  const student = await getStudentSession();
  if (!student) return NextResponse.json({ error: "student_session_required" }, { status: 401 });
  const admin = createAdminClient();
  if (!admin) return NextResponse.json({ progress: null });
  const { data, error } = await admin.from("student_chess_progress").select("progress,updated_at").eq("student_id", student.studentId).maybeSingle();
  if (error) return NextResponse.json({ progress: null });
  return NextResponse.json({ progress: data?.progress ?? null, updatedAt: data?.updated_at ?? null });
}

export async function PUT(request: Request) {
  const student = await getStudentSession();
  if (!student) return NextResponse.json({ error: "student_session_required" }, { status: 401 });
  const admin = createAdminClient();
  if (!admin) return NextResponse.json({ saved: false });
  const progress = await request.json().catch(() => null);
  if (!progress || typeof progress !== "object") return NextResponse.json({ error: "invalid_progress" }, { status: 400 });
  const { error } = await admin.from("student_chess_progress").upsert({ student_id: student.studentId, progress, updated_at: new Date().toISOString() }, { onConflict: "student_id" });
  return error ? NextResponse.json({ saved: false }, { status: 500 }) : NextResponse.json({ saved: true });
}

export async function DELETE() {
  const student = await getStudentSession();
  if (!student) return NextResponse.json({ error: "student_session_required" }, { status: 401 });
  const admin = createAdminClient();
  if (admin) await admin.from("student_chess_progress").delete().eq("student_id", student.studentId);
  return NextResponse.json({ deleted: true });
}
