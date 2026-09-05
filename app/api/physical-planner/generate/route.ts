import OpenAI from "openai";
import {
  NextRequest,
  NextResponse,
} from "next/server";

import { getAuthenticatedApiAccess } from "@/features/auth/server/apiAccess";
import {
  buildPhysicalPlanPrompt,
  PHYSICAL_PLANNER_INSTRUCTIONS,
} from "@/features/physical-planner/prompts/buildPhysicalPlanPrompt";
import { physicalPlanSchema } from "@/features/physical-planner/schemas/physicalPlanSchema";
import type {
  PhysicalPlannerFormData,
  PhysicalPlannerUsage,
} from "@/features/physical-planner/types/physicalPlanner";
import {
  isGeneratedPhysicalPlan,
  sanitizePhysicalPlanTerminology,
  isValidPhysicalPlannerFormData,
  validatePhysicalPlan,
} from "@/features/physical-planner/utils/validatePhysicalPlan";
import { recordCurrentUserActivity } from "@/features/dashboard/server/activity";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";

export const runtime = "nodejs";

const MAX_REQUEST_SIZE = 8_000;
const MAX_GENERATION_ATTEMPTS = 3;

interface UsageRpcResult {
  allowed?: boolean;
  reason?: string | null;
  tier?: "free" | "pro" | "admin";
  limit?: number;
  used?: number;
  remaining?: number;
  historyLimit?: number;
}

function errorResponse(
  message: string,
  status: number,
  code?: string,
) {
  return NextResponse.json(
    {
      success: false,
      error: message,
      ...(code ? { code } : {}),
    },
    {
      status,
      headers: {
        "Cache-Control": "no-store",
      },
    },
  );
}

function usageFromRpc(
  value: UsageRpcResult,
): PhysicalPlannerUsage {
  return {
    tier: value.tier ?? "free",
    limit: value.limit ?? 0,
    used: value.used ?? 0,
    remaining: value.remaining ?? 0,
    historyLimit: value.historyLimit ?? 3,
  };
}

async function releaseReservation(
  userId: string,
  context: PhysicalPlannerFormData["context"],
) {
  const admin = createAdminClient();

  if (!admin) {
    console.error(
      "[Planificador Físico] No se pudo liberar la cuota: falta el cliente administrativo.",
    );
    return;
  }

  const { error } = await admin.rpc(
    "release_physical_planner_run",
    {
      p_user_id: userId,
      p_context: context,
    },
  );

  if (error) {
    console.error(
      "[Planificador Físico] No se pudo liberar la cuota.",
      error.code,
    );
  }
}

