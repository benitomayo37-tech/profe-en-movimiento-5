import "server-only";

import { createAdminClient } from "@/lib/supabase/admin";

type SequenceKey = "welcome" | "agents_1d" | "academy_3d" | "pro_7d";

const SITE_URL = "https://profe-en-movimiento-5.vercel.app";

const DAY_MS = 86_400_000;

function escapeHtml(value: string) {
  return value.replace(/[&<>'"]/g, (character) => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    "'": "&#39;",
    '"': "&quot;",
  })[character] ?? character);
}

function firstName(fullName: string) {
  return fullName.trim().split(/\s+/)[0] || "profe";
}

function emailTemplate(sequence: SequenceKey, name: string, downloadToken: string, unsubscribeToken: string) {
  const safeName = escapeHtml(firstName(name));
  const unsubscribeUrl = `${SITE_URL}/correo/cancelar/${unsubscribeToken}`;
  const common = {
    welcome: {
      subject: "Tu kit de clase ya está listo",
      heading: "Tu clase de 45 minutos está lista",
      body: `Hola ${safeName}, gracias por solicitar el kit de Profe en Movimiento. Conserva esta planificación como punto de partida y adáptala cuando lo necesites.`,
      action: "Descargar el kit en PDF",
      href: `${SITE_URL}/api/funnel/download/${downloadToken}`,
    },
    agents_1d: {
      subject: "Adapta el kit a tu curso con Agentes IA",
      heading: "Ahora conviértelo en una clase hecha para ti",
      body: `Hola ${safeName}, indica el curso, el número de estudiantes, los materiales y tu objetivo. El Coordinador Docente te ayudará a crear una versión ajustada a tu realidad.`,
      action: "Abrir Agentes IA",
      href: `${SITE_URL}/agentes`,
    },
    academy_3d: {
      subject: "Da el siguiente paso en la Academia",
      heading: "Formación práctica para aplicar en clase",
      body: `Hola ${safeName}, el curso piloto de Academia te ayudará a distinguir metodologías activas, modelos pedagógicos y estrategias organizativas con ejemplos aplicables.`,
      action: "Iniciar el curso piloto",
      href: `${SITE_URL}/academia`,
    },
    pro_7d: {
      subject: "Sigue creando con Profe en Movimiento",
      heading: "Todo tu trabajo docente en un solo lugar",
      body: `Hola ${safeName}, ya conoces una parte de la plataforma. El Plan Pro amplía tus ejecuciones y reúne herramientas para planificar, evaluar, incluir y organizar tus clases.`,
      action: "Conocer el Plan Pro",
      href: `${SITE_URL}/cuenta`,
    },
  }[sequence];

  const htmlContent = `<!doctype html><html lang="es"><body style="margin:0;background:#f1f5f9;font-family:Arial,sans-serif;color:#0f172a"><div style="max-width:620px;margin:0 auto;padding:28px 16px"><div style="background:#0f1f33;border-radius:24px;padding:32px;color:#fff"><p style="margin:0 0 10px;color:#fb923c;font-size:12px;font-weight:700;letter-spacing:1.5px;text-transform:uppercase">Profe en Movimiento</p><h1 style="margin:0;font-size:28px;line-height:1.2">${common.heading}</h1><p style="margin:18px 0 0;color:#dbeafe;font-size:16px;line-height:1.7">${common.body}</p><a href="${common.href}" style="display:block;margin-top:24px;padding:14px 20px;border-radius:12px;background:#f97316;color:#fff;text-align:center;text-decoration:none;font-weight:700">${common.action} →</a></div><div style="padding:22px 12px;text-align:center;color:#64748b;font-size:12px;line-height:1.6"><p>Profe en Movimiento · Quito, Ecuador</p><p>Recibes este mensaje porque solicitaste el kit gratuito y autorizaste contenidos relacionados.</p><a href="${unsubscribeUrl}" style="color:#475569">Dejar de recibir estos correos</a></div></div></body></html>`;
  const textContent = `${common.heading}\n\n${common.body.replace(/<[^>]+>/g, "")}\n\n${common.action}: ${common.href}\n\nDejar de recibir estos correos: ${unsubscribeUrl}`;
  return { subject: common.subject, htmlContent, textContent };
}

