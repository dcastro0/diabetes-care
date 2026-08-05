import AsyncStorage from "@react-native-async-storage/async-storage"
import { api } from "./api"

const HEARTBEAT_KEY = "@LastHeartbeat"

// --- ALTERAÇÃO AQUI ---
// Adicionamos os novos campos que o backend envia
interface HeartbeatResponse {
  streak_count: number
  last_active_date: string
  pontos: number
  total_medicoes: number
  unlocked_achievements: any[] // Adicionando também este
}
// --- FIM DA ALTERAÇÃO ---

async function sendHeartbeat(token: string): Promise<HeartbeatResponse | null> {
  const today = new Date().toISOString().split("T")[0] // YYYY-MM-DD
  await AsyncStorage.setItem(HEARTBEAT_KEY, today)
  console.log("Batimento cardíaco enviado para:", today)

  try {
    const response = await api.post<HeartbeatResponse>(
      "/heartbeat",
      { local_date: today },
      { headers: { Authorization: `Bearer ${token}` } },
    )
    // Agora o response.data inclui { streak_count, pontos, total_medicoes, ... }
    return response.data
  } catch (error) {
    console.error("Erro ao enviar batimento cardíaco:", error)
    return null
  }
}

async function trySendPendingHeartbeat(token: string): Promise<HeartbeatResponse | null> {
  const lastSent = (await AsyncStorage.getItem(HEARTBEAT_KEY)) || ""
  const today = new Date().toISOString().split("T")[0]

  if (lastSent !== today) {
    console.log("Enviando batimento cardíaco pendente...")
    return await sendHeartbeat(token)
  }
  return null
}

export { HeartbeatResponse, sendHeartbeat, trySendPendingHeartbeat }; // Exporte a interface se precisar