export async function POST(request: NextRequest) {
  const accessResult = await getAuthenticatedApiAccess(
    "Planificador Físico",
  );

  if (accessResult.error) {
    return accessResult.error;
  }

  const access = accessResult.access;

  if (!access.userId) {
    return errorResponse("Debes iniciar sesión.", 401);
  }

  if (!process.env.OPENAI_API_KEY) {
    return errorResponse(
      "Planificador Físico no tiene configurada la clave de inteligencia artificial.",
      503,
    );
  }

  const supabase = await createClient();

  if (!supabase) {
    return errorResponse(
      "El servicio de datos no está disponible temporalmente.",
      503,
    );
  }

  let parsedBody: unknown;

  try {
    const rawBody = await request.text();

    if (rawBody.length > MAX_REQUEST_SIZE) {
      return errorResponse(
        "La solicitud supera el tamaño permitido.",
        413,
      );
    }

    parsedBody = JSON.parse(rawBody);
  } catch {
    return errorResponse(
      "La solicitud contiene información no válida.",
      400,
    );
  }

  if (!isValidPhysicalPlannerFormData(parsedBody)) {
    return errorResponse(
      "Los datos de la sesión están incompletos o no son válidos.",
      400,
    );
  }

  const formData = parsedBody;
  const freeDurations = new Set([30, 45, 60]);

  if (
    !access.hasProAccess &&
    !freeDurations.has(formData.durationMinutes)
  ) {
    return errorResponse(
      "El Plan Free permite sesiones de 30, 45 o 60 minutos. El Plan Pro permite una duración personalizada.",
      403,
      "physical_planner_custom_duration_pro",
    );
  }

  let reservationActive = false;

  try {
    const { data: reservationData, error: reservationError } =
      await supabase.rpc(
        "consume_physical_planner_run",
        {
          p_context: formData.context,
        },
      );

    if (reservationError) {
      console.error(
        "[Planificador Físico] No se pudo reservar la ejecución.",
        reservationError.code,
      );

      return errorResponse(
        "No fue posible comprobar tu límite mensual. Intenta nuevamente.",
        503,
      );
    }

    const reservation =
      (reservationData ?? {}) as UsageRpcResult;

    if (reservation.allowed !== true) {
      if (reservation.reason === "free_sport_limit") {
        return errorResponse(
          "El Plan Free permite una sesión mensual de preparación deportiva. Puedes continuar con Educación Física o activar el Plan Pro.",
          429,
          "physical_planner_free_sport_limit",
        );
      }

      return errorResponse(
        reservation.tier === "pro"
          ? "Alcanzaste el límite mensual de 40 sesiones del Plan Pro."
          : "Ya utilizaste tus 2 sesiones gratuitas de este mes. Activa el Plan Pro para continuar.",
        429,
        "physical_planner_monthly_limit",
      );
    }

    reservationActive = true;

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
      const aiResponse = await client.responses.create({
        model: process.env.OPENAI_MODEL ?? "gpt-5-mini",
        store: false,
        instructions: PHYSICAL_PLANNER_INSTRUCTIONS,
        input: buildPhysicalPlanPrompt(
          formData,
          attempt > 1
            ? lastValidationMessage
            : undefined,
        ),
        text: {
          format: {
            type: "json_schema",
            name: "physical_plan",
            strict: true,
            schema: physicalPlanSchema,
          },
        },
      });

      if (!aiResponse.output_text) {
        lastValidationMessage =
          "La inteligencia artificial no produjo contenido.";
        continue;
      }

      let generatedPlan: unknown;

      try {
        generatedPlan = JSON.parse(aiResponse.output_text);

        generatedPlan =
          sanitizePhysicalPlanTerminology(
            generatedPlan,
          );
      } catch {
        lastValidationMessage =
          "La respuesta generada no pudo procesarse.";
        continue;
      }

      if (!isGeneratedPhysicalPlan(generatedPlan)) {
        lastValidationMessage =
          "La respuesta no cumple la estructura requerida.";
        continue;
      }

      const validation = validatePhysicalPlan(
        formData,
        generatedPlan,
      );

      if (!validation.valid) {
        lastValidationMessage =
          validation.message ??
          "La sesión no cumple las condiciones requeridas.";

        console.warn(
          `[Planificador Físico] Intento ${attempt}: ${lastValidationMessage}`,
        );
        continue;
      }

      const { data: savedData, error: savedError } =
        await supabase.rpc(
          "save_physical_planner_session",
          {
            p_context: formData.context,
            p_title: generatedPlan.title,
            p_form_data: formData,
            p_result_data: generatedPlan,
          },
        );

      if (savedError) {
        console.error(
          "[Planificador Físico] No se pudo guardar la sesión.",
          savedError.code,
        );

        await releaseReservation(
          access.userId,
          formData.context,
        );
        reservationActive = false;

        return errorResponse(
          "La sesión fue generada, pero no pudo guardarse de forma segura. Intenta nuevamente.",
          500,
        );
      }

      const savedSession = Array.isArray(savedData)
        ? savedData[0]
        : savedData;

      await recordCurrentUserActivity({
        type: "physical-planner",
        title: generatedPlan.title,
        description:
          `${formData.activityOrSport} · ${formData.group}`,
        href: "/planificador-fisico",
      });

      reservationActive = false;

      return NextResponse.json(
        {
          success: true,
          data: generatedPlan,
          usage: usageFromRpc(reservation),
          savedSessionId:
            savedSession &&
            typeof savedSession === "object" &&
            "id" in savedSession
              ? savedSession.id
              : null,
        },
        {
          headers: {
            "Cache-Control": "no-store",
          },
        },
      );
    }

    await releaseReservation(
      access.userId,
      formData.context,
    );
    reservationActive = false;

    console.error(
      "[Planificador Físico] Validación agotada:",
      lastValidationMessage,
    );

    return errorResponse(
      "No fue posible producir una sesión completamente coherente. Intenta nuevamente.",
      502,
    );
  } catch (error) {
    if (reservationActive) {
      await releaseReservation(
        access.userId,
        formData.context,
      );
    }

    console.error(
      "========== ERROR PLANIFICADOR FÍSICO ==========",
    );
    console.error(error);

    if (error instanceof OpenAI.APIError) {
      if (error.status === 401) {
        return errorResponse(
          "La clave configurada no es válida.",
          503,
        );
      }

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

    return errorResponse(
      "Ocurrió un error inesperado al generar la sesión.",
      500,
    );
  }
}