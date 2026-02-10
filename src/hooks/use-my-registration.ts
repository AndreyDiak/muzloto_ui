import { useQuery } from "@tanstack/react-query";
import { authFetch } from "@/lib/auth-fetch";
import { queryKeys, STALE_TIME_MS } from "@/lib/query-client";
import type { ApiMyRegistrationResponse } from "@/types/api";
import { parseJson } from "@/types/api";

const BACKEND_URL = (import.meta.env.VITE_BACKEND_URL || "http://localhost:3001").replace(
	/\/$/,
	"",
);

async function fetchMyRegistration(): Promise<ApiMyRegistrationResponse["registration"]> {
	const res = await authFetch(`${BACKEND_URL}/api/events/my-registration`);
	if (!res.ok) return null;
	const json = await parseJson<ApiMyRegistrationResponse>(res);
	return json.registration ?? null;
}

export function useMyRegistration() {
	const { data, isLoading } = useQuery({
		queryKey: queryKeys.myRegistration,
		queryFn: fetchMyRegistration,
		staleTime: STALE_TIME_MS,
	});

	return { registration: data ?? null, isLoading };
}
