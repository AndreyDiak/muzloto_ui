import { useSession } from "@/app/context/session";
import { useToast } from "@/app/context/toast";
import { useTickets } from "@/hooks/use-tickets";
import { http } from "@/http";
import { TicketIcon } from "lucide-react";
import { memo, useEffect, useState } from "react";
import { ProfileTicketCard } from "./_ticket-card";

export const ProfileTickets = memo(() => {
	const { user } = useSession();
	const { showToast } = useToast();
	const { tickets, isLoading, error, refetch } = useTickets(user?.id);
	const [openedTicketId, setOpenedTicketId] = useState<string | null>(null);

	useEffect(() => {
		if (user?.id == null) {
			return;
		}

		const channel = http
			.channel("tickets-for-user")
			.on(
				"postgres_changes",
				{
					event: "UPDATE",
					schema: "public",
					table: "tickets",
					filter: `telegram_id=eq.${user.id}`,
				},
				(payload: { new: { id?: string; used_at?: string | null; }; }) => {
					if (payload.new?.used_at) {
						showToast("Билет активирован", "success");
						setOpenedTicketId(null);
						void refetch();
					}
				}
			)
			.subscribe();

		return () => {
			channel.unsubscribe();
		};
	}, [user?.id, refetch, showToast]);

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

	return (
		<section className="space-y-2">
			<h3 className="text-lg font-semibold text-white flex items-center gap-2">
				<TicketIcon className="w-5 h-5 text-[#00f0ff]" />
				Мои билеты
			</h3>
			{/* Карточки на всю ширину: выходим из padding родителя */}
			<div className="-mx-4 rounded-none overflow-hidden">
				{tickets.map((t) => (
					<ProfileTicketCard
						key={t.id}
						ticket={t}
						isModalOpen={openedTicketId === t.id}
						onOpenModal={() => setOpenedTicketId(t.id)}
						onCloseModal={() => setOpenedTicketId(null)}
					/>
				))}
			</div>
		</section>
	);
});
