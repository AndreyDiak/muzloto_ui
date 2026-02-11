import type { PurchaseSuccessPayload } from "../entities/ticket";
import { authFetch } from "@/lib/auth-fetch";
import { type ApiPurchaseResponse, type ApiError, parseJson } from "@/types/api";

interface PurchaseCatalogItemParams {
  catalogItemId: string;
  onSuccess?: (data: PurchaseSuccessPayload) => void;
  onError?: (message: string, statusCode?: number) => void;
}

const BACKEND_URL = (import.meta.env.VITE_BACKEND_URL || 'http://localhost:3001').replace(/\/$/, '');

export async function purchaseCatalogItem({
  catalogItemId,
  onSuccess,
  onError,
}: PurchaseCatalogItemParams): Promise<void> {
  try {
    const res = await authFetch(`${BACKEND_URL}/api/catalog/purchase`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ catalog_item_id: catalogItemId }),
    });

    const data = await parseJson<ApiPurchaseResponse | ApiError>(res).catch(() => ({ error: `Ошибка ${res.status}` }) as ApiError);

    if (!res.ok) {
      onError?.("error" in data ? data.error : `Ошибка ${res.status}`, res.status);
      return;
    }

    if (!("success" in data) || !data.success || !data.item || typeof data.newBalance !== 'number') {
      onError?.('Неверный ответ сервера.');
      return;
    }

    onSuccess?.({
      item: data.item,
      newBalance: data.newBalance,
      newlyUnlockedAchievements: data.newlyUnlockedAchievements,
    });
  } catch (e) {
    const msg = e instanceof Error ? e.message : 'Ошибка при покупке';
    onError?.(msg);
  }
}
