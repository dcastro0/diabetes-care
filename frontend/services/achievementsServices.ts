import { AxiosError } from 'axios'
import { api } from './api'

export interface Achievement {
  achievement_id: number
  code: string
  title: string
  description: string
  icon: string | null
  goal: number
  points_reward: number
  progress: number
  unlocked: boolean
  unlocked_at: string | null
  user_id: number
}

export const getAchievements = async (token: string): Promise<Achievement[]> => {
  try {
    const response = await api.get<Achievement[]>('/achievements', {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
    return response.data
  } catch (error) {
    const axiosError = error as AxiosError
    console.error('Erro ao buscar conquistas:', axiosError.response?.data || axiosError.message)
    throw new Error('Não foi possível carregar as conquistas. Tente novamente mais tarde.')
  }
}