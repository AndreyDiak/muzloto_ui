import { http } from "@/http";

export interface ClaimAchievementResult {
  success: true;
  coinsAdded: number;
  newBalance: number;
}

export async function claimAchievementReward(achievementSlug: string): Promise<ClaimAchievementResult> {
  const { data: { session } } = await http.auth.getSession();
  if (!session?.access_token) {
    throw new Error("Нет активной сессии. Обновите страницу.");
  }

  const backendUrl = (import.meta.env.VITE_BACKEND_URL || "http://localhost:3001").replace(/\/$/, "");
  const res = await fetch(`${backendUrl}/api/achievements/claim`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${session.access_token}`,
    },
    body: JSON.stringify({ achievement_slug: achievementSlug }),
  });

  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(data.error || `Ошибка ${res.status}`);
  }

  return data as ClaimAchievementResult;
}
