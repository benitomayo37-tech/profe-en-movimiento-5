import type {
  GeneratedMicrocycle,
  MicrocycleFormData,
} from "@/features/trainer/types/trainer";

interface MicrocycleApiResponse {
  success: boolean;
  data?: GeneratedMicrocycle;
  error?: string;
}

export class MicrocycleRequestError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "MicrocycleRequestError";
  }
}

export async function generateMicrocycle(
  formData: MicrocycleFormData,
): Promise<GeneratedMicrocycle> {
  const response = await fetch(
    "/api/trainer/microcycle/generate",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(formData),
    },
  );

  const payload =
    (await response.json()) as MicrocycleApiResponse;

  if (!response.ok || !payload.success || !payload.data) {
    throw new MicrocycleRequestError(
      payload.error ??
        "No fue posible generar el microciclo.",
    );
  }

  return payload.data;
}
