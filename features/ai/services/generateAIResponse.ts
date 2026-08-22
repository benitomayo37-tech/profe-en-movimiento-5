import type {
  AIFormData,
  GeneratedAIContent,
} from "@/features/ai/types/ai";

interface SuccessfulAIResponse {
  success: true;
  data: GeneratedAIContent;
}

interface FailedAIResponse {
  success: false;
  error: string;
}

type AIResponse =
  | SuccessfulAIResponse
  | FailedAIResponse;

export class AIRequestError extends Error {
  status: number;

  constructor(
    message: string,
    status: number,
  ) {
    super(message);

    this.name = "AIRequestError";
    this.status = status;
  }
}

export async function generateAIResponse(
  data: AIFormData,
): Promise<GeneratedAIContent> {
  const response = await fetch(
    "/api/ai/generate",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    },
  );

  let result: AIResponse;

  try {
    result =
      (await response.json()) as AIResponse;
  } catch {
    throw new AIRequestError(
      "El servidor produjo una respuesta que no pudo interpretarse.",
      response.status,
    );
  }

  if (
    !response.ok ||
    !result.success
  ) {
    const message =
      result.success === false
        ? result.error
        : "No fue posible generar el contenido.";

    throw new AIRequestError(
      message,
      response.status,
    );
  }

  return result.data;
}