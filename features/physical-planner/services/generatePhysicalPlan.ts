import type {
  GeneratedPhysicalPlan,
  PhysicalPlannerFormData,
  PhysicalPlannerUsage,
} from "@/features/physical-planner/types/physicalPlanner";

interface SuccessfulResponse {
  success: true;
  data: GeneratedPhysicalPlan;
  usage: PhysicalPlannerUsage;
  savedSessionId: string | null;
}

interface FailedResponse {
  success: false;
  error: string;
  code?: string;
}

type PhysicalPlannerResponse =
  | SuccessfulResponse
  | FailedResponse;

export interface GeneratedPhysicalPlanResponse {
  data: GeneratedPhysicalPlan;
  usage: PhysicalPlannerUsage;
  savedSessionId: string | null;
}

export class PhysicalPlannerRequestError extends Error {
  status: number;
  code?: string;

  constructor(
    message: string,
    status: number,
    code?: string,
  ) {
    super(message);
    this.name = "PhysicalPlannerRequestError";
    this.status = status;
    this.code = code;
  }
}

export async function generatePhysicalPlan(
  formData: PhysicalPlannerFormData,
): Promise<GeneratedPhysicalPlanResponse> {
  const response = await fetch(
    "/api/physical-planner/generate",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(formData),
    },
  );

  let result: PhysicalPlannerResponse;

  try {
    result =
      (await response.json()) as PhysicalPlannerResponse;
  } catch {
    throw new PhysicalPlannerRequestError(
      "El servidor produjo una respuesta que no pudo interpretarse.",
      response.status,
    );
  }

  if (!response.ok || result.success !== true) {
    throw new PhysicalPlannerRequestError(
      result.success === false
        ? result.error
        : "No fue posible generar la sesión.",
      response.status,
      result.success === false
        ? result.code
        : undefined,
    );
  }

  return {
    data: result.data,
    usage: result.usage,
    savedSessionId: result.savedSessionId,
  };
}