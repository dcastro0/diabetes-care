import { LoginFormData } from "@/schemas/authSchema";
import { AuthData } from "./AuthData";

interface AuthContextData {
  authData?: AuthData;
  isGuest: boolean;
  loading: boolean;
  signIn: (data: LoginFormData) => Promise<AuthData>;
  completeAuth: (auth: AuthData) => Promise<AuthData>;
  enterGuestMode: () => Promise<void>;
  signOut: () => Promise<void>;
  updateAuthData: (newData: Partial<AuthData>) => Promise<void>;
}

export { AuthContextData, AuthData, type LoginFormData as SignInProp };
