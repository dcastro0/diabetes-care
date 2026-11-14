import { Achievement } from "./achievementsServices";
import { api, ApiError } from "./api";
import {
  Measurement,
  ServerGlucoseLog,
} from "@/services/orm/entities/measurement";

interface SyncResponse {
  message: string;
  total_measurements_on_server: number;
  inserted_count: number;
  unlocked_achievements?: Achievement[];
}

/**
 * Envia medições não sincronizadas para o backend usando a API Fetch nativa.
 */
export const syncMeasurements = async (
  token: string,
  measurements: Measurement[],
): Promise<SyncResponse> => {
  try {
    const payload = measurements.map((m) => ({
      value: m.value,
      date: m.date,
      context: m.context || "geral",
      note: m.note ?? null,
    }));

    const response = await api.post<SyncResponse>("/measurements/sync", payload, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    return response.data;
  } catch (error) {
    if (error instanceof ApiError) {
      console.error("Erro ao sincronizar medições:", error.data || error.message);
    }
    throw new Error("Não foi possível sincronizar os dados.");
  }
};

export const fetchMeasurementsFromServer = async (
  token: string,
): Promise<ServerGlucoseLog[]> => {
  const response = await api.get<ServerGlucoseLog[]>("/glucose", {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return response.data || [];
};

export const deleteMeasurementOnServer = async (
  token: string,
  serverId: string,
): Promise<void> => {
  await api.delete(`/glucose/${serverId}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
};
