import type { AchievementItem } from "@/entities/achievement";
import { authFetch } from "@/lib/auth-fetch";
import { queryKeys, STALE_TIME_MS } from "@/lib/query-client";
import { type ApiAchievementsResponse, type ApiError, parseJson } from "@/types/api";
import { useQuery } from "@tanstack/react-query";

const BACKEND_URL = (import.meta.env.VITE_BACKEND_URL || "http://localhost:3001").replace(/\/$/, "");

async function fetchAchievements(): Promise<AchievementItem[]> {
  const response = await authFetch(`${BACKEND_URL}/api/achievements`);

  if (!response.ok) {
    const err = await parseJson<ApiError>(response).catch(() => ({ error: `HTTP ${response.status}` }));
    throw new Error(err.error || `HTTP ${response.status}`);
  }

  const data = await parseJson<ApiAchievementsResponse>(response);
  return data.achievements ?? [];
}

export function useAchievements(enabled: boolean): {
  achievements: AchievementItem[];
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
    achievements: data ?? [],
    isLoading: enabled && isPending,
    error: error ? (error instanceof Error ? error : new Error(String(error))) : null,
    refetch: async () => {
      await refetch();
    },
  };
}