export async function enqueueLeadEmailSequence(leadId: string) {
  const admin = createAdminClient();
  if (!admin) return;
  const now = Date.now();
  const rows: Array<{ lead_id: string; sequence_key: SequenceKey; scheduled_for: string }> = [
    // Un margen breve evita que una diferencia de reloj entre Vercel y Supabase
    // haga que el correo inmediato parezca estar programado en el futuro.
    { lead_id: leadId, sequence_key: "welcome", scheduled_for: new Date(now - 60_000).toISOString() },
    { lead_id: leadId, sequence_key: "agents_1d", scheduled_for: new Date(now + DAY_MS).toISOString() },
    { lead_id: leadId, sequence_key: "academy_3d", scheduled_for: new Date(now + 3 * DAY_MS).toISOString() },
    { lead_id: leadId, sequence_key: "pro_7d", scheduled_for: new Date(now + 7 * DAY_MS).toISOString() },
  ];
  const { error } = await admin.from("marketing_email_deliveries").upsert(rows, { onConflict: "lead_id,sequence_key", ignoreDuplicates: true });
  if (error) console.error("[Embudo] No se pudo programar la secuencia de correo.", error);
}

async function markDelivery(id: string, values: Record<string, string | null>) {
  const admin = createAdminClient();
  if (!admin) return;
  await admin.from("marketing_email_deliveries").update({ ...values, updated_at: new Date().toISOString() }).eq("id", id);
}

export async function processDueMarketingEmails(limit = 25) {
  const admin = createAdminClient();
  const apiKey = process.env.BREVO_API_KEY?.trim();
  const senderEmail = process.env.BREVO_SENDER_EMAIL?.trim();
  if (!admin || !apiKey || !senderEmail) return { processed: 0, sent: 0, skipped: 0, failed: 0 };

  const { data: claims, error: claimError } = await admin.rpc("claim_due_marketing_emails", { p_limit: limit });
  if (claimError) throw new Error(claimError.message);
  const ids = (claims ?? []).map((item: { delivery_id: string }) => item.delivery_id);
  if (!ids.length) return { processed: 0, sent: 0, skipped: 0, failed: 0 };

  let sent = 0;
  let skipped = 0;
  let failed = 0;

  for (const id of ids) {
    const { data: delivery, error } = await admin
      .from("marketing_email_deliveries")
      .select("id,sequence_key,lead_id,marketing_leads(full_name,email,download_token,unsubscribe_token,unsubscribed_at,converted_user_id)")
      .eq("id", id)
      .single();
    if (error || !delivery) {
      failed += 1;
      await markDelivery(id, { status: "failed", last_error: error?.message ?? "delivery_not_found" });
      continue;
    }

    const leadValue = delivery.marketing_leads;
    const lead = (Array.isArray(leadValue) ? leadValue[0] : leadValue) as { full_name: string; email: string; download_token: string; unsubscribe_token: string; unsubscribed_at: string | null; converted_user_id: string | null } | null;
    if (!lead || lead.unsubscribed_at) {
      skipped += 1;
      await markDelivery(id, { status: "skipped", last_error: lead ? "unsubscribed" : "lead_not_found" });
      continue;
    }

    if (lead.converted_user_id && delivery.sequence_key !== "welcome") {
      const [{ data: activation }, { data: profile }] = await Promise.all([
        admin.from("lead_activation_progress").select("agents_first_run_at,academy_started_at").eq("user_id", lead.converted_user_id).maybeSingle(),
        admin.from("profiles").select("plan,role").eq("id", lead.converted_user_id).maybeSingle(),
      ]);
      const alreadyCompleted = (delivery.sequence_key === "agents_1d" && activation?.agents_first_run_at)
        || (delivery.sequence_key === "academy_3d" && activation?.academy_started_at)
        || (delivery.sequence_key === "pro_7d" && (profile?.plan === "pro" || profile?.role === "admin"));
      if (alreadyCompleted) {
        skipped += 1;
        await markDelivery(id, { status: "skipped", last_error: "goal_already_completed" });
        continue;
      }
    }

    const content = emailTemplate(delivery.sequence_key as SequenceKey, lead.full_name, lead.download_token, lead.unsubscribe_token);
    try {
      const response = await fetch("https://api.brevo.com/v3/smtp/email", {
        method: "POST",
        headers: { "api-key": apiKey, "content-type": "application/json", accept: "application/json" },
        body: JSON.stringify({ sender: { name: "Profe en Movimiento", email: senderEmail }, to: [{ email: lead.email, name: lead.full_name }], ...content }),
      });
      const result = await response.json() as { messageId?: string; message?: string };
      if (!response.ok || !result.messageId) throw new Error(result.message ?? `brevo_${response.status}`);
      sent += 1;
      await markDelivery(id, { status: "sent", sent_at: new Date().toISOString(), provider_message_id: result.messageId, last_error: null });
    } catch (sendError) {
      failed += 1;
      await markDelivery(id, { status: "failed", last_error: sendError instanceof Error ? sendError.message.slice(0, 500) : "send_failed" });
    }
  }

  return { processed: ids.length, sent, skipped, failed };
}
