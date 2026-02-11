import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { prettifyCoins } from "@/lib/utils";
import { CheckCircle2, Coins } from "lucide-react";

export interface PurchaseSuccessModalProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	itemName: string;
	itemPrice: number;
	newBalance: number;
}

export function PurchaseSuccessModal({
	open,
	onOpenChange,
	itemName,
	itemPrice,
	newBalance,
}: PurchaseSuccessModalProps) {
	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent className="bg-surface-card border border-white/8 max-w-sm">
				<DialogHeader>
					<DialogTitle className="text-white text-center">Покупка оформлена</DialogTitle>
				</DialogHeader>
				<div className="flex flex-col items-center gap-4">
					<div className="flex items-center justify-center w-16 h-16 rounded-full bg-green-500/20">
						<CheckCircle2 className="w-8 h-8 text-green-500" />
					</div>
					<p className="text-sm text-center text-transparent bg-clip-text bg-linear-to-r from-neon-cyan to-neon-purple font-semibold">
						{itemName}
					</p>
					<div className="w-full space-y-2">
						<div className="flex items-center justify-between p-3 rounded-lg bg-white/5">
							<span className="text-gray-400 text-sm">Цена:</span>
							<div className="flex items-center gap-1">
								<Coins className="w-4 h-4 text-neon-gold" />
								<span className="text-neon-gold font-semibold">{prettifyCoins(itemPrice)}</span>
							</div>
						</div>
						<div className="flex items-center justify-between p-3 rounded-lg bg-white/5">
							<span className="text-gray-400 text-sm">Остаток монет:</span>
							<div className="flex items-center gap-1">
								<Coins className="w-4 h-4 text-neon-gold" />
								<span className="text-neon-gold font-semibold">{prettifyCoins(newBalance)}</span>
							</div>
						</div>
					</div>
					<p className="text-gray-500 text-xs text-center">
						Информация о покупке отправлена вам в личные сообщения
					</p>
					<button
						type="button"
						onClick={() => onOpenChange(false)}
						className="w-full py-2.5 rounded-xl bg-neon-cyan text-black font-medium hover:opacity-95 transition-opacity"
					>
						Закрыть
					</button>
				</div>
			</DialogContent>
		</Dialog>
	);
}
