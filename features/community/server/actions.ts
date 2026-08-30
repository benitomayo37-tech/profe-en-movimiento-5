"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { getAuthAccess } from "@/features/auth/server/access";
import type { CommunityKind, CommunityStatus } from "@/features/community/types";
import { createClient } from "@/lib/supabase/server";

function value(formData: FormData, name: string, maxLength: number) {
  const entry = formData.get(name);
  return typeof entry === "string" ? entry.trim().slice(0, maxLength) : "";
}

export async function createCommunitySubmissionAction(formData: FormData) {
  const access = await getAuthAccess();
  if (!access.authenticated || !access.userId) redirect("/login?next=/comunidad");
  const supabase = await createClient();
  if (!supabase) redirect("/comunidad?error=config");

  const kind = value(formData, "kind", 30) as CommunityKind;
  const subject = value(formData, "subject", 160);
  const message = value(formData, "message", 4000);
  if (!(["topic", "experience", "question", "improvement"] as string[]).includes(kind) || subject.length < 5 || message.length < 20) {
    redirect(`/comunidad?error=validation&type=${kind}`);
  }

  const { error } = await supabase.from("community_submissions").insert({ user_id: access.userId, kind, subject, message });
  if (error) redirect(`/comunidad?error=save&type=${kind}`);
  revalidatePath("/comunidad");
  revalidatePath("/comunidad/admin");
  redirect("/comunidad?sent=1");
}

export async function moderateCommunitySubmissionAction(formData: FormData) {
  const access = await getAuthAccess();
  if (!access.authenticated || access.role !== "admin" || !access.userId) redirect("/login?next=/comunidad/admin");
  const supabase = await createClient();
  if (!supabase) redirect("/comunidad/admin?error=config");

  const id = value(formData, "id", 80);
  const status = value(formData, "status", 20) as CommunityStatus;
  const response = value(formData, "response", 4000);
  if (!id || !(["pending", "reviewing", "resolved", "archived"] as string[]).includes(status)) redirect("/comunidad/admin?error=validation");

  const hasResponse = response.length > 0;
  const { error } = await supabase.from("community_submissions").update({
    status,
    admin_response: hasResponse ? response : null,
    responded_by: hasResponse ? access.userId : null,
    responded_at: hasResponse ? new Date().toISOString() : null,
    updated_at: new Date().toISOString(),
  }).eq("id", id);
  if (error) redirect("/comunidad/admin?error=save");
  revalidatePath("/comunidad");
  revalidatePath("/comunidad/admin");
  redirect("/comunidad/admin?saved=1");
}

