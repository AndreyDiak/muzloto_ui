import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import { authFetch } from "@/lib/auth-fetch";
import type { ApiRaffleResponse, ApiRegistrationsResponse } from "@/types/api";
import { parseJson } from "@/types/api";
import { User } from "lucide-react";
import { useCallback, useState } from "react";

const BACKEND_URL = (import.meta.env.VITE_BACKEND_URL || "http://localhost:3001").replace(
	/\/$/,
	"",
);

const SLOT_HEIGHT = 56;
const SLOT_GAP = 2;
const ITEM_HEIGHT = SLOT_HEIGHT + SLOT_GAP;
const VISIBLE_HEIGHT = 400;
const ROULETTE_DURATION_MS = 6000;
const COPIES = 7;

type ApiRegistrationRow = ApiRegistrationsResponse["registrations"][number];
type ApiRaffleWinner = NonNullable<ApiRaffleResponse["winner"]>;

interface RaffleModalProps {
	eventId: string;
	registrations: ApiRegistrationsResponse["registrations"];
	open: boolean;
	onOpenChange: (open: boolean) => void;
	existingWinner: ApiRaffleWinner | null;
	onRaffleDone?: () => void;
}

function ParticipantCard({
	r,
	highlight,
}: {
	r: ApiRegistrationRow;
	highlight?: boolean;
}) {
	return (
		<div
			className={`flex items-center gap-2 px-2 py-1.5 rounded-lg border shrink-0 ${
				highlight
					? "bg-neon-gold/20 border-neon-gold/50"
					: "bg-surface-card border-white/[0.08]"
			}`}
			style={{ height: SLOT_HEIGHT }}
		>
			<div className="w-8 h-8 rounded-full bg-neon-cyan/10 flex items-center justify-center shrink-0 overflow-hidden">
				{r.avatar_url ? (
					<img src={r.avatar_url} alt="" className="w-full h-full object-cover" />
				) : (
					<User className="w-4 h-4 text-neon-cyan" />
				)}
			</div>
			<div className="min-w-0 flex-1">
				<p className="text-white font-medium truncate">{r.first_name || "—"}</p>
				{r.username && (
					<p className="text-xs text-gray-400 truncate">@{r.username}</p>
				)}
			</div>
		</div>
	);
}

