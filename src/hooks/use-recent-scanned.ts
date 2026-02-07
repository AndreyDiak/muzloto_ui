import { http } from "@/http";
import { type ApiRecentScannedResponse, type ApiError, parseJson } from "@/types/api";
import { useCallback, useEffect, useState } from "react";

export type { ApiRecentScannedItem as RecentScannedItem } from "@/types/api";

export function useRecentScanned(enabled: boolean) {
	const [items, setItems] = useState<ApiRecentScannedResponse["items"]>([]);
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
			if (!res.ok) {
				const err = await parseJson<ApiError>(res).catch(() => ({ error: "Не удалось загрузить список" }));
				throw new Error(err.error ?? "Не удалось загрузить список");
			}
			const body = await parseJson<ApiRecentScannedResponse>(res);
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
