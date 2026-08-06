import Constants from "expo-constants";
import { Platform } from "react-native";

const getApiUrl = () => {
  if (process.env.EXPO_PUBLIC_API_URL) {
    return process.env.EXPO_PUBLIC_API_URL;
  }

  // Detect Expo host IP dynamically when running in Expo Go on physical device
  const hostUri = Constants.expoConfig?.hostUri;
  if (hostUri) {
    const hostIp = hostUri.split(":")[0];
    if (hostIp && hostIp !== "localhost" && hostIp !== "127.0.0.1") {
      return `http://${hostIp}:8080/api/v1`;
    }
  }

  // Android Emulator fallback
  if (Platform.OS === "android") {
    return "http://10.0.2.2:8080/api/v1";
  }

  // iOS Simulator / Web fallback
  return "http://localhost:8080/api/v1";
};

export const API_URL = getApiUrl();