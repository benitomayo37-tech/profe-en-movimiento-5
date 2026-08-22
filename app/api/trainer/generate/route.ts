import OpenAI from "openai";
import {
  NextRequest,
  NextResponse,
} from "next/server";

import { getAuthenticatedApiAccess } from "@/features/auth/server/apiAccess";
import {
  releaseFreeGeneration,
  reserveFreeGeneration,
} from "@/features/auth/server/freeUsage";
import { recordCurrentUserActivity } from "@/features/dashboard/server/activity";
import {
  buildTrainingSessionPrompt,
  TRAINER_INSTRUCTIONS,
} from "@/features/trainer/prompts/buildTrainingSessionPrompt";
import { trainingSessionSchema } from "@/features/trainer/schemas/trainingSessionSchema";
import {
  isGeneratedTrainingSession,
  isValidTrainingSessionFormData,
  validateTrainingSession,
} from "@/features/trainer/utils/validateTrainingSession";

export const runtime = "nodejs";

const MAX_REQUEST_SIZE = 6_000;
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
  const accessResult = await getAuthenticatedApiAccess("Entrenador IA");
  if (accessResult.error) return accessResult.error;

  const access = accessResult.access;
  let freeReservationActive = false;

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

    if (!isValidTrainingSessionFormData(parsedBody)) {
      return createErrorResponse(
        "Los datos de la sesión están incompletos o no son válidos.",
        400,
      );
    }

    const reservation = await reserveFreeGeneration(
      access,
      "training-session",
    );

    if (!reservation.allowed) {
      return createErrorResponse(
        reservation.message ?? "Alcanzaste el límite mensual del Plan Free.",
        429,
      );
    }

    freeReservationActive = reservation.reserved;

    const client = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });

    let lastValidationMessage =
      "La sesión no superó la validación.";

    for (
      let attempt = 1;
      attempt <= MAX_GENERATION_ATTEMPTS;
      attempt += 1
    ) {
      const response = await client.responses.create({
        model: process.env.OPENAI_MODEL ?? "gpt-5-mini",
        store: false,
        instructions: TRAINER_INSTRUCTIONS,
        input: buildTrainingSessionPrompt(
          parsedBody,
          attempt > 1 ? lastValidationMessage : undefined,
        ),
        text: {
          format: {
            type: "json_schema",
            name: "training_session",
            strict: true,
            schema: trainingSessionSchema,
          },
        },
      });

      if (!response.output_text) {
        lastValidationMessage =
          "Entrenador IA no produjo contenido.";
        continue;
      }

      let generatedSession: unknown;

      try {
        generatedSession = JSON.parse(response.output_text);
      } catch {
        lastValidationMessage =
          "La respuesta generada no pudo procesarse.";
        continue;
      }

      if (!isGeneratedTrainingSession(generatedSession)) {
        lastValidationMessage =
          "La respuesta no cumple la estructura requerida.";
        continue;
      }

      const validation = validateTrainingSession(
        parsedBody,
        generatedSession,
      );

      if (!validation.valid) {
        lastValidationMessage =
          validation.message ??
          "La sesión no cumple las condiciones requeridas.";

        console.warn(
          `[Entrenador IA] Intento ${attempt}: ${lastValidationMessage}`,
        );
        continue;
      }

      await recordCurrentUserActivity({
        type: "training-session",
        title: generatedSession.title,
        description: `${parsedBody.sport} · ${parsedBody.category}`,
        href: "/entrenador-ia",
      });

      return NextResponse.json({
        success: true,
        data: generatedSession,
      });
    }

    console.error(
      "[Entrenador IA] Validación agotada:",
      lastValidationMessage,
    );

    if (freeReservationActive) {
      await releaseFreeGeneration(access, "training-session");
      freeReservationActive = false;
    }

    return createErrorResponse(
      "Entrenador IA no pudo producir una sesión completamente coherente. Intenta generar nuevamente.",
      502,
    );
  } catch (error) {
    if (freeReservationActive) {
      await releaseFreeGeneration(access, "training-session");
      freeReservationActive = false;
    }

    console.error("========== ERROR ENTRENADOR IA ==========");
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
      "Ocurrió un error inesperado al generar la sesión.",
      500,
    );
  }
}
