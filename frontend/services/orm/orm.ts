import { all, first, run } from "./database";
import { buildCreateIndicesSQL, buildCreateTableSQL, buildInsertSQL, buildUpdateSQL } from "./helpers";
import { TableDefinition } from "./schema";

export async function createTable(table: TableDefinition) {
  const sql = buildCreateTableSQL(table);
  await run(sql);
  const indices = buildCreateIndicesSQL(table);
  for (const i of indices) {
    await run(i);
  }
}

export async function insert(table: string, data: Record<string, any>) {
  const { sql, params } = buildInsertSQL(table, data);
  await run(sql, params);
}

export async function update(table: string, data: Record<string, any>, where: string, whereParams: any[] = []) {
  const { sql, params } = buildUpdateSQL(table, data, where);
  await run(sql, [...params, ...whereParams]);
}

export async function remove(table: string, where: string, params: any[] = []) {
  const sql = `DELETE FROM ${table} WHERE ${where};`;
  await run(sql, params);
}

export async function select<T = any>(table: string, where?: string, params: any[] = []): Promise<T[]> {
  const sql = where ? `SELECT * FROM ${table} WHERE ${where};` : `SELECT * FROM ${table};`;
  return await all<T>(sql, params);
}

export async function firstRow<T = any>(table: string, where?: string, params: any[] = []): Promise<T | null> {
  const sql = where ? `SELECT * FROM ${table} WHERE ${where} LIMIT 1;` : `SELECT * FROM ${table} LIMIT 1;`;
  return await first<T>(sql, params);
}
