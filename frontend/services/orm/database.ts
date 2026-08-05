import * as SQLite from "expo-sqlite";

let _db: any = null;

export async function getDb(): Promise<any> {
  if (_db) return _db;
  _db = await SQLite.openDatabaseAsync("app.db");
  return _db;
}

export async function run(sql: string, params: any[] = []) {
  const db = await getDb();
  return db.runAsync(sql, params);
}

export async function all<T = any>(sql: string, params: any[] = []): Promise<T[]> {
  const db = await getDb();
  return db.getAllAsync(sql, params) as Promise<T[]>;
}

export async function first<T = any>(sql: string, params: any[] = []): Promise<T | null> {
  const db = await getDb();
  return db.getFirstAsync(sql, params) as Promise<T | null>;
}

export async function exec(sql: string) {
  const db = await getDb();
  return db.execAsync(sql);
}
