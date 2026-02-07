import { http } from "@/http";

/**
 * Получает access_token из сессии Supabase.
 * При отсутствии токена пытается обновить сессию через refreshSession().
 */
export async function getAuthToken(): Promise<string | null> {
	let { data: { session } } = await http.auth.getSession();
	if (!session?.access_token) {
		const { data: { session: refreshed } } = await http.auth.refreshSession();
		return refreshed?.access_token ?? null;
	}
	return session.access_token;
}

/**
 * Fetch с автоматическим добавлением Authorization: Bearer.
 * Перед запросом получает/обновляет токен.
 * @throws Error('Нет сессии') если токен недоступен
 */
export async function authFetch(url: string, init?: RequestInit): Promise<Response> {
	const token = await getAuthToken();
	if (!token) {
		throw new Error("Нет сессии");
	}
	const headers = new Headers(init?.headers);
	headers.set("Authorization", `Bearer ${token}`);
	return fetch(url, { ...init, headers });
}
