import type { AchievementItem } from "@/entities/achievement";
import { authFetch } from "@/lib/auth-fetch";
import { queryKeys, STALE_TIME_MS } from "@/lib/query-client";
import { type ApiAchievementsResponse, type ApiError, parseJson } from "@/types/api";
import { useQuery } from "@tanstack/react-query";

const BACKEND_URL = (import.meta.env.VITE_BACKEND_URL || "http://localhost:3001").replace(/\/$/, "");

async function fetchAchievements(): Promise<{
  achievements: AchievementItem[];
  games_visited: number;
  tickets_purchased: number;
  visit_reward_progress: number;
  visit_reward_pending: boolean;
  visit_reward_coins: number;
}> {
  const response = await authFetch(`${BACKEND_URL}/api/achievements`);

  if (!response.ok) {
    const err = await parseJson<ApiError>(response).catch(() => ({ error: `HTTP ${response.status}` }));
    throw new Error(err.error || `HTTP ${response.status}`);
  }

  const data = await parseJson<ApiAchievementsResponse>(response);
  return {
    achievements: data.achievements ?? [],
    games_visited: data.games_visited ?? 0,
    tickets_purchased: data.tickets_purchased ?? 0,
    visit_reward_progress: data.visit_reward_progress ?? 0,
    visit_reward_pending: data.visit_reward_pending ?? false,
    visit_reward_coins: data.visit_reward_coins ?? 0,
  };
}

export function useAchievements(enabled: boolean): {
  achievements: AchievementItem[];
  gamesVisited: number;
  ticketsPurchased: number;
  visitRewardProgress: number;
  visitRewardPending: boolean;
  visitRewardCoins: number;
  isLoading: boolean;
  error: Error | null;
  refetch: () => Promise<void>;
} {
  const { data, isPending, error, refetch } = useQuery({
    queryKey: queryKeys.achievements,
    queryFn: fetchAchievements,
    enabled,
    staleTime: STALE_TIME_MS,
  });

  return {
    achievements: data?.achievements ?? [],
    gamesVisited: data?.games_visited ?? 0,
    ticketsPurchased: data?.tickets_purchased ?? 0,
    visitRewardProgress: data?.visit_reward_progress ?? 0,
    visitRewardPending: data?.visit_reward_pending ?? false,
    visitRewardCoins: data?.visit_reward_coins ?? 0,
    isLoading: enabled && isPending,
    error: error ? (error instanceof Error ? error : new Error(String(error))) : null,
    refetch: async () => {
      await refetch();
    },
  };
}
