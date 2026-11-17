import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { isAuthed } from "@/lib/auth";
import { announcementUpdateSchema, zodErrorResponse } from "@/lib/schemas";

export const dynamic = "force-dynamic";

// PUT /api/announcements/:id — admin (mise à jour partielle sans perte)
export async function PUT(req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  if (!isAuthed(req.headers.get("cookie"))) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  }
  const { id } = await ctx.params;
  const parsed = announcementUpdateSchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return zodErrorResponse(parsed.error);
  try {
    const b = parsed.data;
    const row = await db.announcement.update({
      where: { id },
      data: {
        ...(b.kind !== undefined ? { kind: b.kind } : {}),
        ...(b.title !== undefined ? { title: b.title } : {}),
        ...(b.author !== undefined ? { author: b.author || "Conseil Villageois de Développement" } : {}),
        ...(b.body !== undefined ? { body: b.body } : {}),
        ...(b.date !== undefined ? { date: b.date } : {}),
      },
    });
    revalidatePath("/");
    return NextResponse.json(row);
  } catch (e) {
    console.error("PUT /announcements/:id", e);
    return NextResponse.json({ error: "Modification impossible" }, { status: 500 });
  }
}

// DELETE /api/announcements/:id — admin
export async function DELETE(req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  if (!isAuthed(req.headers.get("cookie"))) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  }
  const { id } = await ctx.params;
  try {
    await db.announcement.delete({ where: { id } });
    revalidatePath("/");
    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error("DELETE /announcements/:id", e);
    return NextResponse.json({ error: "Suppression impossible" }, { status: 500 });
  }
}
