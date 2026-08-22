import OpenAI from "openai";
import { NextResponse } from "next/server";

import { getAuthAccess } from "@/features/auth/server/access";
import { buildStudentHistoryPrompt, STUDENT_HISTORY_INSTRUCTIONS } from "@/features/students/history/prompt";
import { studentHistorySchema } from "@/features/students/history/schema";
import type { StudentHistoryApiResponse } from "@/features/students/history/types";
import { isStudentHistoryResult } from "@/features/students/history/validation";
import { getStudentSession } from "@/features/students/server/session";
import { createAdminClient } from "@/lib/supabase/admin";

export const runtime = "nodejs";

const MONTHLY_LIMIT = 10;
const MAX_REQUEST_SIZE = 2_000;

function response(body: StudentHistoryApiResponse, status = 200) {
  return NextResponse.json(body, { status });
}

function cleanTopic(value: unknown) {
  if (typeof value !== "string") return "";
  return value.replace(/\s+/g, " ").trim();
}

async function currentUsage(studentId: string) {
  const admin = createAdminClient();
  if (!admin) return null;
  const month = `${new Date().toISOString().slice(0, 7)}-01`;
  const { data, error } = await admin
    .from("student_monthly_usage")
    .select("generation_count")
    .eq("student_id", studentId)
    .eq("usage_month", month)
    .maybeSingle();
  if (error) return null;
  return typeof data?.generation_count === "number" ? data.generation_count : 0;
}

export async function POST(request: Request) {
  const [student, teacher] = await Promise.all([getStudentSession(), getAuthAccess()]);
  if (!student && !teacher.authenticated) return response({ success: false, error: "Inicia sesión para utilizar Historia." }, 401);

  const rawBody = await request.text();
  if (rawBody.length > MAX_REQUEST_SIZE) return response({ success: false, error: "La solicitud supera el tamaño permitido." }, 413);

  let topic = "";
  try {
    topic = cleanTopic((JSON.parse(rawBody) as { topic?: unknown }).topic);
  } catch {
    return response({ success: false, error: "La solicitud no es válida." }, 400);
  }

  if (topic.length < 5 || topic.length > 160) {
    return response({ success: false, error: "Escribe un tema histórico de entre 5 y 160 caracteres." }, 400);
  }

  const admin = createAdminClient();
  if (!admin) return response({ success: false, error: "Historia aún no está configurada. Comunícalo al administrador." }, 503);

  if (student) {
    const used = await currentUsage(student.studentId);
    if (used === null) return response({ success: false, error: "No pudimos consultar tu límite mensual. Inténtalo nuevamente." }, 503);
    if (used >= MONTHLY_LIMIT) return response({ success: false, remaining: 0, error: "Ya utilizaste tus 10 investigaciones de este mes. El contador se reiniciará el próximo mes." }, 429);
  }

  if (!process.env.OPENAI_API_KEY) return response({ success: false, error: "La inteligencia artificial no está configurada." }, 503);

  try {
    const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
    const aiResponse = await client.responses.create({
      model: process.env.OPENAI_MODEL ?? "gpt-5-mini",
      store: false,
      instructions: STUDENT_HISTORY_INSTRUCTIONS,
      input: buildStudentHistoryPrompt({
        topic,
        educationLevel: student?.educationLevel ?? "Educación secundaria",
        gradeCourse: student?.gradeCourse ?? "Adaptación general para estudiantes",
      }),
      text: {
        format: {
          type: "json_schema",
          name: "student_history_research",
          strict: true,
          schema: studentHistorySchema,
        },
      },
    });

    if (!aiResponse.output_text) throw new Error("empty_history_response");
    const generated: unknown = JSON.parse(aiResponse.output_text);
    if (!isStudentHistoryResult(generated)) throw new Error("invalid_history_response");

    let remaining: number | null = null;
    if (student) {
      const { data: usage, error: usageError } = await admin.rpc("consume_student_generation", {
        p_student_id: student.studentId,
        p_limit: MONTHLY_LIMIT,
      });
      if (usageError || usage?.allowed !== true) {
        return response({ success: false, remaining: 0, error: "Tu límite mensual se completó mientras preparábamos la investigación. El contador se reiniciará el próximo mes." }, 429);
      }
      remaining = typeof usage.remaining === "number" ? usage.remaining : null;

      await admin.from("student_research_history").insert({
        student_id: student.studentId,
        resource_type: "history",
        topic,
        generated_content: generated,
      });
    }

    return response({ success: true, result: generated, remaining });
  } catch (error) {
    console.error("[Historia estudiantil] No se pudo generar la investigación:", error);
    return response({ success: false, error: "No pudimos completar la investigación en este momento. Tu cupo no fue descontado; inténtalo nuevamente." }, 502);
  }
}
