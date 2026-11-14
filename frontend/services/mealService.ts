import { api } from "./api";
import { Meal, ServerMeal } from "@/services/orm/entities/meal";

interface SyncMealsResponse {
  message: string;
  total_meals_on_server: number;
  inserted_count: number;
}

export const syncMeals = async (
  token: string,
  meals: Meal[],
): Promise<SyncMealsResponse> => {
  const payload = meals.map((m) => ({
    name: m.name,
    carbs_grams: m.carbs_grams,
    insulin_units: m.insulin_units,
    notes: m.notes ?? null,
    eaten_at: m.eaten_at,
  }));

  const response = await api.post<SyncMealsResponse>("/meals/sync", payload, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return response.data;
};

export const fetchMealsFromServer = async (
  token: string,
): Promise<ServerMeal[]> => {
  const response = await api.get<ServerMeal[]>("/meals", {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return response.data || [];
};

export const deleteMealOnServer = async (
  token: string,
  serverId: string,
): Promise<void> => {
  await api.delete(`/meals/${serverId}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
};
