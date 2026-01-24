import { createBrowserRouter } from "react-router";
import { BasicLayout } from "./layouts";
import { Profile } from "./pages/profile";

export const router = createBrowserRouter([
	{
		path: "/",
		Component: BasicLayout,
		children: [
			{
				index: true,
				Component: Profile
			}
		]
	}
])