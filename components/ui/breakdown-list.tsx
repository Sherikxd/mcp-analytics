import type { BreakdownEntry } from "@/lib/analytics/metrics";

export function BreakdownList({
  entries,
  max,
  emptyLabel,
}: {
  entries: BreakdownEntry[];
  max?: number;
  emptyLabel: string;
}) {
  if (entries.length === 0) {
    return <p className="py-6 text-center text-xs text-fg-subtle">{emptyLabel}</p>;
  }

  const peak = max ?? Math.max(...entries.map((e) => e.count), 1);

  return (
    <ul className="space-y-2.5">
      {entries.map((entry) => (
        <li key={entry.key} className="flex items-center gap-3">
          <span className="w-40 shrink-0 truncate text-xs text-fg-muted" title={entry.key}>
            {entry.key}
          </span>
          <span className="h-2 flex-1 bg-surface-2">
            <span
              className="block h-2 bg-fg"
              style={{ width: `${Math.max(2, (entry.count / peak) * 100)}%` }}
            />
          </span>
          <span className="w-8 shrink-0 text-right text-xs font-medium text-fg tnum">
            {entry.count}
          </span>
        </li>
      ))}
    </ul>
  );
}
