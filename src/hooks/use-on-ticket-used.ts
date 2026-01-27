import { TICKET_USED_EVENT } from "@/lib/ticket-used-event";
import { useEffect, useRef } from "react";

/**
 * Подписка на событие «билет активирован» (ведущий отсканировал).
 * Вызывает callback с id билета. Колбэк хранится в ref, можно передавать замыкания с актуальным state.
 */
export function useOnTicketUsed(callback: (ticketId: string) => void): void {
	const callbackRef = useRef(callback);
	callbackRef.current = callback;

	useEffect(() => {
		const handler = (e: Event) => {
			const ticketId = (e as CustomEvent<string>).detail;
			callbackRef.current(ticketId);
		};
		window.addEventListener(TICKET_USED_EVENT, handler);
		return () => window.removeEventListener(TICKET_USED_EVENT, handler);
	}, []);
}
