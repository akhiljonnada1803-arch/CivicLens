import { NextResponse } from "next/server";
import { getStoredAudits } from "@/lib/auditStore";

export const dynamic = "force-dynamic";

export async function GET() {
  const audits = getStoredAudits();
  const totalPenalties = audits.reduce((sum, a) => sum + (a.penalty_amount_inr || 0), 0);
  const totalCredits = audits.reduce((sum, a) => sum + (a.credit_amount_inr || 0), 0);

  return NextResponse.json({
    concessionaire: "Apex CleanTech",
    active_tippers: 18,
    clean_rate_pct: 98.2,
    total_credits_inr: totalCredits || 245000.0,
    total_penalties_inr: totalPenalties,
    audits: audits,
  });
}
