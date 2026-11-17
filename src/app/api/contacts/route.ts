import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { isAuthed, hasVillageAccess } from "@/lib/auth";
import { contactCreateSchema, zodErrorResponse } from "@/lib/schemas";

export const dynamic = "force-dynamic";

// GET /api/contacts —
// • session admin → tous les contacts
// • accès villageois (code du village) → tous les contacts
// • public → uniquement « Urgences & Autorités » et « Ouvriers & Artisans » ;
//   les contacts personnels (habitants & diaspora) ne sont pas exposés.
export async function GET(req: NextRequest) {
  try {
    const cookie = req.headers.get("cookie");
    const fullAccess = isAuthed(cookie) || hasVillageAccess(cookie);
    const rows = await db.contact.findMany({
      where: fullAccess ? {} : { category: { not: "habitant" } },
      orderBy: { name: "asc" },
    });
    return NextResponse.json({ fullAccess, rows });
  } catch (e) {
    console.error("GET /contacts", e);
    return NextResponse.json({ error: "Lecture impossible" }, { status: 500 });
  }
}

// POST /api/contacts — admin
export async function POST(req: NextRequest) {
  if (!isAuthed(req.headers.get("cookie"))) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  }
  const parsed = contactCreateSchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return zodErrorResponse(parsed.error);
  try {
    const b = parsed.data;
    const row = await db.contact.create({
      data: {
        category: b.category,
        name: b.name,
        role: b.role,
        quartier: b.quartier ?? null,
        city: b.city ?? null,
        phone: b.phone,
        whatsapp: b.whatsapp ?? null,
        note: b.note ?? null,
      },
    });
    revalidatePath("/");
    return NextResponse.json(row, { status: 201 });
  } catch (e) {
    console.error("POST /contacts", e);
    return NextResponse.json({ error: "Création impossible" }, { status: 500 });
  }
}
