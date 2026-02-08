import type { ApiEventTeam, ApiRegistrationsResponse } from "@/types/api";
import { Skeleton } from "@/components/ui/skeleton";
import { Users } from "lucide-react";
import { useMemo } from "react";

interface TeamsSectionProps {
  teams: ApiEventTeam[];
  registrations: ApiRegistrationsResponse["registrations"];
  loading: boolean;
}

export function TeamsSection({ teams, registrations, loading }: TeamsSectionProps) {
  const teamCounts = useMemo(() => {
    const counts = new Map<string, number>();
    for (const r of registrations) {
      if (r.team?.id) {
        counts.set(r.team.id, (counts.get(r.team.id) ?? 0) + 1);
      }
    }
    return counts;
  }, [registrations]);

  if (loading) {
    return (
      <div className="space-y-2">
        {Array.from({ length: 3 }).map((_, i) => (
          <Skeleton key={i} className="h-[52px] rounded-xl" />
        ))}
      </div>
    );
  }

  if (teams.length === 0) {
    return <p className="text-gray-400 text-sm">Команды не добавлены</p>;
  }

  return (
    <ul className="space-y-2">
      {teams.map((team) => {
        const count = teamCounts.get(team.id) ?? 0;
        return (
          <li
            key={team.id}
            className="flex items-center gap-3 p-3 rounded-xl bg-[#0a0a0f] border border-[#b829ff]/10"
          >
            <div className="w-9 h-9 rounded-lg bg-[#b829ff]/10 flex items-center justify-center shrink-0">
              <Users className="w-4 h-4 text-[#b829ff]" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-white font-medium truncate text-sm">{team.name}</p>
            </div>
            <span className="text-xs text-gray-400 shrink-0 tabular-nums">
              {count} {pluralize(count)}
            </span>
          </li>
        );
      })}
    </ul>
  );
}

function pluralize(n: number): string {
  if (n % 10 === 1 && n % 100 !== 11) return "участник";
  if (n % 10 >= 2 && n % 10 <= 4 && (n % 100 < 10 || n % 100 >= 20)) return "участника";
  return "участников";
}
