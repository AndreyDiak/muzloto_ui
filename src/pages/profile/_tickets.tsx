import { useSession } from "@/app/context/session";
import { useToast } from "@/app/context/toast";
import { useTickets } from "@/hooks/use-tickets";
import { TICKET_USED_EVENT } from "@/lib/ticket-used-event";
import { ChevronDown, ChevronUp, TicketIcon } from "lucide-react";
import { memo, useEffect, useState } from "react";
import { ProfileTicketCard } from "./_ticket-card";

const VISIBLE_COUNT = 3;

export const ProfileTickets = memo(() => {
	const { user } = useSession();
	const { showToast } = useToast();
	const { tickets, isLoading, error, refetch } = useTickets(user?.id);
	const [openedTicketId, setOpenedTicketId] = useState<string | null>(null);
	const [showAll, setShowAll] = useState(false);

	const visibleTickets = tickets.slice(0, VISIBLE_COUNT);
	const restTickets = tickets.slice(VISIBLE_COUNT);
	const hasMore = restTickets.length > 0;

	useEffect(() => {
		const handler = () => {
			showToast("Билет активирован", "success");
			setOpenedTicketId(null);
			void refetch();
		};
		window.addEventListener(TICKET_USED_EVENT, handler);
		return () => window.removeEventListener(TICKET_USED_EVENT, handler);
	}, [refetch, showToast]);

	if (isLoading) {
		return (
			<section className="space-y-2">
				<h3 className="text-lg font-semibold text-white flex items-center gap-2">
					<TicketIcon className="w-5 h-5 text-[#00f0ff]" />
					Мои билеты
				</h3>
				<div className="text-sm text-gray-400 py-6 text-center">Загрузка…</div>
			</section>
		);
	}

	if (error) {
		return (
			<section className="space-y-2">
				<h3 className="text-lg font-semibold text-white flex items-center gap-2">
					<TicketIcon className="w-5 h-5 text-[#00f0ff]" />
					Мои билеты
				</h3>
				<div className="text-sm text-red-400/90 py-4 text-center">{error.message}</div>
			</section>
		);
	}

	if (tickets.length === 0) {
		return (
			<section className="space-y-2">
				<h3 className="text-lg font-semibold text-white flex items-center gap-2">
					<TicketIcon className="w-5 h-5 text-[#00f0ff]" />
					Мои билеты
				</h3>
				<div className="text-sm text-gray-500 py-6 text-center">
					Пока нет билетов. Оформите покупку в разделе «Каталог».
				</div>
			</section>
		);
	}

	const renderCard = (t: (typeof tickets)[0]) => (
		<ProfileTicketCard
			key={t.id}
			ticket={t}
			isModalOpen={openedTicketId === t.id}
			onOpenModal={() => setOpenedTicketId(t.id)}
			onCloseModal={() => setOpenedTicketId(null)}
		/>
	);

	return (
		<section className="space-y-2">
			<h3 className="text-lg font-semibold text-white flex items-center gap-2">
				<TicketIcon className="w-5 h-5 text-[#00f0ff]" />
				Мои билеты
			</h3>
			<div className="-mx-4 rounded-none overflow-hidden">
				{visibleTickets.map(renderCard)}
				{hasMore && (
					<>
						<div
							className="overflow-hidden transition-[grid-template-rows] duration-200 ease-out"
							style={{
								display: "grid",
								gridTemplateRows: showAll ? "1fr" : "0fr",
							}}
						>
							<div className="min-h-0">
								{restTickets.map(renderCard)}
							</div>
						</div>
						<button
							type="button"
							onClick={() => setShowAll((v) => !v)}
							className="w-full py-3 text-center text-sm text-[#00f0ff] hover:text-[#00f0ff]/80 hover:underline focus:outline-none flex items-center justify-center gap-1.5"
						>
							{showAll ? (
								<>
									Свернуть
									<ChevronUp className="w-4 h-4" />
								</>
							) : (
								<>
									Показать все ({tickets.length})
									<ChevronDown className="w-4 h-4" />
								</>
							)}
						</button>
					</>
				)}
			</div>
		</section>
	);
});
