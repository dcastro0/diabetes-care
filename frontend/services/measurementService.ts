import { AxiosError } from 'axios'
import { Achievement } from './achievementsServices'
import { api } from './api'
// Importa o tipo 'Measurement' diretamente do seu arquivo ORM
import { Measurement } from '@/services/orm/entities/measurement'

// A interface LocalMeasurement foi removida.

// Interface da resposta da API
interface SyncResponse {
  message: string
  total_measurements_on_server: number
  unlocked_achievements: Achievement[]
}

/**
 * Envia medições não sincronizadas para o backend.
 * Agora aceita o tipo Measurement[] do seu ORM.
 */
export const syncMeasurements = async (
  token: string,
  measurements: Measurement[], // <- TIPO CORRIGIDO
): Promise<SyncResponse> => {
  try {
    // A API espera 'value', 'date', 'note'.
    // O tipo Measurement já corresponde a isso.
    const payload = measurements.map((m) => ({
      value: m.value,
      date: m.date,
      note: m.note,
      // Opcional: envie o ID local para checagem de duplicidade no backend
      // local_id: m.id 
    }))

    const response = await api.post<SyncResponse>('/measurements/sync', payload, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
    
    // Retorna a resposta (que pode incluir conquistas desbloqueadas)
    return response.data
    
  } catch (error) {
    const axiosError = error as AxiosError
    console.error('Erro ao sincronizar medições:', axiosError.response?.data || axiosError.message)
    throw new Error('Não foi possível sincronizar os dados.')
  }
}