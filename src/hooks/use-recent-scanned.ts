import { authFetch } from "@/lib/auth-fetch";
import { queryKeys, STALE_TIME_MS } from "@/lib/query-client";
import { type ApiRecentScannedResponse, type ApiError, parseJson } from "@/types/api";
import { useQuery } from "@tanstack/react-query";

export type { ApiRecentScannedItem as RecentScannedItem } from "@/types/api";

const BACKEND_URL = (import.meta.env.VITE_BACKEND_URL || "http://localhost:3001").replace(/\/$/, "");

async function fetchRecentScanned(): Promise<ApiRecentScannedResponse["items"]> {
	const res = await authFetch(`${BACKEND_URL}/api/scanner/recent`);
	if (!res.ok) {
		const err = await parseJson<ApiError>(res).catch(() => ({ error: "Не удалось загрузить список" }));
		throw new Error(err.error ?? "Не удалось загрузить список");
	}
	const body = await parseJson<ApiRecentScannedResponse>(res);
	return body.items ?? [];
}

export function useRecentScanned(enabled: boolean) {
	const { data, isPending, error, refetch } = useQuery({
		queryKey: queryKeys.recentScanned,
		queryFn: fetchRecentScanned,
		enabled,
		staleTime: STALE_TIME_MS,
	});

	return {
		items: data ?? [],
		isLoading: enabled && isPending,
		error: error ? (error instanceof Error ? error : new Error(String(error))) : null,
		refetch: async () => { await refetch(); },
	};
}
