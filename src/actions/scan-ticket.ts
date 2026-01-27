import { http } from "@/http";

export interface ScanTicketParticipant {
	telegram_id: number;
	username: string | null;
	first_name: string | null;
	last_name: string | null;
}

export interface ScanTicketItem {
	id: string;
	name: string;
	description: string | null;
	price: number;
	photo: string | null;
}

export interface ScanTicketSuccess {
	participant: ScanTicketParticipant;
	item: ScanTicketItem;
}

export async function scanTicket(params: {
	code: string;
	onSuccess: (data: ScanTicketSuccess) => void;
	onError: (message: string) => void;
}): Promise<void> {
	try {
		let {
			data: { session },
		} = await http.auth.getSession();
		if (!session) {
			const { data: { session: refreshed }, error } = await http.auth.refreshSession();
			if (error || !refreshed) {
				params.onError("Нет активной сессии. Обновите страницу.");
				return;
			}
			session = refreshed;
		}
		const token = session?.access_token;
		if (!token) {
			params.onError("Нет токена доступа. Обновите страницу.");
			return;
		}

		const backendUrl = (import.meta.env.VITE_BACKEND_URL || "http://localhost:3001").replace(/\/$/, "");
		const res = await fetch(`${backendUrl}/api/scanner/scan`, {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
				Authorization: `Bearer ${token}`,
			},
			body: JSON.stringify({ code: params.code.trim().toUpperCase() }),
		});

		const body = await res.json().catch(() => ({}));

		if (!res.ok) {
			params.onError((body as { error?: string }).error || "Ошибка при сканировании билета");
			return;
		}

		if (!(body as { success?: boolean }).success || !(body as { participant?: unknown }).participant || !(body as { item?: unknown }).item) {
			params.onError("Неверный ответ сервера");
			return;
		}

		params.onSuccess({
			participant: (body as ScanTicketSuccess).participant,
			item: (body as ScanTicketSuccess).item,
		});
	} catch (e) {
		params.onError(e instanceof Error ? e.message : "Ошибка при сканировании билета");
	}
}
