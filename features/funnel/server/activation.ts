import "server-only";

import { createAdminClient } from "@/lib/supabase/admin";

export interface LeadActivationJourney {
  downloadUrl: string;
  completedSteps: number;
  totalSteps: 3;
  completed: boolean;
  steps: {
    kit: boolean;
    agents: boolean;
    academy: boolean;
  };
}

export async function getLeadActivationJourney(userId: string | null): Promise<LeadActivationJourney | null> {
  if (!userId) return null;
  const admin = createAdminClient();
  if (!admin) return null;

  const { data: lead, error: leadError } = await admin
    .from("marketing_leads")
    .select("id,download_token,downloaded_at")
    .eq("converted_user_id", userId)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (leadError) throw new Error(leadError.message);
  if (!lead) return null;

  const [agentResult, academyResult, existingResult] = await Promise.all([
    admin.from("ai_agent_messages").select("created_at").eq("user_id", userId).eq("role", "user").order("created_at", { ascending: true }).limit(1).maybeSingle(),
    admin.from("academy_progress").select("created_at").eq("user_id", userId).order("created_at", { ascending: true }).limit(1).maybeSingle(),
    admin.from("lead_activation_progress").select("kit_downloaded_at,agents_first_run_at,academy_started_at,completed_at").eq("user_id", userId).maybeSingle(),
  ]);

  for (const result of [agentResult, academyResult, existingResult]) {
    if (result.error) throw new Error(result.error.message);
  }

  const kitDownloadedAt = lead.downloaded_at ?? existingResult.data?.kit_downloaded_at ?? null;
  const agentsFirstRunAt = agentResult.data?.created_at ?? existingResult.data?.agents_first_run_at ?? null;
  const academyStartedAt = academyResult.data?.created_at ?? existingResult.data?.academy_started_at ?? null;
  const completedAt = kitDownloadedAt && agentsFirstRunAt && academyStartedAt
    ? existingResult.data?.completed_at ?? new Date().toISOString()
    : null;

  const { error: syncError } = await admin.from("lead_activation_progress").upsert({
    user_id: userId,
    lead_id: lead.id,
    kit_downloaded_at: kitDownloadedAt,
    agents_first_run_at: agentsFirstRunAt,
    academy_started_at: academyStartedAt,
    completed_at: completedAt,
    updated_at: new Date().toISOString(),
  }, { onConflict: "user_id" });
  if (syncError) throw new Error(syncError.message);

  const steps = {
    kit: Boolean(kitDownloadedAt),
    agents: Boolean(agentsFirstRunAt),
    academy: Boolean(academyStartedAt),
  };
  const completedSteps = Object.values(steps).filter(Boolean).length;

  return {
    downloadUrl: `/api/funnel/download/${lead.download_token}`,
    completedSteps,
    totalSteps: 3,
    completed: completedSteps === 3,
    steps,
  };
}
