import { NextResponse } from "next/server";

import { getAuthenticatedApiAccess } from "@/features/auth/server/apiAccess";
import { createClient } from "@/lib/supabase/server";

const MAX_CONTENT_LENGTH = 20_000;

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

export async function GET(request: Request) {
  const accessResult = await getAuthenticatedApiAccess("Agentes IA");
  if (accessResult.error) return accessResult.error;

  const access = accessResult.access;
  if (!access.userId) {
    return response("Debes iniciar sesión.", 401);
  }

  const supabase = await createClient();
  if (!supabase) {
    return response("Supabase no está configurado.", 503);
  }

  const messageId = new URL(request.url).searchParams.get("id")?.trim() ?? "";
  if (!messageId) {
    return response("Falta el resultado que deseas consultar.", 400);
  }

  const { data: message } = await supabase
    .from("ai_agent_messages")
    .select("id")
    .eq("id", messageId)
    .eq("user_id", access.userId)
    .eq("role", "assistant")
    .eq("response_kind", "result")
    .maybeSingle();

  if (!message) {
    return response("El resultado no existe o no está disponible.", 404);
  }

  const { data: versions, error } = await supabase
    .from("ai_agent_result_versions")
    .select("id,message_id,version_number,content,created_at")
    .eq("message_id", messageId)
    .eq("user_id", access.userId)
    .order("version_number", { ascending: false });

  if (error) {
    console.error(
      "[Agentes IA] No se pudieron consultar las versiones.",
      error.code,
    );
    return response("No se pudieron consultar las versiones.", 500);
  }

  return response("Versiones recuperadas.", 200, {
    versions: versions ?? [],
  });
}

export async function POST(request: Request) {
  const accessResult = await getAuthenticatedApiAccess("Agentes IA");
  if (accessResult.error) return accessResult.error;

  const access = accessResult.access;
  if (!access.userId) {
    return response("Debes iniciar sesión.", 401);
  }

  const supabase = await createClient();
  if (!supabase) {
    return response("Supabase no está configurado.", 503);
  }

  let body: {
    id?: unknown;
    content?: unknown;
  };

  try {
    body = await request.json();
  } catch {
    return response("Solicitud no válida.", 400);
  }

  const messageId = typeof body.id === "string" ? body.id.trim() : "";
  let content = typeof body.content === "string" ? body.content.trim() : "";

  if (!messageId) {
    return response("Falta el resultado que deseas guardar.", 400);
  }

  const { data: message } = await supabase
    .from("ai_agent_messages")
    .select("id,content")
    .eq("id", messageId)
    .eq("user_id", access.userId)
    .eq("role", "assistant")
    .eq("response_kind", "result")
    .maybeSingle();

  if (!message) {
    return response("El resultado no existe o no está disponible.", 404);
  }

  // Mantiene compatibilidad con el botón de guardado de la Fase 1.
  if (!content) {
    content = message.content;
  }

  if (content.length < 1 || content.length > MAX_CONTENT_LENGTH) {
    return response(
      "El resultado debe contener entre 1 y 20000 caracteres.",
      400,
    );
  }

  const { data, error } = await supabase.rpc(
    "save_agent_result_version",
    {
      p_message_id: messageId,
      p_content: content,
    },
  );

  if (error) {
    console.error(
      "[Agentes IA] No se pudo guardar la versión.",
      error.code,
    );

    if (error.message.includes("version_limit_reached")) {
      return response(
        "Este resultado alcanzó el máximo de 10 versiones guardadas.",
        409,
        { code: "agent_version_limit" },
      );
    }

    if (error.message.includes("result_not_found")) {
      return response(
        "El resultado no existe o no está disponible.",
        404,
      );
    }

    if (error.message.includes("invalid_content_length")) {
      return response(
        "El resultado debe contener entre 1 y 20000 caracteres.",
        400,
      );
    }

    return response("No se pudo guardar la versión.", 500);
  }

  const version = Array.isArray(data) ? data[0] : data;

  if (!version) {
    return response("No se pudo recuperar la versión guardada.", 500);
  }

  return response("Versión guardada correctamente.", 200, {
    version,
    savedAt: version.created_at,
  });
}