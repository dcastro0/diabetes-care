import { AuthProvider } from "@/contexts/Auth";
import { migrateDb } from "@/services/orm/migrations";
import { useFonts } from "expo-font";
import * as Notifications from 'expo-notifications';
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { StatusBar } from "expo-status-bar";
import { useEffect, useState } from "react";
import "react-native-reanimated";

import Constants, { ExecutionEnvironment } from "expo-constants";

SplashScreen.preventAutoHideAsync();

try {
  // Only execute notification handler configuration if supported safely
  if (Constants.executionEnvironment !== ExecutionEnvironment.StoreClient) {
    Notifications.setNotificationHandler({
      handleNotification: async () => ({
        shouldShowAlert: true,
        shouldShowBanner: true,
        shouldShowList: true,
        shouldPlaySound: true,
        shouldSetBadge: false,
      }),
    });
  }
} catch (e) {
  console.warn("expo-notifications handler skipped in Expo Go environment", e);
}

export default function RootLayout() {
  const [loaded, error] = useFonts({
    SpaceMono: require("../assets/fonts/SpaceMono-Regular.ttf"),
  });

  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (error) throw error;
  }, [error]);

  useEffect(() => {
    if (!loaded) return;
    let mounted = true;
    (async () => {
      try {
        await migrateDb();
      } catch (e) {
        console.error("migrateDb error", e);
      } finally {
        if (!mounted) return;
        try {
          await SplashScreen.hideAsync();
        } catch (e) {
          console.warn("hide splash error", e);
        }
        setReady(true);
      }
    })();
    return () => {
      mounted = false;
    };
  }, [loaded]);

  if (!loaded || !ready) {
    return null;
  }

  return (
    <AuthProvider>
      <Stack initialRouteName="index">
        <Stack.Screen name="index" options={{ headerShown: false }} />
        <Stack.Screen name="login" options={{ headerShown: false }} />
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="+not-found" />
        <Stack.Screen name="register" options={{ headerShown: false }} />
        <Stack.Screen name="historico"/>
        <Stack.Screen name="lembretes" options={{ headerShown: false }} />
        <Stack.Screen name="config" options={{ headerShown: false }} />
        <Stack.Screen name="edit_profile" options={{ headerShown: false }} />
        <Stack.Screen name="help" options={{ headerShown: false }} />
      </Stack>
      <StatusBar style="dark" />
    </AuthProvider>
  );
}