import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Notifications from "expo-notifications";
import { Platform } from "react-native";

export interface Reminder {
  id: string;
  hour: number;
  minute: number;
  title: string;
  enabled: boolean;
}

const REMINDERS_STORAGE_KEY = "@DiabetesCare:reminders";

// Configurar comportamento de notificacao em primeiro plano
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

export async function requestNotificationPermissions(): Promise<boolean> {
  try {
    if (Platform.OS === "web") return false;
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;
    if (existingStatus !== "granted") {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }
    return finalStatus === "granted";
  } catch (error) {
    console.warn("Permissão de notificação indisponível:", error);
    return false;
  }
}

export async function getReminders(): Promise<Reminder[]> {
  try {
    const raw = await AsyncStorage.getItem(REMINDERS_STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch (error) {
    console.error("Erro ao carregar lembretes salvos:", error);
    return [];
  }
}

export async function saveReminders(reminders: Reminder[]): Promise<void> {
  try {
    await AsyncStorage.setItem(REMINDERS_STORAGE_KEY, JSON.stringify(reminders));
  } catch (error) {
    console.error("Erro ao salvar lembretes:", error);
  }
}

export async function addReminder(hour: number, minute: number, title = "Lembrete de Glicemia"): Promise<Reminder[]> {
  const current = await getReminders();
  const id = `reminder_${Date.now()}`;

  const hasPermission = await requestNotificationPermissions();
  if (hasPermission && Platform.OS !== "web") {
    try {
      await Notifications.scheduleNotificationAsync({
        identifier: id,
        content: {
          title: "Diabetes Care",
          body: title,
          sound: true,
          priority: Notifications.AndroidNotificationPriority.HIGH,
        },
        trigger: {
          type: Notifications.SchedulableTriggerInputTypes.DAILY,
          hour,
          minute,
        },
      });
    } catch (err) {
      console.warn("Erro ao agendar notificação nativa:", err);
    }
  }

  const newReminder: Reminder = {
    id,
    hour,
    minute,
    title,
    enabled: true,
  };

  const updated = [...current, newReminder];
  await saveReminders(updated);
  return updated;
}

export async function removeReminder(id: string): Promise<Reminder[]> {
  const current = await getReminders();
  if (Platform.OS !== "web") {
    try {
      await Notifications.cancelScheduledNotificationAsync(id);
    } catch (err) {
      console.warn("Erro ao cancelar notificação:", err);
    }
  }

  const updated = current.filter((r) => r.id !== id);
  await saveReminders(updated);
  return updated;
}

export async function cancelAllReminders(): Promise<void> {
  if (Platform.OS !== "web") {
    try {
      await Notifications.cancelAllScheduledNotificationsAsync();
    } catch (err) {
      console.warn("Erro ao cancelar todas as notificações:", err);
    }
  }
  await saveReminders([]);
}