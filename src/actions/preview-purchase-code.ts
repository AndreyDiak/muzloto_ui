import { authFetch } from "@/lib/auth-fetch";
import {
	type ApiPreviewPurchaseCodeResponse,
	type ApiError,
	parseJson,
} from "@/types/api";

const BACKEND_URL = (import.meta.env.VITE_BACKEND_URL || "http://localhost:3001").replace(
	/\/$/,
	""
);

export async function previewPurchaseCode(code: string): Promise<ApiPreviewPurchaseCodeResponse | null> {
	try {
		const res = await authFetch(
			`${BACKEND_URL}/api/catalog/preview-purchase-code?code=${encodeURIComponent(code)}`
		);
		const data = await parseJson<ApiPreviewPurchaseCodeResponse | ApiError>(res).catch(
			() => ({ error: `Ошибка ${res.status}` }) as ApiError
		);

		if (!res.ok || "error" in data) {
			return null;
		}

		if (!data.item || typeof data.balance !== "number") {
			return null;
		}

		return data;
	} catch {
		return null;
	}
}
