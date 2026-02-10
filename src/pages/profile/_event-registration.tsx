import { useMyRegistration } from "@/hooks/use-my-registration";
import { CalendarCheck, Users } from "lucide-react";
import { memo } from "react";

export const ProfileEventRegistration = memo(() => {
  const { registration: data, isLoading } = useMyRegistration();

  if (isLoading || !data || !data.event) return null;

  return (
    <div className="-mx-4 flex items-center gap-3 bg-neon-cyan/15 py-3 px-4 border-y border-white/[0.06]">
      <div className="w-9 h-9 rounded-lg bg-neon-cyan/15 flex items-center justify-center shrink-0">
        <CalendarCheck className="w-4 h-4 text-neon-cyan" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm text-white font-medium truncate">
          {data.event.title}
        </p>
        {data.team && (
          <span className="inline-flex items-center gap-1 mt-1 px-2 py-0.5 bg-neon-purple/20 text-neon-purple-light text-xs font-medium rounded-full">
            <Users className="w-3 h-3 shrink-0" />
            {data.team.name}
          </span>
        )}
      </div>
    </div>
  );
});
