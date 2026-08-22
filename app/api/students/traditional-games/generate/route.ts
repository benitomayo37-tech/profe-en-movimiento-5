import OpenAI from "openai";
import { NextResponse } from "next/server";

import { getAuthAccess } from "@/features/auth/server/access";
import {
  buildStudentTraditionalGamesPrompt,
  STUDENT_TRADITIONAL_GAMES_INSTRUCTIONS,
} from "@/features/students/traditional-games/prompt";
import { studentTraditionalGamesSchema } from "@/features/students/traditional-games/schema";
import type { StudentTraditionalGamesApiResponse } from "@/features/students/traditional-games/types";
import { isStudentTraditionalGamesResult } from "@/features/students/traditional-games/validation";
import { getStudentSession } from "@/features/students/server/session";
import { createAdminClient } from "@/lib/supabase/admin";

export const runtime = "nodejs";

const MONTHLY_LIMIT = 10;
const MAX_REQUEST_SIZE = 2_000;

function response(body: StudentTraditionalGamesApiResponse, status = 200) {
  return NextResponse.json(body, { status });
}

function cleanLocation(value: unknown) {
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
  if (!student && !teacher.authenticated) {
    return response({ success: false, error: "Inicia sesión para utilizar Juegos tradicionales." }, 401);
  }

  const rawBody = await request.text();
  if (rawBody.length > MAX_REQUEST_SIZE) {
    return response({ success: false, error: "La solicitud supera el tamaño permitido." }, 413);
  }

  let country = "";
  let region = "";
  try {
    const body = JSON.parse(rawBody) as { country?: unknown; region?: unknown };
    country = cleanLocation(body.country);
    region = cleanLocation(body.region);
  } catch {
    return response({ success: false, error: "La solicitud no es válida." }, 400);
  }

  if (country.length < 2 || country.length > 60) {
    return response({ success: false, error: "Escribe un país de entre 2 y 60 caracteres." }, 400);
  }
  if (region.length > 80) {
    return response({ success: false, error: "La región, provincia o localidad no puede superar 80 caracteres." }, 400);
  }

  const admin = createAdminClient();
  if (!admin) {
    return response({ success: false, error: "Juegos tradicionales aún no está configurado. Comunícalo al administrador." }, 503);
  }

  if (student) {
    const used = await currentUsage(student.studentId);
    if (used === null) {
      return response({ success: false, error: "No pudimos consultar tu límite mensual. Inténtalo nuevamente." }, 503);
    }
    if (used >= MONTHLY_LIMIT) {
      return response({ success: false, remaining: 0, error: "Ya utilizaste tus 10 investigaciones de este mes. El contador se reiniciará el próximo mes." }, 429);
    }
  }

  if (!process.env.OPENAI_API_KEY) {
    return response({ success: false, error: "La inteligencia artificial no está configurada." }, 503);
  }

  try {
    const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
    const aiResponse = await client.responses.create({
      model: process.env.OPENAI_MODEL ?? "gpt-5-mini",
      store: false,
      instructions: STUDENT_TRADITIONAL_GAMES_INSTRUCTIONS,
      input: buildStudentTraditionalGamesPrompt({
        country,
        region,
        educationLevel: student?.educationLevel ?? "Educación secundaria",
        gradeCourse: student?.gradeCourse ?? "Adaptación general para estudiantes",
      }),
      text: {
        format: {
          type: "json_schema",
          name: "student_traditional_games",
          strict: true,
          schema: studentTraditionalGamesSchema,
        },
      },
    });

    if (!aiResponse.output_text) throw new Error("empty_traditional_games_response");
    const generated: unknown = JSON.parse(aiResponse.output_text);
    if (!isStudentTraditionalGamesResult(generated)) throw new Error("invalid_traditional_games_response");

    let remaining: number | null = null;
    if (student) {
      const { data: usage, error: usageError } = await admin.rpc("consume_student_generation", {
        p_student_id: student.studentId,
        p_limit: MONTHLY_LIMIT,
      });
      if (usageError || usage?.allowed !== true) {
        return response({ success: false, remaining: 0, error: "Tu límite mensual se completó mientras preparábamos la guía. El contador se reiniciará el próximo mes." }, 429);
      }
      remaining = typeof usage.remaining === "number" ? usage.remaining : null;

      const location = region ? `${country}, ${region}` : country;
      await admin.from("student_research_history").insert({
        student_id: student.studentId,
        resource_type: "traditional-games",
        topic: `Juegos tradicionales de ${location}`,
        generated_content: generated,
      });
    }

    return response({ success: true, result: generated, remaining });
  } catch (error) {
    console.error("[Juegos tradicionales] No se pudo generar la guía:", error);
    return response({ success: false, error: "No pudimos completar la guía en este momento. Tu cupo no fue descontado; inténtalo nuevamente." }, 502);
  }
}
