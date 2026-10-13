import FadeContent from "@/components/react-bits/FadeContent";
import { BreakdownBar, BreakdownDoughnut } from "@/components/charts/charts";
import { NeedsTable } from "@/components/tables/needs-table";
import { PageHeader } from "@/components/ui/page-header";
import { PanelCard } from "@/components/ui/panel-card";
import { getNeedsData } from "@/lib/analytics/metrics";
import { getDict, isLocale } from "@/lib/i18n/dictionaries";

export default async function NeedsPage(props: PageProps<"/[locale]/needs">) {
  const { locale } = await props.params;
  if (!isLocale(locale)) return null;
  const dict = getDict(locale);
  const t = dict.needs;
  const data = await getNeedsData();

  const urgencyLabel = (value: string): string => {
    switch (value.toLowerCase()) {
      case "alta":
      case "high":
        return t.urgencyHigh;
      case "media":
      case "medium":
        return t.urgencyMid;
      case "baja":
      case "low":
        return t.urgencyLow;
      default:
        return value;
    }
  };

  const topSupporters = data.bySupporters.slice(0, 10);

  return (
    <div>
      <PageHeader title={t.title} subtitle={t.subtitle} />

      <FadeContent
        threshold={0.05}
        duration={700}
        delay={60}
        className="grid gap-4 lg:grid-cols-3"
      >
        <PanelCard title={t.chartUrgency} bodyClassName="p-4 pt-3">
          {data.byUrgency.length > 0 ? (
            <BreakdownDoughnut
              labels={data.byUrgency.map((e) => urgencyLabel(e.key))}
              values={data.byUrgency.map((e) => e.count)}
              variant="urgency"
            />
          ) : (
            <p className="py-10 text-center text-xs text-fg-subtle">
              {dict.common.empty}
            </p>
          )}
        </PanelCard>

        <PanelCard title={t.chartStatus} bodyClassName="p-4 pt-3">
          {data.byStatus.length > 0 ? (
            <BreakdownBar
              labels={data.byStatus.map((e) => e.key)}
              values={data.byStatus.map((e) => e.count)}
              height={240}
            />
          ) : (
            <p className="py-10 text-center text-xs text-fg-subtle">
              {dict.common.empty}
            </p>
          )}
        </PanelCard>

        <PanelCard title={t.chartCategory} bodyClassName="p-4 pt-3">
          {data.byCategory.length > 0 ? (
            <BreakdownBar
              labels={data.byCategory.map((e) => e.key)}
              values={data.byCategory.map((e) => e.count)}
              height={240}
            />
          ) : (
            <p className="py-10 text-center text-xs text-fg-subtle">
              {dict.common.empty}
            </p>
          )}
        </PanelCard>
      </FadeContent>

      <div className="mt-4 grid gap-4 lg:grid-cols-3">
        <PanelCard
          title={t.table}
          hint={`${data.rows.length} ${dict.common.rows}`}
          className="lg:col-span-2"
          bodyClassName=""
        >
          <NeedsTable rows={data.rows} />
        </PanelCard>

        <PanelCard title={t.chartSupporters} bodyClassName="p-4 pt-3">
          {topSupporters.length > 0 ? (
            <BreakdownBar
              labels={topSupporters.map((e) =>
                e.key.length > 28 ? `${e.key.slice(0, 28)}…` : e.key,
              )}
              values={topSupporters.map((e) => e.count)}
              height={280}
              horizontal
            />
          ) : (
            <p className="py-10 text-center text-xs text-fg-subtle">
              {dict.common.empty}
            </p>
          )}
        </PanelCard>
      </div>
    </div>
  );
}
