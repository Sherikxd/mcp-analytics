import { cache } from "react";
import {
  countBy,
  monthKey,
  monthRange,
  bucketCounts,
  type BreakdownEntry,
} from "@/lib/analytics/aggregate";
import { countRows, fetchAll, fetchRows } from "@/lib/analytics/queries";
import type { Locale } from "@/lib/i18n/dictionaries";

export type { BreakdownEntry };

export interface OverviewData {
  counts: {
    points: number;
    needs: number;
    supporters: number;
    comments: number;
    reports: number;
  };
  openPoints: number;
  verifiedPoints: number;
  urgentNeeds: number;
  activeNeeds: number;
  pointsByStatus: BreakdownEntry[];
  pointsByCategory: BreakdownEntry[];
  pointsByComuna: BreakdownEntry[];
  needsByUrgency: BreakdownEntry[];
  needsByStatus: BreakdownEntry[];
  creationSeries: {
    labels: string[];
    points: number[];
    needs: number[];
  };
}

export interface PointRow {
  id: string;
  name: string;
  category: string;
  comuna: string;
  barrio: string;
  status: string;
  verified: boolean;
  created_at: string;
}

export interface NeedRow {
  id: string;
  title: string;
  category: string;
  barrio: string;
  urgency: string;
  status: string;
  supporters_count: number;
  created_at: string;
}

const LOCALE_TAGS: Record<Locale, string> = { es: "es-CO", en: "en-US" };

function formatMonthLabels(keys: string[], locale: Locale): string[] {
  const fmt = new Intl.DateTimeFormat(LOCALE_TAGS[locale], { month: "short" });
  return keys.map((k) => {
    const [y, m] = k.split("-").map(Number);
    return fmt.format(new Date(y, m - 1, 1)).replace(".", "");
  });
}

export const getOverviewData = cache(async (locale: Locale): Promise<OverviewData> => {
  const [
    points,
    needs,
    supporters,
    comments,
    reports,
    pointRows,
    needRows,
    pointMonths,
    needMonths,
  ] = await Promise.all([
    countRows("help_points"),
    countRows("help_needs"),
    countRows("need_supporters"),
    countRows("point_comments"),
    countRows("entity_reports"),
    fetchAll("help_points", {
      columns: "status, category, comuna, verified",
    }),
    fetchAll("help_needs", { columns: "urgency, status" }),
    fetchAll("help_points", { columns: "created_at" }),
    fetchAll("help_needs", { columns: "created_at" }),
  ]);

  const used = new Set<string>();
  for (const r of [...pointMonths, ...needMonths]) {
    const k = monthKey(String(r.created_at));
    if (k) used.add(k);
  }
  const keys = monthRange(used);

  const pointsByMonth = bucketCounts(
    pointMonths.map((r) => String(r.created_at)),
    monthKey,
  );
  const needsByMonth = bucketCounts(
    needMonths.map((r) => String(r.created_at)),
    monthKey,
  );

  const pointsByStatus = countBy(pointRows, "status");
  const openPoints = pointsByStatus
    .filter((e) => e.key.toLowerCase() === "abierto")
    .reduce((acc, e) => acc + e.count, 0);
  const verifiedPoints = pointRows.filter((r) => r.verified === true).length;
  const needsByUrgency = countBy(needRows, "urgency");
  const urgentNeeds = needsByUrgency
    .filter((e) => ["alta", "media"].includes(e.key.toLowerCase()))
    .reduce((acc, e) => acc + e.count, 0);
  const activeNeeds = needRows.filter(
    (r) => String(r.status).toLowerCase() === "activa",
  ).length;

  return {
    counts: { points, needs, supporters, comments, reports },
    openPoints,
    verifiedPoints,
    urgentNeeds,
    activeNeeds,
    pointsByStatus,
    pointsByCategory: countBy(pointRows, "category"),
    pointsByComuna: countBy(pointRows, "comuna").slice(0, 8),
    needsByUrgency,
    needsByStatus: countBy(needRows, "status"),
    creationSeries: {
      labels: formatMonthLabels(keys, locale),
      points: keys.map((k) => pointsByMonth.get(k) ?? 0),
      needs: keys.map((k) => needsByMonth.get(k) ?? 0),
    },
  };
});

export const getPointsData = cache(async () => {
  const rows = await fetchRows<PointRow>("help_points", {
    columns: "id, name, category, comuna, barrio, status, verified, created_at",
    limit: 500,
  });
  const source = rows as unknown as Record<string, unknown>[];
  return {
    rows,
    byCategory: countBy(source, "category"),
    byComuna: countBy(source, "comuna"),
    byStatus: countBy(source, "status"),
    verified: rows.filter((r) => r.verified).length,
    unverified: rows.filter((r) => !r.verified).length,
  };
});

export const getNeedsData = cache(async () => {
  const rows = await fetchRows<NeedRow>("help_needs", {
    columns:
      "id, title, category, barrio, urgency, status, supporters_count, created_at",
    limit: 500,
  });
  const source = rows as unknown as Record<string, unknown>[];
  const bySupporters = [...rows]
    .sort((a, b) => b.supporters_count - a.supporters_count)
    .map((r) => ({ key: r.title, count: r.supporters_count }));
  return {
    rows,
    byUrgency: countBy(source, "urgency"),
    byStatus: countBy(source, "status"),
    byCategory: countBy(source, "category"),
    bySupporters,
  };
});

export interface ActivityData {
  counts: { supporters: number; comments: number; reports: number };
  recentSupporters: Record<string, unknown>[];
  recentComments: Record<string, unknown>[];
  recentReports: Record<string, unknown>[];
}

export const getActivityData = cache(async (): Promise<ActivityData> => {
  const [
    supporters,
    comments,
    reports,
    recentSupporters,
    recentComments,
    recentReports,
  ] = await Promise.all([
    countRows("need_supporters"),
    countRows("point_comments"),
    countRows("entity_reports"),
    fetchRows("need_supporters", { limit: 10 }),
    fetchRows("point_comments", { limit: 10 }),
    fetchRows("entity_reports", { limit: 10 }),
  ]);
  return {
    counts: { supporters, comments, reports },
    recentSupporters,
    recentComments,
    recentReports,
  };
});
