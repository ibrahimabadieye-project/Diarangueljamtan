import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { isAuthed } from "@/lib/auth";
import { contactUpdateSchema, zodErrorResponse } from "@/lib/schemas";

export const dynamic = "force-dynamic";

// PUT /api/contacts/:id — admin (mise à jour partielle sans perte)
export async function PUT(req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  if (!isAuthed(req.headers.get("cookie"))) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  }
  const { id } = await ctx.params;
  const parsed = contactUpdateSchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return zodErrorResponse(parsed.error);
  try {
    const b = parsed.data;
    const row = await db.contact.update({
      where: { id },
      data: {
        ...(b.category !== undefined ? { category: b.category } : {}),
        ...(b.name !== undefined ? { name: b.name } : {}),
        ...(b.role !== undefined ? { role: b.role } : {}),
        ...(b.quartier !== undefined ? { quartier: b.quartier ?? null } : {}),
        ...(b.city !== undefined ? { city: b.city ?? null } : {}),
        ...(b.phone !== undefined ? { phone: b.phone } : {}),
        ...(b.whatsapp !== undefined ? { whatsapp: b.whatsapp ?? null } : {}),
        ...(b.note !== undefined ? { note: b.note ?? null } : {}),
      },
    });
    revalidatePath("/");
    return NextResponse.json(row);
  } catch (e) {
    console.error("PUT /contacts/:id", e);
    return NextResponse.json({ error: "Modification impossible" }, { status: 500 });
  }
}

// DELETE /api/contacts/:id — admin
export async function DELETE(req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  if (!isAuthed(req.headers.get("cookie"))) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  }
  const { id } = await ctx.params;
  try {
    await db.contact.delete({ where: { id } });
    revalidatePath("/");
    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error("DELETE /contacts/:id", e);
    return NextResponse.json({ error: "Suppression impossible" }, { status: 500 });
  }
}
