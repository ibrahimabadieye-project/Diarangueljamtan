import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { isAuthed } from "@/lib/auth";
import { healthInfoUpdateSchema, zodErrorResponse } from "@/lib/schemas";

export const dynamic = "force-dynamic";

// GET /api/health-info — infos publiques (sans la section "alerte")
export async function GET() {
  try {
    const rows = await db.healthTransportInfo.findMany({
      where: { section: { in: ["sante", "transport"] } },
      orderBy: [{ section: "asc" }, { sortOrder: "asc" }],
    });
    return NextResponse.json(rows);
  } catch (e) {
    console.error("GET /health-info", e);
    return NextResponse.json({ error: "Lecture impossible" }, { status: 500 });
  }
}

// PUT /api/health-info — édition admin d'une ligne
export async function PUT(req: NextRequest) {
  if (!isAuthed(req.headers.get("cookie"))) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  }
  const parsed = healthInfoUpdateSchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return zodErrorResponse(parsed.error);
  try {
    const b = parsed.data;
    const row = await db.healthTransportInfo.update({
      where: { id: b.id },
      data: {
        ...(b.label !== undefined ? { label: b.label } : {}),
        ...(b.value !== undefined ? { value: b.value } : {}),
      },
    });
    revalidatePath("/");
    return NextResponse.json(row);
  } catch (e) {
    console.error("PUT /health-info", e);
    return NextResponse.json({ error: "Modification impossible" }, { status: 500 });
  }
}
