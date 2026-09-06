import { NextResponse } from "next/server";

import {
  getSportsNews,
} from "@/features/sports-news/server/getSportsNews";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  const news = await getSportsNews();

  return NextResponse.json(
    news,
    {
      headers: {
        "Content-Type":
          "application/json; charset=utf-8",
        "Cache-Control":
          "public, s-maxage=3600, stale-while-revalidate=86400",
      },
    },
  );
}