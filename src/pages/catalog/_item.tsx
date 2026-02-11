import { purchaseCatalogItem } from "@/actions/purchase-catalog-item";
import { useSession } from "@/app/context/session";
import { useToast } from "@/app/context/toast";
import { PurchaseSuccessModal } from "@/components/purchase-success-modal";
import { TicketQRModalLazy } from "@/components/ticket-qr-modal-lazy";
import type { SCatalogItem } from "@/entities/catalog";
import type { PurchaseSuccessPayload } from "@/entities/ticket";
import { getShopDeepLink } from "@/lib/event-deep-link";
import { queryKeys } from "@/lib/query-client";
import { prettifyCoins } from "@/lib/utils";
import { useQueryClient } from "@tanstack/react-query";
import { Coins, QrCode } from "lucide-react";
import { useState } from "react";

const BACKEND_URL = (import.meta.env.VITE_BACKEND_URL || "http://localhost:3001").replace(/\/$/, "");

interface Props {
	item: SCatalogItem;
	color: string;
	isRoot?: boolean;
}

export const CatalogItem = ({ item, color: _color, isRoot }: Props) => {
	const { refetchProfile } = useSession();
	const { showToast } = useToast();
	const queryClient = useQueryClient();
	const [_isPurchasing, setIsPurchasing] = useState(false);
	const [purchaseResult, setPurchaseResult] = useState<PurchaseSuccessPayload | null>(null);
	const [generatedCode, setGeneratedCode] = useState<{ code: string; itemName: string } | null>(null);
	const [isGenerating, setIsGenerating] = useState(false);

	const handlePurchase = () => {
		setIsPurchasing(true);
		purchaseCatalogItem({
			catalogItemId: item.id,
			onSuccess: async (data) => {
				setPurchaseResult(data);
				void queryClient.invalidateQueries({ queryKey: queryKeys.achievements });
				await refetchProfile().catch(() => {});
				setIsPurchasing(false);
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

	const handleGeneratePurchaseCode = async () => {
		if (isGenerating) return;
		setIsGenerating(true);
		try {
			const { authFetch } = await import("@/lib/auth-fetch");
			const res = await authFetch(`${BACKEND_URL}/api/catalog/generate-purchase-code`, {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ catalog_item_id: item.id }),
			});
			const data = await res.json();
			if (!res.ok) {
				showToast(data?.error ?? "Ошибка генерации кода", "error");
				return;
			}
			if (data?.code && data?.item?.name) {
				setGeneratedCode({ code: data.code, itemName: data.item.name });
				showToast("Код создан. Покажите QR или код покупателю.", "success");
			} else {
				showToast("Неверный ответ сервера", "error");
			}
		} catch (e) {
			showToast(e instanceof Error ? e.message : "Ошибка", "error");
		} finally {
			setIsGenerating(false);
		}
	};

	return (
		<>
			<div
				key={item.id}
				className="bg-surface-card border border-white/6 rounded-xl p-4 flex flex-col"
			>
				<h3 className="text-white text-lg font-bold mb-2 flex-1">{item.name}</h3>
				<p className="text-xs text-gray-400 mb-3">{item.description ?? ""}</p>

				<div className="flex items-center gap-1 mb-3">
					<Coins className="w-4 h-4 text-neon-gold" />
					<span className="text-neon-gold font-semibold text-sm">{prettifyCoins(item.price)}</span>
				</div>

				{isRoot && (
					<button
						type="button"
						onClick={handleGeneratePurchaseCode}
						disabled={isGenerating}
						className="w-full py-2.5 rounded-lg text-sm font-medium flex items-center justify-center gap-2 mb-2 bg-neon-cyan/20 text-neon-cyan border border-neon-cyan/40 hover:bg-neon-cyan/30 transition-colors disabled:opacity-50"
					>
						<QrCode className="w-4 h-4" />
						{isGenerating ? "Генерация…" : "Сгенерировать код покупки"}
					</button>
				)}

				<button
					onClick={handlePurchase}
					disabled={_isPurchasing}
					className="w-full py-2 rounded-lg text-sm font-medium bg-neon-cyan text-black hover:opacity-95 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
				>
					{_isPurchasing ? "Оформление..." : "Купить"}
				</button>
			</div>

			{purchaseResult && (
				<PurchaseSuccessModal
					open={!!purchaseResult}
					onOpenChange={(open) => !open && setPurchaseResult(null)}
					itemName={purchaseResult.item.name}
					itemPrice={purchaseResult.item.price}
					newBalance={purchaseResult.newBalance}
				/>
			)}

			{generatedCode && (
				<TicketQRModalLazy
					open={!!generatedCode}
					onOpenChange={(open) => !open && setGeneratedCode(null)}
					code={generatedCode.code}
					itemName={generatedCode.itemName}
					dialogTitle="Код покупки"
					showProfileHint={false}
					qrData={getShopDeepLink(generatedCode.code) || generatedCode.code}
				/>
			)}
		</>
	);
};
