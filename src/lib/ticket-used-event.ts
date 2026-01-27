/** Событие при активации билета ведущим. detail — id билета (string). */
export const TICKET_USED_EVENT = "muzloto:ticket-used";

export function dispatchTicketUsed(ticketId: string): void {
	window.dispatchEvent(new CustomEvent(TICKET_USED_EVENT, { detail: ticketId }));
}
