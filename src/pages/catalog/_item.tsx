import { useSession } from "@/app/context/session";
import { useToast } from "@/app/context/toast";
import { ImageWithFallback } from "@/components/image-with-fallback";
import { preloadTicketQRModal } from "@/components/ticket-qr-modal-preload";
import { TicketQRModalLazy } from "@/components/ticket-qr-modal-lazy";
import type { SCatalogItem } from "@/entities/catalog";
import { http } from "@/http";
import { queryKeys } from "@/lib/query-client";
import { prettifyCoins } from "@/lib/utils";
import { useQueryClient } from "@tanstack/react-query";
import { Coins, QrCode } from "lucide-react";
import { useEffect, useState } from "react";

const BACKEND_URL = (import.meta.env.VITE_BACKEND_URL || "http://localhost:3001").replace(/\/$/, "");

interface Props {
	item: SCatalogItem;
	color: string;
	isRoot?: boolean;
	/** Активный (неиспользованный) код для этого товара, если есть */
	activeCode?: { code: string; item_name: string } | null;
}

export const CatalogItem = ({ item, color: _color, isRoot, activeCode = null }: Props) => {
	const { showToast } = useToast();
	const queryClient = useQueryClient();
	const { user, isSupabaseSessionReady } = useSession();
	const [shownCode, setShownCode] = useState<{ code: string; itemName: string } | null>(null);
	const [isGenerating, setIsGenerating] = useState(false);

	const handleShowCode = async () => {
		if (activeCode) {
			setShownCode({ code: activeCode.code, itemName: activeCode.item_name });
			return;
		}
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
				void queryClient.invalidateQueries({ queryKey: queryKeys.catalogActivePurchaseCodes });
				setShownCode({ code: data.code, itemName: data.item.name });
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

	// Realtime: как только у кода появляется владелец (погашение) — закрываем модалку
	useEffect(() => {
		if (!shownCode?.code || !isRoot || user?.id == null || !isSupabaseSessionReady) return;

		const channel = http
			.channel(`catalog-code-${shownCode.code}-${user.id}`)
			.on(
				"postgres_changes",
				{
					event: "UPDATE",
					schema: "public",
					table: "codes",
					filter: `code=eq.${shownCode.code}`,
				},
				(payload: { new?: { type?: string; used_at?: string | null; owner_telegram_id?: number | null } }) => {
					const rec = payload.new;
					if (rec?.type !== "purchase") return;
					if (rec.used_at ?? rec.owner_telegram_id) {
						setShownCode(null);
						showToast("Код использован. Нажмите «Показать код» для нового.", "success");
						void queryClient.invalidateQueries({ queryKey: queryKeys.catalogActivePurchaseCodes });
					}
				}
			)
			.subscribe();

		return () => {
			channel.unsubscribe();
		};
	}, [shownCode?.code, isRoot, user?.id, isSupabaseSessionReady, showToast, queryClient]);

	return (
		<>
			<div
				key={item.id}
				className="bg-surface-card border border-white/6 rounded-xl overflow-hidden flex flex-col"
			>
				{item.photo && (
					<div className="w-full h-48 bg-white/5 shrink-0 overflow-hidden">
						<ImageWithFallback src={item.photo} alt={item.name} />
					</div>
				)}
				<div className="p-3 flex flex-col flex-1">
					<h3 className="text-white text-lg font-bold mb-1.5 leading-tight">{item.name}</h3>
					{(item.description?.trim() ?? "") && (
						<p className="text-sm text-gray-300 leading-relaxed mb-3">{item.description}</p>
					)}
					<div className="flex items-center gap-1 mb-2">
						<Coins className="w-4 h-4 text-neon-gold" />
						<span className="text-neon-gold font-semibold text-sm">{prettifyCoins(item.price)}</span>
					</div>

				{isRoot ? (
					<button
						type="button"
						onMouseEnter={preloadTicketQRModal}
						onFocus={preloadTicketQRModal}
						onClick={handleShowCode}
						disabled={isGenerating}
						className="w-full py-2.5 rounded-lg text-sm font-medium flex items-center justify-center gap-2 bg-neon-cyan/20 text-neon-cyan border border-neon-cyan/40 hover:bg-neon-cyan/30 transition-colors disabled:opacity-50"
					>
						<QrCode className="w-4 h-4" />
						{isGenerating ? "Генерация…" : "Показать код"}
					</button>
				) : null}
				</div>
			</div>

			{shownCode && (
				<TicketQRModalLazy
					open={!!shownCode}
					onOpenChange={(open) => !open && setShownCode(null)}
					code={shownCode.code}
					itemName={shownCode.itemName}
					dialogTitle="Код покупки"
					showProfileHint={false}
					qrData={shownCode.code}
				/>
			)}
		</>
	);
};
