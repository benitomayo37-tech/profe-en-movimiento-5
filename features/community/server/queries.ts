import "server-only";

import type { CommunitySubmission } from "@/features/community/types";
import { createClient } from "@/lib/supabase/server";

export async function getCommunitySubmissions(userId?: string) {
  const supabase = await createClient();
  if (!supabase) return [] as CommunitySubmission[];
  let query = supabase.from("community_submissions").select("id,user_id,kind,subject,message,status,admin_response,responded_at,created_at").order("created_at", { ascending: false });
  if (userId) query = query.eq("user_id", userId);
  const { data } = await query;
  return (data ?? []) as CommunitySubmission[];
}

