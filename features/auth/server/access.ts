import "server-only";

import { createClient } from "@/lib/supabase/server";
import type { AccessPlan, AppRole, AuthAccess } from "@/features/auth/types";

const anonymousAccess: AuthAccess = {
  configured: true,
  authenticated: false,
  userId: null,
  email: null,
  fullName: null,
  plan: "free",
  role: "teacher",
  hasProAccess: false,
};

export async function getAuthAccess(): Promise<AuthAccess> {
  const supabase = await createClient();

  if (!supabase) return { ...anonymousAccess, configured: false };

  const { data, error } = await supabase.auth.getClaims();
  const claims = data?.claims;
  const userId = typeof claims?.sub === "string" ? claims.sub : null;

  if (error || !userId) return anonymousAccess;

  const { data: profile } = await supabase
    .from("profiles")
    .select("full_name, plan, role")
    .eq("id", userId)
    .maybeSingle();

  const plan: AccessPlan = profile?.plan === "pro" ? "pro" : "free";
  const role: AppRole = profile?.role === "admin" ? "admin" : "teacher";

  return {
    configured: true,
    authenticated: true,
    userId,
    email: claims && typeof claims.email === "string" ? claims.email : null,
    fullName: typeof profile?.full_name === "string" ? profile.full_name : null,
    plan,
    role,
    hasProAccess: plan === "pro" || role === "admin",
  };
}

export function normalizeReturnTo(value: string | null | undefined, fallback = "/cuenta") {
  if (!value || !value.startsWith("/") || value.startsWith("//")) return fallback;
  return value;
}
