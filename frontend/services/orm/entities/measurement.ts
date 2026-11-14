import { migrateDb } from "../migrations";
import { createTable, firstRow, insert, remove, select, update } from "../orm";
import { measurementTable } from "../schema";

export async function initMeasurementTable() {
  await migrateDb();
  await createTable(measurementTable);
}

export type Measurement = {
  id?: number;
  value: number;
  date: string;
  context?: string | null;
  note?: string | null;
  synced?: 0 | 1;
  server_id?: string | null;
};

export interface ServerGlucoseLog {
  id: string;
  value: number;
  context: string;
  notes?: string;
  measured_at: string;
}

export async function saveMeasurement(
  value: number,
  date: string,
  note?: string | null,
  context: string = "geral",
): Promise<number> {
  return await insert("measurements", {
    value,
    date,
    context,
    note: note ?? null,
    synced: 0,
    server_id: null,
  });
}

export async function getMeasurements(): Promise<Measurement[]> {
  return await select<Measurement>("measurements", undefined, []);
}

export async function getMeasurementsBetween(
  startIso: string,
  endIso: string,
): Promise<Measurement[]> {
  return await select<Measurement>(
    "measurements",
    "date BETWEEN ? AND ?",
    [startIso, endIso],
  );
}

export async function getUnsyncedMeasurements(): Promise<Measurement[]> {
  return await select<Measurement>("measurements", "synced = 0", []);
}

export async function deleteMeasurement(id: number) {
  await remove("measurements", "id = ?", [id]);
}

export async function markAsSynced(id: number) {
  await update("measurements", { synced: 1 }, "id = ?", [id]);
}

export async function markMeasurementsAsSynced(ids: number[]) {
  if (ids.length === 0) return;
  const placeholders = ids.map(() => "?").join(",");
  await update("measurements", { synced: 1 }, `id IN (${placeholders})`, ids);
}

export async function findMeasurementById(
  id: number,
): Promise<Measurement | null> {
  return await firstRow<Measurement>("measurements", "id = ?", [id]);
}

export async function clearMeasurements() {
  await remove("measurements", "1 = 1", []);
}

export async function upsertMeasurementsFromServer(logs: ServerGlucoseLog[]) {
  if (!logs || logs.length === 0) return;
  const existing = await getMeasurements();

  for (const log of logs) {
    const match = existing.find(
      (m) =>
        (m.server_id && m.server_id === log.id) ||
        (m.value === log.value &&
          Math.abs(
            new Date(m.date).getTime() - new Date(log.measured_at).getTime(),
          ) < 1000),
    );

    if (match && match.id !== undefined) {
      if (!match.server_id || !match.synced) {
        await update(
          "measurements",
          { server_id: log.id, synced: 1 },
          "id = ?",
          [match.id],
        );
      }
    } else {
      await insert("measurements", {
        value: log.value,
        date: log.measured_at,
        context: log.context || "geral",
        note: log.notes || null,
        synced: 1,
        server_id: log.id,
      });
    }
  }
}
