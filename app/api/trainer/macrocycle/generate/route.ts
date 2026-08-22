import OpenAI from "openai";
import { NextRequest, NextResponse } from "next/server";

import { requireTrainerProAccess } from "@/features/auth/server/apiAccess";
import { recordCurrentUserActivity } from "@/features/dashboard/server/activity";
import {
  buildMacrocyclePrompt,
  MACROCYCLE_INSTRUCTIONS,
} from "@/features/trainer/prompts/buildMacrocyclePrompt";
import { macrocycleSchema } from "@/features/trainer/schemas/macrocycleSchema";
import {
  isGeneratedMacrocycle,
  isValidMacrocycleFormData,
  validateMacrocycle,
} from "@/features/trainer/utils/validateMacrocycle";

export const runtime = "nodejs";

const MAX_REQUEST_SIZE = 7_000;
const MAX_GENERATION_ATTEMPTS = 3;

function normalizeVisibleSpanish<T>(value: T): T {
  if (typeof value === "string") {
    return value
      .replace(/\btapering\b/gi, "reducción planificada de la carga")
      .replace(/\btiming\b/gi, "sincronización")
      .replace(/\bcore\b/gi, "zona media")
      .replace(/\bRPE\b/g, "percepción subjetiva del esfuerzo")
      .replace(/\binitiation\b/gi, "iniciación")
      .replace(/\bintermediate\b/gi, "intermedio")
      .replace(/\badvanced\b/gi, "avanzado")
      .replace(/\bmanteniento\b/gi, "mantenimiento")
      .replace(/\bsesiones enfocados\b/gi, "sesiones enfocadas") as T;
  }

  if (Array.isArray(value)) {
    return value.map((item) => normalizeVisibleSpanish(item)) as T;
  }

  if (value && typeof value === "object") {
    return Object.fromEntries(
      Object.entries(value).map(([key, item]) => [
        key,
        normalizeVisibleSpanish(item),
      ]),
    ) as T;
  }

  return value;
}

function errorResponse(message: string, status: number) {
  return NextResponse.json({ success: false, error: message }, { status });
}

function completeCompetitionGuidance(
  competitionWeek: number | null,
  guidance: string,
): string {
  if (competitionWeek === null) return guidance;

  let completed = guidance.trim();
  const normalized = completed
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();

  if (!new RegExp(`\\bsemana\\s+${competitionWeek}\\b`).test(normalized)) {
    completed = `La competencia principal se ubica en la semana ${competitionWeek}. ${completed}`;
  }

  if (
    !/\b(?:descarga|reduccion|ajuste|recuperacion|puesta a punto)\b/.test(
      normalized,
    )
  ) {
    completed = `${completed} Antes de competir se reduce progresivamente la carga y se prioriza la recuperación.`;
  }

  return completed;
}

export async function POST(request: NextRequest) {
  const accessError = await requireTrainerProAccess();
  if (accessError) return accessError;

  if (!process.env.OPENAI_API_KEY) {
    return errorResponse(
      "Entrenador IA no tiene configurada la clave de inteligencia artificial.",
      503,
    );
  }

  try {
    const rawBody = await request.text();
    if (rawBody.length > MAX_REQUEST_SIZE) {
      return errorResponse("La solicitud supera el tamaño permitido.", 413);
    }

    let parsedBody: unknown;
    try {
      parsedBody = JSON.parse(rawBody);
    } catch {
      return errorResponse("La solicitud contiene información no válida.", 400);
    }

    if (!isValidMacrocycleFormData(parsedBody)) {
      return errorResponse(
        "Los datos del macrociclo están incompletos o no son válidos.",
        400,
      );
    }

    const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
    let lastValidationMessage = "El macrociclo no superó la validación.";

    for (let attempt = 1; attempt <= MAX_GENERATION_ATTEMPTS; attempt += 1) {
      const response = await client.responses.create({
        model: process.env.OPENAI_MODEL ?? "gpt-5-mini",
        store: false,
        instructions: MACROCYCLE_INSTRUCTIONS,
        input: buildMacrocyclePrompt(
          parsedBody,
          attempt > 1 ? lastValidationMessage : undefined,
        ),
        text: {
          format: {
            type: "json_schema",
            name: "training_macrocycle",
            strict: true,
            schema: macrocycleSchema,
          },
        },
      });

      if (!response.output_text) {
        lastValidationMessage = "Entrenador IA no produjo contenido.";
        continue;
      }

      let generated: unknown;
      try {
        generated = JSON.parse(response.output_text);
      } catch {
        lastValidationMessage = "La respuesta generada no pudo procesarse.";
        continue;
      }

      if (!isGeneratedMacrocycle(generated)) {
        lastValidationMessage = "La respuesta no cumple la estructura requerida.";
        continue;
      }

      const normalizedGenerated = normalizeVisibleSpanish(generated);

      normalizedGenerated.mainCompetitionGuidance = completeCompetitionGuidance(
        parsedBody.mainCompetitionWeek,
        normalizedGenerated.mainCompetitionGuidance,
      );

      const validation = validateMacrocycle(parsedBody, normalizedGenerated);
      if (!validation.valid) {
        lastValidationMessage =
          validation.message ??
          "El macrociclo no cumple las condiciones requeridas.";
        console.warn(
          `[Entrenador IA · Macrociclo] Intento ${attempt}: ${lastValidationMessage}`,
        );
        continue;
      }

      await recordCurrentUserActivity({
        type: "macrocycle",
        title: normalizedGenerated.title,
        description: `${parsedBody.sport} · ${parsedBody.category}`,
        href: "/entrenador-ia",
      });

      return NextResponse.json({ success: true, data: normalizedGenerated });
    }

    console.error(
      "[Entrenador IA · Macrociclo] Validación agotada:",
      lastValidationMessage,
    );
    return errorResponse(
      "Entrenador IA no pudo producir un macrociclo completamente coherente. Intenta generar nuevamente.",
      502,
    );
  } catch (error) {
    console.error("========== ERROR MACROCICLO ENTRENADOR IA ==========", error);
    if (error instanceof OpenAI.APIError) {
      if (error.status === 401) {
        return errorResponse("La clave configurada no es válida.", 503);
      }
      if (error.status === 429) {
        return errorResponse(
          error.code === "insufficient_quota"
            ? "La cuenta de OpenAI API no tiene cuota o saldo disponible."
            : "Se alcanzó el límite de solicitudes. Espera unos minutos e intenta nuevamente.",
          429,
        );
      }
      if (error.status && error.status >= 500) {
        return errorResponse(
          "El servicio de inteligencia artificial no está disponible temporalmente.",
          503,
        );
      }
    }
    return errorResponse(
      "Ocurrió un error inesperado al generar el macrociclo.",
      500,
    );
  }
}
