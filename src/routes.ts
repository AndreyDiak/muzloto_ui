import { createBrowserRouter } from "react-router";
import { BasicLayout } from "./layouts";
import { Events } from "./pages/events";
import { Profile } from "./pages/profile";
import { Shop } from "./pages/shop";

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
				path: "/shop",
				Component: Shop
			}
		]
	}
])