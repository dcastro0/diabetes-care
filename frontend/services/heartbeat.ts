import AsyncStorage from "@react-native-async-storage/async-storage";
import { api } from "./api";

const HEARTBEAT_KEY = "@LastHeartbeat";

export interface HeartbeatResponse {
  streak_count: number;
  last_active_date: string;
  pontos: number;
  total_medicoes: number;
  unlocked_achievements: any[];
}

function getLocalDateString(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export async function sendHeartbeat(
  token: string,
): Promise<HeartbeatResponse | null> {
  const today = getLocalDateString();

  try {
    const response = await api.post<HeartbeatResponse>(
      "/heartbeat",
      { local_date: today },
      { headers: { Authorization: `Bearer ${token}` } },
    );
    await AsyncStorage.setItem(HEARTBEAT_KEY, today);
    return response.data;
  } catch (error) {
    console.error("Erro ao enviar batimento cardíaco:", error);
    return null;
  }
}

export async function trySendPendingHeartbeat(
  token: string,
): Promise<HeartbeatResponse | null> {
  const lastSent = (await AsyncStorage.getItem(HEARTBEAT_KEY)) || "";
  const today = getLocalDateString();

  if (lastSent !== today) {
    return await sendHeartbeat(token);
  }
  return null;
}
