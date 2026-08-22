import OpenAI from "openai";

import { buildAssistantContext } from "../core";
import { buildPedagogicalPrompt } from "../prompts/buildPedagogicalPrompt";
import { generatedContentSchema } from "../schemas/generatedContentSchema";
import type {
  AIFormData,
  GeneratedAIContent,
} from "../types/ai";
import { AIEngineError } from "./AIEngineError";
import { isGeneratedAIContent } from "./isGeneratedAIContent";
import type { AIEngineGenerationResult } from "./types";

const DEFAULT_MODEL = "gpt-5-mini";

const parseGeneratedContent = (
  outputText: string,
): GeneratedAIContent => {
  let parsedContent: unknown;

  try {
    parsedContent = JSON.parse(outputText);
  } catch (error) {
    throw new AIEngineError({
      code: "INVALID_PROVIDER_RESPONSE",
      message:
        "La respuesta generada no pudo procesarse.",
      status: 502,
      cause: error,
    });
  }

  if (!isGeneratedAIContent(parsedContent)) {
    throw new AIEngineError({
      code: "INVALID_STRUCTURED_OUTPUT",
      message:
        "La respuesta no cumple la estructura requerida.",
      status: 502,
    });
  }

  return parsedContent;
};

const normalizeOpenAIError = (
  error: unknown,
): AIEngineError => {
  if (!(error instanceof OpenAI.APIError)) {
    return new AIEngineError({
      code: "UNKNOWN_ERROR",
      message:
        "Ocurrió un error inesperado al generar el contenido.",
      status: 500,
      cause: error,
    });
  }

  if (error.status === 401) {
    return new AIEngineError({
      code: "AUTHENTICATION_ERROR",
      message:
        "La clave configurada no es válida.",
      status: 503,
      cause: error,
    });
  }

  if (error.status === 429) {
    const errorCode =
      typeof error.code === "string"
        ? error.code
        : "unknown";

    if (errorCode === "insufficient_quota") {
      return new AIEngineError({
        code: "INSUFFICIENT_QUOTA",
        message:
          "La cuenta de OpenAI API no tiene cuota o saldo disponible. Revisa la facturación de la API.",
        status: 429,
        cause: error,
      });
    }

    return new AIEngineError({
      code: "RATE_LIMIT",
      message:
        "Se alcanzó el límite de solicitudes de OpenAI. Espera unos minutos e intenta nuevamente.",
      status: 429,
      cause: error,
    });
  }

  if (
    typeof error.status === "number" &&
    error.status >= 500
  ) {
    return new AIEngineError({
      code: "PROVIDER_UNAVAILABLE",
      message:
        "El servicio de inteligencia artificial no está disponible temporalmente.",
      status: 503,
      cause: error,
    });
  }

  return new AIEngineError({
    code: "UNKNOWN_ERROR",
    message:
      "Ocurrió un error inesperado al generar el contenido.",
    status: 500,
    cause: error,
  });
};

export const generateWithAIEngine = async (
  data: AIFormData,
): Promise<AIEngineGenerationResult> => {
  const apiKey = process.env.OPENAI_API_KEY;

  if (!apiKey) {
    throw new AIEngineError({
      code: "MISSING_API_KEY",
      message:
        "Profe IA no tiene configurada la clave de inteligencia artificial.",
      status: 503,
    });
  }

  const userPrompt = buildPedagogicalPrompt(data);

  /*
   * Mientras el formulario actual siga orientado a
   * planificaciones pedagógicas, ProfeGPT será la
   * selección preferida.
   *
   * Más adelante, cuando incorporemos el chat libre,
   * el router analizará directamente el mensaje del usuario.
   */
  const assistantContext = buildAssistantContext(
    userPrompt,
    "profegpt",
  );

  const model =
    process.env.OPENAI_MODEL ??
    DEFAULT_MODEL;

  const client = new OpenAI({
    apiKey,
  });

  try {
    const response =
      await client.responses.create({
        model,
        store: false,

        instructions:
          assistantContext.systemPrompt,

        input: userPrompt,

        text: {
          format: {
            type: "json_schema",
            name: "profe_gpt_content",
            strict: true,
            schema: generatedContentSchema,
          },
        },
      });

    if (!response.output_text) {
      throw new AIEngineError({
        code: "EMPTY_RESPONSE",
        message:
          `${assistantContext.assistant.name} no produjo contenido.`,
        status: 502,
      });
    }

    const content = parseGeneratedContent(
      response.output_text,
    );

    return {
      content,
      metadata: {
        assistant:
          assistantContext.assistant,
        requestedAssistantId:
          assistantContext.requestedAssistantId,
        routing:
          assistantContext.routing,
        fallbackApplied:
          assistantContext.fallbackApplied,
        fallbackReason:
          assistantContext.fallbackReason,
        model,
      },
    };
  } catch (error) {
    if (error instanceof AIEngineError) {
      throw error;
    }

    throw normalizeOpenAIError(error);
  }
};