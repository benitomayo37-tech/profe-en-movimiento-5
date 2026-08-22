import { NextResponse } from "next/server";

import { getAuthAccess } from "@/features/auth/server/access";
import { createAdminClient } from "@/lib/supabase/admin";

export async function POST(request: Request) {
  const access = await getAuthAccess();
  if (!access.authenticated || !access.userId) return NextResponse.json({ error: "Debes iniciar sesión como docente." }, { status: 401 });

  const body = await request.json().catch(() => null) as { examId?: unknown; active?: unknown } | null;
  const examId = typeof body?.examId === "string" ? body.examId.trim() : "";
  const active = body?.active;
  if (!examId || typeof active !== "boolean") return NextResponse.json({ error: "Datos no válidos." }, { status: 400 });

  const admin = createAdminClient();
  if (!admin) return NextResponse.json({ error: "El servicio no está configurado." }, { status: 503 });

  const { data, error } = await admin.from("student_exams")
    .update({ active })
    .eq("id", examId)
    .eq("teacher_id", access.userId)
    .select("id, active")
    .maybeSingle();

  if (error) return NextResponse.json({ error: "No pudimos actualizar el código." }, { status: 500 });
  if (!data) return NextResponse.json({ error: "Examen no encontrado." }, { status: 404 });
  return NextResponse.json({ active: data.active });
}
