import { authFetch } from "@/lib/auth-fetch";
import type { ApiRaffleResponse, ApiRegistrationsResponse } from "@/types/api";
import { parseJson } from "@/types/api";
import { Loader2, User } from "lucide-react";
import type { ReactNode } from "react";
import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";

const BACKEND_URL = (import.meta.env.VITE_BACKEND_URL || "http://localhost:3001").replace(
	/\/$/,
	"",
);

type ApiRegistrationRow = ApiRegistrationsResponse["registrations"][number];
type ApiRaffleWinner = NonNullable<ApiRaffleResponse["winner"]>;

export interface RaffleContentProps {
	eventId: string;
	registrations: ApiRegistrationsResponse["registrations"];
	existingWinner: ApiRaffleWinner | null;
	onRaffleDone?: () => void;
	/** Кнопка/ссылка «Назад» в шапке (для страницы розыгрыша) */
	headerLeft?: ReactNode;
}

function shuffleArray<T>(arr: T[]): T[] {
	const out = [...arr];
	for (let i = out.length - 1; i > 0; i--) {
		const j = Math.floor(Math.random() * (i + 1));
		[out[i], out[j]] = [out[j], out[i]];
	}
	return out;
}

const SHUFFLE_ANIMATION_MS = 400;

const GRID_LAYOUTS: [number, number][] = [
	[2, 3], [2, 4], [3, 3], [3, 4], [4, 4], [4, 5], [5, 5], [5, 6], [6, 6], [6, 7], [7, 7],
];

function getGridLayout(count: number): { cols: number; rows: number } {
	if (count <= 0) return { cols: 2, rows: 3 };
	let best: [number, number] = GRID_LAYOUTS[0];
	let bestWaste = Infinity;
	for (const [cols, rows] of GRID_LAYOUTS) {
		const cells = cols * rows;
		if (cells < count) continue;
		const waste = cells - count;
		if (waste < bestWaste) {
			bestWaste = waste;
			best = [cols, rows];
		}
	}
	return { cols: best[0], rows: best[1] };
}

