import { AuthData } from "@/interfaces/AuthData";
import { RegisterFormData } from "@/schemas/authSchema";
import { api, ApiError } from "@/services/api";
import AsyncStorage from "@react-native-async-storage/async-storage";

async function signUp(data: RegisterFormData): Promise<AuthData> {
  try {
    const diabetesType =
      (await AsyncStorage.getItem("@DiabetesCare:diabetesType")) || "Tipo 1";

    const response = await api.post<any>(`/register`, {
      nome: data.nome,
      email: data.email,
      password: data.password,
      diabetes_type: diabetesType,
    });

    const resData = response.data;
    const user = resData.user || resData;

    return {
      id: String(user.id || resData.id || "1"),
      nome: user.name || user.nome || resData.name || resData.nome || data.nome,
      email: user.email || resData.email || data.email,
      token: resData.token,
      diabetesType: user.diabetes_type || resData.diabetes_type || diabetesType,
      targetGlucoseMin: user.target_glucose_min,
      targetGlucoseMax: user.target_glucose_max,
      membroDesde: user.created_at || resData.created_at,
    };
  } catch (error) {
    if (error instanceof ApiError) {
      if (error.status === 409) {
        throw new Error("Este email já está em uso. Tente outro.");
      }
      if (error.data?.error) {
        throw new Error(error.data.error);
      }
    }
    throw new Error("Não foi possível realizar o cadastro. Tente novamente.");
  }
}

export const registerService = { signUp };
