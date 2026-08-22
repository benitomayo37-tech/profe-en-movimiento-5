import OpenAI from "openai";
import {
  NextRequest,
  NextResponse,
} from "next/server";

import { requireTrainerProAccess } from "@/features/auth/server/apiAccess";
import { recordCurrentUserActivity } from "@/features/dashboard/server/activity";
import {
  buildMicrocyclePrompt,
  MICROCYCLE_INSTRUCTIONS,
} from "@/features/trainer/prompts/buildMicrocyclePrompt";
import { microcycleSchema } from "@/features/trainer/schemas/microcycleSchema";
import {
  isGeneratedMicrocycle,
  isValidMicrocycleFormData,
  validateMicrocycle,
} from "@/features/trainer/utils/validateMicrocycle";

export const runtime = "nodejs";

const MAX_REQUEST_SIZE = 7_000;
const MAX_GENERATION_ATTEMPTS = 3;

function createErrorResponse(
  message: string,
  status: number,
) {
  return NextResponse.json(
    { success: false, error: message },
    { status },
  );
}

export async function POST(request: NextRequest) {
  const accessError = await requireTrainerProAccess();
  if (accessError) return accessError;

  if (!process.env.OPENAI_API_KEY) {
    return createErrorResponse(
      "Entrenador IA no tiene configurada la clave de inteligencia artificial.",
      503,
    );
  }

  try {
    const rawBody = await request.text();

    if (rawBody.length > MAX_REQUEST_SIZE) {
      return createErrorResponse(
        "La solicitud supera el tamaño permitido.",
        413,
      );
    }

    let parsedBody: unknown;

    try {
      parsedBody = JSON.parse(rawBody);
    } catch {
      return createErrorResponse(
        "La solicitud contiene información no válida.",
        400,
      );
    }

    if (!isValidMicrocycleFormData(parsedBody)) {
      return createErrorResponse(
        "Los datos del microciclo están incompletos o no son válidos.",
        400,
      );
    }

    const client = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });

    let lastValidationMessage =
      "El microciclo no superó la validación.";

    for (
      let attempt = 1;
      attempt <= MAX_GENERATION_ATTEMPTS;
      attempt += 1
    ) {
      const response = await client.responses.create({
        model: process.env.OPENAI_MODEL ?? "gpt-5-mini",
        store: false,
        instructions: MICROCYCLE_INSTRUCTIONS,
        input: buildMicrocyclePrompt(
          parsedBody,
          attempt > 1 ? lastValidationMessage : undefined,
        ),
        text: {
          format: {
            type: "json_schema",
            name: "training_microcycle",
            strict: true,
            schema: microcycleSchema,
          },
        },
      });

      if (!response.output_text) {
        lastValidationMessage =
          "Entrenador IA no produjo contenido.";
        continue;
      }

      let generatedMicrocycle: unknown;

      try {
        generatedMicrocycle = JSON.parse(response.output_text);
      } catch {
        lastValidationMessage =
          "La respuesta generada no pudo procesarse.";
        continue;
      }

      if (!isGeneratedMicrocycle(generatedMicrocycle)) {
        lastValidationMessage =
          "La respuesta no cumple la estructura requerida.";
        continue;
      }

      const validation = validateMicrocycle(
        parsedBody,
        generatedMicrocycle,
      );

      if (!validation.valid) {
        lastValidationMessage =
          validation.message ??
          "El microciclo no cumple las condiciones requeridas.";

        console.warn(
          `[Entrenador IA · Microciclo] Intento ${attempt}: ${lastValidationMessage}`,
        );
        continue;
      }

      await recordCurrentUserActivity({
        type: "microcycle",
        title: generatedMicrocycle.title,
        description: `${parsedBody.sport} · ${parsedBody.category}`,
        href: "/entrenador-ia",
      });

      return NextResponse.json({
        success: true,
        data: generatedMicrocycle,
      });
    }

    console.error(
      "[Entrenador IA · Microciclo] Validación agotada:",
      lastValidationMessage,
    );

    return createErrorResponse(
      "Entrenador IA no pudo producir un microciclo completamente coherente. Intenta generar nuevamente.",
      502,
    );
  } catch (error) {
    console.error("========== ERROR MICROCICLO ENTRENADOR IA ==========");
    console.error(error);

    if (error instanceof OpenAI.APIError) {
      if (error.status === 401) {
        return createErrorResponse(
          "La clave configurada no es válida.",
          503,
        );
      }

      if (error.status === 429) {
        return createErrorResponse(
          error.code === "insufficient_quota"
            ? "La cuenta de OpenAI API no tiene cuota o saldo disponible."
            : "Se alcanzó el límite de solicitudes. Espera unos minutos e intenta nuevamente.",
          429,
        );
      }

      if (error.status && error.status >= 500) {
        return createErrorResponse(
          "El servicio de inteligencia artificial no está disponible temporalmente.",
          503,
        );
      }
    }

    return createErrorResponse(
      "Ocurrió un error inesperado al generar el microciclo.",
      500,
    );
  }
}
