import type { EmailOtpType } from "@supabase/supabase-js";
import { NextResponse, type NextRequest } from "next/server";

import { normalizeReturnTo } from "@/features/auth/server/access";
import { createClient } from "@/lib/supabase/server";

export async function GET(request: NextRequest) {
  const url = new URL(request.url);
  const tokenHash = url.searchParams.get("token_hash");
  const type = url.searchParams.get("type") as EmailOtpType | null;
  const code = url.searchParams.get("code");
  const next = normalizeReturnTo(url.searchParams.get("next"), "/cuenta");
  const supabase = await createClient();

  if (!supabase) return NextResponse.redirect(new URL("/login?error=configuracion", url.origin));

  let error: Error | null = null;

  if (tokenHash && type) {
    const result = await supabase.auth.verifyOtp({ type, token_hash: tokenHash });
    error = result.error;
  } else if (code) {
    const result = await supabase.auth.exchangeCodeForSession(code);
    error = result.error;
  } else {
    error = new Error("Enlace incompleto");
  }

  if (error) return NextResponse.redirect(new URL("/login?error=enlace", url.origin));

  return NextResponse.redirect(new URL(next, url.origin));
}
