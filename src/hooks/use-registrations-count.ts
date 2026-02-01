import { http } from "@/http";
import { STALE_TIME_MS } from "@/lib/query-client";
import { useQuery } from "@tanstack/react-query";

async function fetchRegistrationsCount(telegramId: number): Promise<number> {
  const { count, error } = await http
    .from("registrations")
    .select("id", { count: "exact", head: true })
    .eq("telegram_id", telegramId);

  if (error) {
    throw new Error(error.message);
  }

  return count ?? 0;
}

export function useRegistrationsCount(telegramId: number | undefined): {
  count: number;
  isLoading: boolean;
  error: Error | null;
} {
  const { data, isPending, error } = useQuery({
    queryKey: ["registrations-count", telegramId ?? 0],
    queryFn: () => fetchRegistrationsCount(telegramId!),
    enabled: telegramId != null,
    staleTime: STALE_TIME_MS,
  });

  return {
    count: data ?? 0,
    isLoading: telegramId != null && isPending,
    error: error ? (error instanceof Error ? error : new Error(String(error))) : null,
  };
}