export function RaffleModal({
	eventId,
	registrations,
	open,
	onOpenChange,
	existingWinner,
	onRaffleDone,
}: RaffleModalProps) {
	const [phase, setPhase] = useState<"idle" | "spinning" | "stopped">("idle");
	const [winner, setWinner] = useState<ApiRaffleWinner | null>(existingWinner ?? null);
	const [translateY, setTranslateY] = useState(0);
	const [error, setError] = useState<string | null>(null);
	const [confirming, setConfirming] = useState(false);

	const hasWinner = existingWinner ?? winner;
	const winnerRegistration = winner
		? registrations.find((r) => r.telegram_id === winner.telegram_id)
		: null;

	const runRaffle = useCallback(async () => {
		if (!eventId || registrations.length === 0) return;
		setError(null);
		setPhase("spinning");

		try {
			const res = await authFetch(`${BACKEND_URL}/api/events/${eventId}/raffle/roll`, {
				method: "POST",
			});
			const data = await parseJson<{ winner?: ApiRaffleWinner; error?: string }>(res);

			if (!res.ok) {
				setError(data.error ?? "Ошибка розыгрыша");
				setPhase("idle");
				return;
			}

			if (!data.winner) {
				setError("Нет победителя");
				setPhase("idle");
				return;
			}

			setWinner(data.winner);

			if (registrations.length === 1) {
				setPhase("stopped");
				return;
			}

			const winnerIndex = registrations.findIndex(
				(r) => r.telegram_id === data.winner!.telegram_id,
			);
			const n = registrations.length;
			const targetIndex = 2 * n + (winnerIndex >= 0 ? winnerIndex : 0);
			const finalY = VISIBLE_HEIGHT / 2 - SLOT_HEIGHT / 2 - targetIndex * ITEM_HEIGHT;

			setTranslateY(0);
			requestAnimationFrame(() => {
				requestAnimationFrame(() => {
					setTranslateY(finalY);
				});
			});

			const t = setTimeout(() => setPhase("stopped"), ROULETTE_DURATION_MS);
			return () => clearTimeout(t);
		} catch (e) {
			setError(e instanceof Error ? e.message : "Ошибка сети");
			setPhase("idle");
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
			onOpenChange(false);
		} catch (e) {
			setError(e instanceof Error ? e.message : "Ошибка сети");
		} finally {
			setConfirming(false);
		}
	}, [eventId, winner, onRaffleDone, onOpenChange]);

	const handleOpenChange = useCallback(
		(o: boolean) => {
			if (!o) {
				setPhase("idle");
				setError(null);
				if (!hasWinner) setWinner(null);
			}
			onOpenChange(o);
		},
		[onOpenChange, hasWinner],
	);

	const repeatedList = registrations.length > 0 ? Array(COPIES).fill(registrations).flat() : [];

	return (
		<Dialog open={open} onOpenChange={handleOpenChange}>
			<DialogContent className="bg-surface-card border border-white/[0.08] text-white max-w-sm h-[90vh] max-h-[90vh] flex flex-col overflow-y-auto">
				<DialogHeader>
					<DialogTitle className="text-white text-lg">Розыгрыш</DialogTitle>
				</DialogHeader>

				{registrations.length === 0 ? (
					<p className="text-gray-400 text-sm py-4">Нет участников для розыгрыша.</p>
				) : existingWinner ? (
					<div className="space-y-4 py-2">
						<p className="text-gray-400 text-sm">
							Розыгрыш уже проведён. Победитель:
						</p>
						<div className="flex items-center gap-3 p-4 rounded-xl bg-neon-gold/20 border border-neon-gold/50">
							<div className="w-12 h-12 rounded-full bg-neon-cyan/10 flex items-center justify-center shrink-0 overflow-hidden">
								{existingWinner.avatar_url ? (
									<img
										src={existingWinner.avatar_url}
										alt=""
										className="w-full h-full object-cover"
									/>
								) : (
									<User className="w-6 h-6 text-neon-cyan" />
								)}
							</div>
							<div className="min-w-0">
								<p className="text-white font-medium">
									{existingWinner.first_name || "—"}
								</p>
								{existingWinner.username && (
									<p className="text-xs text-gray-400">@{existingWinner.username}</p>
								)}
							</div>
						</div>
					</div>
				) : phase === "idle" ? (
					<div className="space-y-4 py-2">
						<p className="text-gray-400 text-sm">
							Один победитель среди зарегистрированных. Розыгрыш проводится один раз.
						</p>
						{error && (
							<p className="text-red-400 text-sm">{error}</p>
						)}
						<button
							type="button"
							onClick={runRaffle}
							className="w-full py-3 rounded-xl bg-neon-gold/20 text-neon-gold font-medium border border-neon-gold/40 hover:bg-neon-gold/30 transition-colors"
						>
							Провести розыгрыш
						</button>
					</div>
				) : (
					<div className="flex flex-col items-center py-2">
						{/* Горизонтальные риски, указывающие на центральную карточку */}
						<div
							className="relative w-full flex justify-center"
							style={{ height: VISIBLE_HEIGHT }}
						>
							{/* Левый риск */}
							<div
								className="absolute left-0 top-1/2 z-10 h-1 w-14 -translate-y-1/2 rounded-full bg-neon-gold/80"
								aria-hidden
							/>
							{/* Правый риск */}
							<div
								className="absolute right-0 top-1/2 z-10 h-1 w-14 -translate-y-1/2 rounded-full bg-neon-gold/80"
								aria-hidden
							/>
							<div className="overflow-hidden w-full flex justify-center">
								<div
									className="w-full max-w-[280px] flex flex-col transition-transform ease-out"
									style={{
										transform: `translateY(${translateY}px)`,
										transitionDuration: `${ROULETTE_DURATION_MS}ms`,
										gap: SLOT_GAP,
									}}
								>
									{repeatedList.map((r, i) => (
										<ParticipantCard
											key={`${r.telegram_id}-${i}`}
											r={r}
											highlight={
												phase === "stopped" &&
												winner !== null &&
												r.telegram_id === winner.telegram_id
											}
										/>
									))}
								</div>
							</div>
						</div>
						{phase === "stopped" && winnerRegistration && (
							<>
								<div className="mt-4 w-full max-w-[280px]">
									<p className="text-center text-neon-gold font-medium text-sm mb-2">
										Победитель
									</p>
									<ParticipantCard r={winnerRegistration} highlight />
								</div>
								{error && (
									<p className="mt-2 text-red-400 text-sm text-center w-full max-w-[280px]">
										{error}
									</p>
								)}
								<div className="mt-4 flex w-full max-w-[280px] flex-col gap-2">
									<button
										type="button"
										onClick={runRaffle}
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
								</div>
							</>
						)}
					</div>
				)}
			</DialogContent>
		</Dialog>
	);
}
