import { useSession } from "@/app/context/session";
import { useEvents } from "@/hooks/use-events";
import { EventCard } from "./_event-card";
import { EventsList } from "./_list";

export default function Events() {
	const { isRoot } = useSession();
	const { events, isLoading, error } = useEvents();

	if (isLoading) {
		return (
			<div className="p-3">
				<div className="text-gray-400">Загрузка событий...</div>
			</div>
		);
	}

	if (error) {
		return (
			<div className="p-3">
				<div className="text-red-400">Ошибка загрузки: {error.message}</div>
			</div>
		);
	}

	if (events.length === 0) {
		return (
			<div className="p-3">
				<div className="text-gray-400">Нет предстоящих событий</div>
			</div>
		);
	}

	const [firstEvent, ...restEvents] = events;
	const displayedEvents = restEvents.slice(0, 2);
	const remainingCount = restEvents.length - displayedEvents.length;

	return (
		<div className="p-3 space-y-4">

			{/* Featured Event - Ближайшее */}
			<EventCard event={firstEvent} isRoot={isRoot} isUpcoming />

			{/* Other Events - Compact List */}
			<EventsList events={displayedEvents} isRoot={isRoot} />

			{/* Remaining events count */}
			{remainingCount > 0 && (
				<div className="text-center text-gray-400 text-sm py-2">
					И еще {remainingCount} {remainingCount === 1 ? 'мероприятие' : remainingCount < 5 ? 'мероприятия' : 'мероприятий'}
				</div>
			)}
		</div>
	);
}