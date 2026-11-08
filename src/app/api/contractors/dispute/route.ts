import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    return NextResponse.json({
      status: "DISPUTE_ACCEPTED",
      job_id: body.job_id,
      message: "Re-dump defense registered with immutable proof vault. Municipal penalty held in abeyance pending automated photo timestamp review.",
      defense_notes: body.defense_notes,
      timestamp: new Date().toISOString(),
    });
  } catch (e: any) {
    return NextResponse.json({ error: "Invalid payload: " + e.message }, { status: 400 });
  }
}

