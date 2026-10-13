export interface BreakdownEntry {
  key: string;
  count: number;
}

export function countBy(
  rows: Record<string, unknown>[],
  column: string,
): BreakdownEntry[] {
  const map = new Map<string, number>();
  for (const row of rows) {
    const raw = row[column];
    const key = raw === null || raw === undefined || raw === "" ? "—" : String(raw);
    map.set(key, (map.get(key) ?? 0) + 1);
  }
  return [...map.entries()]
    .map(([key, count]) => ({ key, count }))
    .sort((a, b) => b.count - a.count || a.key.localeCompare(b.key));
}

export function monthKey(iso: string): string | null {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return null;
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
}

export function dayKey(iso: string): string | null {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return null;
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

export function addMonth(key: string, delta: number): string {
  const [y, m] = key.split("-").map(Number);
  const d = new Date(y, m - 1 + delta, 1);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
}

export function currentMonthKey(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
}

/** Rango continuo de meses cubriendo las claves usadas (máx 12). */
export function monthRange(used: Set<string>): string[] {
  const now = currentMonthKey();
  let min = now;
  let max = now;
  for (const k of used) {
    if (k < min) min = k;
    if (k > max) max = k;
  }
  if (used.size === 0) min = addMonth(now, -5);

  let span = 0;
  let cursor = min;
  while (cursor <= max && span < 12) {
    cursor = addMonth(cursor, 1);
    span++;
  }
  if (span >= 12) min = addMonth(max, -11);

  const keys: string[] = [];
  let c = min;
  while (c <= max) {
    keys.push(c);
    c = addMonth(c, 1);
  }
  return keys;
}

export function bucketCounts(
  timestamps: string[],
  keyOf: (iso: string) => string | null,
): Map<string, number> {
  const map = new Map<string, number>();
  for (const ts of timestamps) {
    const k = keyOf(ts);
    if (k) map.set(k, (map.get(k) ?? 0) + 1);
  }
  return map;
}
