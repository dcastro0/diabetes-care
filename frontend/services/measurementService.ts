import { Achievement } from './achievementsServices';
import { api, ApiError } from './api';
import { Measurement } from '@/services/orm/entities/measurement';

interface SyncResponse {
  message: string;
  total_measurements_on_server: number;
  unlocked_achievements: Achievement[];
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
      note: m.note,
    }));

    const response = await api.post<SyncResponse>('/measurements/sync', payload, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    return response.data;
  } catch (error) {
    if (error instanceof ApiError) {
      console.error('Erro ao sincronizar medições:', error.data || error.message);
    }
    throw new Error('Não foi possível sincronizar os dados.');
  }
};