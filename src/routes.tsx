import { lazy, Suspense } from "react";
import { createBrowserRouter } from "react-router";
import { LazyLoadingFallback } from "./layouts/fallback";

const BasicLayout = lazy(() =>
	import("./layouts").then((m) => ({ default: m.BasicLayout }))
);

const Profile = lazy(() => import("./pages/profile"));
const Events = lazy(() => import("./pages/events"));
const EventManage = lazy(() => import("./pages/events/manage"));
const RafflePage = lazy(() => import("./pages/events/raffle"));
function RaffleRoute() {
	return (
		<Suspense fallback={<LayoutFallback />}>
			<RafflePage />
		</Suspense>
	);
}
const Catalog = lazy(() => import("./pages/catalog"));
const Scanner = lazy(() => import("./pages/scanner"));
const Admin = lazy(() => import("./pages/admin"));

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
			{ path: "/events", Component: Events },
			{ path: "/events/:eventId/manage", Component: EventManage },
			{ path: "/catalog", Component: Catalog },
			{ path: "/scanner", Component: Scanner },
			{ path: "/admin", Component: Admin }
		]
	},
	{ path: "/events/:eventId/raffle", Component: RaffleRoute }
]);
