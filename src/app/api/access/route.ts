import { NextRequest, NextResponse } from "next/server";
import { ACCESS_COOKIE, ACCESS_TTL_SECONDS, checkVillageCode, issueAccessToken, cookieOptions } from "@/lib/auth";
import { clientKey, rateLimit, resetAttempts } from "@/lib/rate-limit";
import { accessSchema, zodErrorResponse } from "@/lib/schemas";

export const dynamic = "force-dynamic";

// POST /api/access { code } — déverrouille les contacts personnels
// (Habitants & Diaspora) pour l'appareil, via le code du village.
export async function POST(req: NextRequest) {
  const key = clientKey(req);
  const limit = rateLimit(`village:${key}`);
  if (!limit.ok) {
    return NextResponse.json(
      { error: `Trop de tentatives. Réessayez dans ${Math.max(1, Math.ceil(limit.retryAfterSec / 60))} minutes.` },
      { status: 429, headers: { "Retry-After": String(limit.retryAfterSec) } }
    );
  }
  const parsed = accessSchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return zodErrorResponse(parsed.error);
  if (!checkVillageCode(parsed.data.code)) {
    return NextResponse.json({ error: "Code du village incorrect" }, { status: 401 });
  }
  resetAttempts(`village:${key}`);
  const res = NextResponse.json({ access: true });
  res.cookies.set(ACCESS_COOKIE, issueAccessToken(), {
    ...cookieOptions,
    maxAge: ACCESS_TTL_SECONDS,
  });
  return res;
}

// DELETE /api/access — retire l'accès villageois de l'appareil
export async function DELETE() {
  const res = NextResponse.json({ access: false });
  res.cookies.set(ACCESS_COOKIE, "", { ...cookieOptions, maxAge: 0 });
  return res;
}
