import { useQuery } from "@tanstack/react-query";
import type { SEvent } from "../entities/event/types";
import { http } from "../http";
import { queryKeys, STALE_TIME_MS } from "../lib/query-client";

interface UseEventsReturn {
  events: SEvent[];
  isLoading: boolean;
  error: Error | null;
  refetch: () => Promise<void>;
}

async function fetchEvents(): Promise<SEvent[]> {
  const { data, error } = await http
    .from("events")
    .select("*")
    .order("event_date", { ascending: true });

  if (error) {
    throw new Error(error.message);
  }
  return (data ?? []) as SEvent[];
}

export function useEvents(): UseEventsReturn {
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: queryKeys.events,
    queryFn: fetchEvents,
    staleTime: STALE_TIME_MS,
  });

  return {
    events: data ?? [],
    isLoading,
    error: error ? (error instanceof Error ? error : new Error(String(error))) : null,
    refetch: async () => {
      await refetch();
    },
  };
}
