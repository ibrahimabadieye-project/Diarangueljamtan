import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { isAuthed } from "@/lib/auth";
import { eventUpdateSchema, zodErrorResponse } from "@/lib/schemas";

export const dynamic = "force-dynamic";

// PUT /api/events/:id — admin (mise à jour partielle sans perte :
// un champ absent reste inchangé, une chaîne vide efface le champ optionnel)
export async function PUT(req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  if (!isAuthed(req.headers.get("cookie"))) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  }
  const { id } = await ctx.params;
  const parsed = eventUpdateSchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return zodErrorResponse(parsed.error);
  try {
    const b = parsed.data;
    const row = await db.event.update({
      where: { id },
      data: {
        ...(b.kind !== undefined ? { kind: b.kind } : {}),
        ...(b.title !== undefined ? { title: b.title } : {}),
        ...(b.startAt !== undefined ? { startAt: b.startAt } : {}),
        ...(b.endAt !== undefined ? { endAt: b.endAt ?? null } : {}),
        ...(b.location !== undefined ? { location: b.location || "Village de Diaranguel" } : {}),
        ...(b.quartier !== undefined ? { quartier: b.quartier || "Centre du village" } : {}),
        ...(b.family !== undefined ? { family: b.family || "CVD de Diaranguel" } : {}),
        ...(b.notes !== undefined ? { notes: b.notes?.trim() || null } : {}),
      },
    });
    revalidatePath("/");
    return NextResponse.json(row);
  } catch (e) {
    console.error("PUT /events/:id", e);
    return NextResponse.json({ error: "Modification impossible" }, { status: 500 });
  }
}

// DELETE /api/events/:id — admin
export async function DELETE(req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  if (!isAuthed(req.headers.get("cookie"))) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  }
  const { id } = await ctx.params;
  try {
    await db.event.delete({ where: { id } });
    revalidatePath("/");
    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error("DELETE /events/:id", e);
    return NextResponse.json({ error: "Suppression impossible" }, { status: 500 });
  }
}
