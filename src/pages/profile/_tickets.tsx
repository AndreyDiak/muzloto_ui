import { useSession } from "@/app/context/session";
import { useToast } from "@/app/context/toast";
import { Skeleton } from "@/components/ui/skeleton";
import { useOnTicketUsed } from "@/hooks/use-on-ticket-used";
import { useTickets } from "@/hooks/use-tickets";
import { useQueryClient } from "@tanstack/react-query";
import { ChevronDown, ChevronLeft, ChevronRight, ChevronUp, TicketIcon } from "lucide-react";
import { memo, useState } from "react";
import { ProfileTicketCard } from "./_ticket-card";

/** На профиле: сколько билетов показывать до «Показать все». На странице билетов: размер страницы пагинации. */
const TICKETS_CHUNK_SIZE = 7;

interface ProfileTicketsProps {
	/** На странице «Мои билеты» показывать все билеты сразу */
	defaultExpanded?: boolean;
	/** Разбить список на «Активные» и «Использованные» (для страницы билетов) */
	groupByUsed?: boolean;
}

export const ProfileTickets = memo(({ defaultExpanded = false, groupByUsed = false }: ProfileTicketsProps) => {
	const { user, isLoading: isSessionLoading, isProfileLoading } = useSession();
	const { showToast } = useToast();
	const queryClient = useQueryClient();
	const { tickets, isLoading, error } = useTickets(user?.id);
	const [openedTicketId, setOpenedTicketId] = useState<string | null>(null);
	const [showAll, setShowAll] = useState(defaultExpanded);
	const [activePage, setActivePage] = useState(0);

	const activeTickets = tickets.filter((t) => !t.used_at);
	const activeTotalPages = Math.max(1, Math.ceil(activeTickets.length / TICKETS_CHUNK_SIZE));
	const activeTicketsPage = activeTickets.slice(
		activePage * TICKETS_CHUNK_SIZE,
		(activePage + 1) * TICKETS_CHUNK_SIZE,
	);

	const visibleTickets = tickets.slice(0, TICKETS_CHUNK_SIZE);
	const restTickets = tickets.slice(TICKETS_CHUNK_SIZE);
	const hasMore = restTickets.length > 0;
	const showLoader = isSessionLoading || isProfileLoading || isLoading;

	useOnTicketUsed(() => {
		showToast("Билет активирован", "success");
		setOpenedTicketId(null);
		void queryClient.invalidateQueries({ queryKey: ["tickets"] });
	});

	if (showLoader) {
		return (
			<section className="space-y-2">
				<h3 className="text-lg font-semibold text-white flex items-center gap-2">
					<TicketIcon className="w-5 h-5 text-neon-cyan" />
					Мои билеты
				</h3>
				<div className="space-y-3">
					{Array.from({ length: 5 }).map((_, i) => (
						<Skeleton key={i} className="h-[64px] w-full rounded-xl" />
					))}
				</div>
			</section>
		);
	}

	if (error) {
		return (
			<section className="space-y-2">
				<h3 className="text-lg font-semibold text-white flex items-center gap-2">
					<TicketIcon className="w-5 h-5 text-neon-cyan" />
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
					<TicketIcon className="w-5 h-5 text-neon-cyan" />
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

	if (groupByUsed) {
		const paginationControls = (
			currentPage: number,
			totalPages: number,
			onPrev: () => void,
			onNext: () => void,
		) =>
			totalPages > 1 ? (
				<div className="flex items-center justify-center gap-3 py-3">
					<button
						type="button"
						onClick={onPrev}
						disabled={currentPage === 0}
						className="p-2 rounded-lg text-neon-cyan hover:bg-neon-cyan/10 disabled:opacity-40 disabled:pointer-events-none transition-colors"
						aria-label="Предыдущая страница"
					>
						<ChevronLeft className="w-5 h-5" />
					</button>
					<span className="text-sm text-gray-400 tabular-nums">
						{currentPage + 1} / {totalPages}
					</span>
					<button
						type="button"
						onClick={onNext}
						disabled={currentPage >= totalPages - 1}
						className="p-2 rounded-lg text-neon-cyan hover:bg-neon-cyan/10 disabled:opacity-40 disabled:pointer-events-none transition-colors"
						aria-label="Следующая страница"
					>
						<ChevronRight className="w-5 h-5" />
					</button>
				</div>
			) : null;

		return (
			<section className="space-y-2">
				<h3 className="text-lg font-semibold text-white flex items-center gap-2">
					<TicketIcon className="w-5 h-5 text-neon-cyan" />
					Мои билеты
				</h3>
				<div className="space-y-3">
					{activeTickets.length === 0 ? (
						<p className="text-sm text-gray-500 py-4 px-4 text-center">
							Нет активных билетов
						</p>
					) : (
						<>
							{activeTicketsPage.map(renderCard)}
							{paginationControls(
								activePage,
								activeTotalPages,
								() => setActivePage((p) => Math.max(0, p - 1)),
								() => setActivePage((p) => Math.min(activeTotalPages - 1, p + 1)),
							)}
						</>
					)}
				</div>
			</section>
		);
	}

	return (
		<section className="space-y-2">
			<h3 className="text-lg font-semibold text-white flex items-center gap-2">
				<TicketIcon className="w-5 h-5 text-neon-cyan" />
				Мои билеты
			</h3>
			<div className="space-y-3">
				{visibleTickets.map(renderCard)}
				{hasMore && (
					<>
						<div
							className="overflow-hidden transition-[grid-template-rows] duration-200 ease-out space-y-3"
							style={{
								display: "grid",
								gridTemplateRows: showAll ? "1fr" : "0fr",
							}}
						>
							<div className="min-h-0 space-y-3">
								{restTickets.map(renderCard)}
							</div>
						</div>
						<button
							type="button"
							onClick={() => setShowAll((v) => !v)}
							className="w-full py-3 text-center text-sm text-neon-cyan hover:text-neon-cyan/80 hover:underline focus:outline-none flex items-center justify-center gap-1.5"
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
