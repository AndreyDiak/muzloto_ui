import { processBingoCode } from "@/actions/process-bingo-code";
import { processEventCode } from "@/actions/process-event-code";
import { useCoinAnimation } from "@/app/context/coin_animation";
import { useSession } from "@/app/context/session";
import { useTelegram } from "@/app/context/telegram";
import { useToast } from "@/app/context/toast";
import { useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "@/lib/query-client";
import { parseStartPayload } from "@/lib/event-deep-link";
import { useEffect, useRef, useState } from "react";

const STORAGE_KEY = "muzloto_start_param_processed";

/**
 * Сырой payload при открытии по ссылке:
 * - Прямая ссылка t.me/bot/app?startapp=... → initDataUnsafe.start_param
 * - Или в URL: ?code=... / ?tgWebAppStartParam=... (и в hash)
 */
function getRawPayload(tg: { initDataUnsafe?: { start_param?: string } } | undefined): string | null {
	const fromStartParam = tg?.initDataUnsafe?.start_param?.trim();
	if (fromStartParam) return fromStartParam;
	if (typeof window === "undefined") return null;
	const fromQuery = () => {
		const params = new URLSearchParams(window.location.search);
		return params.get("code") ?? params.get("tgWebAppStartParam");
	};
	const fromHash = () => {
		const hash = window.location.hash.slice(1);
		if (!hash) return null;
		const params = new URLSearchParams(hash);
		return params.get("code") ?? params.get("tgWebAppStartParam");
	};
	return fromQuery() ?? fromHash();
}

/**
 * Обрабатывает payload при заходе по ссылке по типу:
 * - registration (reg-CODE или 5 символов) → регистрация на мероприятие, начисление монет.
 * - prize (prize-TOKEN / p-TOKEN) → получение приза (в будущем).
 */
export function StartParamHandler() {
	const { tg } = useTelegram();
	const { user, refetchProfile, isSupabaseSessionReady } = useSession();
	const { showToast } = useToast();
	const { showCoinAnimation } = useCoinAnimation();
	const queryClient = useQueryClient();
	const processedRef = useRef(false);
	const [retryAt, setRetryAt] = useState(0);

	useEffect(() => {
		const payload = (() => {
			const raw = getRawPayload(tg);
			return raw ? parseStartPayload(raw) : null;
		})();
		if (!payload || !user?.id || !isSupabaseSessionReady) return;

		const storageKey = `${payload.type}:${payload.value}`;
		if (sessionStorage.getItem(STORAGE_KEY) === storageKey) return;
		if (processedRef.current) return;
		processedRef.current = true;

		if (payload.type === "registration") {
			const timeoutId = setTimeout(() => {
				processEventCode({
					code: payload.value,
					telegramId: user.id,
					onSuccess: (data) => {
						sessionStorage.setItem(STORAGE_KEY, storageKey);
						refetchProfile();
						showCoinAnimation(data.coinsEarned ?? 10);
						void queryClient.invalidateQueries({ queryKey: queryKeys.achievements });
						showToast(
							`Успешно! Вы зарегистрированы на мероприятие «${data.event.title}». +${data.coinsEarned} монет`,
							"success"
						);
						(data.newlyUnlockedAchievements ?? []).forEach((a, i) => {
							setTimeout(() => {
								const rewardText = a.coinReward ? ` +${a.coinReward} монет` : "";
								showToast(`${a.badge} Достижение: ${a.name}. ${a.label}${rewardText}`, "success");
							}, 600 + i * 400);
						});
					},
					onError: (message) => {
						processedRef.current = false;
						showToast(message || "Не удалось обработать код", "error");
					},
				});
			}, 150);
			return () => clearTimeout(timeoutId);
		}

		if (payload.type === "bingo") {
			const timeoutId = setTimeout(() => {
				processBingoCode({
					code: payload.value,
					telegramId: user.id,
					onSuccess: (data) => {
						sessionStorage.setItem(STORAGE_KEY, storageKey);
						refetchProfile();
						showCoinAnimation(data.coinsEarned ?? 10);
						void queryClient.invalidateQueries({ queryKey: queryKeys.achievements });
						showToast(`Победа в бинго! +${data.coinsEarned} монет.`, "success");
						(data.newlyUnlockedAchievements ?? []).forEach((a, i) => {
							setTimeout(() => {
								const rewardText = a.coinReward ? ` +${a.coinReward} монет` : "";
								showToast(`${a.badge} Достижение: ${a.name}. ${a.label}${rewardText}`, "success");
							}, 600 + i * 400);
						});
					},
					onError: (message) => {
						processedRef.current = false;
						showToast(message || "Не удалось засчитать победу.", "error");
					},
				});
			}, 150);
			return () => clearTimeout(timeoutId);
		}

		if (payload.type === "prize") {
			handlePrizePayload(payload.value, user.id, { showToast, refetchProfile });
		}
	}, [tg?.initDataUnsafe?.start_param, user?.id, isSupabaseSessionReady, retryAt, showToast, refetchProfile, showCoinAnimation, queryClient]);

	// start_param иногда приходит с задержкой — перепроверяем через 0.8 с
	useEffect(() => {
		if (!user?.id || !isSupabaseSessionReady) return;
		const t = setTimeout(() => setRetryAt((n) => n + 1), 800);
		return () => clearTimeout(t);
	}, [user?.id, isSupabaseSessionReady]);

	return null;
}

/**
 * Обработка payload «получение приза». Сейчас — заглушка.
 * Ссылка: t.me/bot/app?startapp=prize-TOKEN или startapp=p-TOKEN
 */
function handlePrizePayload(
	_token: string,
	_telegramId: number,
	_ctx: { showToast: (msg: string, type: "success" | "error" | "info") => void; refetchProfile: () => Promise<void> }
) {
	// TODO: вызов API получения приза, обновление профиля, тост
	_ctx.showToast("Получение приза по ссылке будет доступно скоро.", "info");
}
