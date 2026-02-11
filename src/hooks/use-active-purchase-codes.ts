import { useQuery } from "@tanstack/react-query";
import { authFetch } from "@/lib/auth-fetch";
import { queryKeys, STALE_TIME_MS } from "@/lib/query-client";

export interface ActivePurchaseCode {
  code: string;
  catalog_item_id: string;
  item_name: string;
  created_at: string;
}

async function fetchActivePurchaseCodes(): Promise<ActivePurchaseCode[]> {
  const backendUrl = (import.meta.env.VITE_BACKEND_URL || "http://localhost:3001").replace(/\/$/, "");
  const res = await authFetch(`${backendUrl}/api/catalog/active-purchase-codes`);
  if (!res.ok) throw new Error("Не удалось загрузить коды");
  const data = (await res.json()) as { codes?: ActivePurchaseCode[] };
  return data.codes ?? [];
}

export function useActivePurchaseCodes(enabled: boolean) {
  const { data, isLoading, refetch } = useQuery({
    queryKey: queryKeys.catalogActivePurchaseCodes,
    queryFn: fetchActivePurchaseCodes,
    enabled,
    staleTime: STALE_TIME_MS,
  });

  return {
    codes: data ?? [],
    isLoading,
    refetch,
  };
}
