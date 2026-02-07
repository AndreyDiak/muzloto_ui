import type { NewlyUnlockedAchievement } from "@/entities/achievement";
import { http } from "../http";
import { type ApiBingoClaimResponse, type ApiError, parseJson } from "@/types/api";

interface ProcessBingoCodeParams {
  code: string;
  telegramId: number;
  onSuccess?: (data: {
    newBalance: number;
    coinsEarned: number;
    newlyUnlockedAchievements?: NewlyUnlockedAchievement[];
  }) => void;
  onError?: (error: string, statusCode?: number) => void;
}

const CODE_LENGTH = 5;

export async function processBingoCode({
  code,
  telegramId: _telegramId,
  onSuccess,
  onError,
}: ProcessBingoCodeParams): Promise<void> {
  if (!code || code.length !== CODE_LENGTH || code[0].toUpperCase() !== "B") {
    onError?.("Неверный формат кода бинго. Ожидается 5 символов, первый — B.");
    return;
  }

  try {
    let { data: { session } } = await http.auth.getSession();

    if (!session) {
      const { data: { session: refreshed }, error } = await http.auth.refreshSession();
      if (error || !refreshed) {
        onError?.("Нет активной сессии. Обновите страницу.");
        return;
      }
      session = refreshed;
    }

    if (!session?.access_token) {
      onError?.("Нет токена доступа. Обновите страницу.");
      return;
    }

    const backendUrl = import.meta.env.VITE_BACKEND_URL || "http://localhost:3001";
    const response = await fetch(`${backendUrl}/api/bingo/claim`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${session.access_token}`,
      },
      body: JSON.stringify({ code: code.toUpperCase() }),
    });

    const responseData = await parseJson<ApiBingoClaimResponse | ApiError>(response).catch(() => ({ error: "Ошибка сервера" }) as ApiError);

    if (!response.ok) {
      onError?.("error" in responseData ? responseData.error : `Ошибка ${response.status}`, response.status);
      return;
    }

    if (!("success" in responseData) || !responseData.success) {
      onError?.("error" in responseData ? responseData.error : "Не удалось засчитать победу.");
      return;
    }

    onSuccess?.({
      newBalance: responseData.newBalance,
      coinsEarned: responseData.coinsEarned ?? 10,
      newlyUnlockedAchievements: responseData.newlyUnlockedAchievements,
    });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Ошибка при обработке кода бинго.";
    onError?.(msg);
  }
}
