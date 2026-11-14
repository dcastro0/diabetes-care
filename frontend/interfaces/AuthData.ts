export interface AuthData {
  id: string;
  nome: string;
  email: string;
  token: string;
  diabetesType?: string;
  targetGlucoseMin?: number;
  targetGlucoseMax?: number;
  avatar?: string | null;
  membroDesde?: string;
  totalMedicoes?: number;
  pontos?: number;
  streak_count?: number;
}
