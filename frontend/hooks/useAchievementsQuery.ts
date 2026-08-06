import { Achievement, getAchievements } from "@/services/achievementsServices";
import { useQuery } from "@tanstack/react-query";

export function useAchievementsQuery(token?: string) {
  return useQuery<Achievement[]>({
    queryKey: ["achievements", token],
    queryFn: async () => {
      if (!token) return [];
      return await getAchievements(token);
    },
    enabled: !!token,
    staleTime: 1000 * 60 * 10, // 10 minutos
  });
}
