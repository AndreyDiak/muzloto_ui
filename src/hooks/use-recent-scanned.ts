import type { ScanTicketItem, ScanTicketParticipant } from "@/actions/scan-ticket";
import { http } from "@/http";
import { useCallback, useEffect, useState } from "react";

export interface RecentScannedItem {
	id: string;
	used_at: string;
	code: string;
	participant: ScanTicketParticipant | null;
	item: ScanTicketItem | null;
}

export function useRecentScanned(enabled: boolean) {
	const [items, setItems] = useState<RecentScannedItem[]>([]);
	const [isLoading, setIsLoading] = useState(false);
	const [error, setError] = useState<Error | null>(null);

	const refetch = useCallback(async () => {
		if (!enabled) return;
		setIsLoading(true);
		setError(null);
		try {
			const {
				data: { session },
			} = await http.auth.getSession();
			if (!session?.access_token) {
				setItems([]);
				return;
			}
			const url = `${(import.meta.env.VITE_BACKEND_URL || "http://localhost:3001").replace(/\/$/, "")}/api/scanner/recent`;
			const res = await fetch(url, {
				headers: { Authorization: `Bearer ${session.access_token}` },
			});
			const body = (await res.json().catch(() => ({}))) as { items?: RecentScannedItem[]; error?: string };
			if (!res.ok) {
				throw new Error(body.error ?? "Не удалось загрузить список");
			}
			setItems(body.items ?? []);
		} catch (e) {
			setError(e instanceof Error ? e : new Error("Ошибка загрузки"));
			setItems([]);
		} finally {
			setIsLoading(false);
		}
	}, [enabled]);

	useEffect(() => {
		refetch();
	}, [refetch]);

	return { items, isLoading, error, refetch };
}
