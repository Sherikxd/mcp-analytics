import type { McpServer } from "@modelcontextprotocol/server";
import { z } from "zod";
import {
  bucketCounts,
  countBy,
  dayKey,
  monthKey,
  monthRange,
} from "@/lib/analytics/aggregate";
import {
  MAX_LIMIT,
  QueryValidationError,
  countRows,
  fetchAll,
  fetchRows,
  type Filter,
  type FilterOp,
} from "@/lib/analytics/queries";
import {
  TABLES,
  TABLE_NAMES,
  columnNames,
  isColumnOf,
  isTableName,
  timeColumn,
} from "@/lib/analytics/schema";

type ToolResult = {
  content: { type: "text"; text: string }[];
  isError?: boolean;
};

function ok(data: unknown): ToolResult {
  return { content: [{ type: "text", text: JSON.stringify(data, null, 2) }] };
}

function fail(message: string): ToolResult {
  return { content: [{ type: "text", text: message }], isError: true };
}

function errorResult(error: unknown): ToolResult {
  if (error instanceof QueryValidationError) return fail(error.message);
  return fail(error instanceof Error ? error.message : String(error));
}

const dateish = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/, "Debe tener formato YYYY-MM-DD");

async function kpiBundle() {
  const [
    points,
    needs,
    supporters,
    comments,
    reports,
    pointRows,
    needRows,
  ] = await Promise.all([
    countRows("help_points"),
    countRows("help_needs"),
    countRows("need_supporters"),
    countRows("point_comments"),
    countRows("entity_reports"),
    fetchAll("help_points", { columns: "status, verified" }),
    fetchAll("help_needs", { columns: "urgency, status" }),
  ]);

  const openPoints = pointRows.filter(
    (r) => String(r.status).toLowerCase() === "abierto",
  ).length;
  const verifiedPoints = pointRows.filter((r) => r.verified === true).length;
  const urgentNeeds = needRows.filter((r) =>
    ["alta", "media"].includes(String(r.urgency).toLowerCase()),
  ).length;
  const activeNeeds = needRows.filter(
    (r) => String(r.status).toLowerCase() === "activa",
  ).length;

  return {
    tables: {
      help_points: points,
      help_needs: needs,
      need_supporters: supporters,
      point_comments: comments,
      entity_reports: reports,
    },
    kpis: {
      open_points: openPoints,
      verified_points: verifiedPoints,
      active_needs: activeNeeds,
      urgent_needs: urgentNeeds,
    },
  };
}

function buildFilters(
  table: keyof typeof TABLES,
  from?: string,
  to?: string,
): Filter[] {
  const filters: Filter[] = [];
  const t = timeColumn(table);
  if (t) {
    if (from) filters.push({ column: t, op: "gte", value: from });
    if (to) filters.push({ column: t, op: "lte", value: `${to}T23:59:59` });
  }
  return filters;
}

