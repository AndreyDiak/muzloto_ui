import type { SEvent } from "@/entities/event";
import { Calendar, Clock, MapPin } from "lucide-react";
import { memo } from "react";
import { formatEventDate, useEventColors } from "./_utils";

interface Props {
	event: SEvent;
	/** Мастер-аккаунт: при клике на блок показывать модалку с кодом мероприятия */
	isRoot?: boolean;
	onShowEventCode?: (event: SEvent) => void;
}

export const UpcomingEvent = memo(({ event, isRoot, onShowEventCode }: Props) => {
	const eventColors = useEventColors();
	const cyanColor = eventColors.cyan;
	const eventDate = formatEventDate(event.event_date);
	const isClickable = isRoot && !!onShowEventCode;

	const handleBlockClick = (e: React.MouseEvent) => {
		if (isClickable) {
			e.preventDefault();
			onShowEventCode?.(event);
		}
	};

	return (
		<div
			role={isClickable ? "button" : undefined}
			tabIndex={isClickable ? 0 : undefined}
			onClick={isClickable ? handleBlockClick : undefined}
			onKeyDown={
				isClickable
					? (e) => {
							if (e.key === "Enter" || e.key === " ") {
								e.preventDefault();
								onShowEventCode?.(event);
							}
						}
					: undefined
			}
			className={`bg-[#16161d] rounded-2xl overflow-hidden border border-[#00f0ff]/20 neon-glow ${
				isClickable ? "cursor-pointer" : ""
			}`}
		>
			<div
				className="h-48 bg-linear-to-br opacity-30"
				style={{
					background: `linear-gradient(135deg, ${cyanColor} 0%, #0a0a0f 100%)`,
				}}
			/>
			<div className="p-5">
				<div className="flex items-center gap-2 mb-2">
					<span className="px-2 py-1 bg-[#00f0ff]/20 text-[#00f0ff] text-xs rounded-full border border-[#00f0ff]/30">
						Скоро
					</span>
				</div>
				<h3 className="text-xl text-white mb-4">{event.title}</h3>

				<div className="space-y-2 mb-5">
					<div className="flex items-center gap-2 text-gray-300 text-sm">
						<Calendar className="w-4 h-4" style={{ color: cyanColor }} />
						<span>{eventDate.date}</span>
					</div>
					<div className="flex items-center gap-2 text-gray-300 text-sm">
						<Clock className="w-4 h-4" style={{ color: cyanColor }} />
						<span>{eventDate.time}</span>
					</div>
					{event.location && (
						<div className="flex items-center gap-2 text-gray-300 text-sm">
							<MapPin className="w-4 h-4" style={{ color: cyanColor }} />
							<span>{event.location}</span>
						</div>
					)}
				</div>

				<button
					className="w-full px-6 py-2.5 rounded-lg font-medium transition-all text-white"
					style={{
						background: `linear-gradient(135deg, ${cyanColor} 0%, ${cyanColor}99 100%)`,
						boxShadow: `0 0 15px ${cyanColor}40`,
					}}
					onClick={(e) => e.stopPropagation()}
				>
					Зарегистрироваться
				</button>
			</div>
		</div>
	);
});