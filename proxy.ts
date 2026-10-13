import { NextResponse, type NextRequest } from "next/server";
import { defaultLocale, isLocale } from "@/lib/i18n/dictionaries";

const PANEL_COOKIE = "panel_token";

/** Rutas de panel que exigen sesión (bajo /[locale]/ menos login y api). */
function isProtectedPath(pathname: string): boolean {
  const segs = pathname.split("/").filter(Boolean);
  if (segs.length === 0) return false;
  if (!isLocale(segs[0])) return false;
  const rest = segs.slice(1);
  // /{locale} es el overview del panel; solo /{locale}/login es público
  if (rest.length === 0) return true;
  return rest[0] !== "login";
}

function detectLocale(request: NextRequest): string {
  const cookie = request.cookies.get("NEXT_LOCALE")?.value;
  if (cookie && isLocale(cookie)) return cookie;

  const header = request.headers.get("accept-language") || "";
  for (const part of header.split(",")) {
    const code = part.split(";")[0]?.trim().slice(0, 2).toLowerCase();
    if (code && isLocale(code)) return code;
  }
  return defaultLocale;
}

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const segs = pathname.split("/").filter(Boolean);
  const first = segs[0];

  // / o rutas sin locale -> redirige al locale preferido
  if (!first || !isLocale(first)) {
    const locale = detectLocale(request);
    const url = request.nextUrl.clone();
    url.pathname = `/${locale}${pathname === "/" ? "" : pathname}`;
    return NextResponse.redirect(url);
  }

  const locale = first;
  if (segs[1] === "login") {
    // Si ya está autenticado, evita la pantalla de login
    const token = request.cookies.get(PANEL_COOKIE)?.value;
    const expected = process.env.PANEL_ACCESS_TOKEN;
    if (token && expected && token === expected) {
      const url = request.nextUrl.clone();
      url.pathname = `/${locale}`;
      return NextResponse.redirect(url);
    }
    return NextResponse.next();
  }

  if (isProtectedPath(pathname)) {
    const token = request.cookies.get(PANEL_COOKIE)?.value;
    const expected = process.env.PANEL_ACCESS_TOKEN;
    if (!token || !expected || token !== expected) {
      const url = request.nextUrl.clone();
      url.pathname = `/${locale}/login`;
      url.search = "";
      return NextResponse.redirect(url);
    }
  }

  const response = NextResponse.next();
  response.cookies.set("NEXT_LOCALE", locale, {
    path: "/",
    maxAge: 60 * 60 * 24 * 365,
    sameSite: "lax",
  });
  return response;
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:png|jpg|svg|ico|txt)).*)"],
};
