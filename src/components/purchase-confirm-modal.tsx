import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import { prettifyCoins } from "@/lib/utils";
import { Coins, Loader2 } from "lucide-react";

export interface PurchaseConfirmModalProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	itemName: string;
	itemPrice: number;
	balance: number;
	isConfirming: boolean;
	onConfirm: () => void;
}

export function PurchaseConfirmModal({
	open,
	onOpenChange,
	itemName,
	itemPrice,
	balance,
	isConfirming,
	onConfirm,
}: PurchaseConfirmModalProps) {
	const canAfford = balance >= itemPrice;

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent className="bg-surface-card border border-white/[0.08] max-w-sm">
				<DialogHeader>
					<DialogTitle className="text-white text-center">
						Подтвердите покупку
					</DialogTitle>
				</DialogHeader>

				<div className="space-y-4">
					<p className="text-center text-sm text-transparent bg-clip-text bg-linear-to-r from-neon-cyan to-neon-purple font-semibold">
						{itemName}
					</p>

					<div className="w-full space-y-2">
						<div className="flex items-center justify-between p-3 rounded-lg bg-white/5">
							<span className="text-gray-400 text-sm">Цена:</span>
							<div className="flex items-center gap-1.5">
								<Coins className="w-4 h-4 text-neon-gold shrink-0" />
								<span className="text-neon-gold font-semibold">{prettifyCoins(itemPrice)}</span>
							</div>
						</div>
						<div className="flex items-center justify-between p-3 rounded-lg bg-white/5">
							<span className="text-gray-400 text-sm">Ваш баланс:</span>
							<div className="flex items-center gap-1.5">
								<Coins className="w-4 h-4 text-neon-gold shrink-0" />
								<span className="text-neon-gold font-semibold">{prettifyCoins(balance)}</span>
							</div>
						</div>
					</div>

					{!canAfford && (
						<p className="text-red-400 text-sm text-center">
							Недостаточно монет для покупки
						</p>
					)}

					<button
						type="button"
						disabled={isConfirming || !canAfford}
						onClick={onConfirm}
						className="w-full py-3 rounded-xl bg-linear-to-r from-neon-cyan to-neon-purple text-white font-semibold hover:opacity-95 transition-opacity active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
					>
						{isConfirming ? (
							<Loader2 className="w-5 h-5 animate-spin mx-auto" />
						) : (
							"Подтвердить оплату"
						)}
					</button>
				</div>
			</DialogContent>
		</Dialog>
	);
}
