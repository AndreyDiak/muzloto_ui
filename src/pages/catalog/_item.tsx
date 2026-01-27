import { purchaseCatalogItem } from "@/actions/purchase-catalog-item";
import { useSession } from "@/app/context/session";
import { useToast } from "@/app/context/toast";
import { TicketQRModal } from "@/components/ticket-qr-modal";
import type { SCatalogItem } from "@/entities/catalog";
import type { PurchaseSuccessPayload } from "@/entities/ticket";
import { Coins } from "lucide-react";
import { useEffect, useState } from "react";

export const TICKET_USED_EVENT = "muzloto:ticket-used";

interface Props {
	item: SCatalogItem;
	color: string;
}

export const CatalogItem = ({ item, color }: Props) => {
	const { profile, refetchProfile } = useSession();
	const { showToast } = useToast();
	const coins = profile?.balance ?? 0;
	const [isPurchasing, setIsPurchasing] = useState(false);
	const [ticketResult, setTicketResult] = useState<PurchaseSuccessPayload | null>(null);

	// Слушаем событие «билет активирован» (подписка в Catalog) — закрываем модалку, если это наш билет
	useEffect(() => {
		const handler = (e: CustomEvent<string>) => {
			if (ticketResult?.ticket?.id === e.detail) {
				setTicketResult(null);
			}
		};
		window.addEventListener(TICKET_USED_EVENT, handler as EventListener);
		return () => window.removeEventListener(TICKET_USED_EVENT, handler as EventListener);
	}, [ticketResult?.ticket?.id]);

	const handlePurchase = () => {
		setIsPurchasing(true);
		purchaseCatalogItem({
			catalogItemId: item.id,
			onSuccess: (data) => {
				setTicketResult(data);
				refetchProfile().catch(() => { });
				setIsPurchasing(false);
				showToast("Покупка оформлена. Сохраните код билета.", "success");
			},
			onError: (msg) => {
				showToast(msg, "error");
				setIsPurchasing(false);
			},
		});
	};

	return (
		<>
			<div
				key={item.id}
				className="bg-[#16161d] rounded-xl p-4 border border-[#00f0ff]/10 flex flex-col"
			>
				<h3 className="text-white text-lg font-bold mb-2 flex-1">{item.name}</h3>
				{item.photo && (
					<div className="w-full h-full rounded-lg overflow-hidden">
						<img src={item.photo} alt={item.name} />
					</div>
				)}
				<p className="text-xs text-gray-400 mb-3">{item.description ?? ""}</p>

				<div className="flex items-center gap-1 mb-3">
					<Coins className="w-4 h-4 text-[#ffd700]" />
					<span className="text-[#ffd700] font-semibold text-sm">{item.price}</span>
				</div>

				<button
					onClick={handlePurchase}
					disabled={coins < item.price || isPurchasing}
					className="w-full py-2 rounded-lg text-sm font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed"
					style={{
						background:
							coins >= item.price && !isPurchasing
								? `linear-gradient(135deg, ${color} 0%, ${color}99 100%)`
								: "#333",
						boxShadow: coins >= item.price && !isPurchasing ? `0 0 15px ${color}40` : "none",
					}}
				>
					{isPurchasing ? "Оформление…" : `Получить за ${item.price} монет`}
				</button>
			</div>

			<TicketQRModal
				open={!!ticketResult}
				onOpenChange={(open) => !open && setTicketResult(null)}
				code={ticketResult?.ticket.code ?? ""}
				itemName={ticketResult?.item.name ?? ""}
			/>
		</>
	);
};
