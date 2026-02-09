import { purchaseCatalogItem } from "@/actions/purchase-catalog-item";
import { useSession } from "@/app/context/session";
import { useToast } from "@/app/context/toast";
import { TicketQRModalLazy } from "@/components/ticket-qr-modal-lazy";
import type { SCatalogItem } from "@/entities/catalog";
import type { PurchaseSuccessPayload } from "@/entities/ticket";
import { useOnTicketUsed } from "@/hooks/use-on-ticket-used";
import { queryKeys } from "@/lib/query-client";
import { useQueryClient } from "@tanstack/react-query";
import { Coins } from "lucide-react";
import { useState } from "react";

interface Props {
	item: SCatalogItem;
	color: string;
}

export const CatalogItem = ({ item, color: _color }: Props) => {
	const { refetchProfile } = useSession();
	const { showToast } = useToast();
	const queryClient = useQueryClient();
	const [_isPurchasing, setIsPurchasing] = useState(false);
	const [ticketResult, setTicketResult] = useState<PurchaseSuccessPayload | null>(null);

	useOnTicketUsed((ticketId) => {
		if (ticketResult?.ticket?.id === ticketId) {
			showToast("Билет активирован", "success");
			setTicketResult(null);
		}
	});

	const handlePurchase = () => {
		setIsPurchasing(true);
		purchaseCatalogItem({
			catalogItemId: item.id,
			onSuccess: async (data) => {
				setTicketResult(data);
				queryClient.invalidateQueries({ queryKey: ["tickets"] });
				void queryClient.invalidateQueries({ queryKey: queryKeys.achievements });
				await refetchProfile().catch(() => {});
				setIsPurchasing(false);
				showToast("Покупка оформлена. Сохраните код билета.", "success");
				(data.newlyUnlockedAchievements ?? []).forEach((a, i) => {
					setTimeout(() => {
						const hint = a.coinReward ? " Заберите награду в разделе «Достижения»." : "";
						showToast(`${a.badge} Достижение: ${a.name}. ${a.label}.${hint}`, "success");
					}, 600 + i * 400);
				});
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
				className="bg-surface-card rounded-xl p-4 border border-neon-cyan/10 flex flex-col"
			>
				<h3 className="text-white text-lg font-bold mb-2 flex-1">{item.name}</h3>
				{/* TODO: return in future */}
				{/* {item.photo && (
					<div className="w-full h-full rounded-lg overflow-hidden">
						<img src={item.photo} alt={item.name} />
					</div>
				)} */}
				<p className="text-xs text-gray-400 mb-3">{item.description ?? ""}</p>

				<div className="flex items-center gap-1 mb-3">
					<Coins className="w-4 h-4 text-neon-gold" />
					<span className="text-neon-gold font-semibold text-sm">{item.price}</span>
				</div>

				<button
					onClick={handlePurchase}
					disabled={true}
					title="Покупка временно недоступна"
					className="w-full py-2 rounded-lg text-sm font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed"
					style={{
						background: "#333",
						boxShadow: "none",
					}}
				>
					Покупка временно недоступна
				</button>
			</div>

			<TicketQRModalLazy
				open={!!ticketResult}
				onOpenChange={(open) => !open && setTicketResult(null)}
				code={ticketResult?.ticket.code ?? ""}
				itemName={ticketResult?.item.name ?? ""}
			/>
		</>
	);
};
