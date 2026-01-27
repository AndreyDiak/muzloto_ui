import { useSession } from "@/app/context/session";
import { useTickets } from "@/hooks/use-tickets";
import { TicketIcon } from "lucide-react";
import { memo } from "react";
import { ProfileTicketCard } from "./_ticket-card";

export const ProfileTickets = memo(() => {
	const { user } = useSession();
	const { tickets, isLoading, error } = useTickets(user?.id);

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
					<ProfileTicketCard key={t.id} ticket={t} />
				))}
			</div>
		</section>
	);
});
