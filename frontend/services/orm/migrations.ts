import { exec, getDb, run } from "./database";
import { buildCreateIndicesSQL, buildCreateTableSQL } from "./helpers";
import { mealTable, measurementTable } from "./schema";

async function addColumnIfMissing(table: string, columnDef: string) {
  try {
    await run(`ALTER TABLE ${table} ADD COLUMN ${columnDef};`);
  } catch {
    // Column already exists on fresh table creation
  }
}

const migrations = [
  {
    version: 1,
    up: async () => {
      const sql = buildCreateTableSQL(measurementTable);
      await run(sql);
      const indices = buildCreateIndicesSQL(measurementTable);
      for (const i of indices) await exec(i);
    },
  },
  {
    version: 2,
    up: async () => {
      await addColumnIfMissing(
        "measurements",
        "context TEXT DEFAULT 'geral'",
      );
      await addColumnIfMissing("measurements", "server_id TEXT DEFAULT NULL");

      const mealSql = buildCreateTableSQL(mealTable);
      await run(mealSql);
      const mealIndices = buildCreateIndicesSQL(mealTable);
      for (const i of mealIndices) await exec(i);
    },
  },
];

export async function migrateDb() {
  const db = await getDb();
  const row: any = await db.getFirstAsync("PRAGMA user_version");
  const current = row && (row.user_version ?? 0);
  const target = migrations[migrations.length - 1].version;
  if (current >= target) return;
  for (const m of migrations) {
    if (m.version > current) {
      await m.up();
      await db.runAsync(`PRAGMA user_version = ${m.version}`);
    }
  }
}
