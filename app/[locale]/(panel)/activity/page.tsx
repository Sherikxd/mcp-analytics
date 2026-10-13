import FadeContent from "@/components/react-bits/FadeContent";
import { PageHeader } from "@/components/ui/page-header";
import { PanelCard } from "@/components/ui/panel-card";
import { EmptyState } from "@/components/ui/empty-state";
import { KpiCard } from "@/components/ui/kpi-card";
import { getActivityData } from "@/lib/analytics/metrics";
import { getDict, isLocale } from "@/lib/i18n/dictionaries";
import { formatDateTime } from "@/lib/i18n/format";

function RowTable({
  rows,
  cell,
}: {
  rows: Record<string, unknown>[];
  cell: (row: Record<string, unknown>) => React.ReactNode;
}) {
  return (
    <ul className="divide-y divide-line">
      {rows.map((row, i) => (
        <li key={String(row.id ?? i)} className="py-2.5 text-xs text-fg-muted">
          {cell(row)}
        </li>
      ))}
    </ul>
  );
}

export default async function ActivityPage(props: PageProps<"/[locale]/activity">) {
  const { locale } = await props.params;
  if (!isLocale(locale)) return null;
  const dict = getDict(locale);
  const a = dict.activity;
  const data = await getActivityData();

  return (
    <div>
      <PageHeader title={a.title} subtitle={a.subtitle} />

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <KpiCard
          label={dict.overview.kpiSupporters}
          value={data.counts.supporters}
          hint="need_supporters"
        />
        <KpiCard label={a.commentsTitle.split(" (")[0]} value={data.counts.comments} hint="point_comments" />
        <KpiCard label={a.reportsTitle.split(" (")[0]} value={data.counts.reports} hint="entity_reports" />
        <KpiCard
          label={dict.common.total}
          value={data.counts.supporters + data.counts.comments + data.counts.reports}
          hint="need_supporters + point_comments + entity_reports"
        />
      </div>

      <FadeContent
        threshold={0.05}
        duration={700}
        delay={80}
        className="mt-4 grid gap-4 lg:grid-cols-3"
      >
        <PanelCard title={a.supportersTitle}>
          {data.recentSupporters.length === 0 ? (
            <EmptyState title={a.empty} hint={a.emptyHint} />
          ) : (
            <RowTable
              rows={data.recentSupporters}
              cell={(row) => (
                <div className="flex items-center justify-between gap-3">
                  <span className="truncate font-mono text-fg">
                    {String(row.user_id ?? "—")}
                  </span>
                  <span className="shrink-0 font-mono text-fg-subtle">
                    {String(row.need_id ?? "—")}
                  </span>
                </div>
              )}
            />
          )}
        </PanelCard>

        <PanelCard title={a.commentsTitle}>
          {data.recentComments.length === 0 ? (
            <EmptyState title={a.empty} hint={a.emptyHint} />
          ) : (
            <RowTable
              rows={data.recentComments}
              cell={(row) => (
                <div className="space-y-1">
                  <p className="line-clamp-2 text-fg">{String(row.body ?? "—")}</p>
                  <p className="font-mono text-[11px] text-fg-subtle">
                    {String(row.point_id ?? "—")} ·{" "}
                    {formatDateTime(String(row.created_at ?? ""), locale)}
                  </p>
                </div>
              )}
            />
          )}
        </PanelCard>

        <PanelCard title={a.reportsTitle}>
          {data.recentReports.length === 0 ? (
            <EmptyState title={a.empty} hint={a.emptyHint} />
          ) : (
            <RowTable
              rows={data.recentReports}
              cell={(row) => (
                <div className="space-y-1">
                  <p className="text-fg">{String(row.reason ?? "—")}</p>
                  <p className="font-mono text-[11px] text-fg-subtle">
                    {String(row.entity_id ?? row.point_id ?? row.need_id ?? "—")} ·{" "}
                    {formatDateTime(String(row.created_at ?? ""), locale)}
                  </p>
                </div>
              )}
            />
          )}
        </PanelCard>
      </FadeContent>
    </div>
  );
}
