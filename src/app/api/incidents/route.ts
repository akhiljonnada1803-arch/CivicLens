import { NextResponse } from "next/server";
import { getStoredIncidents } from "@/lib/incidentStore";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const severity = searchParams.get("severity");

  const results = getStoredIncidents(severity);

  return NextResponse.json({
    count: results.length,
    source: "VERCEL_HIGH_AVAILABILITY_STATE",
    incidents: results,
  });
}
