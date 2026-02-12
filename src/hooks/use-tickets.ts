import { useQuery } from "@tanstack/react-query";
import type { STicketWithItem } from "@/entities/ticket";
import { http } from "@/http";
import { queryKeys, TICKETS_STALE_MS } from "@/lib/query-client";

interface UseTicketsReturn {
  tickets: STicketWithItem[];
  isLoading: boolean;
  error: Error | null;
  refetch: () => Promise<void>;
}

async function fetchTickets(telegramId: number): Promise<STicketWithItem[]> {
  const { data, error: fetchError } = await http
    .from("codes")
    .select("id, code, created_at, used_at, catalog:catalog_item_id(id, name, description, price, photo)")
    .eq("type", "purchase")
    .eq("owner_telegram_id", telegramId)
    .order("created_at", { ascending: false });

  if (fetchError) {
    throw new Error(fetchError.message);
  }

  const raw = (data ?? []) as Array<{
    id: string;
    code: string;
    created_at: string;
    used_at: string | null;
    catalog: STicketWithItem["catalog"] | STicketWithItem["catalog"][];
  }>;
  return raw.map((row) => {
    const catalog = Array.isArray(row.catalog) ? row.catalog[0] ?? null : row.catalog;
    return { id: row.id, code: row.code, created_at: row.created_at, used_at: row.used_at ?? null, catalog };
  });
}

export function useTickets(telegramId: number | undefined): UseTicketsReturn {
  const { data, isPending, error, refetch } = useQuery({
    queryKey: queryKeys.tickets(telegramId ?? 0),
    queryFn: () => (telegramId != null ? fetchTickets(telegramId) : Promise.resolve([])),
    enabled: telegramId != null,
    staleTime: TICKETS_STALE_MS,
  });

  return {
    tickets: data ?? [],
    isLoading: telegramId != null && isPending,
    error: error ? (error instanceof Error ? error : new Error(String(error))) : null,
    refetch: async () => {
      await refetch();
    },
  };
}
