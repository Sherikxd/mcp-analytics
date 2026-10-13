import { NextResponse, type NextRequest } from "next/server";
import { tokensMatch, PANEL_COOKIE } from "@/lib/auth/session";

export async function POST(request: NextRequest) {
  let token = "";
  try {
    const body = await request.json();
    token = typeof body?.token === "string" ? body.token.trim() : "";
  } catch {
    return NextResponse.json({ error: "invalid_body" }, { status: 400 });
  }

  if (!token) {
    return NextResponse.json({ error: "required" }, { status: 400 });
  }

  if (!tokensMatch(token)) {
    return NextResponse.json({ error: "invalid" }, { status: 401 });
  }

  const response = NextResponse.json({ ok: true });
  response.cookies.set(PANEL_COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24 * 7,
  });
  return response;
}

export async function DELETE() {
  const response = NextResponse.json({ ok: true });
  response.cookies.delete(PANEL_COOKIE);
  return response;
}
