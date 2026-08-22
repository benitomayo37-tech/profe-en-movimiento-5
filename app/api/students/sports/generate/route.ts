import OpenAI from "openai";
import { NextResponse } from "next/server";

import { getAuthAccess } from "@/features/auth/server/access";
import { buildStudentSportsPrompt, STUDENT_SPORTS_INSTRUCTIONS } from "@/features/students/sports/prompt";
import { normalizeStudentSportsResult } from "@/features/students/sports/normalize";
import { studentSportsSchema } from "@/features/students/sports/schema";
import type { StudentSportsApiResponse, StudentSportsFocus, StudentSportsResult } from "@/features/students/sports/types";
import { isStudentSportsResult, isStudentSportsStructure } from "@/features/students/sports/validation";
import { findStudentSportsVisuals } from "@/features/students/sports/visuals";
import { getStudentSession } from "@/features/students/server/session";
import { createAdminClient } from "@/lib/supabase/admin";

export const runtime = "nodejs";

const MONTHLY_LIMIT = 10;
const MAX_REQUEST_SIZE = 2_000;
const VALID_FOCUSES = new Set<StudentSportsFocus>(["auto", "complete", "technique", "tactics", "rules"]);

function response(body: StudentSportsApiResponse, status = 200) {
  return NextResponse.json(body, { status });
}

function cleanTopic(value: unknown) {
  if (typeof value !== "string") return "";
  return value.replace(/\s+/g, " ").trim();
}

function cleanFocus(value: unknown): StudentSportsFocus {
  return typeof value === "string" && VALID_FOCUSES.has(value as StudentSportsFocus)
    ? value as StudentSportsFocus
    : "auto";
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
  if (!student && !teacher.authenticated) {
    return response({ success: false, error: "Inicia sesión para utilizar Deportes." }, 401);
  }

  const rawBody = await request.text();
  if (rawBody.length > MAX_REQUEST_SIZE) {
    return response({ success: false, error: "La solicitud supera el tamaño permitido." }, 413);
  }

  let topic = "";
  let focus: StudentSportsFocus = "auto";
  let includeVisuals = true;
  try {
    const body = JSON.parse(rawBody) as { topic?: unknown; focus?: unknown; includeVisuals?: unknown };
    topic = cleanTopic(body.topic);
    focus = cleanFocus(body.focus);
    includeVisuals = body.includeVisuals !== false;
  } catch {
    return response({ success: false, error: "La solicitud no es válida." }, 400);
  }

  if (topic.length < 5 || topic.length > 160) {
    return response({ success: false, error: "Escribe un tema deportivo de entre 5 y 160 caracteres." }, 400);
  }

  const admin = createAdminClient();
  if (!admin) {
    return response({ success: false, error: "Deportes aún no está configurado. Comunícalo al administrador." }, 503);
  }

  if (student) {
    const used = await currentUsage(student.studentId);
    if (used === null) return response({ success: false, error: "No pudimos consultar tu límite mensual. Inténtalo nuevamente." }, 503);
    if (used >= MONTHLY_LIMIT) {
      return response({ success: false, remaining: 0, error: "Ya utilizaste tus 10 investigaciones de este mes. El contador se reiniciará el próximo mes." }, 429);
    }
  }

  if (!process.env.OPENAI_API_KEY) {
    return response({ success: false, error: "La inteligencia artificial no está configurada." }, 503);
  }

  try {
    const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
    const basePrompt = buildStudentSportsPrompt({
      topic,
      focus,
      educationLevel: student?.educationLevel ?? "Educación secundaria",
      gradeCourse: student?.gradeCourse ?? "Adaptación general para estudiantes",
      includeVisuals,
    });
    let generated: StudentSportsResult | null = null;

    for (let attempt = 1; attempt <= 3; attempt += 1) {
      const aiResponse = await client.responses.create({
        model: process.env.OPENAI_MODEL ?? "gpt-5-mini",
        store: false,
        instructions: STUDENT_SPORTS_INSTRUCTIONS,
        input: `${basePrompt}\n\nINTENTO ${attempt} DE 3: entrega contenido final, completo y limpio. No incluyas marcadores internos ni frases truncadas.`,
        text: {
          format: {
            type: "json_schema",
            name: "student_sports_report",
            strict: true,
            schema: studentSportsSchema,
          },
        },
      });

      if (!aiResponse.output_text) {
        console.warn(`[Deportes estudiantes] Intento ${attempt}: respuesta vacía.`);
        continue;
      }
      try {
        const parsed: unknown = JSON.parse(aiResponse.output_text);
        if (!isStudentSportsStructure(parsed)) {
          console.warn(`[Deportes estudiantes] Intento ${attempt}: estructura o extensión no válida.`);
          continue;
        }
        const normalized = normalizeStudentSportsResult(parsed);
        if (!isStudentSportsResult(normalized)) {
          console.warn(`[Deportes estudiantes] Intento ${attempt}: el contenido normalizado conserva marcadores internos no permitidos.`);
          continue;
        }
        generated = normalized;
        break;
      } catch (parseError) {
        console.warn(`[Deportes estudiantes] Intento ${attempt}: JSON no válido.`, parseError);
        continue;
      }
    }

    if (!generated) throw new Error("invalid_sports_response");
    if (includeVisuals) {
      generated = {
        ...generated,
        visuals: await findStudentSportsVisuals(topic),
      };
    }

    let remaining: number | null = null;
    if (student) {
      const { data: usage, error: usageError } = await admin.rpc("consume_student_generation", {
        p_student_id: student.studentId,
        p_limit: MONTHLY_LIMIT,
      });
      if (usageError || usage?.allowed !== true) {
        return response({ success: false, remaining: 0, error: "Tu límite mensual se completó mientras preparábamos el reporte. El contador se reiniciará el próximo mes." }, 429);
      }
      remaining = typeof usage.remaining === "number" ? usage.remaining : null;
      await admin.from("student_research_history").insert({
        student_id: student.studentId,
        resource_type: "sports",
        topic,
        generated_content: generated,
      });
    }

    return response({ success: true, result: generated, remaining });
  } catch (error) {
    console.error("[Deportes estudiantes] No se pudo generar el reporte:", error);
    return response({ success: false, error: "No pudimos completar el reporte en este momento. Tu cupo no fue descontado; inténtalo nuevamente." }, 502);
  }
}
