import { authFetch } from "@/lib/auth-fetch";
import { type ApiMyRegistrationResponse, parseJson } from "@/types/api";
import { CalendarCheck, ChevronRight, Users } from "lucide-react";
import { memo, useEffect, useState } from "react";
import { Link } from "react-router";

const BACKEND_URL = (
  import.meta.env.VITE_BACKEND_URL || "http://localhost:3001"
).replace(/\/$/, "");

export const ProfileEventRegistration = memo(() => {
  const [data, setData] =
    useState<ApiMyRegistrationResponse["registration"]>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await authFetch(
          `${BACKEND_URL}/api/events/my-registration`,
        );
        if (!res.ok) return;
        const json = await parseJson<ApiMyRegistrationResponse>(res);
        if (!cancelled) setData(json.registration);
      } catch {
        // ignore
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  if (loading || !data || !data.event) return null;

  return (
    <Link
      to={`/events/${data.event.id}/overview`}
      className="-mx-4 flex items-center gap-3 bg-neon-cyan/10 border-y border-neon-cyan/20 py-3 px-4 transition-colors hover:bg-neon-cyan/15 active:opacity-90 cursor-pointer"
    >
      <div className="w-9 h-9 rounded-lg bg-neon-cyan/15 flex items-center justify-center shrink-0">
        <CalendarCheck className="w-4 h-4 text-neon-cyan" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm text-white font-medium truncate">
          {data.event.title}
        </p>
        {data.team && (
          <span className="inline-flex items-center gap-1 mt-1 px-2 py-0.5 bg-neon-purple/15 text-neon-purple-light text-xs font-medium rounded-full border border-neon-purple/30">
            <Users className="w-3 h-3 shrink-0" />
            {data.team.name}
          </span>
        )}
      </div>
      <div className="flex items-center gap-1 text-xs text-neon-cyan font-medium shrink-0">
        <span>
          Обзор
        </span>
        <ChevronRight className="w-4 h-4" />
      </div>
    </Link>
  );
});
