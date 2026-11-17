import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { checkAdminCode, isAuthed, SESSION_COOKIE, issueToken, cookieOptions } from "@/lib/auth";
import { clientKey, rateLimit, resetAttempts } from "@/lib/rate-limit";
import { alertUpdateSchema, zodErrorResponse } from "@/lib/schemas";

export const dynamic = "force-dynamic";

// POST /api/admin/login { code } → cookie de session admin
export async function POST(req: NextRequest) {
  const key = clientKey(req);
  const limit = rateLimit(`admin:${key}`);
  if (!limit.ok) {
    return NextResponse.json(
      { error: `Trop de tentatives. Réessayez dans ${Math.max(1, Math.ceil(limit.retryAfterSec / 60))} minutes.` },
      { status: 429, headers: { "Retry-After": String(limit.retryAfterSec) } }
    );
  }

  try {
    const { code } = await req.json();
    if (!checkAdminCode(code)) {
      return NextResponse.json(
        { error: "Code incorrect" },
        { status: 401, headers: { "X-RateLimit-Remaining": String(limit.remaining) } }
      );
    }

    resetAttempts(`admin:${key}`);
    const res = NextResponse.json({ authenticated: true });
    res.cookies.set(SESSION_COOKIE, issueToken(), {
      ...cookieOptions,
      maxAge: 12 * 3600,
    });
    return res;
  } catch (e) {
    console.error("POST /admin/login", e);
    return NextResponse.json({ error: "Connexion impossible" }, { status: 500 });
  }
}

// PUT /api/admin/login — mise à jour du bandeau d'alerte (admin)
export async function PUT(req: NextRequest) {
  if (!isAuthed(req.headers.get("cookie"))) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  }
  try {
    const parsed = alertUpdateSchema.safeParse(await req.json().catch(() => null));
    if (!parsed.success) return zodErrorResponse(parsed.error);
    const { active, message } = parsed.data;
    const activeRow = await db.healthTransportInfo.findFirst({
      where: { section: "alerte", key: "active" },
    });
    const messageRow = await db.healthTransportInfo.findFirst({
      where: { section: "alerte", key: "message" },
    });
    if (activeRow && typeof active === "boolean") {
      await db.healthTransportInfo.update({
        where: { id: activeRow.id },
        data: { value: active ? "true" : "false" },
      });
    }
    if (messageRow && typeof message === "string" && message.trim()) {
      await db.healthTransportInfo.update({
        where: { id: messageRow.id },
        data: { value: message.trim().slice(0, 400) },
      });
    }
    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error("PUT /admin/login (alerte)", e);
    return NextResponse.json({ error: "Mise à jour impossible" }, { status: 500 });
  }
}
