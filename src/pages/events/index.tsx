import { useSession } from "@/app/context/session";
import { TicketQRModal } from "@/components/ticket-qr-modal";
import type { SEvent } from "@/entities/event";
import { useEvents } from "@/hooks/use-events";
import { getEventCodeBotStartLink, getEventCodeDeepLink } from "@/lib/event-deep-link";
import { useState } from "react";
import { EventsList } from "./_list";
import { UpcomingEvent } from "./_upcoming";

export function Events() {
	const { isRoot } = useSession();
	const { events, isLoading, error } = useEvents();
	const [eventForCode, setEventForCode] = useState<SEvent | null>(null);

	if (isLoading) {
		return (
			<div className="p-4">
				<div className="text-gray-400">Загрузка событий...</div>
			</div>
		);
	}

	if (error) {
		return (
			<div className="p-4">
				<div className="text-red-400">Ошибка загрузки: {error.message}</div>
			</div>
		);
	}

	if (events.length === 0) {
		return (
			<div className="p-4">
				<div className="text-gray-400">Нет предстоящих событий</div>
			</div>
		);
	}

	const [firstEvent, ...restEvents] = events;
	const displayedEvents = restEvents.slice(0, 2);
	const remainingCount = restEvents.length - displayedEvents.length;

	return (
		<div className="p-4 space-y-6">
			<h2 className="layout-heaader">
				Ближайшие события
			</h2>

			{/* Featured Event - Ближайшее */}
			<UpcomingEvent
				event={firstEvent}
				isRoot={isRoot}
				onShowEventCode={isRoot ? setEventForCode : undefined}
			/>

			{/* Other Events - Compact List */}
			<EventsList
				events={displayedEvents}
				isRoot={isRoot}
				onShowEventCode={isRoot ? setEventForCode : undefined}
			/>

			{/* Модалка с QR и кодом мероприятия (только для мастер-аккаунта) */}
			{eventForCode && (
				<TicketQRModal
					open={!!eventForCode}
					onOpenChange={(open) => !open && setEventForCode(null)}
					code={eventForCode.code}
					itemName={eventForCode.title}
					showProfileHint={false}
					dialogTitle="Код мероприятия"
					qrData={getEventCodeDeepLink(eventForCode.code) || getEventCodeBotStartLink(eventForCode.code) || undefined}
				/>
			)}

			{/* Remaining events count */}
			{remainingCount > 0 && (
				<div className="text-center text-gray-400 text-sm py-2">
					И еще {remainingCount} {remainingCount === 1 ? 'мероприятие' : remainingCount < 5 ? 'мероприятия' : 'мероприятий'}
				</div>
			)}
		</div>
	);
}