export type ColumnType =
  | "text"
  | "number"
  | "boolean"
  | "timestamp"
  | "array";

export interface ColumnDef {
  name: string;
  type: ColumnType;
}

export interface TableDef {
  name: string;
  description: string;
  timeColumn: string | null;
  columns: ColumnDef[];
}

export const TABLES = {
  help_points: {
    name: "help_points",
    description: "Puntos de ayuda georreferenciados (albergues, acopio, salud…).",
    timeColumn: "created_at",
    columns: [
      { name: "id", type: "text" },
      { name: "name", type: "text" },
      { name: "category", type: "text" },
      { name: "lat", type: "number" },
      { name: "lng", type: "number" },
      { name: "address", type: "text" },
      { name: "barrio", type: "text" },
      { name: "comuna", type: "text" },
      { name: "phone", type: "text" },
      { name: "whatsapp", type: "text" },
      { name: "contact_person", type: "text" },
      { name: "description", type: "text" },
      { name: "schedule", type: "text" },
      { name: "status", type: "text" },
      { name: "urgent_items", type: "array" },
      { name: "capacity", type: "text" },
      { name: "verified", type: "boolean" },
      { name: "author_id", type: "text" },
      { name: "created_at", type: "timestamp" },
      { name: "updated_at", type: "timestamp" },
    ],
  },
  help_needs: {
    name: "help_needs",
    description: "Necesidades o solicitudes de apoyo publicadas por la comunidad.",
    timeColumn: "created_at",
    columns: [
      { name: "id", type: "text" },
      { name: "title", type: "text" },
      { name: "description", type: "text" },
      { name: "category", type: "text" },
      { name: "urgency", type: "text" },
      { name: "barrio", type: "text" },
      { name: "contact_name", type: "text" },
      { name: "contact_phone", type: "text" },
      { name: "items", type: "array" },
      { name: "status", type: "text" },
      { name: "supporters_count", type: "number" },
      { name: "image_url", type: "text" },
      { name: "created_at", type: "timestamp" },
      { name: "author_id", type: "text" },
    ],
  },
  need_supporters: {
    name: "need_supporters",
    description: "Apoyos registrados por usuario sobre una necesidad.",
    timeColumn: "created_at",
    columns: [
      { name: "user_id", type: "text" },
      { name: "need_id", type: "text" },
      { name: "created_at", type: "timestamp" },
    ],
  },
  point_comments: {
    name: "point_comments",
    description: "Comentarios de usuarios sobre puntos de ayuda.",
    timeColumn: "created_at",
    columns: [
      { name: "id", type: "text" },
      { name: "author_id", type: "text" },
      { name: "point_id", type: "text" },
      { name: "body", type: "text" },
      { name: "created_at", type: "timestamp" },
    ],
  },
  entity_reports: {
    name: "entity_reports",
    description: "Reportes sobre entidades (puntos o necesidades).",
    timeColumn: "created_at",
    columns: [
      { name: "id", type: "text" },
      { name: "need_id", type: "text" },
      { name: "entity_id", type: "text" },
      { name: "point_id", type: "text" },
      { name: "reporter_id", type: "text" },
      { name: "reason", type: "text" },
      { name: "created_at", type: "timestamp" },
    ],
  },
} as const satisfies Record<string, TableDef>;

export type TableName = keyof typeof TABLES;

export const TABLE_NAMES = Object.keys(TABLES) as TableName[];

export function isTableName(value: string): value is TableName {
  return (TABLE_NAMES as string[]).includes(value);
}

export function isColumnOf(table: TableName, column: string): boolean {
  return TABLES[table].columns.some((c) => c.name === column);
}

export function columnNames(table: TableName): string[] {
  return TABLES[table].columns.map((c) => c.name);
}

export function timeColumn(table: TableName): string | null {
  return TABLES[table].timeColumn;
}
