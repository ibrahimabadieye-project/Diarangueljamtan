import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export const dynamic = "force-dynamic";

// GET /api/alert — état du bandeau d'alerte urgente
export async function GET() {
  try {
    const rows = await db.healthTransportInfo.findMany({
      where: { section: "alerte" },
    });
    const active = rows.find((r) => r.key === "active")?.value === "true";
    const message = rows.find((r) => r.key === "message")?.value ?? "";
    return NextResponse.json({ active, message });
  } catch (e) {
    console.error("GET /alert", e);
    return NextResponse.json({ active: false, message: "" }, { status: 500 });
  }
}
