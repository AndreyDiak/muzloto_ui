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

/** Полоска «отрывная часть» в стиле зебры как у кино-билетов */
const ZEBRA_STRIP_STYLE: React.CSSProperties = {
	background: "repeating-linear-gradient(-45deg, #1e1e28 0px, #1e1e28 5px, #2a2a38 5px, #2a2a38 10px)",
};

const cardContent = (
	name: string,
	ticket: STicketWithItem,
	isUsed: boolean,
) => (
	<>
		<div className="flex-1 flex items-center gap-3 py-3 pl-4 pr-3 border-r border-dashed border-[#00f0ff]/20">
			<div className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${isUsed ? "bg-gray-600/20" : "bg-[#00f0ff]/10"}`}>
				<TicketIcon className={`w-5 h-5 ${isUsed ? "text-gray-500" : "text-[#00f0ff]"}`} />
			</div>
			<div className="min-w-0 flex-1">
				<p className={`font-medium truncate ${isUsed ? "text-gray-400" : "text-white"}`}>{name}</p>
				<p className="text-xs font-mono mt-0.5 text-gray-500">
					{ticket.code}
					{isUsed && <span className="ml-1.5 text-gray-500">· Использован</span>}
				</p>
			</div>
		</div>
		<div className="w-9 shrink-0" style={ZEBRA_STRIP_STYLE} aria-hidden />
	</>
);

export const ProfileTicketCard = memo(({ ticket, isModalOpen, onOpenModal, onCloseModal }: Props) => {
	const name = ticket.catalog?.name ?? "Билет";
	const isUsed = !!ticket.used_at;

	const buttonClassName = `w-full flex rounded-none text-left bg-[#16161d] border-y border-[#00f0ff]/15 overflow-hidden min-h-[72px] active:opacity-90 transition-opacity ${isUsed ? "opacity-70" : ""}`;

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
