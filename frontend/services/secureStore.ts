import * as SecureStore from "expo-secure-store";
import { Platform } from "react-native";

/**
 * Sanitiza chaves para garantir compatibilidade com o Expo SecureStore.
 * SecureStore permite apenas caracteres alfanuméricos, ".", "-" e "_".
 */
const sanitizeKey = (key: string): string => {
  return key.replace(/[^a-zA-Z0-9._-]/g, "_");
};

/**
 * Salva uma chave/valor de forma segura (Keychain no iOS / EncryptedSharedPreferences no Android).
 */
export async function setSecureItem(key: string, value: string): Promise<void> {
  const safeKey = sanitizeKey(key);
  try {
    if (Platform.OS === "web") {
      localStorage.setItem(safeKey, value);
      return;
    }
    await SecureStore.setItemAsync(safeKey, value);
  } catch (error) {
    console.error(`Erro ao salvar no SecureStore [${safeKey}]:`, error);
  }
}

/**
 * Recupera o valor de uma chave armazenada com segurança.
 */
export async function getSecureItem(key: string): Promise<string | null> {
  const safeKey = sanitizeKey(key);
  try {
    if (Platform.OS === "web") {
      return localStorage.getItem(safeKey);
    }
    return await SecureStore.getItemAsync(safeKey);
  } catch (error) {
    console.error(`Erro ao ler do SecureStore [${safeKey}]:`, error);
    return null;
  }
}

/**
 * Remove uma chave do armazenamento seguro.
 */
export async function deleteSecureItem(key: string): Promise<void> {
  const safeKey = sanitizeKey(key);
  try {
    if (Platform.OS === "web") {
      localStorage.removeItem(safeKey);
      return;
    }
    await SecureStore.deleteItemAsync(safeKey);
  } catch (error) {
    console.error(`Erro ao remover do SecureStore [${safeKey}]:`, error);
  }
}
