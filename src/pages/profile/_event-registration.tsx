import { authFetch } from "@/lib/auth-fetch";
import { type ApiMyRegistrationResponse, parseJson } from "@/types/api";
import { CalendarCheck, Users } from "lucide-react";
import { memo, useEffect, useState } from "react";

const BACKEND_URL = (
  import.meta.env.VITE_BACKEND_URL || "http://localhost:3001"
).replace(/\/$/, "");

export const ProfileEventRegistration = memo(() => {
  const [data, setData] = useState<ApiMyRegistrationResponse["registration"]>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await authFetch(`${BACKEND_URL}/api/events/my-registration`);
        if (!res.ok) return;
        const json = await parseJson<ApiMyRegistrationResponse>(res);
        if (!cancelled) setData(json.registration);
      } catch {
        // ignore
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, []);

  if (loading || !data || !data.event) return null;

  return (
    <div className="relative rounded-2xl p-px bg-linear-to-r from-neon-cyan/60 via-neon-purple/50 to-neon-cyan/60">
      <div className="bg-surface-card-alt rounded-2xl p-4 flex items-center gap-3">
        <div className="w-11 h-11 rounded-xl bg-linear-to-br from-neon-cyan/20 to-neon-purple/20 flex items-center justify-center shrink-0">
          <CalendarCheck className="w-5 h-5 text-neon-cyan" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-xs text-neon-cyan/70 font-medium uppercase tracking-wider mb-0.5">
            Мероприятие
          </p>
          <div className="flex items-center justify-between">

          <p className="text-sm text-white font-medium truncate">{data.event.title}</p>
          {data.team && (
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 bg-neon-purple/15 text-neon-purple-light text-xs font-medium rounded-full border border-neon-purple/40">
              <Users className="w-3 h-3" />
              {data.team.name}
            </span>
          )}
          </div>
        </div>
      </div>
    </div>
  );
});
