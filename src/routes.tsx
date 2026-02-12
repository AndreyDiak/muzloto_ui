import type { ComponentType, LazyExoticComponent } from "react";
import { lazy, Suspense } from "react";
import { createBrowserRouter } from "react-router";
import { LazyLoadingFallback } from "./layouts/fallback";

/** Lazy-загрузка с повтором при ошибке (failed to fetch dynamically в WebView/сети). */
function lazyWithRetry<T extends ComponentType<unknown>>(
	importFn: () => Promise<{ default: T }>,
	retries = 2
): LazyExoticComponent<T> {
	return lazy(async () => {
		let last: unknown;
		for (let i = 0; i <= retries; i++) {
			try {
				return await importFn();
			} catch (e) {
				last = e;
			}
		}
		throw last;
	});
}

const BasicLayout = lazyWithRetry(() =>
	import("./layouts").then((m) => ({ default: m.BasicLayout }))
);

const Profile = lazyWithRetry(() => import("./pages/profile"));
const Events = lazyWithRetry(() => import("./pages/events"));
const EventManage = lazyWithRetry(() => import("./pages/events/manage"));
const RafflePage = lazyWithRetry(() => import("./pages/events/raffle"));
function RaffleRoute() {
	return (
		<Suspense fallback={<LayoutFallback />}>
			<RafflePage />
		</Suspense>
	);
}
const Catalog = lazyWithRetry(() => import("./pages/catalog"));
const Achievements = lazyWithRetry(() => import("./pages/achievements"));
const Scanner = lazyWithRetry(() => import("./pages/scanner"));
const Admin = lazyWithRetry(() => import("./pages/admin"));

function LayoutFallback() {
	return (
		<div className="flex min-h-screen flex-col bg-surface-dark">
			<LazyLoadingFallback />
		</div>
	);
}

function LayoutWithSuspense() {
	return (
		<Suspense fallback={<LayoutFallback />}>
			<BasicLayout />
		</Suspense>
	);
}

export const router = createBrowserRouter([
	{
		path: "/",
		Component: LayoutWithSuspense,
		children: [
			{ index: true, Component: Profile },
			{ path: "/achievements", Component: Achievements },
			{ path: "/events", Component: Events },
			{ path: "/events/:eventId/manage", Component: EventManage },
			{ path: "/catalog", Component: Catalog },
			{ path: "/scanner", Component: Scanner },
			{ path: "/admin", Component: Admin }
		]
	},
	{ path: "/events/:eventId/raffle", Component: RaffleRoute }
]);
