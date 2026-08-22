import OpenAI from "openai";
import { NextRequest, NextResponse } from "next/server";

import { requireTrainerProAccess } from "@/features/auth/server/apiAccess";
import { recordCurrentUserActivity } from "@/features/dashboard/server/activity";
import {
  buildMesocyclePrompt,
  MESOCYCLE_INSTRUCTIONS,
} from "@/features/trainer/prompts/buildMesocyclePrompt";
import { mesocycleSchema } from "@/features/trainer/schemas/mesocycleSchema";
import {
  isGeneratedMesocycle,
  isValidMesocycleFormData,
  validateMesocycle,
} from "@/features/trainer/utils/validateMesocycle";

export const runtime = "nodejs";

const MAX_REQUEST_SIZE = 7_000;
const MAX_GENERATION_ATTEMPTS = 3;

function errorResponse(message: string, status: number) {
  return NextResponse.json({ success: false, error: message }, { status });
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

    if (!isValidMesocycleFormData(parsedBody)) {
      return errorResponse(
        "Los datos del mesociclo están incompletos o no son válidos.",
        400,
      );
    }

    const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
    let lastValidationMessage = "El mesociclo no superó la validación.";

    for (let attempt = 1; attempt <= MAX_GENERATION_ATTEMPTS; attempt += 1) {
      const response = await client.responses.create({
        model: process.env.OPENAI_MODEL ?? "gpt-5-mini",
        store: false,
        instructions: MESOCYCLE_INSTRUCTIONS,
        input: buildMesocyclePrompt(
          parsedBody,
          attempt > 1 ? lastValidationMessage : undefined,
        ),
        text: {
          format: {
            type: "json_schema",
            name: "training_mesocycle",
            strict: true,
            schema: mesocycleSchema,
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

      if (!isGeneratedMesocycle(generated)) {
        lastValidationMessage = "La respuesta no cumple la estructura requerida.";
        continue;
      }

      const validation = validateMesocycle(parsedBody, generated);
      if (!validation.valid) {
        lastValidationMessage =
          validation.message ?? "El mesociclo no cumple las condiciones requeridas.";
        console.warn(
          `[Entrenador IA · Mesociclo] Intento ${attempt}: ${lastValidationMessage}`,
        );
        continue;
      }

      await recordCurrentUserActivity({
        type: "mesocycle",
        title: generated.title,
        description: `${parsedBody.sport} · ${parsedBody.category}`,
        href: "/entrenador-ia",
      });

      return NextResponse.json({ success: true, data: generated });
    }

    console.error(
      "[Entrenador IA · Mesociclo] Validación agotada:",
      lastValidationMessage,
    );
    return errorResponse(
      "Entrenador IA no pudo producir un mesociclo completamente coherente. Intenta generar nuevamente.",
      502,
    );
  } catch (error) {
    console.error("========== ERROR MESOCICLO ENTRENADOR IA ==========", error);
    if (error instanceof OpenAI.APIError) {
      if (error.status === 401) return errorResponse("La clave configurada no es válida.", 503);
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
    return errorResponse("Ocurrió un error inesperado al generar el mesociclo.", 500);
  }
}
