import { NextResponse } from "next/server";

import { getAuthenticatedApiAccess } from "@/features/auth/server/apiAccess";
import { createClient } from "@/lib/supabase/server";

export async function POST(request: Request) {
  const accessResult = await getAuthenticatedApiAccess("Agentes IA");
  if (accessResult.error) return accessResult.error;
  const access = accessResult.access;
  if (!access.userId) return NextResponse.json({ success: false }, { status: 401 });
  const supabase = await createClient();
  if (!supabase) return NextResponse.json({ success: false }, { status: 503 });
  let id = "";
  try { const body = await request.json(); id = typeof body.id === "string" ? body.id : ""; } catch { return NextResponse.json({ success: false }, { status: 400 }); }
  if (!id) return NextResponse.json({ success: false }, { status: 400 });
  const { data, error } = await supabase.from("ai_agent_messages").update({ saved_at: new Date().toISOString() }).eq("id", id).eq("user_id", access.userId).eq("role", "assistant").select("saved_at").maybeSingle();
  return error || !data ? NextResponse.json({ success: false }, { status: 404 }) : NextResponse.json({ success: true, savedAt: data.saved_at });
}
