import { QueryClient } from "@tanstack/react-query";

/** Ключи запросов для инвалидации кеша */
export const queryKeys = {
	achievements: ["achievements"] as const,
	events: ["events"] as const,
	catalog: ["catalog"] as const,
	recentScanned: ["recent-scanned"] as const,
	tickets: (telegramId: number) =>
		["tickets", telegramId] as const,
};

const STALE_TIME_MS = 60 * 1000; // 1 мин — данные считаются свежими
const TICKETS_STALE_MS = 30 * 1000; // 30 сек для билетов (чаще обновляются)

export const queryClient = new QueryClient({
	defaultOptions: {
		queries: {
			staleTime: STALE_TIME_MS,
			refetchOnWindowFocus: false,
		},
	},
});

export { STALE_TIME_MS, TICKETS_STALE_MS };
