"use client";

import { useMemo, useState, type ReactNode } from "react";

export interface TableColumn<T> {
  key: string;
  label: string;
  render?: (row: T) => ReactNode;
  className?: string;
}

interface DataTableProps<T> {
  rows: T[];
  columns: TableColumn<T>[];
  searchFields: (keyof T & string)[];
  searchPlaceholder: string;
  emptyTitle: string;
  emptyHint?: string;
}

export function DataTable<T>({
  rows,
  columns,
  searchFields,
  searchPlaceholder,
  emptyTitle,
  emptyHint,
}: DataTableProps<T>) {
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return rows;
    return rows.filter((row) => {
      const record = row as Record<string, unknown>;
      return searchFields.some((field) =>
        String(record[field] ?? "")
          .toLowerCase()
          .includes(q),
      );
    });
  }, [rows, query, searchFields]);

  return (
    <div>
      <div className="flex items-center justify-between gap-3 border-b border-line px-4 py-3">
        <input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={searchPlaceholder}
          className="w-full max-w-xs border border-line bg-bg px-3 py-1.5 text-xs text-fg outline-none transition-colors placeholder:text-fg-subtle focus:border-fg"
        />
        <span className="hidden shrink-0 text-xs text-fg-subtle tnum sm:block">
          {filtered.length}
        </span>
      </div>

      {filtered.length === 0 ? (
        <div className="px-4 py-10 text-center">
          <p className="text-sm font-medium text-fg-muted">{emptyTitle}</p>
          {emptyHint ? (
            <p className="mt-1 text-xs text-fg-subtle">{emptyHint}</p>
          ) : null}
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-line">
                {columns.map((col) => (
                  <th
                    key={col.key}
                    className={`px-4 py-2.5 text-xs font-medium uppercase tracking-wider text-fg-subtle ${col.className ?? ""}`}
                  >
                    {col.label}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map((row, i) => {
                const record = row as Record<string, unknown>;
                return (
                  <tr
                    key={String(record.id ?? i)}
                    className="border-b border-line transition-colors last:border-b-0 hover:bg-surface-2"
                  >
                    {columns.map((col) => (
                      <td
                        key={col.key}
                        className={`px-4 py-2.5 text-fg-muted ${col.className ?? ""}`}
                      >
                        {col.render ? col.render(row) : String(record[col.key] ?? "—")}
                      </td>
                    ))}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
