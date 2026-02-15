import type { TicketQRModalProps } from "@/components/ticket-qr-modal";
import { lazy, Suspense } from "react";

function loadWithRetry(retries = 2): Promise<{ default: typeof import("@/components/ticket-qr-modal").TicketQRModal }> {
	return import("@/components/ticket-qr-modal").then(
		(m) => ({ default: m.TicketQRModal }),
		(err) => {
			if (retries <= 0) throw err;
			return new Promise((r) => setTimeout(r, 400)).then(() => loadWithRetry(retries - 1));
		}
	);
}

const TicketQRModal = lazy(() => loadWithRetry());

/** Ленивая обёртка: qr-code-styling подгружается только при открытии модалки */
export function TicketQRModalLazy(props: TicketQRModalProps) {
	return (
		<Suspense fallback={null}>
			<TicketQRModal {...props} />
		</Suspense>
	);
}

export type { TicketQRModalProps } from "@/components/ticket-qr-modal";
