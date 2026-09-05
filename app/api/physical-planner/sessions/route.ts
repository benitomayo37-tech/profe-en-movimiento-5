import {
  NextRequest,
  NextResponse,
} from "next/server";

import { getAuthenticatedApiAccess } from "@/features/auth/server/apiAccess";
import { createClient } from "@/lib/supabase/server";

export const runtime = "nodejs";

const UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

function response(
  message: string,
  status: number,
  extra: Record<string, unknown> = {},
) {
  return NextResponse.json(
    {
      success: status < 400,
      message,
      ...extra,
    },
    {
      status,
      headers: {
        "Cache-Control": "no-store",
      },
    },
  );
}

export async function GET(request: NextRequest) {
  const accessResult =
    await getAuthenticatedApiAccess(
      "Planificador Físico",
    );

  if (accessResult.error) {
    return accessResult.error;
  }

  const access = accessResult.access;

  if (!access.userId) {
    return response("Debes iniciar sesión.", 401);
  }

  const supabase = await createClient();

  if (!supabase) {
    return response(
      "El servicio de datos no está disponible.",
      503,
    );
  }

  const sessionId =
    request.nextUrl.searchParams.get("id")?.trim() ?? "";

  if (sessionId && !UUID_PATTERN.test(sessionId)) {
    return response(
      "La sesión solicitada no es válida.",
      400,
    );
  }

  if (sessionId) {
    const { data, error } = await supabase
      .from("physical_planner_sessions")
      .select(
        "id,context,title,form_data,result_data,created_at,updated_at",
      )
      .eq("id", sessionId)
      .eq("user_id", access.userId)
      .maybeSingle();

    if (error) {
      console.error(
        "[Planificador Físico] No se pudo recuperar la sesión.",
        error.code,
      );

      return response(
        "No se pudo recuperar la sesión.",
        500,
      );
    }

    if (!data) {
      return response(
        "La sesión no existe o no está disponible.",
        404,
      );
    }

    return response(
      "Sesión recuperada.",
      200,
      {
        session: data,
      },
    );
  }

  const historyLimit =
    access.role === "admin"
      ? 100
      : access.hasProAccess
        ? 50
        : 3;

  const { data, error } = await supabase
    .from("physical_planner_sessions")
    .select(
      "id,context,title,form_data,result_data,created_at",
    )
    .eq("user_id", access.userId)
    .order("created_at", {
      ascending: false,
    })
    .limit(historyLimit);

  if (error) {
    console.error(
      "[Planificador Físico] No se pudo consultar el historial.",
      error.code,
    );

    return response(
      "No se pudo consultar el historial.",
      500,
    );
  }

  return response(
    "Historial recuperado.",
    200,
    {
      sessions: data ?? [],
      historyLimit,
    },
  );
}

export async function DELETE(
  request: NextRequest,
) {
  const accessResult =
    await getAuthenticatedApiAccess(
      "Planificador Físico",
    );

  if (accessResult.error) {
    return accessResult.error;
  }

  const access = accessResult.access;

  if (!access.userId) {
    return response("Debes iniciar sesión.", 401);
  }

  const supabase = await createClient();

  if (!supabase) {
    return response(
      "El servicio de datos no está disponible.",
      503,
    );
  }

  let body: {
    id?: unknown;
  };

  try {
    body = await request.json();
  } catch {
    return response(
      "La solicitud no es válida.",
      400,
    );
  }

  const sessionId =
    typeof body.id === "string"
      ? body.id.trim()
      : "";

  if (!UUID_PATTERN.test(sessionId)) {
    return response(
      "La sesión que deseas eliminar no es válida.",
      400,
    );
  }

  const { data, error } = await supabase
    .from("physical_planner_sessions")
    .delete()
    .eq("id", sessionId)
    .eq("user_id", access.userId)
    .select("id")
    .maybeSingle();

  if (error) {
    console.error(
      "[Planificador Físico] No se pudo eliminar la sesión.",
      error.code,
    );

    return response(
      "No se pudo eliminar la sesión.",
      500,
    );
  }

  if (!data) {
    return response(
      "La sesión no existe o ya fue eliminada.",
      404,
    );
  }

  return response(
    "Sesión eliminada correctamente.",
    200,
    {
      deletedId: data.id,
    },
  );
}