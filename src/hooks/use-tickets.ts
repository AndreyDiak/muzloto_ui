import type { STicketWithItem } from "@/entities/ticket";
import { http } from "@/http";
import { useCallback, useEffect, useState } from "react";

interface UseTicketsReturn {
	tickets: STicketWithItem[];
	isLoading: boolean;
	error: Error | null;
	refetch: () => Promise<void>;
}

export function useTickets(telegramId: number | undefined): UseTicketsReturn {
	const [tickets, setTickets] = useState<STicketWithItem[]>([]);
	const [isLoading, setIsLoading] = useState(Boolean(telegramId));
	const [error, setError] = useState<Error | null>(null);

	const fetchTickets = useCallback(async () => {
		if (telegramId == null) {
			setTickets([]);
			setIsLoading(false);
			return;
		}
		setIsLoading(true);
		setError(null);
		try {
			const { data, error: fetchError } = await http
				.from("tickets")
				.select("id, code, created_at, used_at, catalog:catalog_item_id(id, name, description, price, photo)")
				.eq("telegram_id", telegramId)
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
			const normalized: STicketWithItem[] = raw.map((row) => {
				const catalog = Array.isArray(row.catalog) ? row.catalog[0] ?? null : row.catalog;
				return { id: row.id, code: row.code, created_at: row.created_at, used_at: row.used_at ?? null, catalog };
			});
			setTickets(normalized);
		} catch (err) {
			setError(err instanceof Error ? err : new Error("Не удалось загрузить билеты"));
			setTickets([]);
		} finally {
			setIsLoading(false);
		}
	}, [telegramId]);

	useEffect(() => {
		fetchTickets();
	}, [fetchTickets]);

	return { tickets, isLoading, error, refetch: fetchTickets };
}
