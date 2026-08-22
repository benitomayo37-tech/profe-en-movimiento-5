import { randomBytes } from "node:crypto";

import OpenAI from "openai";
import { NextResponse } from "next/server";

import { getAuthAccess } from "@/features/auth/server/access";
import { cleanText, isQuestionBank } from "@/features/student-exams/server/helpers";
import type { StoredExamQuestion } from "@/features/student-exams/types";
import { createAdminClient } from "@/lib/supabase/admin";

export const runtime = "nodejs";
export const maxDuration = 120;

const schema = {
  type: "object",
  additionalProperties: false,
  required: ["questions"],
  properties: {
    questions: {
      type: "array",
      minItems: 15,
      maxItems: 15,
      items: {
        type: "object",
        additionalProperties: false,
        required: ["id", "type", "context", "prompt", "options", "correctOptionId", "explanation"],
        properties: {
          id: { type: "string" },
          type: { type: "string", enum: ["multiple_choice", "structured_base", "metacognition"] },
          context: { type: "string" },
          prompt: { type: "string" },
          options: {
            type: "array",
            minItems: 4,
            maxItems: 4,
            items: {
              type: "object",
              additionalProperties: false,
              required: ["id", "text"],
              properties: { id: { type: "string" }, text: { type: "string" } },
            },
          },
          correctOptionId: { type: "string" },
          explanation: { type: "string" },
        },
      },
    },
  },
} as const;

function createCode() {
  return `PEM-${randomBytes(4).toString("hex").toUpperCase().slice(0, 6)}`;
}

export async function POST(request: Request) {
  const access = await getAuthAccess();
  if (!access.authenticated || !access.userId) return NextResponse.json({ error: "Debes iniciar sesión como docente." }, { status: 401 });

  const body = await request.json().catch(() => null) as Record<string, unknown> | null;
  const title = cleanText(body?.title, 120);
  const topic = cleanText(body?.topic, 500);
  const institution = cleanText(body?.institution, 160);
  const gradeCourse = cleanText(body?.gradeCourse, 80);
  const expiresInDays = Math.min(Math.max(Number(body?.expiresInDays) || 7, 1), 30);

  if (title.length < 3 || topic.length < 3 || institution.length < 2 || gradeCourse.length < 1) {
    return NextResponse.json({ error: "Completa todos los datos del examen." }, { status: 400 });
  }

  const apiKey = process.env.OPENAI_API_KEY?.trim();
  const admin = createAdminClient();
  if (!apiKey || !admin) return NextResponse.json({ error: "La generación no está configurada." }, { status: 503 });

  try {
    const client = new OpenAI({ apiKey });
    const response = await client.responses.create({
      model: process.env.OPENAI_MODEL?.trim() || "gpt-5-mini",
      store: false,
      instructions: [
        "Eres un especialista en evaluación de Educación Física escolar.",
        "Crea un banco equivalente, claro, seguro y adecuado al grado indicado.",
        "Entrega exactamente 15 preguntas: 9 multiple_choice, 3 structured_base y 3 metacognition.",
        "Cada pregunta tiene cuatro opciones plausibles y una sola respuesta correcta.",
        "Las preguntas metacognitivas deben evaluar la mejor decisión reflexiva o estrategia de aprendizaje y también deben poder calificarse objetivamente.",
        "Usa ids de pregunta q01 a q15 e ids de opciones a, b, c, d. correctOptionId debe coincidir con una opción.",
        "No incluyas preguntas de riesgo físico, datos personales ni contenidos ajenos al tema.",
        "La explicación debe enseñar brevemente por qué la opción es correcta.",
      ].join("\n"),
      input: `Título: ${title}\nTema: ${topic}\nInstitución: ${institution}\nGrado y curso: ${gradeCourse}\nIdioma: español.`,
      text: { format: { type: "json_schema", name: "student_exam_bank", strict: true, schema } },
    });

    const parsed = JSON.parse(response.output_text || "{}") as { questions?: StoredExamQuestion[] };
    if (!isQuestionBank(parsed.questions)) throw new Error("invalid_exam_bank");

    const expiresAt = new Date(Date.now() + expiresInDays * 86_400_000).toISOString();
    let inserted: { id: string; access_code: string; expires_at: string } | null = null;

    for (let attempt = 0; attempt < 4 && !inserted; attempt += 1) {
      const { data, error } = await admin.from("student_exams").insert({
        teacher_id: access.userId,
        access_code: createCode(),
        title,
        topic,
        institution,
        grade_course: gradeCourse,
        questions: parsed.questions,
        expires_at: expiresAt,
      }).select("id, access_code, expires_at").single();
      if (!error && data) inserted = data;
      else if (error?.code !== "23505") throw error;
    }

    if (!inserted) throw new Error("code_generation_failed");
    return NextResponse.json({ examId: inserted.id, code: inserted.access_code, expiresAt: inserted.expires_at });
  } catch (error) {
    console.error("[Exámenes docentes] No se pudo crear el examen:", error);
    return NextResponse.json({ error: "No pudimos crear el examen. Inténtalo nuevamente." }, { status: 502 });
  }
}
