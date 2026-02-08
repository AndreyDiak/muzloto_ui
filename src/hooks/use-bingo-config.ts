import { useQuery } from "@tanstack/react-query";
import { queryKeys, STALE_TIME_MS } from "@/lib/query-client";
import {
  PERSONAL_BINGO_SLOTS,
  TEAM_BINGO_SLOTS,
  type ApiBingoConfigResponse,
  parseJson,
} from "@/types/api";

const BACKEND_URL = (
  import.meta.env.VITE_BACKEND_URL || "http://localhost:3001"
).replace(/\/$/, "");

async function fetchBingoConfig(): Promise<ApiBingoConfigResponse> {
  const res = await fetch(`${BACKEND_URL}/api/bingo/config`);
  if (!res.ok) throw new Error("Не удалось загрузить настройки бинго");
  return parseJson<ApiBingoConfigResponse>(res);
}

export function useBingoConfig() {
  const { data, isPending } = useQuery({
    queryKey: queryKeys.bingoConfig,
    queryFn: fetchBingoConfig,
    staleTime: STALE_TIME_MS * 5, // 5 мин — конфиг меняется редко
  });

  return {
    personalSlots: data?.personal ?? PERSONAL_BINGO_SLOTS,
    teamSlots: data?.team ?? TEAM_BINGO_SLOTS,
    isLoading: isPending,
  };
}
