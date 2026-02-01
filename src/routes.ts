import { lazy } from "react";
import { createBrowserRouter } from "react-router";
import { BasicLayout } from "./layouts";

const Profile = lazy(() => import("./pages/profile"));
const Achievements = lazy(() => import("./pages/achievements"));
const Tickets = lazy(() => import("./pages/tickets"));
const Events = lazy(() => import("./pages/events"));
const Catalog = lazy(() => import("./pages/catalog"));
const Scanner = lazy(() => import("./pages/scanner"));

export const router = createBrowserRouter([
	{
		path: "/",
		Component: BasicLayout,
		children: [
			{ index: true, Component: Profile },
			{ path: "/achievements", Component: Achievements },
			{ path: "/tickets", Component: Tickets },
			{ path: "/events", Component: Events },
			{ path: "/catalog", Component: Catalog },
			{ path: "/scanner", Component: Scanner }
		]
	}
]);