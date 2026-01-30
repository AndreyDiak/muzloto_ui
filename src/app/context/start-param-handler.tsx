import { processEventCode } from "@/actions/process-event-code";
import { useCoinAnimation } from "@/app/context/coin_animation";
import { useSession } from "@/app/context/session";
import { useTelegram } from "@/app/context/telegram";
import { useToast } from "@/app/context/toast";
import { parseStartPayload } from "@/lib/event-deep-link";
import { useEffect, useRef } from "react";

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
 * - registration (reg:CODE или 5 символов) → регистрация на мероприятие, начисление монет.
 * - prize (prize:TOKEN / p:TOKEN) → получение приза (в будущем).
 */
export function StartParamHandler() {
	const { tg } = useTelegram();
	const { user, refetchProfile, isSupabaseSessionReady } = useSession();
	const { showToast } = useToast();
	const { showCoinAnimation } = useCoinAnimation();
	const processedRef = useRef(false);

	useEffect(() => {
		const raw = getRawPayload(tg);
		const payload = raw ? parseStartPayload(raw) : null;
		if (!payload || !user?.id || !isSupabaseSessionReady) return;

		const storageKey = `${payload.type}:${payload.value}`;
		const stored = sessionStorage.getItem(STORAGE_KEY);
		if (stored === storageKey) return;
		if (processedRef.current) return;
		processedRef.current = true;
		sessionStorage.setItem(STORAGE_KEY, storageKey);

		if (payload.type === "registration") {
			processEventCode({
				code: payload.value,
				telegramId: user.id,
				onSuccess: (data) => {
					refetchProfile();
					showCoinAnimation?.(data.coinsEarned ?? 10);
					showToast(
						`Успешно! Вы зарегистрированы на мероприятие «${data.event.title}». +${data.coinsEarned} монет`,
						"success"
					);
				},
				onError: (message) => {
					showToast(message || "Не удалось обработать код", "error");
				},
			});
			return;
		}

		if (payload.type === "prize") {
			handlePrizePayload(payload.value, user.id, { showToast, refetchProfile });
		}
	}, [tg?.initDataUnsafe?.start_param, user?.id, isSupabaseSessionReady, showToast, refetchProfile, showCoinAnimation]);

	return null;
}

/**
 * Обработка payload «получение приза». Сейчас — заглушка, в будущем — запрос на бэкенд и выдача приза.
 * Ссылка: t.me/bot/app?startapp=prize:TOKEN или startapp=p:TOKEN
 */
function handlePrizePayload(
	_token: string,
	_telegramId: number,
	_ctx: { showToast: (msg: string, type: "success" | "error" | "info") => void; refetchProfile: () => Promise<void> }
) {
	// TODO: вызов API получения приза, обновление профиля, тост
	_ctx.showToast("Получение приза по ссылке будет доступно скоро.", "info");
}
