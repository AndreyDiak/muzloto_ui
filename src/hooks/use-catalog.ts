import { useQuery } from "@tanstack/react-query";
import type { SCatalogItem } from "../entities/catalog";
import { http } from "../http";
import { queryKeys, STALE_TIME_MS } from "../lib/query-client";

interface UseCatalogReturn {
  items: SCatalogItem[];
  isLoading: boolean;
  error: Error | null;
  refetch: () => Promise<void>;
}

async function fetchCatalog(): Promise<SCatalogItem[]> {
  const { data, error } = await http
    .from("catalog")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    throw new Error(error.message);
  }
  return (data as SCatalogItem[]) ?? [];
}

export function useCatalog(): UseCatalogReturn {
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: queryKeys.catalog,
    queryFn: fetchCatalog,
    staleTime: STALE_TIME_MS,
  });

  return {
    items: data ?? [],
    isLoading,
    error: error ? (error instanceof Error ? error : new Error(String(error))) : null,
    refetch: async () => {
      await refetch();
    },
  };
}
