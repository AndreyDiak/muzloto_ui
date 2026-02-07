import { authFetch } from "@/lib/auth-fetch";
import { type ApiScanTicketResponse, type ApiError, parseJson } from "@/types/api";

export type { ApiScanTicketParticipant as ScanTicketParticipant } from "@/types/api";
export type { ApiCatalogItem as ScanTicketItem } from "@/types/api";

export interface ScanTicketSuccess {
	participant: ApiScanTicketResponse["participant"];
	item: ApiScanTicketResponse["item"];
}

const BACKEND_URL = (import.meta.env.VITE_BACKEND_URL || "http://localhost:3001").replace(/\/$/, "");

export async function scanTicket(params: {
	code: string;
	onSuccess: (data: ScanTicketSuccess) => void;
	onError: (message: string) => void;
}): Promise<void> {
	try {
		const res = await authFetch(`${BACKEND_URL}/api/scanner/scan`, {
			method: "POST",
			headers: { "Content-Type": "application/json" },
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
