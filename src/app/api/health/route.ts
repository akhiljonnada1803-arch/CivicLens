import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET() {
  const dbUrl = process.env.DATABASE_URL;
  return NextResponse.json({
    status: "ONLINE",
    service: "CivicLens AI Vercel Edge/Serverless Engine",
    version: "4.0.0",
    environment: process.env.VERCEL_ENV || "production",
    timestamp: new Date().toISOString(),
    database: {
      status: dbUrl ? "CONFIGURED_POSTGRESQL" : "IN_MEMORY_BENCHMARK_ACTIVE",
      postgis_enabled: Boolean(dbUrl),
    },
    target_municipality: "Greater Visakhapatnam Municipal Corporation (GVMC)",
    active_ward: "Ward 14 (Siripuram / Maddilapalem)",
  });
}
