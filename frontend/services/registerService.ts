import { RegisterFormValues } from '@/schema/registerSchema';
import axios from 'axios';

import { api } from "@/services/api";



async function signUp(data: RegisterFormValues): Promise<{ message: string }> {
    try {
        const response = await api.post<{ message: string }>(`/register`, {
            nome: data.nome,
            email: data.email,
            password: data.password
        });
        return response.data;
    } catch (error) {
        if (axios.isAxiosError(error) && error.response?.status === 409) {
            throw new Error("Este email já está em uso. Tente outro.");
        }
        throw new Error("Não foi possível realizar o cadastro. Tente novamente.");
    }
}

export const registerService = { signUp };
