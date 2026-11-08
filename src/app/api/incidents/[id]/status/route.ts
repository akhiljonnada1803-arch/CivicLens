import { NextResponse } from "next/server";
import { updateStoredIncidentStatus } from "@/lib/incidentStore";

export const dynamic = "force-dynamic";

export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json();
    const updated = updateStoredIncidentStatus(params.id, body.status);
    if (!updated) {
      return NextResponse.json({ error: "Incident not found" }, { status: 404 });
    }
    return NextResponse.json({
      success: true,
      message: `Incident ${params.id} updated to ${body.status}`,
      record: updated,
    });
  } catch (e: any) {
    return NextResponse.json({ error: "Update failed: " + e.message }, { status: 400 });
  }
}

