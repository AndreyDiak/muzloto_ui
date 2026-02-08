import type { SEvent } from "@/entities/event";
import { memo } from "react";
import { EventCard } from "./_event-card";

interface Props {
	events: SEvent[];
	isRoot?: boolean;
}

export const EventsList = memo(({ events, isRoot }: Props) => {
	if (events.length === 0) {
		return null;
	}

	return (
		<div className="space-y-2">
				{events.map((event, index) => (
					<EventCard
						key={event.id}
						event={event}
						isRoot={isRoot}
						isUpcoming={false}
						colorIndex={index + 1}
					/>
				))}
		</div>
	);
});