"use client";

import { Badge, needStatusKind, needUrgencyKind } from "@/components/ui/badge";
import { DataTable, type TableColumn } from "@/components/ui/data-table";
import type { NeedRow } from "@/lib/analytics/metrics";
import { useI18n } from "@/lib/i18n/provider";
import { formatDate } from "@/lib/i18n/format";

export function NeedsTable({ rows }: { rows: NeedRow[] }) {
  const { locale, dict } = useI18n();
  const t = dict.needs;

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

  const columns: TableColumn<NeedRow>[] = [
    {
      key: "title",
      label: t.colTitle,
      render: (row) => (
        <span className="line-clamp-2 text-fg" title={row.title}>
          {row.title}
        </span>
      ),
    },
    { key: "category", label: t.colCategory },
    { key: "barrio", label: t.colBarrio },
    {
      key: "urgency",
      label: t.colUrgency,
      render: (row) => (
        <Badge kind={needUrgencyKind(row.urgency)}>{urgencyLabel(row.urgency)}</Badge>
      ),
    },
    {
      key: "status",
      label: t.colStatus,
      render: (row) => <Badge kind={needStatusKind(row.status)}>{row.status}</Badge>,
    },
    {
      key: "supporters_count",
      label: t.colSupporters,
      render: (row) => <span className="tnum text-fg">{row.supporters_count}</span>,
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
      searchFields={["title", "barrio", "category"]}
      searchPlaceholder={t.search}
      emptyTitle={dict.common.empty}
      emptyHint={dict.common.emptyHint}
    />
  );
}
