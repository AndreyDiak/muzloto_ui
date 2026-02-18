/** Предзагрузка TicketQRModal по hover/focus — снижает задержку при клике (bundle-preload) */
export function preloadTicketQRModal(): void {
	if (typeof window !== "undefined") {
		void import("@/components/ticket-qr-modal").then((m) => m.TicketQRModal);
	}
}
