import { NextRequest, NextResponse } from "next/server";
import { isAuthed } from "@/lib/auth";

export const dynamic = "force-dynamic";

// GET /api/admin/session — état de connexion
export async function GET(req: NextRequest) {
  return NextResponse.json({ authenticated: isAuthed(req.headers.get("cookie")) });
}
