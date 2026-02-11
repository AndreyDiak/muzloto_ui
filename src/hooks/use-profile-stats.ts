import { useSession } from "@/app/context/session";
import type { IProfileStats } from "@/entities/profile";
import { useAchievements } from "@/hooks/use-achievements";
import { Award, Trophy } from "lucide-react";

export function useProfileStats(): {
  stats: IProfileStats[];
  isLoading: boolean;
} {
  const { isSupabaseSessionReady } = useSession();
  const { gamesVisited, isLoading: achievementsLoading } = useAchievements(isSupabaseSessionReady);

  const isLoading = achievementsLoading;

  const stats: IProfileStats[] = [
    {
      icon: Trophy,
      label: "Посещено событий",
      value: String(gamesVisited),
      textColor: "var(--accent-gold)",
      bgColor: "bg-surface-card",
      description:
        gamesVisited === 0
          ? "Вы ещё не посещали событий"
          : `Вы посетили ${gamesVisited} ${gamesVisited === 1 ? "событие" : gamesVisited < 5 ? "события" : "событий"}`,
      path: "/events",
    },
    {
      icon: Award,
      label: "Награды",
      value: "→",
      textColor: "var(--accent-pink)",
      bgColor: "bg-surface-card",
      description: "Приз за каждые 5 посещений",
      path: "/rewards",
    },
  ];

  return { stats, isLoading };
}
