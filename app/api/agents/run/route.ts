import { NextResponse } from "next/server";

import { runTeacherCoordinator } from "@/features/agents/server/agents";
import { getAuthenticatedApiAccess } from "@/features/auth/server/apiAccess";
import { createClient } from "@/lib/supabase/server";

export const runtime = "nodejs";
const MAX_MESSAGE_LENGTH = 6000;

function response(message: string, status: number, extra: Record<string, unknown> = {}) {
  return NextResponse.json({ success: status < 400, message, ...extra }, { status });
}

export async function POST(request: Request) {
  const accessResult = await getAuthenticatedApiAccess("Agentes IA");
  if (accessResult.error) return accessResult.error;
  const access = accessResult.access;
  if (!access.userId) return response("Debes iniciar sesión.", 401);
  const supabase = await createClient();
  if (!supabase) return response("Supabase no está configurado.", 503);

  let body: { conversationId?: unknown; message?: unknown };
  try { body = await request.json(); } catch { return response("Solicitud no válida.", 400); }
  const message = typeof body.message === "string" ? body.message.trim() : "";
  const requestedConversationId = typeof body.conversationId === "string" ? body.conversationId : null;
  if (!message || message.length > MAX_MESSAGE_LENGTH) return response("Escribe una solicitud de hasta 6000 caracteres.", 400);

  const { data: usage, error: usageError } = await supabase.rpc("consume_agent_run");
  if (usageError) return response("No se pudo comprobar el límite de uso.", 500);
  if (usage?.allowed !== true) return response("Alcanzaste el límite mensual del Centro de Agentes IA.", 429, { limit: usage?.limit ?? null, remaining: 0 });

  let conversationId = requestedConversationId;
  try {
    if (conversationId) {
      const { data: owned } = await supabase.from("ai_agent_conversations").select("id").eq("id", conversationId).eq("user_id", access.userId).maybeSingle();
      if (!owned) throw new Error("conversation_not_found");
    } else {
      const title = message.length > 76 ? `${message.slice(0, 73)}…` : message;
      const { data: created, error } = await supabase.from("ai_agent_conversations").insert({ user_id: access.userId, title }).select("id").single();
      if (error || !created) throw new Error("conversation_create_failed");
      conversationId = created.id;
    }

    const { data: history } = await supabase.from("ai_agent_messages").select("role,content").eq("conversation_id", conversationId).eq("user_id", access.userId).order("created_at", { ascending: false }).limit(12);
    const chronological = [...(history ?? [])].reverse();
    const context = chronological.length ? `Contexto reciente de esta conversación:\n${chronological.map((item) => `${item.role === "user" ? "Docente" : "Agente"}: ${item.content}`).join("\n\n")}\n\nNueva solicitud del docente:\n${message}` : message;

    const { data: userMessage, error: userError } = await supabase.from("ai_agent_messages").insert({ conversation_id: conversationId, user_id: access.userId, role: "user", content: message }).select("*").single();
    if (userError) throw new Error("user_message_failed");

    const generated = await runTeacherCoordinator(context);
    const { data: assistantMessage, error: assistantError } = await supabase.from("ai_agent_messages").insert({ conversation_id: conversationId, user_id: access.userId, role: "assistant", content: generated.output, specialist: generated.specialist }).select("*").single();
    if (assistantError) throw new Error("assistant_message_failed");
    await supabase.from("ai_agent_conversations").update({ last_specialist: generated.specialist }).eq("id", conversationId).eq("user_id", access.userId);

    return response("Respuesta generada.", 200, { conversationId, userMessage, assistantMessage, remaining: usage?.remaining ?? null, limit: usage?.limit ?? null });
  } catch (error) {
    console.error("[Agentes IA] No se pudo completar la ejecución.", error);
    await supabase.rpc("release_agent_run");
    return response("No se pudo completar la solicitud. Inténtalo nuevamente.", 500);
  }
}
