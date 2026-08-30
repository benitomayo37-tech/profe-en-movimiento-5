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
  ]);

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
    generatedAt: new Date().toISOString(),
  };
}
