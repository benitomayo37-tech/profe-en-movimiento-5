import type {
  GeneratedMesocycle,
  MesocycleFormData,
} from "@/features/trainer/types/trainer";

interface MesocycleApiResponse {
  success: boolean;
  data?: GeneratedMesocycle;
  error?: string;
}

export class MesocycleRequestError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "MesocycleRequestError";
  }
}

export async function generateMesocycle(
  formData: MesocycleFormData,
): Promise<GeneratedMesocycle> {
  const response = await fetch(
    "/api/trainer/mesocycle/generate",
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(formData),
    },
  );

  const payload = (await response.json()) as MesocycleApiResponse;

  if (!response.ok || !payload.success || !payload.data) {
    throw new MesocycleRequestError(
      payload.error ?? "No fue posible generar el mesociclo.",
    );
  }

  return payload.data;
}
