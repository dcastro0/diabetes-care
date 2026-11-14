import { migrateDb } from "../migrations";
import { createTable, insert, remove, select, update } from "../orm";
import { mealTable } from "../schema";

export async function initMealTable() {
  await migrateDb();
  await createTable(mealTable);
}

export type Meal = {
  id?: number;
  name: string;
  carbs_grams: number;
  insulin_units: number;
  notes?: string | null;
  eaten_at: string;
  synced?: 0 | 1;
  server_id?: string | null;
};

export interface ServerMeal {
  id: string;
  name: string;
  carbs_grams: number;
  insulin_units: number;
  notes?: string;
  eaten_at: string;
}

export async function saveMeal(
  name: string,
  carbsGrams: number,
  insulinUnits: number,
  eatenAt: string,
  notes?: string | null,
): Promise<number> {
  return await insert("meals", {
    name,
    carbs_grams: carbsGrams,
    insulin_units: insulinUnits,
    notes: notes ?? null,
    eaten_at: eatenAt,
    synced: 0,
    server_id: null,
  });
}

export async function getMeals(): Promise<Meal[]> {
  return await select<Meal>("meals", undefined, []);
}

export async function getUnsyncedMeals(): Promise<Meal[]> {
  return await select<Meal>("meals", "synced = 0", []);
}

export async function deleteMeal(id: number) {
  await remove("meals", "id = ?", [id]);
}

export async function markMealsAsSynced(ids: number[]) {
  if (ids.length === 0) return;
  const placeholders = ids.map(() => "?").join(",");
  await update("meals", { synced: 1 }, `id IN (${placeholders})`, ids);
}

export async function clearMeals() {
  await remove("meals", "1 = 1", []);
}

export async function upsertMealsFromServer(serverMeals: ServerMeal[]) {
  if (!serverMeals || serverMeals.length === 0) return;
  const existing = await getMeals();

  for (const sm of serverMeals) {
    const match = existing.find(
      (m) =>
        (m.server_id && m.server_id === sm.id) ||
        (m.name === sm.name &&
          Math.abs(
            new Date(m.eaten_at).getTime() - new Date(sm.eaten_at).getTime(),
          ) < 1000),
    );

    if (match && match.id !== undefined) {
      if (!match.server_id || !match.synced) {
        await update("meals", { server_id: sm.id, synced: 1 }, "id = ?", [
          match.id,
        ]);
      }
    } else {
      await insert("meals", {
        name: sm.name,
        carbs_grams: sm.carbs_grams,
        insulin_units: sm.insulin_units,
        notes: sm.notes || null,
        eaten_at: sm.eaten_at,
        synced: 1,
        server_id: sm.id,
      });
    }
  }
}
