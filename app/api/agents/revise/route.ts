import type { SupabaseClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";

import { runTeacherRevision } from "@/features/agents/server/agents";
import { getAuthenticatedApiAccess } from "@/features/auth/server/apiAccess";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";

export const runtime = "nodejs";

const MAX_CONTENT_LENGTH = 20_000;
const MAX_INSTRUCTION_LENGTH = 2_000;
const MAX_SECTION_LENGTH = 120;

type RevisionMode = "full" | "section";
type AgentFeature =
  | "general"
  | "planning"
  | "assessment"
  | "inclusion"
  | "training_session"
  | "microcycle"
  | "mesocycle"
  | "macrocycle";

function normalized(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();
}

function classifyAgentFeature(value: string): AgentFeature {
  const text = normalized(value);

  if (/\bmacrociclo\b/.test(text)) return "macrocycle";
  if (/\bmesociclo\b/.test(text)) return "mesocycle";
  if (/\bmicrociclo\b/.test(text)) return "microcycle";
  if (/\b(?:dua|nee|inclusion|inclusiv|adaptacion)\b/.test(text)) {
    return "inclusion";
  }
  if (/\b(?:rubrica|evaluacion|examen|lista\s+de\s+cotejo)\b/.test(text)) {
    return "assessment";
  }
  if (/\b(?:sesion\s+de\s+entrenamiento|entrenamiento\s+deportivo)\b/.test(text)) {
    return "training_session";
  }
  if (/\b(?:clase|planificacion|metodologia)\b/.test(text)) {
    return "planning";
  }

  return "general";
}

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

async function releaseConsumedRun(
  userClient: SupabaseClient,
  userId: string,
  feature: AgentFeature,
) {
  const admin = createAdminClient();

  if (admin) {
    const { error } = await admin.rpc(
      "release_agent_feature_run_for_user",
      {
        p_feature_key: feature,
        p_user_id: userId,
      },
    );

    if (!error) return;

    if (!["42883", "PGRST202"].includes(error.code)) {
      throw new Error(`secure_usage_release_failed:${error.code}`);
    }
  }

  const { error } = await userClient.rpc(
    "release_agent_feature_run",
    {
      p_feature_key: feature,
    },
  );

  if (error) {
    throw new Error(`legacy_usage_release_failed:${error.code}`);
  }
}

function normalizedSectionLine(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/^#{1,6}\s*/, "")
    .replace(/^[-*]\s*/, "")
    .replace(/^\d+[\).]\s*/, "")
    .replace(/[:.]+$/, "")
    .trim();
}

function isKnownSectionHeading(line: string) {
  const value = normalizedSectionLine(line);

  return /^(?:resumen|datos generales|objetivo|organizacion|inicio|desarrollo|cierre|evaluacion|seguridad|normas|dua|adaptaciones|apoyos nee|variaciones|rubrica|registro|implementacion|revision del docente|revision del entrenador|decision final|carga|recuperacion|sesion|semana|periodo)\b/.test(
    value,
  );
}

function findSectionStartIndex(document: string, section: string) {
  const lines = document.split("\n");
  const target = normalizedSectionLine(section);

  const exactIndex = lines.findIndex((line) => {
    const value = normalizedSectionLine(line);
    return value === target || value.startsWith(`${target} `);
  });

  if (exactIndex >= 0) return exactIndex;

  const aliases: Array<[RegExp, RegExp]> = [
    [/\bseguridad\b/, /^(?:seguridad|medidas de seguridad|normas de seguridad)/],
    [/\bdua\b|\badaptaciones?\b/, /^(?:dua|adaptaciones? dua|adaptaciones?)/],
    [/\brubrica\b/, /^(?:rubrica|instrumento de evaluacion)/],
    [/\bevaluacion\b/, /^(?:evaluacion|evaluacion formativa|evaluacion sumativa)/],
    [/\binicio\b|\bcalentamiento\b/, /^(?:inicio|calentamiento)/],
    [/\bdesarrollo\b|\bparte principal\b/, /^(?:desarrollo|parte principal|trabajo principal)/],
    [/\bcierre\b|\bvuelta a la calma\b/, /^(?:cierre|vuelta a la calma)/],
    [/\bnee\b|\bapoyos\b/, /^(?:nee|apoyos nee|apoyos concretos)/],
  ];

  const alias = aliases.find(([targetPattern]) =>
    targetPattern.test(target)
  );

  if (!alias) return -1;

  return lines.findIndex((line) => {
    const trimmed = line.trim();
    const value = normalizedSectionLine(line);

    if (!trimmed || trimmed.includes("|")) return false;

    return alias[1].test(value);
  });
}

