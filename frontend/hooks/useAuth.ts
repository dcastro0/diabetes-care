import { AuthContext } from "@/contexts/Auth";
import { useContext } from "react";

export const useAuth = () => {
  return useContext(AuthContext);
};
