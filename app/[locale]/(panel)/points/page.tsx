import FadeContent from "@/components/react-bits/FadeContent";
import { BreakdownBar, BreakdownDoughnut } from "@/components/charts/charts";
import { PointsTable } from "@/components/tables/points-table";
import { BreakdownList } from "@/components/ui/breakdown-list";
import { PageHeader } from "@/components/ui/page-header";
import { PanelCard } from "@/components/ui/panel-card";
import { getPointsData } from "@/lib/analytics/metrics";
import { getDict, isLocale } from "@/lib/i18n/dictionaries";

export default async function PointsPage(props: PageProps<"/[locale]/points">) {
  const { locale } = await props.params;
  if (!isLocale(locale)) return null;
  const dict = getDict(locale);
  const t = dict.points;
  const data = await getPointsData();

  return (
    <div>
      <PageHeader title={t.title} subtitle={t.subtitle} />

      <FadeContent
        threshold={0.05}
        duration={700}
        delay={60}
        className="grid gap-4 lg:grid-cols-3"
      >
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

        <PanelCard title={t.chartComuna} bodyClassName="p-4 pt-3">
          {data.byComuna.length > 0 ? (
            <BreakdownBar
              labels={data.byComuna.map((e) => e.key)}
              values={data.byComuna.map((e) => e.count)}
              height={240}
              horizontal
            />
          ) : (
            <p className="py-10 text-center text-xs text-fg-subtle">
              {dict.common.empty}
            </p>
          )}
        </PanelCard>

        <PanelCard title={t.chartVerified} bodyClassName="p-4 pt-3">
          <BreakdownDoughnut
            labels={[dict.common.verified, dict.common.unverified]}
            values={[data.verified, data.unverified]}
          />
        </PanelCard>
      </FadeContent>

      <div className="mt-4 grid gap-4 lg:grid-cols-3">
        <PanelCard
          title={t.table}
          hint={`${data.rows.length} ${dict.common.rows}`}
          className="lg:col-span-2"
          bodyClassName=""
        >
          <PointsTable rows={data.rows} />
        </PanelCard>

        <PanelCard title={t.chartStatus}>
          <BreakdownList entries={data.byStatus} emptyLabel={dict.common.empty} />
        </PanelCard>
      </div>
    </div>
  );
}
