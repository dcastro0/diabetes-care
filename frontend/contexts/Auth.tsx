import { AuthContextData, SignInProp } from "@/interfaces/AuthContextData"
import { AuthData } from "@/interfaces/AuthData"
import { AuthProviderProps } from "@/interfaces/AuthProviderProps"
import { authService } from "@/services/authServices"
import { sendHeartbeat, trySendPendingHeartbeat } from "@/services/heartbeat"
import { deleteSecureItem, getSecureItem, setSecureItem } from "@/services/secureStore"
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
        const auth = await getSecureItem("@AuthData")
        if (auth) {
          const parsed = JSON.parse(auth)
          setAuthData(parsed)
          if (parsed?.token) {
            const hbResponse = await trySendPendingHeartbeat(parsed.token)
            if (hbResponse) {
              setAuthData((prevData) => ({
                ...prevData!,
                streak_count: hbResponse.streak_count,
              }))
            }
          }
        }
      } catch (error) {
        console.error("Falha ao carregar dados de autenticação seguros:", error)
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
        const hbResponse = await sendHeartbeat(auth.token)
        if (hbResponse) {
          auth.streak_count = hbResponse.streak_count
        }

        setAuthData(auth)
        await setSecureItem("@AuthData", JSON.stringify(auth))
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
    await deleteSecureItem("@AuthData")
  }, [])

  const updateAuthData = useCallback(async (newData: Partial<AuthData>) => {
    setAuthData((currentData) => {
      if (!currentData) return undefined

      const updatedData = { ...currentData, ...newData }

      setSecureItem("@AuthData", JSON.stringify(updatedData)).catch(
        (err) => {
          console.error("Falha ao salvar authData atualizado com segurança:", err)
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
      updateAuthData,
    }),
    [authData, loading, signIn, signOut, updateAuthData],
  )

  return (
    <AuthContext.Provider value={contextValue}>{children}</AuthContext.Provider>
  )
}

export { AuthContext, AuthProvider }
