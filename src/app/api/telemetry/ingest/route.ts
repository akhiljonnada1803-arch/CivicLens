import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const newId = `inc-${Date.now()}`;
    const record = {
      id: newId,
      defect_type: body.defect_type || "garbage_overflow",
      severity: body.severity || "HIGH",
      title: (body.defect_type || "hazard").replace("_", " ").toUpperCase(),
      slm_summary: body.slm_summary || "Autonomous vision verified road defect requiring municipal clearance.",
      latitude: body.latitude || 17.7225,
      longitude: body.longitude || 83.3045,
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

    return NextResponse.json({
      status: "INGESTED",
      ticket_id: newId,
      assigned_concessionaire: "Apex CleanTech",
      ward_resolved: "Ward 14 (Siripuram)",
      message: `Hazard successfully ingested from ${record.source_fleet}. Dispatched to Apex CleanTech QRT route.`,
      record,
    }, { status: 201 });
  } catch (e: any) {
    return NextResponse.json({ error: "Ingestion failed: " + e.message }, { status: 400 });
  }
}
