import { type NextRequest } from "next/server";
import { tokensMatch } from "@/lib/auth/session";
import {
  getActivityData,
  getNeedsData,
  getOverviewData,
  getPointsData,
} from "@/lib/analytics/metrics";
import { defaultLocale, isLocale, type Locale } from "@/lib/i18n/dictionaries";

const VIEWS = ["overview", "points", "needs", "activity"] as const;
type View = (typeof VIEWS)[number];

async function authorized(request: NextRequest): Promise<boolean> {
  const cookie = request.cookies.get("panel_token")?.value;
  if (tokensMatch(cookie)) return true;

  const header = request.headers.get("authorization");
  if (header?.startsWith("Bearer ")) {
    return tokensMatch(header.slice(7).trim());
  }
  return false;
}

export async function GET(
  request: NextRequest,
  ctx: RouteContext<"/api/analytics/[view]">,
) {
  const { view } = await ctx.params;

  if (!(await authorized(request))) {
    return Response.json({ error: "unauthorized" }, { status: 401 });
  }

  if (!(VIEWS as readonly string[]).includes(view)) {
    return Response.json(
      { error: "unknown_view", views: VIEWS },
      { status: 404 },
    );
  }

  const localeParam = request.nextUrl.searchParams.get("locale") ?? defaultLocale;
  const locale: Locale = isLocale(localeParam) ? localeParam : defaultLocale;

  try {
    switch (view as View) {
      case "overview":
        return Response.json(await getOverviewData(locale));
      case "points":
        return Response.json(await getPointsData());
      case "needs":
        return Response.json(await getNeedsData());
      case "activity":
        return Response.json(await getActivityData());
    }
  } catch (error) {
    return Response.json(
      { error: "query_failed", message: error instanceof Error ? error.message : "error" },
      { status: 500 },
    );
  }
}
