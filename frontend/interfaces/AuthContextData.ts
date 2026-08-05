import { LoginFormValues } from "@/schema/loginSchema"; // 1. Importa do schema
import { AuthData } from "./AuthData";

// 2. Remove a interface duplicada 'SignInProp'

interface AuthContextData {
  authData?: AuthData
  // 3. Corrige o tipo de retorno para que o Login/Registro funcione
  signIn: (data: LoginFormValues) => Promise<AuthData>
  signOut: () => Promise<void>
  loading: boolean
  updateAuthData: (newData: Partial<AuthData>) => Promise<void>
}

// 4. Exporta LoginFormValues como SignInProp (ou apenas usa LoginFormValues)
export { AuthContextData, AuthData, type LoginFormValues as SignInProp };

