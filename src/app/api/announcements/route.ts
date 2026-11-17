import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { isAuthed } from "@/lib/auth";
import { announcementCreateSchema, zodErrorResponse } from "@/lib/schemas";

export const dynamic = "force-dynamic";

// GET /api/announcements — flux public (tri antéchronologique)
export async function GET() {
  try {
    const rows = await db.announcement.findMany({ orderBy: { date: "desc" } });
    return NextResponse.json(rows);
  } catch (e) {
    console.error("GET /announcements", e);
    return NextResponse.json({ error: "Lecture impossible" }, { status: 500 });
  }
}

// POST /api/announcements — admin
export async function POST(req: NextRequest) {
  if (!isAuthed(req.headers.get("cookie"))) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  }
  const parsed = announcementCreateSchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return zodErrorResponse(parsed.error);
  try {
    const b = parsed.data;
    const row = await db.announcement.create({
      data: {
        kind: b.kind,
        title: b.title,
        author: b.author || "Conseil Villageois de Développement",
        body: b.body,
        date: b.date ?? new Date(),
      },
    });
    revalidatePath("/");
    return NextResponse.json(row, { status: 201 });
  } catch (e) {
    console.error("POST /announcements", e);
    return NextResponse.json({ error: "Création impossible" }, { status: 500 });
  }
}
