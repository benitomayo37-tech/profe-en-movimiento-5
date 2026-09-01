import { NextResponse } from "next/server";

import { runTeacherCoordinator } from "@/features/agents/server/agents";
import { getAuthenticatedApiAccess } from "@/features/auth/server/apiAccess";
import { createClient } from "@/lib/supabase/server";

export const runtime = "nodejs";
const MAX_MESSAGE_LENGTH = 6000;
type AgentFeature = "general" | "planning" | "assessment" | "inclusion" | "training_session" | "microcycle" | "mesocycle" | "macrocycle";

function normalized(value: string) {
  return value.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
}

function classifyAgentFeature(message: string): AgentFeature {
  const value = normalized(message);
  if (/\bmacrociclo\b/.test(value) || /\b(?:temporada|periodo\s+(?:preparatorio|competitivo|de\s+transicion))\b/.test(value)) return "macrocycle";
  if (/\bmesociclo\b/.test(value) || /\b(?:plan|planificacion|programa|ciclo)\b.{0,100}\bsemanas?\b/.test(value)) return "mesocycle";
  if (/\bmicrociclo\b/.test(value)) return "microcycle";
  if (/\b(?:dua|nee|inclusion|inclusiv|adaptacion)\b/.test(value)) return "inclusion";
  if (/\b(?:rubrica|evaluacion|examen|lista\s+de\s+cotejo|instrumento\s+de\s+evaluacion)\b/.test(value)) return "assessment";
  if (/\b(?:sesion\s+de\s+entrenamiento|entrenamiento\s+deportivo|entrenar)\b/.test(value)) return "training_session";
  if (/\b(?:clase|planificacion|planificar|metodologia)\b/.test(value)) return "planning";
  return "general";
}

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
  let ownedConversation: { id: string; title: string } | null = null;
  if (requestedConversationId) {
    const { data } = await supabase.from("ai_agent_conversations").select("id,title").eq("id", requestedConversationId).eq("user_id", access.userId).maybeSingle();
    if (!data) return response("La conversación no existe o no está disponible.", 404);
    ownedConversation = data;
  }
  const feature = classifyAgentFeature(`${ownedConversation?.title ?? ""}\n${message}`);
  if (!access.hasProAccess && (feature === "mesocycle" || feature === "macrocycle")) {
    return response("Los mesociclos y macrociclos están disponibles con el Plan Pro.", 403, { code: "agents_pro_required", upgradeUrl: "/store/plan-pro-mensual" });
  }

  if (!access.hasProAccess && requestedConversationId) {
    const { count } = await supabase.from("ai_agent_messages").select("id", { count: "exact", head: true }).eq("conversation_id", requestedConversationId).eq("user_id", access.userId).eq("role", "user");
    if ((count ?? 0) >= 2) return response("El Plan Free permite una corrección por resultado. Activa Pro para continuar revisándolo.", 403, { code: "agents_correction_limit", upgradeUrl: "/store/plan-pro-mensual" });
  }

  const { data: usage, error: usageError } = await supabase.rpc("consume_agent_feature_run", { p_feature_key: feature });
  if (usageError) return response("No se pudo comprobar el límite de uso.", 500);
  if (usage?.allowed !== true) {
    if (usage?.reason === "microcycle_limit") return response("El Plan Free incluye un microciclo de prueba al mes. Activa Pro para crear más.", 403, { code: "agents_microcycle_limit", upgradeUrl: "/store/plan-pro-mensual", remaining: usage?.remaining ?? null });
    if (usage?.reason === "pro_required") return response("Esta función está disponible con el Plan Pro.", 403, { code: "agents_pro_required", upgradeUrl: "/store/plan-pro-mensual", remaining: usage?.remaining ?? null });
    return response("Alcanzaste el límite mensual del Centro de Agentes IA.", 429, { limit: usage?.limit ?? null, remaining: 0 });
  }

  let conversationId = requestedConversationId;
  try {
    if (!conversationId) {
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

    return response("Respuesta generada.", 200, { conversationId, userMessage, assistantMessage, remaining: usage?.remaining ?? null, limit: usage?.limit ?? null, feature });
  } catch (error) {
    console.error("[Agentes IA] No se pudo completar la ejecución.", error);
    await supabase.rpc("release_agent_feature_run", { p_feature_key: feature });
    return response("No se pudo completar la solicitud. Inténtalo nuevamente.", 500);
  }
}
