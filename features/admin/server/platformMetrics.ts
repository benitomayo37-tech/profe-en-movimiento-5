import "server-only";

import { createAdminClient } from "@/lib/supabase/admin";

export interface PlatformMetrics {
  totalPeople: number;
  teacherAccounts: number;
  activeStudentAccounts: number;
  freeAccounts: number;
  proAccounts: number;
  adminAccounts: number;
  newThisMonth: number;
  activeSubscriptions: number;
  monthlySubscriptions: number;
  annualSubscriptions: number;
  uncategorizedSubscriptions: number;
  pendingRegistration: number;
  inactiveSubscriptions: number;
  agentRunsThisMonth: number;
  agentFreeRuns: number;
  agentProRuns: number;
  agentAdminRuns: number;
  activeAgentUsers: number;
  agentUsersAtLimit: number;
  agentFeatureUsage: Array<{ feature: string; runs: number }>;
  funnelLeads: number;
  funnelLeadsThisMonth: number;
  funnelConvertedLeads: number;
  funnelConversionRate: number;
  funnelKitDownloads: number;
  funnelAgentActivations: number;
  funnelAcademyActivations: number;
  funnelCompletedActivations: number;
  funnelProConversions: number;
  funnelProConversionRate: number;
  funnelEmailsSent: number;
  funnelEmailFailures: number;
  funnelUnsubscribed: number;
  funnelEmailAutomationConfigured: boolean;
  commercialProInterest: number;
  commercialCheckoutReached: number;
  commercialHotmartReached: number;
  commercialProActivated: number;
  funnelLeadJourneys: FunnelLeadJourney[];
  generatedAt: string;
}

export interface FunnelLeadJourney {
  id: string;
  fullName: string;
  email: string;
  createdAt: string;
  downloadedAt: string | null;
  convertedAt: string | null;
  accountPlan: "free" | "pro" | "admin" | null;
  agentsFirstRunAt: string | null;
  academyStartedAt: string | null;
  completedAt: string | null;
  emailsSent: number;
  unsubscribedAt: string | null;
}

const MONTHLY_OFFER_CODE = "argy2ka2";
const ANNUAL_OFFER_CODE = "1wmoonn5";

async function getCount(promise: PromiseLike<{ count: number | null; error: { message: string } | null }>) {
  const { count, error } = await promise;
  if (error) throw new Error(error.message);
  return count ?? 0;
}