function RaffleCard({
	registration,
	number,
	showNumber,
	isRevealed,
	isWinner,
	showWinnerFace,
}: {
	registration: ApiRegistrationRow;
	number: number;
	showNumber: boolean;
	isRevealed: boolean;
	isWinner: boolean;
	showWinnerFace: boolean;
}) {
	return (
		<div
			className="relative w-full aspect-square transition-all duration-500 ease-in-out"
			style={{
				transform: isWinner ? "scale(1.8)" : "scale(1)",
				opacity: isRevealed ? 1 : 0,
				visibility: isRevealed ? "visible" : "hidden",
				transitionProperty: "opacity, transform, visibility",
				perspective: "800px",
				transformStyle: "preserve-3d",
			}}
		>
			<div className="absolute inset-0 rounded-xl overflow-hidden" style={{ transformStyle: "preserve-3d" }}>
				<div
					className="absolute inset-0 flex items-center justify-center rounded-xl border border-neon-gold/30 bg-neon-gold/10 z-0"
					style={{ opacity: showNumber && !showWinnerFace ? 1 : 0 }}
				>
					<span className="text-2xl sm:text-3xl font-bold text-neon-gold">{number}</span>
				</div>
				<div
					className="absolute inset-0 rounded-xl border border-white/10 bg-surface-card z-10 transition-transform duration-500 ease-in-out"
					style={{
						backfaceVisibility: "hidden",
						WebkitBackfaceVisibility: "hidden",
						transform: showNumber && !showWinnerFace ? "rotateY(180deg)" : "rotateY(0deg)",
					}}
				>
					<div className="absolute inset-0 flex flex-col items-center justify-center p-2 rounded-xl">
						<div className="w-full h-full min-h-0 rounded-lg bg-white/5 flex flex-col items-center justify-center">
							<div className="w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-neon-cyan/10 flex items-center justify-center shrink-0 overflow-hidden">
								{registration.avatar_url ? (
									<img src={registration.avatar_url} alt="" className="w-full h-full object-cover" />
								) : (
									<User className="w-6 h-6 sm:w-7 sm:h-7 text-neon-cyan" />
								)}
							</div>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
}

export function RaffleContent({
	eventId,
	registrations,
	existingWinner,
	onRaffleDone,
	headerLeft,
}: RaffleContentProps) {
	const [phase, setPhase] = useState<
		"avatars" | "numbers" | "shuffled" | "generating" | "showDrawnNumber" | "revealed" | "winner"
	>("avatars");
	const [order, setOrder] = useState<number[]>([]);
	const [winner, setWinner] = useState<ApiRaffleWinner | null>(existingWinner ?? null);
	const [winnerNumber, setWinnerNumber] = useState<number | null>(null);
	const [error, setError] = useState<string | null>(null);
	const [confirming, setConfirming] = useState(false);

	const cardRefs = useRef<(HTMLDivElement | null)[]>([]);
	const flipPositionsRef = useRef<Map<number, DOMRect> | null>(null);

	const winnerRegistration = winner
		? registrations.find((r) => r.telegram_id === winner.telegram_id)
		: null;

	useEffect(() => {
		if (registrations.length > 0 && phase === "avatars") {
			setOrder(registrations.map((_, i) => i));
		}
	}, [registrations.length, phase]);

	const goToNumbers = useCallback(() => setPhase("numbers"), []);

	const doShuffle = useCallback(() => {
		setOrder((prev) => {
			const positions = new Map<number, DOMRect>();
			for (let i = 0; i < prev.length; i++) {
				const el = cardRefs.current[i];
				if (el) positions.set(prev[i], el.getBoundingClientRect());
			}
			flipPositionsRef.current = positions;
			return shuffleArray(prev);
		});
		setPhase("shuffled");
	}, []);

	const generateNumber = useCallback(async () => {
		if (!eventId || registrations.length === 0) return;
		setError(null);
		setPhase("generating");
		try {
			const res = await authFetch(`${BACKEND_URL}/api/events/${eventId}/raffle/roll`, { method: "POST" });
			const data = await parseJson<{ winner?: ApiRaffleWinner; error?: string }>(res);
			if (!res.ok) {
				setError(data.error ?? "Ошибка розыгрыша");
				setPhase("shuffled");
				return;
			}
			if (!data.winner) {
				setError("Нет победителя");
				setPhase("shuffled");
				return;
			}
			setWinner(data.winner);
			const winnerIndex = registrations.findIndex((r) => r.telegram_id === data.winner!.telegram_id);
			if (winnerIndex < 0) {
				setError("Участник не найден");
				setPhase("shuffled");
				return;
			}
			setWinnerNumber(winnerIndex + 1);
			setPhase("winner");
		} catch (e) {
			setError(e instanceof Error ? e.message : "Ошибка сети");
			setPhase("shuffled");
		}
	}, [eventId, registrations]);

	const confirmWinner = useCallback(async () => {
		if (!winner || !eventId) return;
		setError(null);
		setConfirming(true);
		try {
			const res = await authFetch(`${BACKEND_URL}/api/events/${eventId}/raffle/confirm`, {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ winner_telegram_id: winner.telegram_id }),
			});
			const data = await parseJson<{ error?: string }>(res);
			if (!res.ok) {
				setError(data.error ?? "Ошибка подтверждения");
				return;
			}
			onRaffleDone?.();
		} catch (e) {
			setError(e instanceof Error ? e.message : "Ошибка сети");
		} finally {
			setConfirming(false);
		}
	}, [eventId, winner, onRaffleDone]);

	const restart = useCallback(() => {
		setPhase("avatars");
		setWinner(null);
		setWinnerNumber(null);
		setOrder(registrations.map((_, i) => i));
		setError(null);
	}, [registrations.length]);

	useLayoutEffect(() => {
		const oldPositions = flipPositionsRef.current;
		if (!oldPositions || order.length === 0) return;

		flipPositionsRef.current = null;
		const refs = cardRefs.current;
		const duration = SHUFFLE_ANIMATION_MS / 1000;

		for (let i = 0; i < order.length; i++) {
			const el = refs[i];
			const regIndex = order[i];
			const oldRect = oldPositions.get(regIndex);
			if (!el || !oldRect) continue;

			const newRect = el.getBoundingClientRect();
			const dx = oldRect.left - newRect.left;
			const dy = oldRect.top - newRect.top;
			el.style.transition = "none";
			el.style.transform = `translate(${dx}px, ${dy}px)`;
		}

		requestAnimationFrame(() => {
			requestAnimationFrame(() => {
				for (let i = 0; i < order.length; i++) {
					const el = refs[i];
					if (!el) continue;
					el.style.transition = `transform ${duration}s ease-in-out`;
					el.style.transform = "translate(0, 0)";
				}
				setTimeout(() => {
					for (let i = 0; i < order.length; i++) {
						const el = refs[i];
						if (el) {
							el.style.transition = "";
							el.style.transform = "";
						}
					}
				}, SHUFFLE_ANIMATION_MS + 50);
			});
		});
	}, [order]);

	if (registrations.length === 0) {
		return (
			<div className="flex flex-col h-full min-h-0 px-4 py-3">
				<div className="relative flex items-center gap-3 shrink-0 min-h-10">
					{headerLeft}
					<div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 flex justify-center w-full pointer-events-none">
						<span className="text-lg font-bold text-neon-gold tracking-tight drop-shadow-[0_0_8px_var(--color-neon-gold)]">
						Караоке Лото
					</span>
					</div>
				</div>
				<p className="text-gray-400 text-sm py-4">Нет участников для розыгрыша.</p>
			</div>
		);
	}

	if (existingWinner) {
		const existingWinnerIndex = registrations.findIndex((r) => r.telegram_id === existingWinner.telegram_id);
		const displayNumber = existingWinnerIndex >= 0 ? existingWinnerIndex + 1 : null;
		return (
			<div className="flex flex-col h-full min-h-0 overflow-hidden px-4 pt-2 sm:px-6 sm:pt-3 bg-transparent">
				<header className="shrink-0 py-1 flex flex-col gap-1">
					<div className="relative flex items-center gap-3 min-h-10">
						{headerLeft}
						<div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 flex justify-center w-full pointer-events-none">
							<span className="text-lg font-bold text-neon-gold tracking-tight drop-shadow-[0_0_8px_var(--color-neon-gold)]">
						Караоке Лото
					</span>
						</div>
					</div>
				</header>
				<div className="flex-1 min-h-0 flex flex-col items-center justify-center gap-6 sm:gap-8 py-4">
					<p className="text-white text-4xl sm:text-6xl font-bold tabular-nums text-center">
						{displayNumber != null ? `Выпал номер ${displayNumber}` : "Победитель"}
					</p>
					<div className="flex flex-col items-center gap-3 p-4 min-w-0 max-w-sm">
						<div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full bg-neon-cyan/10 flex items-center justify-center shrink-0 overflow-hidden border-2 border-neon-gold/40">
							{existingWinner.avatar_url ? (
								<img src={existingWinner.avatar_url} alt="" className="w-full h-full object-cover" />
							) : (
								<User className="w-10 h-10 sm:w-12 sm:h-12 text-neon-cyan" />
							)}
						</div>
						<div className="text-center min-w-0">
							<p className="text-white font-semibold text-lg sm:text-xl">{existingWinner.first_name || "—"}</p>
							{existingWinner.username && (
								<p className="text-neon-gold text-sm sm:text-base mt-1">@{existingWinner.username}</p>
							)}
						</div>
					</div>
				</div>
			</div>
		);
	}

	const showNumber = phase !== "avatars";
	const isWinnerPhase = phase === "winner";
	const winnerRegIndex =
		winner !== null ? registrations.findIndex((r) => r.telegram_id === winner.telegram_id) : -1;
	const { cols: gridCols, rows: gridRows } = getGridLayout(registrations.length);
	const totalCells = gridCols * gridRows;

	return (
		<div
			className={`flex flex-col h-full min-h-0 overflow-hidden px-4 pt-2 sm:px-6 sm:pt-3 ${isWinnerPhase ? "bg-transparent" : "bg-surface-card"}`}
		>
			<header className="shrink-0 py-1 flex flex-col gap-1">
				<div className="relative flex items-center gap-3 min-h-10">
					{headerLeft}
					<div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 flex justify-center w-full pointer-events-none">
						<span className="text-lg font-bold text-neon-gold tracking-tight drop-shadow-[0_0_8px_var(--color-neon-gold)]">
						Караоке Лото
					</span>
					</div>
				</div>
			</header>

			<div className="flex-1 min-h-0 flex flex-col overflow-hidden">
				{phase === "generating" ? (
					<div className="flex-1 min-h-0 flex items-center justify-center">
						<Loader2 className="w-16 h-16 sm:w-20 sm:h-20 text-neon-gold animate-spin" aria-hidden />
					</div>
				) : isWinnerPhase && winnerRegistration ? (
					<div className="flex-1 min-h-0 flex flex-col items-center justify-center gap-6 sm:gap-8 py-4">
						<p
							className="text-white text-4xl sm:text-6xl font-bold tabular-nums text-center"
							style={{
								animation: "raffle-number-in 0.45s ease-out both",
							}}
						>
							Выпал номер {winnerNumber ?? winnerRegIndex + 1}
						</p>
						<div className="flex flex-col items-center gap-3 p-4 min-w-0 max-w-sm">
							<div
								className="w-20 h-20 sm:w-24 sm:h-24 rounded-full bg-neon-cyan/10 flex items-center justify-center shrink-0 overflow-hidden border-2 border-neon-gold/40"
								style={{
									animation: "raffle-avatar-in 0.4s ease-out both",
									animationDelay: "0.75s",
								}}
							>
								{winnerRegistration.avatar_url ? (
									<img
										src={winnerRegistration.avatar_url}
										alt=""
										className="w-full h-full object-cover"
									/>
								) : (
									<User className="w-10 h-10 sm:w-12 sm:h-12 text-neon-cyan" />
								)}
							</div>
							<div
								className="text-center min-w-0"
								style={{
									animation: "raffle-name-in 0.35s ease-out both",
									animationDelay: "1.25s",
								}}
							>
								<p className="text-white font-semibold text-lg sm:text-xl">
									{winnerRegistration.first_name || "—"}
								</p>
								{winnerRegistration.username && (
									<p className="text-neon-gold text-sm sm:text-base mt-1">@{winnerRegistration.username}</p>
								)}
							</div>
						</div>
					</div>
				) : (
					<div className="flex-1 min-h-0 min-w-0 overflow-hidden flex flex-col items-center justify-center">
						<div
							className="grid gap-2 sm:gap-3 p-1 w-full max-w-full max-h-full"
							style={{
								aspectRatio: `${gridCols} / ${gridRows}`,
								gridTemplateColumns: `repeat(${gridCols}, 1fr)`,
								gridTemplateRows: `repeat(${gridRows}, 1fr)`,
							}}
						>
							{Array.from({ length: totalCells }, (_, position) => {
								if (position >= order.length) {
									return (
										<div
											key={`empty-${position}`}
											className="min-w-0 min-h-0 aspect-square rounded-xl border border-dashed border-white/10 bg-white/5"
											aria-hidden
										/>
									);
								}
								const regIndex = order[position];
								const reg = registrations[regIndex];
								const number = regIndex + 1;
								const card = (
									<RaffleCard
										registration={reg}
										number={number}
										showNumber={showNumber}
										isRevealed
										isWinner={false}
										showWinnerFace={false}
									/>
								);
								return (
									<div
										key={reg.telegram_id}
										ref={(el) => {
											cardRefs.current[position] = el;
										}}
										className="min-w-0 min-h-0 aspect-square"
									>
										{card}
									</div>
								);
							})}
						</div>
					</div>
				)}

				{error && (
					<p className="text-red-400 text-sm text-center mt-2 shrink-0">{error}</p>
				)}

				<div className="flex flex-col gap-2 shrink-0 pt-4 pb-6 sm:pb-8">
					{phase === "avatars" && (
						<button
							type="button"
							onClick={goToNumbers}
							className="w-full py-3 rounded-xl bg-neon-gold/20 text-neon-gold font-medium border border-neon-gold/40 hover:bg-neon-gold/30 transition-colors"
						>
							Перевернуть карточки
						</button>
					)}
					{phase === "numbers" && (
						<button
							type="button"
							onClick={doShuffle}
							className="w-full py-3 rounded-xl bg-neon-gold/20 text-neon-gold font-medium border border-neon-gold/40 hover:bg-neon-gold/30 transition-colors"
						>
							Перемешать
						</button>
					)}
					{phase === "shuffled" && (
						<button
							type="button"
							onClick={generateNumber}
							className="w-full py-3 rounded-xl bg-neon-gold/20 text-neon-gold font-medium border border-neon-gold/40 hover:bg-neon-gold/30 transition-colors"
						>
							Сгенерировать номер
						</button>
					)}
					{phase === "winner" && (
						<>
							<button
								type="button"
								onClick={restart}
								disabled={confirming}
								className="w-full py-2.5 rounded-xl bg-white/10 text-white font-medium border border-white/20 hover:bg-white/15 transition-colors disabled:opacity-50"
							>
								Повторить
							</button>
							<button
								type="button"
								onClick={confirmWinner}
								disabled={confirming}
								className="w-full py-2.5 rounded-xl bg-neon-gold/20 text-neon-gold font-medium border border-neon-gold/40 hover:bg-neon-gold/30 transition-colors disabled:opacity-50"
							>
								{confirming ? "Сохранение…" : "Подтвердить победителя"}
							</button>
						</>
					)}
				</div>
			</div>
		</div>
	);
}
