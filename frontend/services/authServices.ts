import { AuthData } from "@/interfaces/AuthData";
import { LoginFormData } from "@/schemas/authSchema";
import { api, ApiError } from "@/services/api";

async function signIn(data: LoginFormData): Promise<AuthData> {
  try {
    const response = await api.post<any>(`/login`, {
      email: data.email,
      password: data.password,
    });

    const resData = response.data;
    const user = resData.user || resData;

    return {
      id: String(user.id || resData.id || "1"),
      nome: user.name || user.nome || resData.name || resData.nome || "Usuário",
      email: user.email || resData.email || data.email,
      token: resData.token,
      diabetesType: user.diabetes_type || resData.diabetes_type,
      targetGlucoseMin: user.target_glucose_min,
      targetGlucoseMax: user.target_glucose_max,
      membroDesde: user.created_at || resData.created_at,
    };
  } catch (error) {
    if (error instanceof ApiError) {
      if (error.status === 401) {
        throw new Error("Credenciais inválidas. Verifique seu email e senha.");
      }
      if (error.data?.error || error.message) {
        throw new Error(error.data?.error || error.message);
      }
    }

    throw new Error(
      "Não foi possível conectar ao servidor Backend Go. Verifique se 'make dev-backend' está em execução.",
    );
  }
}

export const authService = { signIn };