export async function getPlatformMetrics(): Promise<PlatformMetrics | null> {
  const admin = createAdminClient();
  if (!admin) return null;

  const monthStart = new Date();
  monthStart.setUTCDate(1);
  monthStart.setUTCHours(0, 0, 0, 0);
  const since = monthStart.toISOString();
  const usageMonth = since.slice(0, 10);

  const [
    teacherAccounts,
    activeStudentAccounts,
    freeAccounts,
    proAccounts,
    adminAccounts,
    newTeachers,
    newStudents,
    activeSubscriptions,
    monthlySubscriptions,
    annualSubscriptions,
    pendingRegistration,
    inactiveSubscriptions,
    agentFeatureResult,
    agentUsageResult,
    funnelLeads,
    funnelLeadsThisMonth,
    funnelConvertedLeads,
    funnelKitDownloads,
    funnelAgentActivations,
    funnelAcademyActivations,
    funnelCompletedActivations,
    funnelEmailsSent,
    funnelEmailFailures,
    funnelUnsubscribed,
    commercialMetricsResult,
  ] = await Promise.all([
    getCount(admin.from("profiles").select("id", { count: "exact", head: true })),
    getCount(admin.from("student_accounts").select("id", { count: "exact", head: true }).eq("active", true)),
    getCount(admin.from("profiles").select("id", { count: "exact", head: true }).eq("plan", "free").neq("role", "admin")),
    getCount(admin.from("profiles").select("id", { count: "exact", head: true }).eq("plan", "pro")),
    getCount(admin.from("profiles").select("id", { count: "exact", head: true }).eq("role", "admin")),
    getCount(admin.from("profiles").select("id", { count: "exact", head: true }).gte("created_at", since)),
    getCount(admin.from("student_accounts").select("id", { count: "exact", head: true }).eq("active", true).gte("created_at", since)),
    getCount(admin.from("hotmart_entitlements").select("entitlement_key", { count: "exact", head: true }).eq("active", true)),
    getCount(admin.from("hotmart_entitlements").select("entitlement_key", { count: "exact", head: true }).eq("active", true).eq("offer_code", MONTHLY_OFFER_CODE)),
    getCount(admin.from("hotmart_entitlements").select("entitlement_key", { count: "exact", head: true }).eq("active", true).eq("offer_code", ANNUAL_OFFER_CODE)),
    getCount(admin.from("hotmart_entitlements").select("entitlement_key", { count: "exact", head: true }).eq("active", true).is("user_id", null)),
    getCount(admin.from("hotmart_entitlements").select("entitlement_key", { count: "exact", head: true }).eq("active", false)),
    admin.from("monthly_agent_feature_usage").select("user_id,feature_key,plan_tier,run_count").eq("usage_month", usageMonth),
    admin.from("monthly_agent_usage").select("user_id,run_count").eq("usage_month", usageMonth),
    getCount(admin.from("marketing_leads").select("id", { count: "exact", head: true })),
    getCount(admin.from("marketing_leads").select("id", { count: "exact", head: true }).gte("created_at", since)),
    getCount(admin.from("marketing_leads").select("id", { count: "exact", head: true }).not("converted_at", "is", null)),
    getCount(admin.from("marketing_leads").select("id", { count: "exact", head: true }).not("downloaded_at", "is", null)),
    getCount(admin.from("lead_activation_progress").select("user_id", { count: "exact", head: true }).not("agents_first_run_at", "is", null)),
    getCount(admin.from("lead_activation_progress").select("user_id", { count: "exact", head: true }).not("academy_started_at", "is", null)),
    getCount(admin.from("lead_activation_progress").select("user_id", { count: "exact", head: true }).not("completed_at", "is", null)),
    getCount(admin.from("marketing_email_deliveries").select("id", { count: "exact", head: true }).eq("status", "sent")),
    getCount(admin.from("marketing_email_deliveries").select("id", { count: "exact", head: true }).eq("status", "failed")),
    getCount(admin.from("marketing_leads").select("id", { count: "exact", head: true }).not("unsubscribed_at", "is", null)),
    admin.rpc("get_commercial_conversion_metrics"),
  ]);

  if (agentFeatureResult.error) throw new Error(agentFeatureResult.error.message);
  if (agentUsageResult.error) throw new Error(agentUsageResult.error.message);
  if (commercialMetricsResult.error) throw new Error(commercialMetricsResult.error.message);
  const commercialMetrics = (commercialMetricsResult.data ?? {}) as Record<string, unknown>;
  const commercialProInterest = Number(commercialMetrics.pro_interest ?? 0);
  const commercialCheckoutReached = Number(commercialMetrics.checkout_reached ?? 0);
  const commercialHotmartReached = Number(commercialMetrics.hotmart_reached ?? 0);
  const commercialProActivated = Number(commercialMetrics.pro_activated ?? 0);
  const featureRows = agentFeatureResult.data ?? [];
  const usageRows = agentUsageResult.data ?? [];
  const usageUserIds = usageRows.map((row) => row.user_id);
  const { data: usageProfiles, error: usageProfilesError } = usageUserIds.length
    ? await admin.from("profiles").select("id,plan,role").in("id", usageUserIds)
    : { data: [], error: null };
  if (usageProfilesError) throw new Error(usageProfilesError.message);
  const profileById = new Map((usageProfiles ?? []).map((profile) => [profile.id, profile]));
  const agentUsersAtLimit = usageRows.filter((row) => {
    const profile = profileById.get(row.user_id);
    const limit = profile?.role === "admin" ? 1000 : profile?.plan === "pro" ? 100 : 3;
    return row.run_count >= limit;
  }).length;
  const featureTotals = new Map<string, number>();
  for (const row of featureRows) featureTotals.set(row.feature_key, (featureTotals.get(row.feature_key) ?? 0) + row.run_count);

  const [recentLeadsResult, allConvertedLeadsResult] = await Promise.all([
    admin
      .from("marketing_leads")
      .select("id,full_name,email,created_at,downloaded_at,converted_user_id,converted_at,unsubscribed_at")
      .order("created_at", { ascending: false })
      .limit(50),
    admin.from("marketing_leads").select("converted_user_id").not("converted_user_id", "is", null),
  ]);
  if (recentLeadsResult.error) throw new Error(recentLeadsResult.error.message);
  if (allConvertedLeadsResult.error) throw new Error(allConvertedLeadsResult.error.message);
  const recentLeads = recentLeadsResult.data ?? [];

  const leadIds = (recentLeads ?? []).map((lead) => lead.id);
  const convertedUserIds = recentLeads
    .map((lead) => lead.converted_user_id)
    .filter((userId): userId is string => Boolean(userId));
  const allConvertedUserIds = (allConvertedLeadsResult.data ?? [])
    .map((lead) => lead.converted_user_id)
    .filter((userId): userId is string => Boolean(userId));
  const [activationResult, emailDeliveryResult, convertedProfilesResult, proConvertedProfilesResult] = await Promise.all([
    leadIds.length
      ? admin.from("lead_activation_progress").select("lead_id,agents_first_run_at,academy_started_at,completed_at").in("lead_id", leadIds)
      : Promise.resolve({ data: [], error: null }),
    leadIds.length
      ? admin.from("marketing_email_deliveries").select("lead_id,status").in("lead_id", leadIds).eq("status", "sent")
      : Promise.resolve({ data: [], error: null }),
    convertedUserIds.length
      ? admin.from("profiles").select("id,plan,role").in("id", convertedUserIds)
      : Promise.resolve({ data: [], error: null }),
    allConvertedUserIds.length
      ? admin.from("profiles").select("id").in("id", allConvertedUserIds).eq("plan", "pro")
      : Promise.resolve({ data: [], error: null }),
  ]);
  for (const result of [activationResult, emailDeliveryResult, convertedProfilesResult, proConvertedProfilesResult]) {
    if (result.error) throw new Error(result.error.message);
  }

  const activationByLeadId = new Map((activationResult.data ?? []).map((row) => [row.lead_id, row]));
  const sentEmailsByLeadId = new Map<string, number>();
  for (const delivery of emailDeliveryResult.data ?? []) {
    sentEmailsByLeadId.set(delivery.lead_id, (sentEmailsByLeadId.get(delivery.lead_id) ?? 0) + 1);
  }
  const profileByUserId = new Map((convertedProfilesResult.data ?? []).map((profile) => [profile.id, profile]));
  const funnelProConversions = proConvertedProfilesResult.data?.length ?? 0;
  const funnelLeadJourneys: FunnelLeadJourney[] = recentLeads.map((lead) => {
    const activation = activationByLeadId.get(lead.id);
    const profile = lead.converted_user_id ? profileByUserId.get(lead.converted_user_id) : null;
    const accountPlan = profile?.role === "admin" ? "admin" : profile?.plan === "pro" ? "pro" : lead.converted_user_id ? "free" : null;
    return {
      id: lead.id,
      fullName: lead.full_name,
      email: lead.email,
      createdAt: lead.created_at,
      downloadedAt: lead.downloaded_at,
      convertedAt: lead.converted_at,
      accountPlan,
      agentsFirstRunAt: activation?.agents_first_run_at ?? null,
      academyStartedAt: activation?.academy_started_at ?? null,
      completedAt: activation?.completed_at ?? null,
      emailsSent: sentEmailsByLeadId.get(lead.id) ?? 0,
      unsubscribedAt: lead.unsubscribed_at,
    };
  });

  return {
    totalPeople: teacherAccounts + activeStudentAccounts,
    teacherAccounts,
    activeStudentAccounts,
    freeAccounts,
    proAccounts,
    adminAccounts,
    newThisMonth: newTeachers + newStudents,
    activeSubscriptions,
    monthlySubscriptions,
    annualSubscriptions,
    uncategorizedSubscriptions: Math.max(0, activeSubscriptions - monthlySubscriptions - annualSubscriptions),
    pendingRegistration,
    inactiveSubscriptions,
    agentRunsThisMonth: featureRows.reduce((total, row) => total + row.run_count, 0),
    agentFreeRuns: featureRows.filter((row) => row.plan_tier === "free").reduce((total, row) => total + row.run_count, 0),
    agentProRuns: featureRows.filter((row) => row.plan_tier === "pro").reduce((total, row) => total + row.run_count, 0),
    agentAdminRuns: featureRows.filter((row) => row.plan_tier === "admin").reduce((total, row) => total + row.run_count, 0),
    activeAgentUsers: usageRows.filter((row) => row.run_count > 0).length,
    agentUsersAtLimit,
    agentFeatureUsage: [...featureTotals.entries()].map(([feature, runs]) => ({ feature, runs })).sort((a, b) => b.runs - a.runs),
    funnelLeads,
    funnelLeadsThisMonth,
    funnelConvertedLeads,
    funnelConversionRate: funnelLeads ? Math.round((funnelConvertedLeads / funnelLeads) * 100) : 0,
    funnelKitDownloads,
    funnelAgentActivations,
    funnelAcademyActivations,
    funnelCompletedActivations,
    funnelProConversions,
    funnelProConversionRate: funnelLeads ? Math.round((funnelProConversions / funnelLeads) * 100) : 0,
    funnelEmailsSent,
    funnelEmailFailures,
    funnelUnsubscribed,
    funnelEmailAutomationConfigured: Boolean(
      process.env.BREVO_API_KEY?.trim()
      && process.env.BREVO_SENDER_EMAIL?.trim()
      && process.env.CRON_SECRET?.trim()
    ),
    commercialProInterest,
    commercialCheckoutReached,
    commercialHotmartReached,
    commercialProActivated,
    funnelLeadJourneys,
    generatedAt: new Date().toISOString(),
  };
}
