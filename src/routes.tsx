import { lazy, Suspense } from "react";
import { createBrowserRouter } from "react-router";
import { LazyLoadingFallback } from "./layouts/fallback";

const BasicLayout = lazy(() =>
	import("./layouts").then((m) => ({ default: m.BasicLayout }))
);

const Profile = lazy(() => import("./pages/profile"));
const Achievements = lazy(() => import("./pages/achievements"));
const Tickets = lazy(() => import("./pages/tickets"));
const Events = lazy(() => import("./pages/events"));
const EventManage = lazy(() => import("./pages/events/manage"));
const Catalog = lazy(() => import("./pages/catalog"));
const Scanner = lazy(() => import("./pages/scanner"));

function LayoutFallback() {
	return (
		<div className="flex min-h-screen flex-col bg-[#0a0a0f]">
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
			{ path: "/tickets", Component: Tickets },
			{ path: "/events", Component: Events },
			{ path: "/events/:eventId/manage", Component: EventManage },
			{ path: "/catalog", Component: Catalog },
			{ path: "/scanner", Component: Scanner }
		]
	}
]);
