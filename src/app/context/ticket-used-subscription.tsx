import { useSession } from "@/app/context/session";
import { http } from "@/http";
import { TICKET_USED_EVENT } from "@/lib/ticket-used-event";
import { useEffect } from "react";

/**
 * Одна подписка на уровне приложения: при активации любого билета пользователя
 * диспатчит событие в window. Профиль и каталог подписаны на него и закрывают модалки.
 * Подписка создаётся только после готовности Supabase-сессии, иначе Realtime идёт без JWT и RLS блокирует доставку.
 */
export function TicketUsedSubscription() {
	const { user, isSupabaseSessionReady } = useSession();

	useEffect(() => {
		if (user?.id == null || !isSupabaseSessionReady) return;

		const channel = http
			.channel(`app-tickets-used-${user.id}`)
			.on(
				"postgres_changes",
				{
					event: "UPDATE",
					schema: "public",
					table: "codes",
					filter: `owner_telegram_id=eq.${user.id}`,
				},
				(payload: { new?: { id?: string; type?: string; used_at?: string | null } }) => {
					const rec = payload.new;
					if (rec?.type !== "purchase") return;
					const id = rec?.id;
					const usedAt = rec?.used_at;
					if (id != null && usedAt) {
						setTimeout(() => {
							window.dispatchEvent(new CustomEvent(TICKET_USED_EVENT, { detail: String(id) }));
						}, 0);
					}
				}
			)
			.subscribe();

		return () => {
			channel.unsubscribe();
		};
	}, [user?.id, isSupabaseSessionReady]);

	return null;
}
