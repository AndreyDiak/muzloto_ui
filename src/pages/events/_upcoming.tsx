import type { SEvent } from "@/entities/event";
import { Calendar, Clock, MapPin } from "lucide-react";
import { memo } from "react";
import { formatEventDate, useEventColors } from "./_utils";

interface Props {
	event: SEvent;
}

export const UpcomingEvent = memo(({ event }: Props) => {

	const eventColors = useEventColors();
	const cyanColor = eventColors.cyan;

	const eventDate = formatEventDate(event.event_date);

	return (
		<div className="bg-[#16161d] rounded-2xl overflow-hidden border border-[#00f0ff]/20 neon-glow">
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
				>
					Зарегистрироваться
				</button>
			</div>
		</div>
	);
});