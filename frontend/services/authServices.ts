import { AuthData } from "@/interfaces/AuthData"
import { LoginFormValues } from "@/schema/loginSchema"; // 1. Importa do schema
import { api } from "@/services/api"
import axios from "axios"

// 2. Usa LoginFormValues
async function signIn(data: LoginFormValues): Promise<AuthData> {
  // 3. Removemos a checagem desnecessária
  // if (!data.email || !data.password) ...

  try {
    const response = await api.post<AuthData>(`/login`, {
      email: data.email,
      password: data.password,
    })
    return response.data
  } catch (error) {
    if (axios.isAxiosError(error) && error.response?.status === 401) {
      throw new Error("Credenciais inválidas. Verifique seu email e senha.")
    }

    throw new Error(
      "Não foi possível conectar ao servidor. Tente novamente mais tarde.",
    )
  }
}

export const authService = { signIn }