import "server-only";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { timingSafeEqual } from "node:crypto";

export const PANEL_COOKIE = "panel_token";

export function tokensMatch(candidate: string | undefined): boolean {
  const expected = process.env.PANEL_ACCESS_TOKEN;
  if (!expected || !candidate) return false;
  const a = Buffer.from(candidate);
  const b = Buffer.from(expected);
  if (a.length !== b.length) return false;
  return timingSafeEqual(a, b);
}

export async function getSessionToken(): Promise<string | undefined> {
  const store = await cookies();
  return store.get(PANEL_COOKIE)?.value;
}

export async function isAuthenticated(): Promise<boolean> {
  return tokensMatch(await getSessionToken());
}

/** Guard de servidor: redirige al login si no hay token válido. */
export async function requireSession(): Promise<void> {
  if (!(await isAuthenticated())) {
    redirect("/login");
  }
}
