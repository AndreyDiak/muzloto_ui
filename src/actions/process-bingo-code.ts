import type { NewlyUnlockedAchievement } from "@/entities/achievement";
import { authFetch } from "@/lib/auth-fetch";
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
const BACKEND_URL = (import.meta.env.VITE_BACKEND_URL || "http://localhost:3001").replace(/\/$/, "");

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
    const response = await authFetch(`${BACKEND_URL}/api/bingo/claim`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
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
