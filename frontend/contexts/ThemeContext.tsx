import AsyncStorage from "@react-native-async-storage/async-storage";
import React, { createContext, useContext, useEffect, useState } from "react";
import { useColorScheme } from "react-native";

type ThemeMode = "light" | "dark" | "system";

interface ThemeContextData {
  theme: "light" | "dark";
  themeMode: ThemeMode;
  setThemeMode: (mode: ThemeMode) => void;
  toggleTheme: () => void;
  isDark: boolean;
}

const THEME_STORAGE_KEY = "@DiabetesCare:themeMode";

const ThemeContext = createContext<ThemeContextData>({} as ThemeContextData);

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const systemColorScheme = useColorScheme();
  const [themeMode, setThemeModeState] = useState<ThemeMode>("system");

  useEffect(() => {
    const loadTheme = async () => {
      try {
        const storedMode = await AsyncStorage.getItem(THEME_STORAGE_KEY);
        if (storedMode === "light" || storedMode === "dark" || storedMode === "system") {
          setThemeModeState(storedMode);
        }
      } catch (err) {
        console.warn("Erro ao carregar tema salvo:", err);
      }
    };
    loadTheme();
  }, []);

  const setThemeMode = async (mode: ThemeMode) => {
    setThemeModeState(mode);
    try {
      await AsyncStorage.setItem(THEME_STORAGE_KEY, mode);
    } catch (err) {
      console.warn("Erro ao salvar modo de tema:", err);
    }
  };

  const effectiveTheme: "light" | "dark" =
    themeMode === "system"
      ? systemColorScheme === "dark"
        ? "dark"
        : "light"
      : themeMode;

  const toggleTheme = () => {
    const nextMode = effectiveTheme === "light" ? "dark" : "light";
    setThemeMode(nextMode);
  };

  return (
    <ThemeContext.Provider
      value={{
        theme: effectiveTheme,
        themeMode,
        setThemeMode,
        toggleTheme,
        isDark: effectiveTheme === "dark",
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
};

export function useTheme() {
  return useContext(ThemeContext);
}
