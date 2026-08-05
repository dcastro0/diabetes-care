import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Notifications from 'expo-notifications';
import { Alert, Platform } from 'react-native';

// Interface para definir a estrutura de um lembrete
export interface Reminder {
  id: string; // ID local (ex: timestamp)
  hour: number;
  minute: number;
  notificationId: string; // ID retornado pelo Expo Notifications
}

const STORAGE_KEY = '@DiabetesCare:reminders';

// --- (Função de permissão - Permanece igual) ---
export async function requestNotificationPermissions() {
  const { status: existingStatus } = await Notifications.getPermissionsAsync();
  let finalStatus = existingStatus;

  if (existingStatus !== 'granted') {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }

  if (finalStatus !== 'granted') {
    Alert.alert('Permissão Negada', 'Não poderemos enviar lembretes se não tivermos permissão.');
    return false;
  }

  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('reminders', {
      name: 'Lembretes de Medição',
      importance: Notifications.AndroidImportance.HIGH,
      vibrationPattern: [0, 250, 250, 250],
      sound: 'default',
    });
  }
  return true;
}

// --- (Novas funções de gestão da lista) ---

// 1. Buscar todos os lembretes guardados no AsyncStorage
export async function getReminders(): Promise<Reminder[]> {
  try {
    const jsonValue = await AsyncStorage.getItem(STORAGE_KEY);
    return jsonValue != null ? JSON.parse(jsonValue) : [];
  } catch (e) {
    console.error('Erro ao buscar lembretes', e);
    return [];
  }
}

// 2. Adicionar um novo lembrete
export async function addReminder(hour: number, minute: number): Promise<Reminder[]> {
  const hasPermission = await requestNotificationPermissions();
  if (!hasPermission) {
    return [];
  }

  // Agenda a notificação no sistema
  const notificationId = await Notifications.scheduleNotificationAsync({
    content: {
      title: 'Diabetes Care: Lembrete',
      body: 'Está na hora de registar a sua glicemia!',
      sound: 'default',
    },
    trigger: {
      hour,
      minute,
      repeats: true, // Repete diariamente
      channelId: 'reminders',
    },
  });

  // Cria o nosso objeto de lembrete local
  const newReminder: Reminder = {
    id: new Date().toISOString(), // ID único simples
    hour,
    minute,
    notificationId,
  };

  // Guarda no AsyncStorage
  const existingReminders = await getReminders();
  const updatedReminders = [...existingReminders, newReminder];
  await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updatedReminders));

  console.log(`Lembrete adicionado para ${hour}:${minute} (ID: ${notificationId})`);
  return updatedReminders; // Retorna a lista atualizada
}

// 3. Remover um lembrete específico
export async function removeReminder(id: string): Promise<Reminder[]> {
  const existingReminders = await getReminders();
  const reminderToRemove = existingReminders.find(r => r.id === id);

  if (reminderToRemove) {
    // Cancela a notificação agendada no sistema
    await Notifications.cancelScheduledNotificationAsync(reminderToRemove.notificationId);
    
    // Remove da lista do AsyncStorage
    const updatedReminders = existingReminders.filter(r => r.id !== id);
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updatedReminders));
    console.log(`Lembrete removido (ID: ${reminderToRemove.notificationId})`);
    return updatedReminders;
  }
  return existingReminders;
}

// 4. Remover TODOS os lembretes
export async function cancelAllReminders(): Promise<void> {
  // Cancela todas as notificações agendadas no sistema
  await Notifications.cancelAllScheduledNotificationsAsync();
  
  // Limpa a lista no AsyncStorage
  await AsyncStorage.removeItem(STORAGE_KEY);

  console.log('Todos os lembretes foram cancelados.');
  Alert.alert('Lembretes Cancelados', 'Todos os seus lembretes foram removidos.');
}