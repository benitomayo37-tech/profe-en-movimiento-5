import "server-only";

import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import type { AuthAccess } from "@/features/auth/types";

export const FREE_MONTHLY_GENERATION_LIMIT = 3;

export type FreeGenerationFeature =
  | "lesson-plan"
  | "training-session";

interface UsageRpcResult {
  allowed?: boolean;
  remaining?: number;
  used?: number;
  limit?: number;
  unlimited?: boolean;
}

export interface FreeUsageReservation {
  allowed: boolean;
  reserved: boolean;
  remaining: number | null;
  message?: string;
}

function featureLabel(feature: FreeGenerationFeature) {
  return feature === "lesson-plan"
    ? "planificaciones"
    : "sesiones de entrenamiento";
}

export async function reserveFreeGeneration(
  access: AuthAccess,
  feature: FreeGenerationFeature,
): Promise<FreeUsageReservation> {
  if (access.hasProAccess) {
    return { allowed: true, reserved: false, remaining: null };
  }

  if (!access.userId) {
    return {
      allowed: false,
      reserved: false,
      remaining: null,
      message: "Debes iniciar sesión para utilizar esta herramienta.",
    };
  }

  const supabase = await createClient();

  if (!supabase) {
    return {
      allowed: false,
      reserved: false,
      remaining: null,
      message: "El control de uso Free no está disponible temporalmente.",
    };
  }

  const { data, error } = await supabase.rpc(
    "consume_free_generation",
    {
      p_feature: feature,
      p_limit: FREE_MONTHLY_GENERATION_LIMIT,
    },
  );

  if (error) {
    console.error("[Acceso Free] No se pudo reservar una generación:", error.message);
    return {
      allowed: false,
      reserved: false,
      remaining: null,
      message:
        "No fue posible comprobar tu límite mensual. Intenta nuevamente en unos minutos.",
    };
  }

  const result = (data ?? {}) as UsageRpcResult;
  const allowed = result.allowed === true;

  if (!allowed) {
    return {
      allowed: false,
      reserved: false,
      remaining: 0,
      message: `Ya utilizaste tus ${FREE_MONTHLY_GENERATION_LIMIT} ${featureLabel(feature)} gratuitas de este mes. Activa el Plan Pro para continuar sin este límite.`,
    };
  }

  return {
    allowed: true,
    reserved: result.unlimited !== true,
    remaining:
      typeof result.remaining === "number"
        ? Math.max(0, result.remaining)
        : null,
  };
}

export async function releaseFreeGeneration(
  access: AuthAccess,
  feature: FreeGenerationFeature,
) {
  if (!access.userId || access.hasProAccess) return;

  const supabase = createAdminClient();
  if (!supabase) {
    console.error("[Acceso Free] No se pudo liberar la generación: falta el cliente administrativo.");
    return;
  }

  const { error } = await supabase.rpc("release_free_generation", {
    p_user_id: access.userId,
    p_feature: feature,
  });

  if (error) {
    console.error("[Acceso Free] No se pudo liberar la generación:", error.message);
  }
}
