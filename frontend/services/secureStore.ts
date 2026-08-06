import * as SecureStore from "expo-secure-store";
import { Platform } from "react-native";

/**
 * Salva uma chave/valor de forma segura (Keychain no iOS / EncryptedSharedPreferences no Android).
 */
export async function setSecureItem(key: string, value: string): Promise<void> {
  try {
    if (Platform.OS === "web") {
      localStorage.setItem(key, value);
      return;
    }
    await SecureStore.setItemAsync(key, value);
  } catch (error) {
    console.error(`Erro ao salvar no SecureStore [${key}]:`, error);
  }
}

/**
 * Recupera o valor de uma chave armazenada com segurança.
 */
export async function getSecureItem(key: string): Promise<string | null> {
  try {
    if (Platform.OS === "web") {
      return localStorage.getItem(key);
    }
    return await SecureStore.getItemAsync(key);
  } catch (error) {
    console.error(`Erro ao ler do SecureStore [${key}]:`, error);
    return null;
  }
}

/**
 * Remove uma chave do armazenamento seguro.
 */
export async function deleteSecureItem(key: string): Promise<void> {
  try {
    if (Platform.OS === "web") {
      localStorage.removeItem(key);
      return;
    }
    await SecureStore.deleteItemAsync(key);
  } catch (error) {
    console.error(`Erro ao remover do SecureStore [${key}]:`, error);
  }
}
