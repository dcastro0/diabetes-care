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
    { name: "note", type: "TEXT", notNull: false, default: null },
    { name: "synced", type: "BOOLEAN", notNull: true, default: 0 }
  ],
  indices: [{ name: "idx_measurements_date", columns: ["date"] }]
};
