import { getSupabase } from "@/lib/supabase/server";
import {
  isColumnOf,
  isTableName,
  timeColumn,
  type TableName,
} from "@/lib/analytics/schema";

export const MAX_LIMIT = 500;
export const DEFAULT_LIMIT = 100;

export type FilterOp = "eq" | "neq" | "gte" | "lte" | "like" | "ilike";

export interface Filter {
  column: string;
  op: FilterOp;
  value: string | number | boolean;
}

export interface FetchRowsOptions {
  columns?: string;
  filters?: Filter[];
  order?: { column: string; ascending?: boolean };
  limit?: number;
  offset?: number;
}

const FILTER_OPS: FilterOp[] = ["eq", "neq", "gte", "lte", "like", "ilike"];

export class QueryValidationError extends Error {}

function assertTable(table: string): asserts table is TableName {
  if (!isTableName(table)) {
    throw new QueryValidationError(`Tabla no permitida: ${table}`);
  }
}

function assertFilters(table: TableName, filters: Filter[] = []): Filter[] {
  for (const f of filters) {
    if (!isColumnOf(table, f.column)) {
      throw new QueryValidationError(
        `Columna no permitida "${f.column}" en tabla "${table}"`,
      );
    }
    if (!FILTER_OPS.includes(f.op)) {
      throw new QueryValidationError(`Operador no permitido: ${f.op}`);
    }
  }
  return filters;
}

/* eslint-disable @typescript-eslint/no-explicit-any */
function applyFilters(query: any, filters: Filter[]): any {
  let q = query;
  for (const f of filters) {
    const value = typeof f.value === "boolean" ? String(f.value) : f.value;
    q = q[f.op](f.column, value);
  }
  return q;
}

function clampLimit(limit?: number): number {
  if (!limit || !Number.isFinite(limit) || limit < 1) return DEFAULT_LIMIT;
  return Math.min(Math.floor(limit), MAX_LIMIT);
}

export async function fetchRows<T = Record<string, unknown>>(
  table: string,
  options: FetchRowsOptions = {},
): Promise<T[]> {
  assertTable(table);
  const filters = assertFilters(table, options.filters);

  let query = getSupabase().from(table).select(options.columns || "*", {
    count: "exact",
  });

  query = applyFilters(query as never, filters) as typeof query;

  if (options.order?.column && isColumnOf(table, options.order.column)) {
    query = query.order(options.order.column, {
      ascending: options.order.ascending ?? false,
    });
  } else {
    const t = timeColumn(table);
    if (t) query = query.order(t, { ascending: false });
  }

  query = query.limit(clampLimit(options.limit));

  if (options.offset && options.offset > 0) {
    query = query.range(
      options.offset,
      options.offset + clampLimit(options.limit) - 1,
    );
  }

  const { data, error } = await query;
  if (error) {
    throw new Error(`Consulta fallida en "${table}": ${error.message}`);
  }
  return (data ?? []) as T[];
}

export async function countRows(
  table: string,
  filters: Filter[] = [],
): Promise<number> {
  assertTable(table);
  const validFilters = assertFilters(table, filters);

  let query = getSupabase().from(table).select("*", { count: "exact", head: true });
  query = applyFilters(query as never, validFilters) as typeof query;

  const { count, error } = await query;
  if (error) {
    throw new Error(`Conteo fallido en "${table}": ${error.message}`);
  }
  return count ?? 0;
}

const MAX_PAGES = 20;
const PAGE_SIZE = MAX_LIMIT;

/**
 * Recorre la tabla en páginas para agregaciones correctas aunque la tabla
 * crezca más allá de MAX_LIMIT. Tope duro de MAX_PAGES * PAGE_SIZE filas.
 */
export async function fetchAll<T = Record<string, unknown>>(
  table: string,
  options: Omit<FetchRowsOptions, "limit" | "offset"> = {},
): Promise<T[]> {
  const all: T[] = [];
  for (let page = 0; page < MAX_PAGES; page++) {
    const rows = await fetchRows<T>(table, {
      ...options,
      limit: PAGE_SIZE,
      offset: page * PAGE_SIZE,
    });
    all.push(...rows);
    if (rows.length < PAGE_SIZE) break;
  }
  return all;
}

/** Devuelve los valores de una columna (para agregaciones en memoria). */
export async function fetchColumnValues(
  table: string,
  column: string,
  filters: Filter[] = [],
): Promise<(string | number | boolean | null)[]> {
  const rows = await fetchRows<Record<string, unknown>>(table, {
    columns: column,
    filters,
    limit: MAX_LIMIT,
  });
  return rows.map((r) => (r[column] ?? null) as string | number | boolean | null);
}

/** Devuelve pares [timestamp, valor] para series temporales. */
export async function fetchTimeSeries(
  table: string,
  filters: Filter[] = [],
): Promise<string[]> {
  assertTable(table);
  const t = timeColumn(table);
  if (!t) return [];
  const rows = await fetchRows<Record<string, unknown>>(table, {
    columns: t,
    filters,
    limit: MAX_LIMIT,
    order: { column: t, ascending: true },
  });
  return rows.map((r) => String(r[t]));
}
