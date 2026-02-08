import { processBingoCode } from "@/actions/process-bingo-code";
import { processEventCode, validateEventCode } from "@/actions/process-event-code";
import { useCoinAnimation } from "@/app/context/coin_animation";
import { useSession } from "@/app/context/session";
import { useTelegram } from "@/app/context/telegram";
import { useToast } from "@/app/context/toast";
import { RegistrationModal } from "@/components/registration-modal";
import { useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "@/lib/query-client";
import { parseStartPayload } from "@/lib/event-deep-link";
import type { ApiValidateCodeResponse } from "@/types/api";
import { useCallback, useEffect, useRef, useState } from "react";

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
 * - registration (reg-CODE или 5 символов) → валидация + модалка регистрации с выбором команды.
 * - prize (prize-TOKEN / p-TOKEN или Bxxxx) → получение приза.
 */
export function StartParamHandler() {
	const { tg } = useTelegram();
	const { user, refetchProfile, isSupabaseSessionReady } = useSession();
	const { showToast } = useToast();
	const { showCoinAnimation } = useCoinAnimation();
	const queryClient = useQueryClient();
	const processedRef = useRef(false);
	const [retryAt, setRetryAt] = useState(0);

	// Registration modal state
	const [regModalOpen, setRegModalOpen] = useState(false);
	const [regModalData, setRegModalData] = useState<ApiValidateCodeResponse | null>(null);
	const [pendingCode, setPendingCode] = useState("");
	const [pendingStorageKey, setPendingStorageKey] = useState("");
	const [isRegistering, setIsRegistering] = useState(false);

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
			const timeoutId = setTimeout(async () => {
				try {
					const data = await validateEventCode(payload.value);
					if (data.alreadyRegistered) {
						sessionStorage.setItem(STORAGE_KEY, storageKey);
						showToast("Вы уже зарегистрированы на это мероприятие", "error");
						return;
					}
					// Открываем модалку регистрации
					setPendingCode(payload.value);
					setPendingStorageKey(storageKey);
					setRegModalData(data);
					setRegModalOpen(true);
				} catch (err: unknown) {
					processedRef.current = false;
					const msg = err instanceof Error ? err.message : "Не удалось обработать код";
					showToast(msg, "error");
				}
			}, 150);
			return () => clearTimeout(timeoutId);
		}

		if (payload.type === "prize") {
			const timeoutId = setTimeout(() => {
				processBingoCode({
					code: payload.value,
					telegramId: user.id,
					onSuccess: (data) => {
						sessionStorage.setItem(STORAGE_KEY, storageKey);
						refetchProfile();
						showCoinAnimation(data.coinsEarned ?? 10);
						void queryClient.invalidateQueries({ queryKey: queryKeys.achievements });
						showToast(`Приз получен! +${data.coinsEarned} монет.`, "success");
						(data.newlyUnlockedAchievements ?? []).forEach((a, i) => {
							setTimeout(() => {
								const hint = a.coinReward ? " Заберите награду в разделе «Достижения»." : "";
								showToast(`${a.badge} Достижение: ${a.name}. ${a.label}.${hint}`, "success");
							}, 600 + i * 400);
						});
					},
					onError: (message) => {
						processedRef.current = false;
						showToast(message || "Не удалось получить приз.", "error");
					},
				});
			}, 150);
			return () => clearTimeout(timeoutId);
		}
	}, [tg?.initDataUnsafe?.start_param, user?.id, isSupabaseSessionReady, retryAt, showToast, refetchProfile, showCoinAnimation, queryClient]);

	const handleRegistrationConfirm = useCallback(async (teamId: string | undefined) => {
		if (!user?.id || !pendingCode) return;
		setIsRegistering(true);
		try {
			await processEventCode({
				code: pendingCode,
				telegramId: user.id,
				teamId,
				onSuccess: (data) => {
					sessionStorage.setItem(STORAGE_KEY, pendingStorageKey);
					setRegModalOpen(false);
					setRegModalData(null);
					setPendingCode("");
					refetchProfile();
					showCoinAnimation(data.coinsEarned ?? 10);
					void queryClient.invalidateQueries({ queryKey: queryKeys.achievements });
					showToast(
						`Успешно! Вы зарегистрированы на мероприятие «${data.event.title}». +${data.coinsEarned} монет`,
						"success"
					);
					(data.newlyUnlockedAchievements ?? []).forEach((a, i) => {
						setTimeout(() => {
							const hint = a.coinReward ? " Заберите награду в разделе «Достижения»." : "";
							showToast(`${a.badge} Достижение: ${a.name}. ${a.label}.${hint}`, "success");
						}, 600 + i * 400);
					});
				},
				onError: (message) => {
					processedRef.current = false;
					showToast(message || "Не удалось обработать код", "error");
				},
			});
		} catch (err: unknown) {
			processedRef.current = false;
			const msg = err instanceof Error ? err.message : "Ошибка при регистрации";
			showToast(msg, "error");
		} finally {
			setIsRegistering(false);
		}
	}, [user?.id, pendingCode, pendingStorageKey, refetchProfile, showCoinAnimation, queryClient, showToast]);

	// start_param иногда приходит с задержкой — перепроверяем через 0.8 с
	useEffect(() => {
		if (!user?.id || !isSupabaseSessionReady) return;
		const t = setTimeout(() => setRetryAt((n) => n + 1), 800);
		return () => clearTimeout(t);
	}, [user?.id, isSupabaseSessionReady]);

	if (!regModalData) return null;

	return (
		<RegistrationModal
			open={regModalOpen}
			onOpenChange={(open) => {
				setRegModalOpen(open);
				if (!open) processedRef.current = false;
			}}
			eventTitle={regModalData.event.title}
			teams={regModalData.teams}
			coinsReward={regModalData.coinsReward}
			isRegistering={isRegistering}
			onConfirm={handleRegistrationConfirm}
		/>
	);
}

