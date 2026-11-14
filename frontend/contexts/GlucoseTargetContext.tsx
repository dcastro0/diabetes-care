import { useAuth } from "@/hooks/useAuth";
import { api } from "@/services/api";
import {
  GlucoseTarget,
  UNIVERSAL_GLUCOSE_TARGET,
} from "@/utils/glucoseLevels";
import AsyncStorage from "@react-native-async-storage/async-storage";
import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

const TARGET_STORAGE_KEY = "@DiabetesCare:glucoseTarget";

type TargetViewMode = "individual" | "standard";

interface GlucoseTargetContextData {
  customTarget: GlucoseTarget | null;
  hasCustomTarget: boolean;
  viewMode: TargetViewMode;
  activeTarget: GlucoseTarget;
  isViewingCustom: boolean;
  setViewMode: (mode: TargetViewMode) => void;
  toggleViewMode: () => void;
  saveCustomTarget: (min: number, max: number) => Promise<void>;
  resetToStandardTarget: () => Promise<void>;
}

const GlucoseTargetContext = createContext<GlucoseTargetContextData>(
  {} as GlucoseTargetContextData,
);

const isCustom = (t: GlucoseTarget | null): boolean =>
  t !== null &&
  (t.min !== UNIVERSAL_GLUCOSE_TARGET.min ||
    t.max !== UNIVERSAL_GLUCOSE_TARGET.max);

export const GlucoseTargetProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const { authData, updateAuthData } = useAuth();
  const [customTarget, setCustomTarget] = useState<GlucoseTarget | null>(null);
  const [viewMode, setViewMode] = useState<TargetViewMode>("individual");

  useEffect(() => {
    const loadTarget = async () => {
      try {
        if (
          authData?.targetGlucoseMin &&
          authData?.targetGlucoseMax &&
          authData.targetGlucoseMax > authData.targetGlucoseMin
        ) {
          const authTarget = {
            min: authData.targetGlucoseMin,
            max: authData.targetGlucoseMax,
          };
          setCustomTarget(isCustom(authTarget) ? authTarget : null);
          return;
        }

        const raw = await AsyncStorage.getItem(TARGET_STORAGE_KEY);
        if (raw) {
          const parsed = JSON.parse(raw) as GlucoseTarget;
          if (parsed?.min > 0 && parsed?.max > parsed.min) {
            setCustomTarget(isCustom(parsed) ? parsed : null);
          }
        }
      } catch (err) {
        console.warn("Erro ao carregar meta glicêmica:", err);
      }
    };
    loadTarget();
  }, [authData?.targetGlucoseMin, authData?.targetGlucoseMax]);

  const hasCustomTarget = useMemo(() => isCustom(customTarget), [customTarget]);

  const isViewingCustom = hasCustomTarget && viewMode === "individual";

  const activeTarget = useMemo<GlucoseTarget>(() => {
    if (isViewingCustom && customTarget) {
      return customTarget;
    }
    return UNIVERSAL_GLUCOSE_TARGET;
  }, [isViewingCustom, customTarget]);

  const toggleViewMode = useCallback(() => {
    setViewMode((prev) => (prev === "individual" ? "standard" : "individual"));
  }, []);

  const saveCustomTarget = useCallback(
    async (min: number, max: number) => {
      const next: GlucoseTarget = { min, max };
      const custom = isCustom(next);
      setCustomTarget(custom ? next : null);
      setViewMode("individual");
      await AsyncStorage.setItem(TARGET_STORAGE_KEY, JSON.stringify(next));
      if (authData) {
        await updateAuthData({
          targetGlucoseMin: min,
          targetGlucoseMax: max,
        });
        if (authData.token) {
          api
            .put(
              "/users/me",
              { target_glucose_min: min, target_glucose_max: max },
              { headers: { Authorization: `Bearer ${authData.token}` } },
            )
            .catch((err) =>
              console.warn("Meta salva localmente; sync adiado:", err),
            );
        }
      }
    },
    [authData, updateAuthData],
  );

  const resetToStandardTarget = useCallback(async () => {
    setCustomTarget(null);
    setViewMode("standard");
    await AsyncStorage.removeItem(TARGET_STORAGE_KEY);
    if (authData) {
      await updateAuthData({
        targetGlucoseMin: UNIVERSAL_GLUCOSE_TARGET.min,
        targetGlucoseMax: UNIVERSAL_GLUCOSE_TARGET.max,
      });
      if (authData.token) {
        api
          .put(
            "/users/me",
            {
              target_glucose_min: UNIVERSAL_GLUCOSE_TARGET.min,
              target_glucose_max: UNIVERSAL_GLUCOSE_TARGET.max,
            },
            { headers: { Authorization: `Bearer ${authData.token}` } },
          )
          .catch((err) =>
            console.warn("Meta restaurada localmente; sync adiado:", err),
          );
      }
    }
  }, [authData, updateAuthData]);

  const value = useMemo(
    () => ({
      customTarget,
      hasCustomTarget,
      viewMode,
      activeTarget,
      isViewingCustom,
      setViewMode,
      toggleViewMode,
      saveCustomTarget,
      resetToStandardTarget,
    }),
    [
      customTarget,
      hasCustomTarget,
      viewMode,
      activeTarget,
      isViewingCustom,
      toggleViewMode,
      saveCustomTarget,
      resetToStandardTarget,
    ],
  );

  return (
    <GlucoseTargetContext.Provider value={value}>
      {children}
    </GlucoseTargetContext.Provider>
  );
};

export function useGlucoseTarget() {
  return useContext(GlucoseTargetContext);
}
