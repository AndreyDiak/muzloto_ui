import { useQuery } from "@tanstack/react-query";
import type { SCatalogItem } from "../entities/catalog";
import { queryKeys, STALE_TIME_MS } from "../lib/query-client";

interface UseCatalogReturn {
  items: SCatalogItem[];
  isLoading: boolean;
  error: Error | null;
  refetch: () => Promise<void>;
}

async function fetchCatalog(): Promise<SCatalogItem[]> {
  const backendUrl = import.meta.env.VITE_BACKEND_URL || "http://localhost:3001";
  const res = await fetch(`${backendUrl}/api/catalog`);
  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.error || res.statusText);
  }
  return (data.items as SCatalogItem[]) ?? [];
}

export function useCatalog(): UseCatalogReturn {
  const { data, isPending, error, refetch } = useQuery({
    queryKey: queryKeys.catalog,
    queryFn: fetchCatalog,
    staleTime: STALE_TIME_MS,
  });

  return {
    items: data ?? [],
    isLoading: isPending,
    error: error ? (error instanceof Error ? error : new Error(String(error))) : null,
    refetch: async () => {
      await refetch();
    },
  };
}
