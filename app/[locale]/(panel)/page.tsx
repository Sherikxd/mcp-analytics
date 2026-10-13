import FadeContent from "@/components/react-bits/FadeContent";
import { BreakdownBar, BreakdownDoughnut, TrendLine } from "@/components/charts/charts";
import { BreakdownList } from "@/components/ui/breakdown-list";
import { KpiCard } from "@/components/ui/kpi-card";
import { PageHeader } from "@/components/ui/page-header";
import { PanelCard } from "@/components/ui/panel-card";
import { getOverviewData } from "@/lib/analytics/metrics";
import { getDict, isLocale, type Locale } from "@/lib/i18n/dictionaries";

export default async function OverviewPage(props: PageProps<"/[locale]">) {
  const { locale } = await props.params;
  if (!isLocale(locale)) {
    return null;
  }
  const dict = getDict(locale);
  const data = await getOverviewData(locale as Locale);
  const o = dict.overview;

  return (
    <div>
      <PageHeader title={o.title} subtitle={o.subtitle} />

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-3 xl:grid-cols-6">
        <KpiCard label={o.kpiPoints} value={data.counts.points} hint={o.kpiPointsHint} />
        <KpiCard
          label={o.kpiOpen}
          value={data.openPoints}
          hint={o.kpiOpenHint}
        />
        <KpiCard
          label={o.kpiNeeds}
          value={data.activeNeeds}
          hint={o.kpiNeedsHint.replace("{total}", String(data.counts.needs))}
        />
        <KpiCard label={o.kpiUrgent} value={data.urgentNeeds} hint={o.kpiUrgentHint} />
        <KpiCard
          label={o.kpiSupporters}
          value={data.counts.supporters}
          hint={o.kpiSupportersHint}
        />
        <KpiCard
          label={o.kpiComments}
          value={data.counts.comments}
          hint={o.kpiCommentsHint}
        />
      </div>

      <FadeContent
        threshold={0.05}
        duration={700}
        delay={80}
        className="mt-4 grid gap-4 lg:grid-cols-3"
      >
        <PanelCard
          title={o.chartCreation}
          hint={o.chartCreationHint}
          className="lg:col-span-2"
          bodyClassName="p-4 pt-3"
        >
          <TrendLine
            labels={data.creationSeries.labels}
            datasets={[
              { label: o.seriesPoints, data: data.creationSeries.points },
              { label: o.seriesNeeds, data: data.creationSeries.needs },
            ]}
          />
        </PanelCard>

        <PanelCard title={o.chartPointStatus} bodyClassName="p-4 pt-3">
          {data.pointsByStatus.length > 0 ? (
            <BreakdownDoughnut
              labels={data.pointsByStatus.map((e) => e.key)}
              values={data.pointsByStatus.map((e) => e.count)}
            />
          ) : (
            <p className="py-10 text-center text-xs text-fg-subtle">{o.noData}</p>
          )}
        </PanelCard>
      </FadeContent>

      <FadeContent
        threshold={0.05}
        duration={700}
        delay={120}
        className="mt-4 grid gap-4 lg:grid-cols-3"
      >
        <PanelCard title={o.chartTopBarrios} hint={o.chartTopBarriosHint}>
          <BreakdownList entries={data.pointsByComuna} emptyLabel={o.noData} />
        </PanelCard>

        <PanelCard title={o.chartNeedsUrgency} bodyClassName="p-4 pt-3">
          {data.needsByUrgency.length > 0 ? (
            <BreakdownDoughnut
              labels={data.needsByUrgency.map((e) => e.key)}
              values={data.needsByUrgency.map((e) => e.count)}
              variant="urgency"
            />
          ) : (
            <p className="py-10 text-center text-xs text-fg-subtle">{o.noData}</p>
          )}
        </PanelCard>

        <PanelCard title={dict.points.chartCategory} bodyClassName="p-4 pt-3">
          {data.pointsByCategory.length > 0 ? (
            <BreakdownBar
              labels={data.pointsByCategory.map((e) => e.key)}
              values={data.pointsByCategory.map((e) => e.count)}
              height={220}
              horizontal
            />
          ) : (
            <p className="py-10 text-center text-xs text-fg-subtle">{o.noData}</p>
          )}
        </PanelCard>
      </FadeContent>

      <p className="mt-6 text-xs text-fg-subtle">
        {dict.common.updateHint} · {dict.common.source}
      </p>
    </div>
  );
}
