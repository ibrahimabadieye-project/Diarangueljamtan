import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export const dynamic = "force-dynamic";

// GET /api/history — récits, figures et coopération
export async function GET() {
  try {
    const rows = await db.historyArticle.findMany({
      orderBy: [{ section: "asc" }, { sortOrder: "asc" }],
    });
    return NextResponse.json(rows);
  } catch (e) {
    console.error("GET /history", e);
    return NextResponse.json({ error: "Lecture impossible" }, { status: 500 });
  }
}
