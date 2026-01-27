import { createBrowserRouter } from "react-router";
import { BasicLayout } from "./layouts";
import { Catalog } from "./pages/catalog";
import { Events } from "./pages/events";
import { Profile } from "./pages/profile";
import { Scanner } from "./pages/scanner";

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