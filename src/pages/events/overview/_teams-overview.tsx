import type { ApiEventTeam } from "@/types/api";
import { Skeleton } from "@/components/ui/skeleton";
import { Users } from "lucide-react";

interface TeamsOverviewProps {
  teams: ApiEventTeam[];
  loading?: boolean;
}

export function TeamsOverview({ teams, loading }: TeamsOverviewProps) {
  if (loading) {
    return (
      <div className="bg-surface-card rounded-2xl p-5 border border-neon-purple/20">
        <Skeleton className="h-5 w-32 rounded-lg mb-3" />
        <div className="space-y-2">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-[52px] rounded-xl" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-surface-card rounded-2xl p-5 border border-neon-purple/20">
      <h2 className="text-lg text-white mb-3 flex items-center gap-2">
        <Users className="w-5 h-5 text-neon-purple" />
        Команды
        {teams.length > 0 && (
          <span className="text-sm font-normal text-gray-400">({teams.length})</span>
        )}
      </h2>
      {teams.length === 0 ? (
        <p className="text-gray-400 text-sm">Команды не добавлены</p>
      ) : (
        <ul className="space-y-2">
          {teams.map((team) => (
            <li
              key={team.id}
              className="flex items-center gap-3 p-3 rounded-xl bg-surface-dark border border-neon-purple/10"
            >
              <div className="w-9 h-9 rounded-lg bg-neon-purple/10 flex items-center justify-center shrink-0">
                <Users className="w-4 h-4 text-neon-purple" />
              </div>
              <p className="text-white font-medium truncate text-sm">{team.name}</p>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
