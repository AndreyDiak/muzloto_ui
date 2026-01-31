import { useQuery } from "@tanstack/react-query";
import type { AchievementItem } from "@/entities/achievement";
import { http } from "@/http";
import { queryKeys, STALE_TIME_MS } from "@/lib/query-client";

interface ApiResponse {
  achievements: AchievementItem[];
}

async function fetchAchievements(): Promise<AchievementItem[]> {
  const { data: { session } } = await http.auth.getSession();
  if (!session?.access_token) {
    throw new Error("No session");
  }

  const backendUrl = import.meta.env.VITE_BACKEND_URL || "http://localhost:3001";
  const response = await fetch(`${backendUrl}/api/achievements`, {
    headers: {
      Authorization: `Bearer ${session.access_token}`,
    },
  });

  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    throw new Error(err.error || `HTTP ${response.status}`);
  }

  const data: ApiResponse = await response.json();
  return data.achievements ?? [];
}

export function useAchievements(enabled: boolean): {
  achievements: AchievementItem[];
  isLoading: boolean;
  error: Error | null;
  refetch: () => Promise<void>;
} {
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: queryKeys.achievements,
    queryFn: fetchAchievements,
    enabled,
    staleTime: STALE_TIME_MS,
  });

  return {
    achievements: data ?? [],
    isLoading,
    error: error ? (error instanceof Error ? error : new Error(String(error))) : null,
    refetch: async () => {
      await refetch();
    },
  };
}
