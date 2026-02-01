import type { TicketQRModalProps } from "@/components/ticket-qr-modal";
import { lazy, Suspense } from "react";

const TicketQRModal = lazy(() =>
	import("@/components/ticket-qr-modal").then((m) => ({ default: m.TicketQRModal }))
);

/** Ленивая обёртка: qr-code-styling подгружается только при открытии модалки */
export function TicketQRModalLazy(props: TicketQRModalProps) {
	return (
		<Suspense fallback={null}>
			<TicketQRModal {...props} />
		</Suspense>
	);
}

export type { TicketQRModalProps } from "@/components/ticket-qr-modal";
