import type { PurchaseSuccessPayload } from "../entities/ticket";
import { http } from "../http";
import { type ApiPurchaseResponse, type ApiError, parseJson } from "@/types/api";

interface PurchaseCatalogItemParams {
  catalogItemId: string;
  onSuccess?: (data: PurchaseSuccessPayload) => void;
  onError?: (message: string, statusCode?: number) => void;
}

export async function purchaseCatalogItem({
  catalogItemId,
  onSuccess,
  onError,
}: PurchaseCatalogItemParams): Promise<void> {
  try {
    let {
      data: { session },
    } = await http.auth.getSession();

    if (!session) {
      const { data: { session: refreshed }, error } = await http.auth.refreshSession();
      if (error || !refreshed) {
        onError?.('Нет активной сессии. Обновите страницу.');
        return;
      }
      session = refreshed;
    }

    if (!session?.access_token) {
      onError?.('Нет токена доступа. Обновите страницу.');
      return;
    }

    const backendUrl = (import.meta.env.VITE_BACKEND_URL || 'http://localhost:3001').replace(/\/$/, '');
    const res = await fetch(`${backendUrl}/api/catalog/purchase`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${session.access_token}`,
      },
      body: JSON.stringify({ catalog_item_id: catalogItemId }),
    });

    const data = await parseJson<ApiPurchaseResponse | ApiError>(res).catch(() => ({ error: `Ошибка ${res.status}` }) as ApiError);

    if (!res.ok) {
      onError?.("error" in data ? data.error : `Ошибка ${res.status}`, res.status);
      return;
    }

    if (!("success" in data) || !data.success || !data.ticket || !data.item || typeof data.newBalance !== 'number') {
      onError?.('Неверный ответ сервера.');
      return;
    }

    onSuccess?.({
      ticket: data.ticket,
      item: data.item,
      newBalance: data.newBalance,
      newlyUnlockedAchievements: data.newlyUnlockedAchievements,
    });
  } catch (e) {
    const msg = e instanceof Error ? e.message : 'Ошибка при покупке';
    onError?.(msg);
  }
}
