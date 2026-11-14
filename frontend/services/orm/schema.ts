export type SqlType = "INTEGER" | "REAL" | "TEXT" | "BOOLEAN";

export interface ColumnDefinition {
  name: string;
  type: SqlType;
  primaryKey?: boolean;
  autoIncrement?: boolean;
  notNull?: boolean;
  default?: number | string | boolean | null;
}

export interface TableDefinition {
  name: string;
  columns: ColumnDefinition[];
  indices?: { name: string; columns: string[]; unique?: boolean }[];
}

export const measurementTable: TableDefinition = {
  name: "measurements",
  columns: [
    { name: "id", type: "INTEGER", primaryKey: true, autoIncrement: true },
    { name: "value", type: "REAL", notNull: true },
    { name: "date", type: "TEXT", notNull: true },
    { name: "context", type: "TEXT", notNull: false, default: "geral" },
    { name: "note", type: "TEXT", notNull: false, default: null },
    { name: "synced", type: "BOOLEAN", notNull: true, default: 0 },
    { name: "server_id", type: "TEXT", notNull: false, default: null },
  ],
  indices: [{ name: "idx_measurements_date", columns: ["date"] }],
};

export const mealTable: TableDefinition = {
  name: "meals",
  columns: [
    { name: "id", type: "INTEGER", primaryKey: true, autoIncrement: true },
    { name: "name", type: "TEXT", notNull: true },
    { name: "carbs_grams", type: "REAL", notNull: true, default: 0 },
    { name: "insulin_units", type: "REAL", notNull: true, default: 0 },
    { name: "notes", type: "TEXT", notNull: false, default: null },
    { name: "eaten_at", type: "TEXT", notNull: true },
    { name: "synced", type: "BOOLEAN", notNull: true, default: 0 },
    { name: "server_id", type: "TEXT", notNull: false, default: null },
  ],
  indices: [{ name: "idx_meals_eaten_at", columns: ["eaten_at"] }],
};
