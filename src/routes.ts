import { createBrowserRouter } from "react-router";
import { BasicLayout } from "./layouts";
import { Achievements } from "./pages/achievements";
import { Catalog } from "./pages/catalog";
import { Events } from "./pages/events";
import { Profile } from "./pages/profile";
import { Scanner } from "./pages/scanner";
import { Tickets } from "./pages/tickets";

export const router = createBrowserRouter([
	{
		path: "/",
		Component: BasicLayout,
		children: [
			{
				index: true,
				Component: Profile
			},
			{
				path: "/achievements",
				Component: Achievements
			},
			{
				path: "/tickets",
				Component: Tickets
			},
			{
				path: "/events",
				Component: Events
			},
			{
				path: "/catalog",
				Component: Catalog
			},
			{
				path: "/scanner",
				Component: Scanner
			}
		]
	}
]);