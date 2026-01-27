import { useSession } from "@/app/context/session";
import { http } from "@/http";
import { TICKET_USED_EVENT } from "@/lib/ticket-used-event";
import { useEffect } from "react";

/**
 * Одна подписка на уровне приложения: при активации любого билета пользователя
 * диспатчит событие в window. Профиль и каталог подписаны на него и закрывают модалки.
 */
export function TicketUsedSubscription() {
	const { user } = useSession();

	useEffect(() => {
		if (user?.id == null) return;

		const channel = http
			.channel("app-tickets-used")
			.on(
				"postgres_changes",
				{
					event: "UPDATE",
					schema: "public",
					table: "tickets",
					filter: `telegram_id=eq.${user.id}`,
				},
				(payload: { new: { id?: string; used_at?: string | null } }) => {
					if (payload.new?.used_at && payload.new?.id) {
						window.dispatchEvent(new CustomEvent(TICKET_USED_EVENT, { detail: payload.new.id }));
					}
				}
			)
			.subscribe();

		return () => {
			channel.unsubscribe();
		};
	}, [user?.id]);

	return null;
}
