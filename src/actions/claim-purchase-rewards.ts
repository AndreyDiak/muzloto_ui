import { http } from "@/http";
import { type ApiClaimVisitRewardResponse, type ApiError, parseJson } from "@/types/api";

export type ClaimPurchaseRewardsResult = ApiClaimVisitRewardResponse;

export async function claimPurchaseRewards(): Promise<ClaimPurchaseRewardsResult> {
  const {
    data: { session },
  } = await http.auth.getSession();
  if (!session?.access_token) {
    throw new Error("Нет активной сессии. Обновите страницу.");
  }

  const backendUrl = (import.meta.env.VITE_BACKEND_URL || "http://localhost:3001").replace(/\/$/, "");
  const res = await fetch(`${backendUrl}/api/achievements/claim-purchase-rewards`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${session.access_token}`,
    },
  });

  const data = await parseJson<ApiClaimVisitRewardResponse | ApiError>(res).catch(
    () => ({ error: `Ошибка ${res.status}` }) as ApiError
  );
  if (!res.ok) {
    throw new Error("error" in data ? data.error : `Ошибка ${res.status}`);
  }

  return data as ApiClaimVisitRewardResponse;
}
