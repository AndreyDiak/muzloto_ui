import { useMyRegistration } from "@/hooks/use-my-registration";
import { getStartOfTodayMoscow } from "@/lib/moscow-date";
import { CalendarCheck } from "lucide-react";
import { memo } from "react";

export const ProfileEventRegistration = memo(() => {
  const { registration: data, isLoading } = useMyRegistration();

  if (isLoading || !data || !data.event) return null;

  const startOfToday = getStartOfTodayMoscow();
  if (new Date(data.event.event_date) < startOfToday) return null;

  return (
    <div className="-mx-3 flex items-center gap-3 bg-surface-card py-2.5 px-3 border-y border-white/10">
      <div className="w-9 h-9 rounded-lg bg-neon-cyan/20 flex items-center justify-center shrink-0 border border-neon-cyan/30">
        <CalendarCheck className="w-4 h-4 text-neon-cyan" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-xs text-gray-400 mb-0.5">Вы успешно зарегистрированы</p>
        <p className="text-sm text-white font-medium truncate">
          {data.event.title}
        </p>
      </div>
    </div>
  );
});
