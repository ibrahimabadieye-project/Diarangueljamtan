import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { isAuthed } from "@/lib/auth";
import { eventCreateSchema, zodErrorResponse } from "@/lib/schemas";

export const dynamic = "force-dynamic";

// GET /api/events — agenda public
export async function GET() {
  try {
    const rows = await db.event.findMany({ orderBy: { startAt: "asc" } });
    return NextResponse.json(rows);
  } catch (e) {
    console.error("GET /events", e);
    return NextResponse.json({ error: "Lecture impossible" }, { status: 500 });
  }
}

// POST /api/events — admin
export async function POST(req: NextRequest) {
  if (!isAuthed(req.headers.get("cookie"))) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  }
  const parsed = eventCreateSchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return zodErrorResponse(parsed.error);
  try {
    const b = parsed.data;
    const row = await db.event.create({
      data: {
        kind: b.kind,
        title: b.title,
        startAt: b.startAt,
        endAt: b.endAt ?? null,
        location: b.location?.trim() || "Village de Diaranguel",
        quartier: b.quartier?.trim() || "Centre du village",
        family: b.family?.trim() || "CVD de Diaranguel",
        notes: b.notes?.trim() || null,
      },
    });
    revalidatePath("/");
    return NextResponse.json(row, { status: 201 });
  } catch (e) {
    console.error("POST /events", e);
    return NextResponse.json({ error: "Création impossible" }, { status: 500 });
  }
}
