import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export const dynamic = "force-dynamic";

// GET /api/route-steps — guide Dakar → Diaranguel
export async function GET() {
  try {
    const rows = await db.routeStep.findMany({ orderBy: { stepNumber: "asc" } });
    return NextResponse.json(rows);
  } catch (e) {
    console.error("GET /route-steps", e);
    return NextResponse.json({ error: "Lecture impossible" }, { status: 500 });
  }
}
