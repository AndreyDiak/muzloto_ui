import { http } from "@/http";
import { type ApiScanTicketResponse, type ApiError, parseJson } from "@/types/api";

export type { ApiScanTicketParticipant as ScanTicketParticipant } from "@/types/api";
export type { ApiCatalogItem as ScanTicketItem } from "@/types/api";

export interface ScanTicketSuccess {
	participant: ApiScanTicketResponse["participant"];
	item: ApiScanTicketResponse["item"];
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

		const body = await parseJson<ApiScanTicketResponse | ApiError>(res).catch(() => ({ error: "Ошибка сервера" }) as ApiError);

		if (!res.ok) {
			const msg = "error" in body ? body.error : "Ошибка при сканировании билета";
			params.onError(msg);
			return;
		}

		if (!("success" in body) || !body.success || !body.participant || !body.item) {
			params.onError("Неверный ответ сервера");
			return;
		}

		params.onSuccess({
			participant: body.participant,
			item: body.item,
		});
	} catch (e) {
		params.onError(e instanceof Error ? e.message : "Ошибка при сканировании билета");
	}
}
