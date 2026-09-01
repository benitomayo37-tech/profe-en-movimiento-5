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
  generatedAt: string;
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
  ]);

  if (agentFeatureResult.error) throw new Error(agentFeatureResult.error.message);
  if (agentUsageResult.error) throw new Error(agentUsageResult.error.message);
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
    generatedAt: new Date().toISOString(),
  };
}
