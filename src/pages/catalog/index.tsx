import { useSession } from "@/app/context/session";
import { useCatalog } from "@/hooks/use-catalog";
import { useCssColor } from "@/hooks/use-css-color";
import { http } from "@/http";
import { useEffect } from "react";
import { CatalogItem, TICKET_USED_EVENT } from "./_item";

const colorVars = [
	"--accent-gold",
	"--accent-pink",
	"--accent-cyan",
	"--accent-purple",
	"--accent-blue",
];

export function Catalog() {
	const { user } = useSession();
	const colors = useCssColor(colorVars);
	const { error, isLoading, items } = useCatalog();

	// Realtime: при активации билета диспатчим событие — модалка «только что купленного» закроется в CatalogItem
	useEffect(() => {
		if (user?.id == null) return;

		const channel = http
			.channel("catalog-tickets-used")
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

	if (isLoading) {
		return (
			<div className="p-4">
				<span className="text-gray-400">Загрузка каталога...</span>
			</div>
		);
	}

	if (error) {
		return (
			<div className="p-4">
				<div className="text-red-400">Ошибка загрузки: {error.message}</div>
			</div>
		);
	}

	if (items.length === 0) {
		return (
			<div className="p-4">
				<div className="text-gray-400">Каталог пуст :(</div>
			</div>
		);
	}

	return (
		<div className="p-4 space-y-6">
			<h2 className="layout-header">
				Каталог
			</h2>

			{items.map((item, index) => (
				<CatalogItem key={item.id} item={item} color={colors[index % colors.length]} />
			))}
		</div>
	);
}