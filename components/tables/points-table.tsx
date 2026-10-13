"use client";

import { Badge, pointStatusKind } from "@/components/ui/badge";
import { DataTable, type TableColumn } from "@/components/ui/data-table";
import type { PointRow } from "@/lib/analytics/metrics";
import { useI18n } from "@/lib/i18n/provider";
import { formatDate } from "@/lib/i18n/format";

export function PointsTable({ rows }: { rows: PointRow[] }) {
  const { locale, dict } = useI18n();
  const t = dict.points;

  const columns: TableColumn<PointRow>[] = [
    {
      key: "name",
      label: t.colName,
      render: (row) => (
        <span className="line-clamp-2 text-fg" title={row.name}>
          {row.name}
        </span>
      ),
    },
    { key: "category", label: t.colCategory },
    { key: "comuna", label: t.colComuna },
    { key: "barrio", label: t.colBarrio },
    {
      key: "status",
      label: t.colStatus,
      render: (row) => <Badge kind={pointStatusKind(row.status)}>{row.status}</Badge>,
    },
    {
      key: "verified",
      label: t.colVerified,
      render: (row) => (
        <Badge kind={row.verified ? "ok" : "neutral"}>
          {row.verified ? dict.common.verified : dict.common.unverified}
        </Badge>
      ),
    },
    {
      key: "created_at",
      label: t.colCreated,
      render: (row) => (
        <span className="tnum">{formatDate(row.created_at, locale)}</span>
      ),
    },
  ];

  return (
    <DataTable
      rows={rows}
      columns={columns}
      searchFields={["name", "barrio", "comuna", "category"]}
      searchPlaceholder={t.search}
      emptyTitle={dict.common.empty}
      emptyHint={dict.common.emptyHint}
    />
  );
}
