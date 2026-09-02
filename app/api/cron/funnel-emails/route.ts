import type { NextRequest } from "next/server";

import { processDueMarketingEmails } from "@/features/funnel/server/emailSequence";

export async function GET(request: NextRequest) {
  const cronSecret = process.env.CRON_SECRET;
  if (!cronSecret || request.headers.get("authorization") !== `Bearer ${cronSecret}`) {
    return Response.json({ error: "unauthorized" }, { status: 401 });
  }
  try {
    return Response.json({ success: true, ...(await processDueMarketingEmails(50)) });
  } catch (error) {
    console.error("[Embudo] Falló la tarea programada de correos.", error);
    return Response.json({ success: false, error: "processing_failed" }, { status: 500 });
  }
}

