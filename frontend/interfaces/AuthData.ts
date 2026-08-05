export interface AuthData {
    id: number
    nome: string
    email: string
    token: string
    avatar?: string | null
    membroDesde?: string
    totalMedicoes?: number
    pontos?: number
    streak_count?: number
}