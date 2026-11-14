import { AuthContextData, SignInProp } from "@/interfaces/AuthContextData";
import { AuthData } from "@/interfaces/AuthData";
import { AuthProviderProps } from "@/interfaces/AuthProviderProps";
import { authService } from "@/services/authServices";
import { sendHeartbeat, trySendPendingHeartbeat } from "@/services/heartbeat";
import {
  fetchMealsFromServer,
  syncMeals,
} from "@/services/mealService";
import {
  fetchMeasurementsFromServer,
  syncMeasurements,
} from "@/services/measurementService";
import {
  clearMeals,
  getUnsyncedMeals,
  initMealTable,
  markMealsAsSynced,
  upsertMealsFromServer,
} from "@/services/orm/entities/meal";
import {
  clearMeasurements,
  getUnsyncedMeasurements,
  initMeasurementTable,
  markMeasurementsAsSynced,
  upsertMeasurementsFromServer,
} from "@/services/orm/entities/measurement";
import {
  deleteSecureItem,
  getSecureItem,
  setSecureItem,
} from "@/services/secureStore";
import AsyncStorage from "@react-native-async-storage/async-storage";
import React, {
  createContext,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";

const GUEST_MODE_KEY = "@DiabetesCare:guestMode";

const AuthContext = createContext<AuthContextData>({} as AuthContextData);

async function syncPendingOfflineMeasurements(token: string) {
  try {
    await initMeasurementTable();
    const unsynced = await getUnsyncedMeasurements();
    if (unsynced.length > 0) {
      await syncMeasurements(token, unsynced);
      const syncedIds = unsynced
        .map((m) => m.id)
        .filter((id): id is number => typeof id === "number");
      await markMeasurementsAsSynced(syncedIds);
    }
    const serverLogs = await fetchMeasurementsFromServer(token);
    await upsertMeasurementsFromServer(serverLogs);

    await initMealTable();
    const unsyncedMeals = await getUnsyncedMeals();
    if (unsyncedMeals.length > 0) {
      await syncMeals(token, unsyncedMeals);
      const syncedMealIds = unsyncedMeals
        .map((m) => m.id)
        .filter((id): id is number => typeof id === "number");
      await markMealsAsSynced(syncedMealIds);
    }
    const serverMeals = await fetchMealsFromServer(token);
    await upsertMealsFromServer(serverMeals);
  } catch (err) {
    console.warn("Sincronização pendente adiada:", err);
  }
}

const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [authData, setAuthData] = useState<AuthData | undefined>();
  const [isGuest, setIsGuest] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadAuthDataFromStorage() {
      try {
        const auth = await getSecureItem("AuthData");
        if (auth) {
          const parsed = JSON.parse(auth) as AuthData;
          setAuthData(parsed);
          setIsGuest(false);
          if (parsed?.token) {
            const hbResponse = await trySendPendingHeartbeat(parsed.token);
            if (hbResponse) {
              setAuthData((prevData) =>
                prevData
                  ? {
                      ...prevData,
                      streak_count: hbResponse.streak_count,
                      pontos: hbResponse.pontos,
                      totalMedicoes: hbResponse.total_medicoes,
                    }
                  : undefined,
              );
            }
          }
        } else {
          const guest = await AsyncStorage.getItem(GUEST_MODE_KEY);
          setIsGuest(guest === "true");
        }
      } catch (error) {
        console.error("Falha ao carregar dados de autenticação seguros:", error);
      } finally {
        setLoading(false);
      }
    }
    loadAuthDataFromStorage();
  }, []);

  const completeAuth = useCallback(async (auth: AuthData): Promise<AuthData> => {
    if (!auth || Object.keys(auth).length === 0 || !auth.token) {
      throw new Error("Recebidos dados de autenticação inválidos do serviço.");
    }

    await AsyncStorage.removeItem(GUEST_MODE_KEY);
    setIsGuest(false);

    const hbResponse = await sendHeartbeat(auth.token);
    if (hbResponse) {
      auth.streak_count = hbResponse.streak_count;
      auth.pontos = hbResponse.pontos;
      auth.totalMedicoes = hbResponse.total_medicoes;
    }

    setAuthData(auth);
    await setSecureItem("AuthData", JSON.stringify(auth));

    // Sincroniza automaticamente medições registradas no modo sem login
    await syncPendingOfflineMeasurements(auth.token);

    return auth;
  }, []);

  const signIn = useCallback(
    async (data: SignInProp): Promise<AuthData> => {
      const auth = await authService.signIn(data);
      return await completeAuth(auth);
    },
    [completeAuth],
  );

  const enterGuestMode = useCallback(async (): Promise<void> => {
    await AsyncStorage.setItem(GUEST_MODE_KEY, "true");
    setIsGuest(true);
  }, []);

  const signOut = useCallback(async (): Promise<void> => {
    setAuthData(undefined);
    setIsGuest(false);
    await deleteSecureItem("AuthData");
    await AsyncStorage.multiRemove([GUEST_MODE_KEY, "@LastHeartbeat"]);
    try {
      await initMeasurementTable();
      await clearMeasurements();
      await initMealTable();
      await clearMeals();
    } catch (err) {
      console.warn("Falha ao limpar medições locais no logout:", err);
    }
  }, []);

  const updateAuthData = useCallback(async (newData: Partial<AuthData>) => {
    setAuthData((currentData) => {
      if (!currentData) return undefined;

      const updatedData = { ...currentData, ...newData };

      setSecureItem("AuthData", JSON.stringify(updatedData)).catch((err) => {
        console.error("Falha ao salvar authData atualizado com segurança:", err);
      });

      return updatedData;
    });
  }, []);

  const contextValue = useMemo(
    () => ({
      authData,
      isGuest,
      loading,
      signIn,
      completeAuth,
      enterGuestMode,
      signOut,
      updateAuthData,
    }),
    [
      authData,
      isGuest,
      loading,
      signIn,
      completeAuth,
      enterGuestMode,
      signOut,
      updateAuthData,
    ],
  );

  return (
    <AuthContext.Provider value={contextValue}>{children}</AuthContext.Provider>
  );
};

export { AuthContext, AuthProvider };
