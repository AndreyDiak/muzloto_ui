import { previewPurchaseCode } from "@/actions/preview-purchase-code";
import { processEventCode, validateEventCode } from "@/actions/process-event-code";
import { redeemPurchaseCode } from "@/actions/redeem-purchase-code";
import { useCoinAnimation } from "@/app/context/coin_animation";
import { useSession } from "@/app/context/session";
import { useTelegram } from "@/app/context/telegram";
import { useToast } from "@/app/context/toast";
import { PurchaseConfirmModal } from "@/components/purchase-confirm-modal";
import { RegistrationModal } from "@/components/registration-modal";
import { parseStartPayload } from "@/lib/event-deep-link";
import { queryKeys } from "@/lib/query-client";
import type { ApiValidateCodeResponse } from "@/types/api";
import { useQueryClient } from "@tanstack/react-query";
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
 * - registration (reg-CODE или 5 цифр) → валидация + модалка регистрации.
 * - shop (shop-CODE или 5 цифр) → погашение кода покупки.
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

	// Purchase confirm modal (shop code from start param)
	const [purchaseConfirmOpen, setPurchaseConfirmOpen] = useState(false);
	const [purchaseConfirmData, setPurchaseConfirmData] = useState<{
		itemName: string;
		itemPrice: number;
		balance: number;
	} | null>(null);
	const [pendingShopCode, setPendingShopCode] = useState("");
	const [pendingShopStorageKey, setPendingShopStorageKey] = useState("");
	const [isConfirmingPurchase, setIsConfirmingPurchase] = useState(false);

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

		if (payload.type === "shop") {
			const timeoutId = setTimeout(async () => {
				try {
					const preview = await previewPurchaseCode(payload.value);
					if (!preview) {
						processedRef.current = false;
						showToast("Код не найден или уже использован.", "error");
						return;
					}
					setPendingShopCode(payload.value);
					setPendingShopStorageKey(storageKey);
					setPurchaseConfirmData({
						itemName: preview.item.name,
						itemPrice: preview.item.price,
						balance: preview.balance,
					});
					setPurchaseConfirmOpen(true);
				} catch {
					processedRef.current = false;
					showToast("Ошибка при загрузке данных кода.", "error");
				}
			}, 150);
			return () => clearTimeout(timeoutId);
		}
	}, [tg?.initDataUnsafe?.start_param, user?.id, isSupabaseSessionReady, retryAt, showToast, refetchProfile, showCoinAnimation, queryClient]);

	const handleRegistrationConfirm = useCallback(async () => {
		if (!user?.id || !pendingCode) return;
		setIsRegistering(true);
		try {
			await processEventCode({
				code: pendingCode,
				telegramId: user.id,
				onSuccess: (data) => {
					sessionStorage.setItem(STORAGE_KEY, pendingStorageKey);
					setRegModalOpen(false);
					setRegModalData(null);
					setPendingCode("");
					refetchProfile();
					showCoinAnimation(data.coinsEarned ?? 10);
					void queryClient.invalidateQueries({ queryKey: queryKeys.achievements });
					showToast(
						`Успешно! Вы зарегистрированы на «${data.event.title}». +${data.coinsEarned} монет. Подтверждение придёт в личку от бота.`,
						"success"
					);
					(data.newlyUnlockedAchievements ?? []).forEach((a, i) => {
						setTimeout(() => {
							const hint = a.coinReward ? " Заберите награду в разделе «Награды»." : "";
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

	const handlePurchaseConfirm = useCallback(async () => {
		if (!pendingShopCode) return;
		setIsConfirmingPurchase(true);
		try {
			await redeemPurchaseCode({
				code: pendingShopCode,
				onSuccess: (data) => {
					sessionStorage.setItem(STORAGE_KEY, pendingShopStorageKey);
					setPurchaseConfirmOpen(false);
					setPurchaseConfirmData(null);
					setPendingShopCode("");
					refetchProfile();
					void queryClient.invalidateQueries({ queryKey: queryKeys.achievements });
					showToast(`Покупка по коду оформлена: ${data.item.name}.`, "success");
					(data.newlyUnlockedAchievements ?? []).forEach((a, i) => {
						setTimeout(() => {
							const hint = a.coinReward ? " Заберите награду в разделе «Награды»." : "";
							showToast(`${a.badge} Достижение: ${a.name}. ${a.label}.${hint}`, "success");
						}, 600 + i * 400);
					});
				},
				onError: (message) => {
					processedRef.current = false;
					showToast(message || "Не удалось погасить код покупки.", "error");
				},
			});
		} finally {
			setIsConfirmingPurchase(false);
		}
	}, [pendingShopCode, pendingShopStorageKey, refetchProfile, queryClient, showToast]);

	// start_param иногда приходит с задержкой — перепроверяем через 0.8 с
	useEffect(() => {
		if (!user?.id || !isSupabaseSessionReady) return;
		const t = setTimeout(() => setRetryAt((n) => n + 1), 800);
		return () => clearTimeout(t);
	}, [user?.id, isSupabaseSessionReady]);

	if (regModalData) {
		return (
			<RegistrationModal
				open={regModalOpen}
				onOpenChange={(open) => {
					setRegModalOpen(open);
					if (!open) processedRef.current = false;
				}}
				eventTitle={regModalData.event.title}
				coinsReward={regModalData.coinsReward}
				isRegistering={isRegistering}
				onConfirm={handleRegistrationConfirm}
			/>
		);
	}

	if (purchaseConfirmData) {
		return (
			<PurchaseConfirmModal
				open={purchaseConfirmOpen}
				onOpenChange={(open) => {
					setPurchaseConfirmOpen(open);
					if (!open) {
						processedRef.current = false;
						setPurchaseConfirmData(null);
						setPendingShopCode("");
					}
				}}
				itemName={purchaseConfirmData.itemName}
				itemPrice={purchaseConfirmData.itemPrice}
				balance={purchaseConfirmData.balance}
				isConfirming={isConfirmingPurchase}
				onConfirm={handlePurchaseConfirm}
			/>
		);
	}

	return null;
}

