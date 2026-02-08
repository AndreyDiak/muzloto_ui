import { TicketQRModalLazy } from "@/components/ticket-qr-modal-lazy";
import type { STicketWithItem } from "@/entities/ticket";
import { ClickableTooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { TicketIcon } from "lucide-react";
import { memo } from "react";

interface Props {
	ticket: STicketWithItem;
	isModalOpen: boolean;
	onOpenModal: () => void;
	onCloseModal: () => void;
}

/** Полоска «отрывная часть» — зебра как у кино-билетов, можно заменить на градиент или двойную полоску */
const ZEBRA_STRIP_STYLE: React.CSSProperties = {
	background: "repeating-linear-gradient(-45deg, #1e1e28 0px, #1e1e28 6px, #2a2a38 6px, #2a2a38 12px)",
};

/** Линия перфорации (пунктир отрыва) между основной частью и отрывным талоном */
const PERFORATION_CLASS =
	"absolute left-0 top-0 bottom-0 w-0 border-l-2 border-dashed border-neon-cyan/40 pointer-events-none";

const cardContent = (
	name: string,
	ticket: STicketWithItem,
	isUsed: boolean,
) => (
	<>
		{/* Основная часть: иконка + название (до 2 строк, полностью) */}
		<div
			className={`flex-1 flex items-center gap-2.5 py-2.5 pl-3 pr-3 min-w-0 relative`}
		>
			<div
				className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${
					isUsed ? "bg-gray-600/25" : "bg-neon-cyan/15 border border-neon-cyan/30"
				}`}
			>
				<TicketIcon className={`w-4 h-4 ${isUsed ? "text-gray-500" : "text-neon-cyan"}`} />
			</div>
			<p
				className={`font-semibold text-sm line-clamp-2 break-words min-w-0 flex-1 leading-snug ${isUsed ? "text-gray-400" : "text-white"}`}
			>
				{name}
			</p>
		</div>
		{/* Отрывная часть: перфорация + зебра + код вертикально */}
		<div
			className="w-12 shrink-0 relative flex items-center justify-center py-2"
			style={ZEBRA_STRIP_STYLE}
		>
			<span className={PERFORATION_CLASS} aria-hidden />
			<span
				className="text-[10px] font-mono font-medium text-gray-400 tracking-widest"
				style={{ writingMode: "vertical-rl", textOrientation: "mixed" }}
			>
				{ticket.code}
			</span>
		</div>
	</>
);

export const ProfileTicketCard = memo(({ ticket, isModalOpen, onOpenModal, onCloseModal }: Props) => {
	const name = ticket.catalog?.name ?? "Билет";
	const isUsed = !!ticket.used_at;

	const buttonClassName = `w-full flex rounded-xl text-left bg-surface-card border border-neon-cyan/20 overflow-hidden min-h-[64px] active:opacity-90 transition-opacity ${
		isUsed ? "opacity-75 border-gray-500/20" : "border-l-4 border-l-neon-cyan"
	}`;

	if (isUsed) {
		return (
			<ClickableTooltip>
				<TooltipTrigger asChild>
					<button type="button" className={buttonClassName}>
						{cardContent(name, ticket, true)}
					</button>
				</TooltipTrigger>
				<TooltipContent side="top">
					<p className="text-sm text-white">Билет уже активирован</p>
				</TooltipContent>
			</ClickableTooltip>
		);
	}

	return (
		<>
			<button
				type="button"
				onClick={onOpenModal}
				className={buttonClassName}
			>
				{cardContent(name, ticket, false)}
			</button>
			<TicketQRModalLazy
				open={isModalOpen}
				onOpenChange={(open) => {
					if (!open) onCloseModal();
				}}
				code={ticket.code}
				itemName={name}
				showProfileHint={false}
			/>
		</>
	);
});
