import { processBingoCode } from "@/actions/process-bingo-code";
import { processEventCode, validateEventCode } from "@/actions/process-event-code";
import { redeemPurchaseCode } from "@/actions/redeem-purchase-code";
import { useCoinAnimation } from "@/app/context/coin_animation";
import { useSession } from "@/app/context/session";
import { useTelegram } from "@/app/context/telegram";
import { useToast } from "@/app/context/toast";
import { PurchaseSuccessModal } from "@/components/purchase-success-modal";
import { RegistrationModal } from "@/components/registration-modal";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import type { PurchaseSuccessPayload } from "@/entities/ticket";
import { extractPayloadFromInput, isBingoCodeLike, isShopCodeLike } from "@/lib/event-deep-link";
import { queryKeys } from "@/lib/query-client";
import type { ApiValidateCodeResponse } from "@/types/api";
import { useQueryClient } from "@tanstack/react-query";
import { Keyboard, QrCode } from "lucide-react";
import { memo, useCallback, useRef, useState } from "react";

export const ProfileSqan = memo(() => {
	const { user, refetchProfile } = useSession();
	const { showToast } = useToast();
	const queryClient = useQueryClient();
	const { showCoinAnimation } = useCoinAnimation();
	const { tg } = useTelegram();
	// 6 полей: код покупки 5 символов или 6 (Cxxxxx), мероприятие/бинго — 5
	const CODE_LENGTH = 6;
	const [codeInputs, setCodeInputs] = useState<string[]>(Array(CODE_LENGTH).fill(''));
	const [isProcessing, setIsProcessing] = useState(false);
	const inputRefs = useRef<(HTMLInputElement | null)[]>(Array(CODE_LENGTH).fill(null));
	const isProcessingQRRef = useRef(false);

	// Registration modal state
	const [regModalOpen, setRegModalOpen] = useState(false);
	const [regModalData, setRegModalData] = useState<ApiValidateCodeResponse | null>(null);
	const [pendingRegCode, setPendingRegCode] = useState<string>("");
	const [isRegistering, setIsRegistering] = useState(false);

	// Модалка ручного ввода кода
	const [manualCodeModalOpen, setManualCodeModalOpen] = useState(false);
	// Результат погашения кода покупки — показываем модалку
	const [redeemResult, setRedeemResult] = useState<PurchaseSuccessPayload | null>(null);

	const handleScanQR = () => {
		if (tg?.showScanQrPopup) {
			// Сбрасываем флаг обработки при открытии нового сканера
			isProcessingQRRef.current = false;
			
			try {
				tg.showScanQrPopup(
					{ text: 'Отсканируйте QR код мероприятия' },
					(text: string) => {
						if (isProcessingQRRef.current) return true;

						try {
							if (!text || typeof text !== 'string' || text.trim() === '') {
								showToast('QR код не распознан. Попробуйте еще раз.', 'error');
								return false;
							}

						isProcessingQRRef.current = true;
						const trimmedText = text.trim();

						// Пробуем распарсить как raw payload, URL с startapp, или код (5/6 символов)
						const parsed = extractPayloadFromInput(trimmedText);
						if (parsed) {
							if (parsed.type === "prize") {
								handleProcessBingoCode(parsed.value);
								return true;
							}
							if (parsed.type === "registration") {
								handleProcessEventCode(parsed.value);
								return true;
							}
							if (parsed.type === "shop") {
								handleRedeemPurchaseCode(parsed.value);
								return true;
							}
						}

						showToast('Неверный формат. Ожидается код из 5–6 символов или ссылка.', 'error');
						isProcessingQRRef.current = false;
						return false;
						} catch {
							showToast('Ошибка при обработке QR кода', 'error');
							isProcessingQRRef.current = false;
							return false;
						}
					}
				);
			} catch (error) {
				showToast('Не удалось открыть сканер QR кода', 'error');
				isProcessingQRRef.current = false;
			}
		} else {
			// Если нативный сканер недоступен (например, на десктопе)
			showToast('Сканер QR доступен только на мобильных. Введите код ниже.', 'info');
		}
	};

	const handleProcessBingoCode = async (code: string) => {
		if (isProcessing || !user?.id) {
			if (!user?.id) showToast('Ошибка: не удалось определить пользователя.', 'error');
			return;
		}
		setIsProcessing(true);
		try {
			await processBingoCode({
				code,
				telegramId: user.id,
				onSuccess: (data) => {
					setCodeInputs(Array(5).fill(''));
					setManualCodeModalOpen(false);
					showCoinAnimation(data.coinsEarned, undefined, () => {
						refetchProfile().catch(() => {});
						void queryClient.invalidateQueries({ queryKey: queryKeys.achievements });
						(data.newlyUnlockedAchievements ?? []).forEach((a, i) => {
							setTimeout(() => {
								const hint = a.coinReward ? ' Заберите награду в разделе «Достижения».' : '';
								showToast(`${a.badge} Достижение: ${a.name}. ${a.label}.${hint}`, 'success');
							}, 600 + i * 400);
							});
					});
					isProcessingQRRef.current = false;
				},
				onError: (err) => {
					showToast(err ?? 'Не удалось засчитать победу.', 'error');
					isProcessingQRRef.current = false;
				},
			});
		} finally {
			setIsProcessing(false);
		}
	};

	const handleRedeemPurchaseCode = async (code: string) => {
		if (isProcessing || !user?.id) {
			if (!user?.id) showToast('Ошибка: не удалось определить пользователя.', 'error');
			return;
		}
		setIsProcessing(true);
		try {
			await redeemPurchaseCode({
				code,
				onSuccess: async (data) => {
					setCodeInputs(Array(CODE_LENGTH).fill(''));
					setManualCodeModalOpen(false);
					setRedeemResult(data);
					refetchProfile().catch(() => {});
					void queryClient.invalidateQueries({ queryKey: queryKeys.achievements });
					isProcessingQRRef.current = false;
					(data.newlyUnlockedAchievements ?? []).forEach((a, i) => {
						setTimeout(() => {
							const hint = a.coinReward ? ' Заберите награду в разделе «Достижения».' : '';
							showToast(`${a.badge} Достижение: ${a.name}. ${a.label}.${hint}`, 'success');
						}, 600 + i * 400);
					});
				},
				onError: (err) => {
					showToast(err ?? 'Не удалось погасить код.', 'error');
					isProcessingQRRef.current = false;
				},
			});
		} finally {
			setIsProcessing(false);
		}
	};

	const handleProcessEventCode = async (code: string) => {
		if (isProcessing) {
			return;
		}

		if (!user?.id) {
			showToast('Ошибка: не удалось определить пользователя. Пожалуйста, перезагрузите страницу.', 'error');
			return;
		}

		if (isBingoCodeLike(code)) {
			handleProcessBingoCode(code);
			return;
		}

		setIsProcessing(true);

		try {
			const data = await validateEventCode(code);

			if (data.alreadyRegistered) {
				setCodeInputs(Array(5).fill(''));
				showToast('Вы уже зарегистрированы на это мероприятие', 'error');
				isProcessingQRRef.current = false;
				return;
			}

			// Открываем модалку регистрации с информацией о мероприятии и командах
			setPendingRegCode(code);
			setRegModalData(data);
			setCodeInputs(Array(5).fill(''));
			setManualCodeModalOpen(false);
			setRegModalOpen(true);
		} catch (err: unknown) {
			const errorMessage = err instanceof Error ? err.message : 'Произошла ошибка при обработке кода';
			showToast(errorMessage, 'error');
			isProcessingQRRef.current = false;
		} finally {
			setIsProcessing(false);
		}
	};

	const handleRegistrationConfirm = useCallback(async (teamId: string | undefined) => {
		if (!user?.id || !pendingRegCode) return;
		setIsRegistering(true);

		try {
			await processEventCode({
				code: pendingRegCode,
				telegramId: user.id,
				teamId,
				onSuccess: async (data) => {
					const coinsEarned = data.coinsEarned;
					const newlyUnlocked = data.newlyUnlockedAchievements ?? [];

					setRegModalOpen(false);
					setRegModalData(null);
					setPendingRegCode("");
					setManualCodeModalOpen(false);

					showCoinAnimation(coinsEarned, undefined, async () => {
						try {
							await refetchProfile();
						} catch {
							// Игнорируем ошибки обновления профиля
						}
						void queryClient.invalidateQueries({ queryKey: queryKeys.achievements });
						void queryClient.invalidateQueries({ queryKey: queryKeys.myRegistration });
						newlyUnlocked.forEach((a, i) => {
							setTimeout(() => {
								const hint = a.coinReward ? ' Заберите награду в разделе «Достижения».' : '';
								showToast(`${a.badge} Достижение: ${a.name}. ${a.label}.${hint}`, 'success');
							}, 600 + i * 400);
						});
					});

					isProcessingQRRef.current = false;
				},
				onError: (error, statusCode) => {
					if (statusCode === 409) {
						setRegModalOpen(false);
						setTimeout(() => {
							showToast(error || 'Вы уже зарегистрированы на это мероприятие', 'error');
						}, 100);
					} else {
						showToast(error || 'Произошла ошибка при обработке кода', 'error');
					}
					isProcessingQRRef.current = false;
				},
			});
		} catch (err: unknown) {
			const errorMessage = err instanceof Error ? err.message : 'Произошла ошибка при обработке кода';
			showToast(errorMessage, 'error');
			isProcessingQRRef.current = false;
		} finally {
			setIsRegistering(false);
		}
	}, [user?.id, pendingRegCode, showCoinAnimation, refetchProfile, queryClient, showToast]);

	const handleSubmitCode = async (codeOverride?: string) => {
		const raw = (codeOverride ?? codeInputs.join('')).toUpperCase();
		if (raw.length < 5) return;
		const code5 = raw.length >= 5 ? raw.slice(0, 5) : raw;
		// Код покупки каталога: 5 символов (новый) или 6 (Cxxxxx, старый)
		if (isShopCodeLike(raw)) {
			await handleRedeemPurchaseCode(raw.slice(0, raw.length >= 6 ? 6 : 5));
			return;
		}
		// 5 символов: бинго или мероприятие
		if (isBingoCodeLike(code5)) {
			await handleProcessBingoCode(code5);
		} else {
			await handleProcessEventCode(code5);
		}
	};

	const handleSubmitButtonClick = () => {
		handleSubmitCode();
	};

	const handleInputChange = (index: number, value: string) => {
		const char = value.length > 0 ? value.slice(-1).toUpperCase() : '';

		const newInputs = [...codeInputs];
		newInputs[index] = char;
		setCodeInputs(newInputs);

		if (char && index < CODE_LENGTH - 1) {
			setTimeout(() => {
				inputRefs.current[index + 1]?.focus();
			}, 0);
		}

		if (char && (index === 4 || index === CODE_LENGTH - 1)) {
			const fullCode = newInputs.join('');
			// Авто-отправка при 5 или 6 символах
			const shouldSubmit5 = fullCode.length === 5;
			const shouldSubmit6 = fullCode.length === 6;
			if (shouldSubmit5 || shouldSubmit6) {
				setTimeout(() => handleSubmitCode(fullCode), 100);
			}
		}
	};

	const handleInputKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
		if (e.key === 'Backspace' && !codeInputs[index] && index > 0) {
			const newInputs = [...codeInputs];
			newInputs[index - 1] = '';
			setCodeInputs(newInputs);
			setTimeout(() => {
				inputRefs.current[index - 1]?.focus();
			}, 0);
		} else if (e.key === 'ArrowLeft' && index > 0) {
			inputRefs.current[index - 1]?.focus();
		} else if (e.key === 'ArrowRight' && index < CODE_LENGTH - 1) {
			inputRefs.current[index + 1]?.focus();
		}
	};

	return (
		<>
			{regModalData && (
				<RegistrationModal
					open={regModalOpen}
					onOpenChange={(open) => {
						setRegModalOpen(open);
						if (!open) {
							isProcessingQRRef.current = false;
						}
					}}
					eventTitle={regModalData.event.title}
					teams={regModalData.teams}
					coinsReward={regModalData.coinsReward}
					isRegistering={isRegistering}
					onConfirm={handleRegistrationConfirm}
				/>
			)}
			{/* Секция камеры: только QR */}
			<div className="bg-linear-to-r from-neon-cyan/15 to-neon-purple/15 rounded-2xl overflow-hidden border border-neon-cyan/30">
				<button
					type="button"
					onClick={handleScanQR}
					className="w-full flex items-center gap-3 p-4 hover:opacity-90 transition-opacity active:scale-[0.98]"
				>
					<div className="shrink-0 w-12 h-12 rounded-xl bg-linear-to-br from-neon-cyan to-neon-purple flex items-center justify-center">
						<QrCode className="w-6 h-6 text-white" />
					</div>
					<div className="flex-1 text-left">
						<h3 className="text-base font-semibold text-white mb-0.5">Отсканировать QR</h3>
						<p className="text-xs text-gray-400">Открыть сканер</p>
					</div>
				</button>
			</div>

			{/* Ввод кода вручную: такой же блок, по клику — модалка */}
			<div className="bg-linear-to-r from-neon-cyan/15 to-neon-purple/15 rounded-2xl overflow-hidden border border-neon-cyan/30">
				<button
					type="button"
					onClick={() => setManualCodeModalOpen(true)}
					className="w-full flex items-center gap-3 p-4 hover:opacity-90 transition-opacity active:scale-[0.98]"
				>
					<div className="shrink-0 w-12 h-12 rounded-xl bg-linear-to-br from-neon-cyan to-neon-purple flex items-center justify-center">
						<Keyboard className="w-6 h-6 text-white" />
					</div>
					<div className="flex-1 text-left">
						<h3 className="text-base font-semibold text-white mb-0.5">Ввести код вручную</h3>
						<p className="text-xs text-gray-400">Открыть ввод кода</p>
					</div>
				</button>
			</div>

			{/* Модалка ручного ввода кода */}
			<Dialog open={manualCodeModalOpen} onOpenChange={(open) => {
				setManualCodeModalOpen(open);
				if (!open) setCodeInputs(Array(CODE_LENGTH).fill(''));
			}}>
				<DialogContent className="bg-surface-card border-white/10 text-white sm:max-w-sm max-w-[calc(100vw-2rem)]">
					<DialogHeader>
						<DialogTitle className="text-white">Введите код</DialogTitle>
						<p className="text-sm text-gray-400">5 символов — код покупки, мероприятие или приз</p>
					</DialogHeader>
					<div className="space-y-4 pt-2">
						<div className="grid grid-cols-6 gap-1.5 sm:gap-2 w-full max-w-full">
							{Array.from({ length: CODE_LENGTH }).map((_, index) => {
								const value = codeInputs[index] || '';
								const isFilled = value !== '';
								return (
									<div key={index} className="aspect-square min-w-0">
										<input
											ref={(el) => {
												inputRefs.current[index] = el;
											}}
											type="text"
											inputMode="text"
											autoComplete="off"
											value={value}
											onChange={(e) => handleInputChange(index, e.target.value)}
											onKeyDown={(e) => handleInputKeyDown(index, e)}
											onFocus={(e) => e.target.select()}
											maxLength={1}
											className={`
												w-full h-full rounded-lg border text-center text-lg sm:text-xl font-bold
												transition-all duration-200 focus:outline-none
												${isFilled
													? 'bg-surface-dark text-white border-white/12'
													: 'bg-surface-dark border-white/8 text-gray-500 focus:border-white/20 focus:ring-2 focus:ring-white/10'
												}
											`}
										/>
									</div>
								);
							})}
						</div>
						<button
							type="button"
							onClick={handleSubmitButtonClick}
							disabled={codeInputs.join('').length < 5 || isProcessing}
							className="w-full py-3 rounded-xl bg-linear-to-r from-neon-cyan to-neon-purple text-white font-semibold hover:opacity-95 transition-opacity active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
						>
							{isProcessing ? 'Обработка...' : 'Активировать код'}
						</button>
					</div>
				</DialogContent>
			</Dialog>

			{redeemResult && (
				<PurchaseSuccessModal
					open={!!redeemResult}
					onOpenChange={(open) => !open && setRedeemResult(null)}
					itemName={redeemResult.item.name}
					itemPrice={redeemResult.item.price}
					newBalance={redeemResult.newBalance}
				/>
			)}
		</>
	);
});