import { createBrowserRouter } from "react-router";
import { RouteChunkErrorFallback } from "./layouts/fallback";
import { BasicLayout } from "./layouts";

// Все роуты грузятся в основном бандле — при смене вкладки нет запроса чанка, нет "failed to fetch dynamically"
import Profile from "./pages/profile";
import Events from "./pages/events";
import EventManage from "./pages/events/manage";
import RafflePage from "./pages/events/raffle";
import Catalog from "./pages/catalog";
import Achievements from "./pages/achievements";
import Scanner from "./pages/scanner";
import Admin from "./pages/admin";

export const router = createBrowserRouter([
	{
		path: "/",
		Component: BasicLayout,
		errorElement: <RouteChunkErrorFallback />,
		children: [
			{ index: true, Component: Profile },
			{ path: "/achievements", Component: Achievements },
			{ path: "/events", Component: Events },
			{ path: "/events/:eventId/manage", Component: EventManage },
			{ path: "/catalog", Component: Catalog },
			{ path: "/scanner", Component: Scanner },
			{ path: "/admin", Component: Admin },
		],
	},
	{ path: "/events/:eventId/raffle", Component: RafflePage },
]);
