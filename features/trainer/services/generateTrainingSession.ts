import type {
  GeneratedTrainingSession,
  TrainingSessionFormData,
} from "@/features/trainer/types/trainer";

interface SuccessfulResponse {
  success: true;
  data: GeneratedTrainingSession;
}

interface FailedResponse {
  success: false;
  error: string;
}

type TrainerResponse = SuccessfulResponse | FailedResponse;

export class TrainerRequestError extends Error {
  status: number;

  constructor(message: string, status: number) {
    super(message);
    this.name = "TrainerRequestError";
    this.status = status;
  }
}

export async function generateTrainingSession(
  data: TrainingSessionFormData,
): Promise<GeneratedTrainingSession> {
  const response = await fetch("/api/trainer/generate", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });

  let result: TrainerResponse;

  try {
    result = (await response.json()) as TrainerResponse;
  } catch {
    throw new TrainerRequestError(
      "El servidor produjo una respuesta que no pudo interpretarse.",
      response.status,
    );
  }

  if (!response.ok || !result.success) {
    throw new TrainerRequestError(
      result.success === false
        ? result.error
        : "No fue posible generar la sesión.",
      response.status,
    );
  }

  return result.data;
}
