import { migrateDb } from "../migrations"
import { createTable, firstRow, insert, remove, select, update } from "../orm"
import { measurementTable } from "../schema"

export async function initMeasurementTable() {
  await migrateDb()
  await createTable(measurementTable)
}

export type Measurement = {
  id?: number
  value: number
  date: string
  note?: string | null
  synced?: 0 | 1
}

export async function saveMeasurement(value: number, date: string, note?: string | null) {
  await insert("measurements", { value, date, note: note ?? null, synced: 0 })
}

export async function getMeasurements(): Promise<Measurement[]> {
  return await select<Measurement>("measurements", undefined, [])
}

export async function getMeasurementsBetween(startIso: string, endIso: string): Promise<Measurement[]> {
  return await select<Measurement>("measurements", "date BETWEEN ? AND ?", [startIso, endIso])
}

export async function getUnsyncedMeasurements(): Promise<Measurement[]> {
  return await select<Measurement>("measurements", "synced = 0", [])
}

export async function deleteMeasurement(id: number) {
  await remove("measurements", "id = ?", [id])
}

export async function markAsSynced(id: number) {
  await update("measurements", { synced: 1 }, "id = ?", [id])
}

export async function markMeasurementsAsSynced(ids: number[]) {
  if (ids.length === 0) return
  const placeholders = ids.map(() => "?").join(",")
  await update("measurements", { synced: 1 }, `id IN (${placeholders})`, ids)
}

export async function findMeasurementById(id: number): Promise<Measurement | null> {
  return await firstRow<Measurement>("measurements", "id = ?", [id])
}