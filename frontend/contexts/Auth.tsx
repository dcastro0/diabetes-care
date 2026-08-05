import { AuthContextData, SignInProp } from "@/interfaces/AuthContextData"
import { AuthData } from "@/interfaces/AuthData"
import { AuthProviderProps } from "@/interfaces/AuthProviderProps"
import { authService } from "@/services/authServices"
import { sendHeartbeat, trySendPendingHeartbeat } from "@/services/heartbeat"
import AsyncStorage from "@react-native-async-storage/async-storage"
import React, {
    createContext,
    useCallback,
    useEffect,
    useMemo,
    useState,
} from "react"

const AuthContext = createContext<AuthContextData>({} as AuthContextData)

const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [authData, setAuthData] = useState<AuthData | undefined>()
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function loadAuthDataFromStorage() {
      try {
        const auth = await AsyncStorage.getItem("@AuthData")
        if (auth) {
          const parsed = JSON.parse(auth)
          setAuthData(parsed)
          if (parsed?.token) {
            // Atualiza o streak ao carregar o app, se necessário
            const hbResponse = await trySendPendingHeartbeat(parsed.token)
            if (hbResponse) {
              // Se o heartbeat rodou, atualiza o authData
              setAuthData((prevData) => ({
                ...prevData!,
                streak_count: hbResponse.streak_count,
              }))
            }
          }
        }
      } catch (error) {
        console.error("Falha ao carregar dados de autenticação:", error)
      } finally {
        setLoading(false)
      }
    }
    loadAuthDataFromStorage()
  }, [])

  const signIn = useCallback(
    async (data: SignInProp): Promise<AuthData> => {
      const auth = await authService.signIn(data)
      if (auth && Object.keys(auth).length > 0) {
        // Envia o heartbeat e já pega o streak_count atualizado
        const hbResponse = await sendHeartbeat(auth.token)
        if (hbResponse) {
          auth.streak_count = hbResponse.streak_count
        }

        setAuthData(auth)
        await AsyncStorage.setItem("@AuthData", JSON.stringify(auth))
        return auth
      } else {
        throw new Error(
          "Recebidos dados de autenticação inválidos do serviço.",
        )
      }
    },
    [],
  )

  const signOut = useCallback(async (): Promise<void> => {
    setAuthData(undefined)
    await AsyncStorage.removeItem("@AuthData")
  }, [])

  // 1. ADICIONADO: Função para atualizar o authData (streak/pontos)
  const updateAuthData = useCallback(async (newData: Partial<AuthData>) => {
    setAuthData((currentData) => {
      if (!currentData) return undefined

      const updatedData = { ...currentData, ...newData }

      // Salva a atualização no AsyncStorage
      AsyncStorage.setItem("@AuthData", JSON.stringify(updatedData)).catch(
        (err) => {
          console.error("Falha ao salvar authData atualizado:", err)
        },
      )
      
      return updatedData
    })
  }, [])

  const contextValue = useMemo(
    () => ({
      authData,
      loading,
      signIn,
      signOut,
      updateAuthData, // 2. Adiciona a função ao contexto
    }),
    [authData, loading, signIn, signOut, updateAuthData], // 3. Adiciona às dependências
  )

  return (
    <AuthContext.Provider value={contextValue}>{children}</AuthContext.Provider>
  )
}

export { AuthContext, AuthProvider }