function replaceDocumentSection(
  document: string,
  section: string,
  replacement: string,
) {
  const lines = document.split("\n");
  const startIndex = findSectionStartIndex(document, section);

  if (startIndex < 0) return null;

  let endIndex = lines.length;

  for (let index = startIndex + 1; index < lines.length; index += 1) {
    const line = lines[index].trim();

    if (!line) continue;

    if (/^#{1,6}\s+\S/.test(line) || isKnownSectionHeading(line)) {
      endIndex = index;
      break;
    }
  }

  const originalHeading = lines[startIndex];
  const replacementLines = replacement
    .replace(/^\[\[RESULTADO\]\]\s*/i, "")
    .replace(
      /^\s*---\s*(?:INICIO|FIN)\s+DEL\s+DOCUMENTO\s*---\s*$/gim,
      "",
    )
    .trim()
    .split("\n");

  const firstReplacementLine = replacementLines[0] ?? "";
  const replacementStartsWithHeading =
    normalizedSectionLine(firstReplacementLine) ===
      normalizedSectionLine(originalHeading)
    || normalizedSectionLine(firstReplacementLine) ===
      normalizedSectionLine(section)
    || isKnownSectionHeading(firstReplacementLine);

  const safeReplacement = replacementStartsWithHeading
    ? [originalHeading, ...replacementLines.slice(1)]
    : [originalHeading, ...replacementLines];

  return [
    ...lines.slice(0, startIndex),
    ...safeReplacement,
    ...lines.slice(endIndex),
  ].join("\n").trim();
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
    messageId?: unknown;
    content?: unknown;
    instruction?: unknown;
    mode?: unknown;
    section?: unknown;
  };

  try {
    body = await request.json();
  } catch {
    return response("Solicitud no válida.", 400);
  }

  const messageId =
    typeof body.messageId === "string" ? body.messageId.trim() : "";
  const content =
    typeof body.content === "string" ? body.content.trim() : "";
  const instruction =
    typeof body.instruction === "string" ? body.instruction.trim() : "";
  const mode: RevisionMode =
    body.mode === "section" ? "section" : "full";
  const section =
    typeof body.section === "string" ? body.section.trim() : "";

  if (!messageId) {
    return response("Falta el resultado que deseas corregir.", 400);
  }

  if (content.length < 1 || content.length > MAX_CONTENT_LENGTH) {
    return response(
      "El documento debe contener entre 1 y 20000 caracteres.",
      400,
    );
  }

  if (
    instruction.length < 2
    || instruction.length > MAX_INSTRUCTION_LENGTH
  ) {
    return response(
      "Describe la corrección usando entre 2 y 2000 caracteres.",
      400,
    );
  }

  if (
    mode === "section"
    && (section.length < 2 || section.length > MAX_SECTION_LENGTH)
  ) {
    return response(
      "Indica una sección de entre 2 y 120 caracteres.",
      400,
    );
  }

  const { data: sourceMessage } = await supabase
    .from("ai_agent_messages")
    .select("id,conversation_id")
    .eq("id", messageId)
    .eq("user_id", access.userId)
    .eq("role", "assistant")
    .eq("response_kind", "result")
    .maybeSingle();

  if (!sourceMessage) {
    return response(
      "El resultado no existe o no está disponible.",
      404,
    );
  }

  if (!access.hasProAccess) {
    const { count } = await supabase
      .from("ai_agent_messages")
      .select("id", { count: "exact", head: true })
      .eq("conversation_id", sourceMessage.conversation_id)
      .eq("user_id", access.userId)
      .eq("role", "assistant")
      .eq("response_kind", "result");

    if ((count ?? 0) >= 2) {
      return response(
        "El Plan Free permite una corrección por resultado. Activa Pro para continuar revisándolo.",
        403,
        {
          code: "agents_correction_limit",
          upgradeUrl: "/store/plan-pro-mensual",
        },
      );
    }
  }

  if (
    mode === "section"
    && findSectionStartIndex(content, section) < 0
  ) {
    return response(
      "No encontramos esa sección en el documento. Escribe el encabezado tal como aparece en el resultado.",
      400,
      { code: "agents_section_not_found" },
    );
  }

  const feature = classifyAgentFeature(content);
  if (
    !access.hasProAccess
    && (feature === "mesocycle" || feature === "macrocycle")
  ) {
    return response(
      "Los mesociclos y macrociclos están disponibles con el Plan Pro.",
      403,
      {
        code: "agents_pro_required",
        upgradeUrl: "/store/plan-pro-mensual",
      },
    );
  }

  const { data: usage, error: usageError } = await supabase.rpc(
    "consume_agent_feature_run",
    { p_feature_key: feature },
  );

  if (usageError) {
    return response("No se pudo comprobar el límite de uso.", 500);
  }

  if (usage?.allowed !== true) {
    if (usage?.reason === "microcycle_limit") {
      return response(
        "El Plan Free incluye un microciclo de prueba al mes.",
        403,
        {
          code: "agents_microcycle_limit",
          upgradeUrl: "/store/plan-pro-mensual",
          remaining: usage?.remaining ?? null,
        },
      );
    }

    if (usage?.reason === "pro_required") {
      return response(
        "Esta función está disponible con el Plan Pro.",
        403,
        {
          code: "agents_pro_required",
          upgradeUrl: "/store/plan-pro-mensual",
        },
      );
    }

    return response(
      "Alcanzaste el límite mensual del Centro de Agentes IA.",
      429,
      {
        remaining: 0,
        limit: usage?.limit ?? null,
      },
    );
  }

  let usageReleased = false;
  let createdUserMessageId: string | null = null;

  try {
    const requestDescription = mode === "section"
      ? `Corrige únicamente la sección "${section}": ${instruction}`
      : `Revisa el documento completo: ${instruction}`;

    const { data: userMessage, error: userError } = await supabase
      .from("ai_agent_messages")
      .insert({
        conversation_id: sourceMessage.conversation_id,
        user_id: access.userId,
        role: "user",
        content: requestDescription,
      })
      .select("*")
      .single();

    if (userError) {
      throw new Error("revision_user_message_failed");
    }

    createdUserMessageId = userMessage.id;

    const generated = await runTeacherRevision({
      content,
      instruction,
      mode,
      section: mode === "section" ? section : null,
    });

    const revisedContent = mode === "section"
      ? replaceDocumentSection(content, section, generated.output)
      : generated.output;

    if (!revisedContent) {
      throw new Error("revision_section_not_found");
    }

    const { data: assistantMessage, error: assistantError } =
      await supabase
        .from("ai_agent_messages")
        .insert({
          conversation_id: sourceMessage.conversation_id,
          user_id: access.userId,
          role: "assistant",
          content: revisedContent,
          specialist: generated.specialist,
          response_kind: generated.responseKind,
        })
        .select("*")
        .single();

    if (assistantError) {
      throw new Error("revision_assistant_message_failed");
    }

    await supabase
      .from("ai_agent_conversations")
      .update({ last_specialist: generated.specialist })
      .eq("id", sourceMessage.conversation_id)
      .eq("user_id", access.userId);

    return response("Corrección generada correctamente.", 200, {
      conversationId: sourceMessage.conversation_id,
      userMessage,
      assistantMessage,
      remaining: usage?.remaining ?? null,
      limit: usage?.limit ?? null,
      feature,
    });
  } catch (error) {
    console.error(
      "[Agentes IA] No se pudo completar la corrección.",
      error,
    );

    if (createdUserMessageId) {
      await supabase
        .from("ai_agent_messages")
        .delete()
        .eq("id", createdUserMessageId)
        .eq("user_id", access.userId)
        .eq("role", "user");
    }

    if (!usageReleased) {
      await releaseConsumedRun(
        supabase,
        access.userId,
        feature,
      ).catch((releaseError) => {
        console.error(
          "[Agentes IA] No se pudo devolver la ejecución.",
          releaseError,
        );
      });
      usageReleased = true;
    }

    return response(
      "No se pudo completar la corrección. Inténtalo nuevamente.",
      500,
    );
  }
}