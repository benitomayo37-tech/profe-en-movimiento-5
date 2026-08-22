import type {
  GeneratedMacrocycle,
  MacrocycleFormData,
} from "@/features/trainer/types/trainer";

interface MacrocycleApiResponse {
  success: boolean;
  data?: GeneratedMacrocycle;
  error?: string;
}

export class MacrocycleRequestError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "MacrocycleRequestError";
  }
}

export async function generateMacrocycle(
  formData: MacrocycleFormData,
): Promise<GeneratedMacrocycle> {
  const response = await fetch("/api/trainer/macrocycle/generate", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(formData),
  });

  const payload = (await response.json()) as MacrocycleApiResponse;

  if (!response.ok || !payload.success || !payload.data) {
    throw new MacrocycleRequestError(
      payload.error ?? "No fue posible generar el macrociclo.",
    );
  }

  return payload.data;
}
