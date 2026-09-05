import { NextResponse } from "next/server";

import { getAuthenticatedApiAccess } from "@/features/auth/server/apiAccess";
import { createClient } from "@/lib/supabase/server";

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
    { status },
  );
}

async function authenticatedClient() {
  const accessResult = await getAuthenticatedApiAccess("Agentes IA");

  if (accessResult.error) {
    return {
      error: accessResult.error,
      userId: null,
      supabase: null,
    };
  }

  if (!accessResult.access.userId) {
    return {
      error: response("Debes iniciar sesión.", 401),
      userId: null,
      supabase: null,
    };
  }

  const supabase = await createClient();

  if (!supabase) {
    return {
      error: response("Supabase no está configurado.", 503),
      userId: null,
      supabase: null,
    };
  }

  return {
    error: null,
    userId: accessResult.access.userId,
    supabase,
  };
}

export async function PATCH(request: Request) {
  const authenticated = await authenticatedClient();
  if (authenticated.error) return authenticated.error;

  let body: {
    id?: unknown;
    title?: unknown;
  };

  try {
    body = await request.json();
  } catch {
    return response("Solicitud no válida.", 400);
  }

  const id = typeof body.id === "string" ? body.id.trim() : "";
  const title =
    typeof body.title === "string"
      ? body.title.replace(/\s+/g, " ").trim()
      : "";

  if (!id) {
    return response("Falta la conversación.", 400);
  }

  if (title.length < 2 || title.length > 120) {
    return response(
      "El título debe contener entre 2 y 120 caracteres.",
      400,
    );
  }

  const { data, error } = await authenticated.supabase
    .from("ai_agent_conversations")
    .update({ title })
    .eq("id", id)
    .eq("user_id", authenticated.userId)
    .select("id,title,last_specialist,created_at,updated_at")
    .maybeSingle();

  if (error || !data) {
    return response(
      "La conversación no existe o no se pudo renombrar.",
      404,
    );
  }

  return response("Conversación renombrada.", 200, {
    conversation: data,
  });
}

export async function POST(request: Request) {
  const authenticated = await authenticatedClient();
  if (authenticated.error) return authenticated.error;

  let id = "";

  try {
    const body = await request.json();
    id = typeof body.id === "string" ? body.id.trim() : "";
  } catch {
    return response("Solicitud no válida.", 400);
  }

  if (!id) {
    return response("Falta la conversación.", 400);
  }

  const { data, error } = await authenticated.supabase.rpc(
    "duplicate_agent_conversation",
    { p_conversation_id: id },
  );

  if (error) {
    if (error.message.includes("conversation_limit_reached")) {
      return response(
        "Alcanzaste el límite de conversaciones de tu plan.",
        409,
        {
          code: "agents_conversation_limit",
          upgradeUrl: "/store/plan-pro-mensual",
        },
      );
    }

    if (error.message.includes("conversation_not_found")) {
      return response("La conversación no existe.", 404);
    }

    console.error(
      "[Agentes IA] No se pudo duplicar la conversación.",
      error.code,
    );
    return response(
      "No se pudo duplicar la conversación.",
      500,
    );
  }

  return response("Conversación duplicada.", 200, {
    conversationId: data,
  });
}

export async function DELETE(request: Request) {
  const authenticated = await authenticatedClient();
  if (authenticated.error) return authenticated.error;

  let id = "";

  try {
    const body = await request.json();
    id = typeof body.id === "string" ? body.id.trim() : "";
  } catch {
    return response("Solicitud no válida.", 400);
  }

  if (!id) {
    return response("Falta la conversación.", 400);
  }

  const { data, error } = await authenticated.supabase
    .from("ai_agent_conversations")
    .delete()
    .eq("id", id)
    .eq("user_id", authenticated.userId)
    .select("id")
    .maybeSingle();

  if (error || !data) {
    return response(
      "La conversación no existe o no se pudo eliminar.",
      404,
    );
  }

  return response("Conversación eliminada.", 200, {
    conversationId: data.id,
  });
}