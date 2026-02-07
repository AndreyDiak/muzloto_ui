import type { SEvent } from "@/entities/event";
import { Calendar, Clock, Settings } from "lucide-react";
import { memo } from "react";
import { Link } from "react-router";
import { formatEventDate, useEventColors } from "./_utils";

interface Props {
	events: SEvent[];
	isRoot?: boolean;
}

function getEventColor(index: number, colors: { cyan: string; colors: string[] }): string {
	if (index === 0) {
		return colors.cyan;
	}
	return colors.colors[(index - 1) % colors.colors.length];
}

export const EventsList = memo(({ events, isRoot }: Props) => {
	const eventColors = useEventColors();

	if (events.length === 0) {
		return null;
	}

	return (
		<div>
			<h3 className="text-lg text-gray-400 mb-3">Другие события</h3>
			<div className="space-y-2">
				{events.map((event, index) => {
					const eventDate = formatEventDate(event.event_date);
					const eventColor = getEventColor(index + 1, eventColors);

					return (
						<div
							key={event.id}
							className="bg-[#16161d] rounded-xl p-4 border border-[#00f0ff]/10 transition-all hover:border-[#00f0ff]/20"
						>
							<div className="flex items-center justify-between gap-3">
								<div className="flex-1 min-w-0">
									<h4 className="text-white mb-2">{event.title}</h4>
									<div className="flex items-center gap-3 text-xs text-gray-400">
										<span className="flex items-center gap-1">
											<Calendar className="w-3 h-3 shrink-0" style={{ color: eventColor }} />
											{eventDate.date}
										</span>
										<span className="flex items-center gap-1">
											<Clock className="w-3 h-3 shrink-0" style={{ color: eventColor }} />
											{eventDate.time}
										</span>
									</div>
								</div>
								{isRoot ? (
									<Link
										to={`/events/${event.id}/manage`}
										className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-medium whitespace-nowrap border border-[#00f0ff]/40 bg-[#00f0ff]/10 text-[#00f0ff] hover:bg-[#00f0ff]/20"
									>
										<Settings className="w-3.5 h-3.5" />
										Управление
									</Link>
								) : (
									<span
										className="px-4 py-2 rounded-lg text-xs font-medium whitespace-nowrap"
										style={{
											background: `${eventColor}30`,
											color: eventColor,
											border: `1px solid ${eventColor}50`,
										}}
									>
										Регистрация
									</span>
								)}
							</div>
						</div>
					);
				})}
			</div>
		</div>
	);
});