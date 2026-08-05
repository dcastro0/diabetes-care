import { TableDefinition } from "./schema";

function formatDefault(d: any) {
  if (d === null) return "NULL";
  if (typeof d === "number") return String(d);
  if (typeof d === "boolean") return d ? "1" : "0";
  return `'${String(d).replace(/'/g, "''")}'`;
}

export function buildCreateTableSQL(table: TableDefinition): string {
  const cols = table.columns
    .map(col => {
      let def = `${col.name} ${col.type}`;
      if (col.primaryKey) def += " PRIMARY KEY";
      if (col.autoIncrement) def += " AUTOINCREMENT";
      if (col.notNull) def += " NOT NULL";
      if (col.default !== undefined) def += ` DEFAULT ${formatDefault(col.default)}`;
      return def;
    })
    .join(", ");
  return `CREATE TABLE IF NOT EXISTS ${table.name} (${cols});`;
}

export function buildCreateIndicesSQL(table: TableDefinition): string[] {
  if (!table.indices) return [];
  return table.indices.map(idx => {
    const uniq = idx.unique ? "UNIQUE" : "";
    const cols = idx.columns.join(", ");
    return `CREATE ${uniq} INDEX IF NOT EXISTS ${idx.name} ON ${table.name} (${cols});`;
  });
}

export function buildInsertSQL(table: string, data: Record<string, any>) {
  const keys = Object.keys(data);
  const placeholders = keys.map(() => "?").join(", ");
  const sql = `INSERT INTO ${table} (${keys.join(", ")}) VALUES (${placeholders});`;
  const params = keys.map(k => (typeof data[k] === "boolean" ? (data[k] ? 1 : 0) : data[k]));
  return { sql, params };
}

export function buildUpdateSQL(table: string, data: Record<string, any>, where: string) {
  const keys = Object.keys(data);
  const setClause = keys.map(k => `${k} = ?`).join(", ");
  const sql = `UPDATE ${table} SET ${setClause} WHERE ${where};`;
  const params = keys.map(k => (typeof data[k] === "boolean" ? (data[k] ? 1 : 0) : data[k]));
  return { sql, params };
}
