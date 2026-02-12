import { useSession } from "@/app/context/session";
import { authFetch } from "@/lib/auth-fetch";
import type { ApiRaffleResponse, ApiRegistrationsResponse } from "@/types/api";
import { parseJson } from "@/types/api";
import { ChevronLeft } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { Link, Navigate, useNavigate, useParams } from "react-router";
import { RaffleContent } from "../manage/_raffle-content";

const BACKEND_URL = (import.meta.env.VITE_BACKEND_URL || "http://localhost:3001").replace(
	/\/$/,
	"",
);

export default function RafflePage() {
	const { eventId } = useParams<{ eventId: string }>();
	const navigate = useNavigate();
	const { isRoot } = useSession();
	const [registrations, setRegistrations] = useState<
		ApiRegistrationsResponse["registrations"]
	>([]);
	const [loading, setLoading] = useState(true);
	const [raffleWinner, setRaffleWinner] = useState<ApiRaffleResponse["winner"]>(null);

	const fetchData = useCallback(async () => {
		if (!eventId) return;
		setLoading(true);
		try {
			const [regRes, raffleRes] = await Promise.all([
				authFetch(`${BACKEND_URL}/api/events/${eventId}/registrations`),
				authFetch(`${BACKEND_URL}/api/events/${eventId}/raffle`),
			]);
			if (regRes.ok) {
				const regJson = await parseJson<ApiRegistrationsResponse>(regRes);
				setRegistrations(regJson.registrations ?? []);
			} else {
				setRegistrations([]);
			}
			if (raffleRes.ok) {
				const raffleJson = await parseJson<ApiRaffleResponse>(raffleRes);
				setRaffleWinner(raffleJson.winner ?? null);
			} else {
				setRaffleWinner(null);
			}
		} catch {
			setRegistrations([]);
			setRaffleWinner(null);
		} finally {
			setLoading(false);
		}
	}, [eventId]);

	useEffect(() => {
		if (eventId) fetchData();
	}, [eventId, fetchData]);

	const onRaffleDone = useCallback(() => {
		navigate(`/events/${eventId}/manage`, { replace: true, state: { raffleConfirmed: true } });
	}, [eventId, navigate]);

	if (!isRoot) {
		return <Navigate to="/events" replace />;
	}

	if (!eventId) {
		return <Navigate to="/events" replace />;
	}

	const backLink = (
		<Link
			to={`/events/${eventId}/manage`}
			className="flex items-center justify-center w-10 h-10 rounded-lg bg-white/10 text-white hover:bg-white/15 transition-colors border border-white/10 shrink-0"
		>
			<ChevronLeft className="w-5 h-5" />
		</Link>
	);

	if (loading) {
		return (
			<div className="min-h-dvh bg-surface-dark flex flex-col items-center justify-center gap-4 px-4">
				<div className="w-full max-w-xl mx-auto flex flex-col items-center gap-4">
					<div className="relative flex items-center gap-3 min-h-10 w-full">
						{backLink}
						<div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 flex justify-center w-full pointer-events-none">
							<span className="text-lg font-bold tracking-tight text-transparent bg-clip-text bg-linear-to-r from-neon-purple via-neon-cyan to-neon-pink">
								Караоке Лото
							</span>
						</div>
					</div>
					<p className="text-gray-400 text-sm">Загрузка…</p>
				</div>
			</div>
		);
	}

	return (
		<div className="min-h-dvh h-dvh max-h-dvh flex flex-col bg-surface-dark text-white overflow-hidden">
			<div className="w-full max-w-xl mx-auto flex flex-col flex-1 min-h-0 bg-surface-card">
				<RaffleContent
					eventId={eventId}
					registrations={registrations}
					existingWinner={raffleWinner}
					onRaffleDone={onRaffleDone}
					headerLeft={backLink}
				/>
			</div>
		</div>
	);
}
