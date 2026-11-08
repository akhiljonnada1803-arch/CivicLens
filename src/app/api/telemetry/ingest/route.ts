import { NextResponse } from "next/server";
import { ingestOrDeduplicateIncident } from "@/lib/incidentStore";
import { Incident } from "@/lib/types";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const newId = `inc-${Date.now()}`;
    const record: Incident = {
      id: newId,
      defect_type: body.defect_type || "garbage_overflow",
      severity: body.severity || "HIGH",
      title: (body.title || (body.defect_type || "hazard").replace("_", " ")).toUpperCase(),
      slm_summary: body.slm_summary || "Autonomous vision verified road defect requiring municipal clearance.",
      latitude: Number(body.latitude) || 17.7225,
      longitude: Number(body.longitude) || 83.3045,
      landmark: body.landmark || "Ward 14 Central Sector",
      ward: "Ward 14 (Siripuram)",
      zone: "Zone 3 (Central)",
      source_fleet: body.source_fleet || "Fleet A (Transit Bus #12)",
      timestamp: new Date().toISOString(),
      sync_status: "SYNCED",
      status: "NEEDS_ACTION",
      concessionaire: "Apex CleanTech",
      bbox: body.bounding_box ? [body.bounding_box.x1, body.bounding_box.y1, body.bounding_box.x2, body.bounding_box.y2] : [0.25, 0.45, 0.75, 0.85],
      image_url: body.image_url || "https://images.unsplash.com/photo-1618477461853-cf6ed80faba5?auto=format&fit=crop&w=800&q=80",
    };

    const { is_duplicate, record: finalRecord } = ingestOrDeduplicateIncident(record);

    if (is_duplicate) {
      return NextResponse.json({
        status: "DEDUPLICATED",
        is_duplicate: true,
        ticket_id: finalRecord.id,
        sighting_count: finalRecord.sighting_count,
        message: `🎯 15m Proximity deduplication hit: Sighting count incremented to ${finalRecord.sighting_count}x. Duplicate alert suppressed to prevent officer fatigue.`,
        record: finalRecord,
      }, { status: 200 });
    }

    return NextResponse.json({
      status: "INGESTED",
      is_duplicate: false,
      ticket_id: newId,
      assigned_concessionaire: "Apex CleanTech",
      ward_resolved: "Ward 14 (Siripuram)",
      message: `🚨 Hazard successfully ingested from ${record.source_fleet}. Dispatched to Apex CleanTech QRT route.`,
      record: finalRecord,
    }, { status: 201 });
  } catch (e: any) {
    return NextResponse.json({ error: "Ingestion failed: " + e.message }, { status: 400 });
  }
}