export function registerAnalyticsTools(server: McpServer): void {
  server.registerTool(
    "get_schema",
    {
      title: "Get schema",
      description:
        "Devuelve las tablas disponibles en la base de datos de la plataforma de ayuda con sus columnas, tipos y número de filas. Úsala antes de consultar para conocer la estructura.",
      inputSchema: z.object({
        table: z
          .string()
          .optional()
          .describe("Nombre de una tabla concreta para ver solo su detalle"),
      }),
    },
    async ({ table }) => {
      try {
        if (table) {
          if (!isTableName(table)) {
            return fail(
              `Tabla desconocida "${table}". Disponibles: ${TABLE_NAMES.join(", ")}`,
            );
          }
          const count = await countRows(table);
          return ok({ ...TABLES[table], row_count: count });
        }

        const counts = await Promise.all(TABLE_NAMES.map((t) => countRows(t)));
        return ok({
          tables: TABLE_NAMES.map((name, i) => ({
            ...TABLES[name],
            columns: TABLES[name].columns,
            row_count: counts[i],
          })),
        });
      } catch (error) {
        return errorResult(error);
      }
    },
  );

  server.registerTool(
    "query_metrics",
    {
      title: "Query metrics",
      description:
        "Métricas agregadas de la plataforma. metric='totals' devuelve conteos globales y KPIs; metric='breakdown' desglosa una columna de una tabla (requiere table y column); metric='series' devuelve una serie temporal de creaciones por día o mes (requiere table).",
      inputSchema: z.object({
        metric: z.enum(["totals", "breakdown", "series"]),
        table: z.string().optional().describe("Tabla (query_metrics breakdown/series)"),
        column: z
          .string()
          .optional()
          .describe("Columna para agrupar (solo breakdown)"),
        interval: z
          .enum(["day", "month"])
          .optional()
          .describe("Intervalo de la serie (solo series, por defecto month)"),
        from: dateish.optional().describe("Fecha inicio YYYY-MM-DD (opcional)"),
        to: dateish.optional().describe("Fecha fin YYYY-MM-DD (opcional)"),
      }),
    },
    async ({ metric, table, column, interval, from, to }) => {
      try {
        if (metric === "totals") {
          return ok(await kpiBundle());
        }

        if (!table || !isTableName(table)) {
          return fail(
            `Parámetro "table" obligatorio y válido. Disponibles: ${TABLE_NAMES.join(", ")}`,
          );
        }

        if (metric === "breakdown") {
          if (!column || !isColumnOf(table, column)) {
            return fail(
              `Parámetro "column" obligatorio y válido para "${table}". Columnas: ${columnNames(table).join(", ")}`,
            );
          }
          const rows = await fetchAll(table, {
            columns: [column, timeColumn(table)].filter(Boolean).join(", "),
            filters: buildFilters(table, from, to),
          });
          return ok({
            table,
            column,
            total: rows.length,
            breakdown: countBy(rows, column),
          });
        }

        // series
        const t = timeColumn(table);
        if (!t) {
          return fail(`La tabla "${table}" no tiene columna temporal.`);
        }
        const rows = await fetchAll(table, {
          columns: t,
          filters: buildFilters(table, from, to),
          order: { column: t, ascending: true },
        });
        const keyOf = interval === "day" ? dayKey : monthKey;
        const buckets = bucketCounts(
          rows.map((r) => String(r[t])),
          keyOf,
        );
        const series = [...buckets.entries()]
          .map(([key, count]) => ({ key, count }))
          .sort((a, b) => a.key.localeCompare(b.key));
        return ok({
          table,
          interval: interval ?? "month",
          total: rows.length,
          series,
        });
      } catch (error) {
        return errorResult(error);
      }
    },
  );

  server.registerTool(
    "query_table",
    {
      title: "Query table",
      description:
        "Consulta filas de una tabla con filtros acotados. Solo se permiten las tablas y columnas registradas; máximo 500 filas por llamada. Usa get_schema para conocer la estructura.",
      inputSchema: z.object({
        table: z.string(),
        columns: z
          .array(z.string())
          .max(20)
          .optional()
          .describe("Columnas a devolver (por defecto todas)"),
        filters: z
          .array(
            z.object({
              column: z.string(),
              op: z.enum(["eq", "neq", "gte", "lte", "like", "ilike"]),
              value: z.union([z.string(), z.number(), z.boolean()]),
            }),
          )
          .max(8)
          .optional(),
        order: z
          .object({
            column: z.string(),
            ascending: z.boolean().optional(),
          })
          .optional(),
        limit: z.number().int().min(1).max(MAX_LIMIT).optional(),
        offset: z.number().int().min(0).optional(),
      }),
    },
    async ({ table, columns, filters, order, limit, offset }) => {
      try {
        if (!isTableName(table)) {
          return fail(
            `Tabla desconocida "${table}". Disponibles: ${TABLE_NAMES.join(", ")}`,
          );
        }

        const safeFilters: Filter[] = (filters ?? []).map((f) => ({
          column: f.column,
          op: f.op as FilterOp,
          value: f.value,
        }));

        const rows = await fetchRows(table, {
          columns: columns?.join(", "),
          filters: safeFilters,
          order,
          limit: limit ?? 50,
          offset,
        });

        const payload = JSON.stringify({ table, count: rows.length, rows }, null, 2);
        if (payload.length > 120_000) {
          const reduced = await fetchRows(table, {
            columns: columns?.join(", "),
            filters: safeFilters,
            order,
            limit: Math.min(limit ?? 25, 25),
            offset,
          });
          return ok({
            table,
            count: reduced.length,
            truncated: true,
            note: "Respuesta reducida por tamaño. Usa filters/columns/limit más específicos.",
            rows: reduced,
          });
        }
        return { content: [{ type: "text" as const, text: payload }] };
      } catch (error) {
        return errorResult(error);
      }
    },
  );

  server.registerTool(
    "generate_report",
    {
      title: "Generate report",
      description:
        "Genera un informe de texto con los KPIs actuales, desgloses principales y tendencia mensual de la plataforma, calculado en el servidor.",
      inputSchema: z.object({
        locale: z
          .enum(["es", "en"])
          .optional()
          .describe("Idioma del informe (por defecto es)"),
      }),
    },
    async ({ locale }) => {
      try {
        const lang = locale ?? "es";
        const bundle = await kpiBundle();

        const [pointBreakdowns, needBreakdowns, needRows, pointMonths, needMonths] =
          await Promise.all([
            fetchAll("help_points", {
              columns: "status, category, comuna, verified",
            }),
            fetchAll("help_needs", { columns: "urgency, status" }),
            fetchAll<{ title: string; supporters_count: number }>("help_needs", {
              columns: "title, supporters_count",
            }),
            fetchAll("help_points", { columns: "created_at" }),
            fetchAll("help_needs", { columns: "created_at" }),
          ]);

        const used = new Set<string>();
        for (const r of [...pointMonths, ...needMonths]) {
          const k = monthKey(String(r.created_at));
          if (k) used.add(k);
        }
        const keys = monthRange(used);
        const pByMonth = bucketCounts(
          pointMonths.map((r) => String(r.created_at)),
          monthKey,
        );
        const nByMonth = bucketCounts(
          needMonths.map((r) => String(r.created_at)),
          monthKey,
        );

        const topComunas = countBy(pointBreakdowns, "comuna").slice(0, 5);
        const topNeeds = [...needRows]
          .sort((a, b) => b.supporters_count - a.supporters_count)
          .slice(0, 5)
          .map((r) => ({ key: r.title, count: r.supporters_count }));
        const byUrgency = countBy(needBreakdowns, "urgency");
        const byPointStatus = countBy(pointBreakdowns, "status");

        const L =
          lang === "es"
            ? {
                title: "Informe de analítica — Plataforma de ayuda",
                generated: "Generado",
                totals: "Totales por tabla",
                kpis: "KPIs",
                pointStatus: "Puntos por estado",
                topComunas: "Top comunas (puntos)",
                urgency: "Necesidades por urgencia",
                topNeeds: "Necesidades con más apoyos",
                trend: "Tendencia mensual de creaciones",
                points: "puntos",
                needs: "necesidades",
                empty: "Sin registros",
                emptyTables: "Tablas sin datos",
                note: "Los datos se leen en vivo desde Supabase; las tablas vacías aparecen con 0.",
              }
            : {
                title: "Analytics report — Help platform",
                generated: "Generated",
                totals: "Totals per table",
                kpis: "KPIs",
                pointStatus: "Points by status",
                topComunas: "Top districts (points)",
                urgency: "Needs by urgency",
                topNeeds: "Needs with most supporters",
                trend: "Monthly creation trend",
                points: "points",
                needs: "needs",
                empty: "No records",
                emptyTables: "Empty tables",
                note: "Data is read live from Supabase; empty tables show 0.",
              };

        const lines: string[] = [];
        lines.push(L.title);
        lines.push(`${L.generated}: ${new Date().toISOString().slice(0, 16)}Z`);
        lines.push("");
        lines.push(`## ${L.totals}`);
        for (const [name, count] of Object.entries(bundle.tables)) {
          lines.push(`- ${name}: ${count}`);
        }
        lines.push("");
        lines.push(`## ${L.kpis}`);
        lines.push(`- open_points: ${bundle.kpis.open_points}`);
        lines.push(`- verified_points: ${bundle.kpis.verified_points}`);
        lines.push(`- active_needs: ${bundle.kpis.active_needs}`);
        lines.push(`- urgent_needs: ${bundle.kpis.urgent_needs}`);
        lines.push("");
        lines.push(`## ${L.pointStatus}`);
        for (const e of byPointStatus) lines.push(`- ${e.key}: ${e.count}`);
        if (byPointStatus.length === 0) lines.push(L.empty);
        lines.push("");
        lines.push(`## ${L.topComunas}`);
        for (const e of topComunas) lines.push(`- ${e.key}: ${e.count}`);
        if (topComunas.length === 0) lines.push(L.empty);
        lines.push("");
        lines.push(`## ${L.urgency}`);
        for (const e of byUrgency) lines.push(`- ${e.key}: ${e.count}`);
        if (byUrgency.length === 0) lines.push(L.empty);
        lines.push("");
        lines.push(`## ${L.topNeeds}`);
        for (const e of topNeeds) lines.push(`- ${e.key}: ${e.count}`);
        if (topNeeds.length === 0) lines.push(L.empty);
        lines.push("");
        lines.push(`## ${L.trend}`);
        for (const k of keys) {
          lines.push(
            `- ${k}: ${pByMonth.get(k) ?? 0} ${L.points}, ${nByMonth.get(k) ?? 0} ${L.needs}`,
          );
        }
        const empties = Object.entries(bundle.tables)
          .filter(([, c]) => c === 0)
          .map(([name]) => name);
        if (empties.length > 0) {
          lines.push("");
          lines.push(`## ${L.emptyTables}`);
          lines.push(`- ${empties.join(", ")}`);
        }
        lines.push("");
        lines.push(L.note);

        return { content: [{ type: "text" as const, text: lines.join("\n") }] };
      } catch (error) {
        return errorResult(error);
      }
    },
  );
}
