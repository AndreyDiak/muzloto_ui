import { useSession } from "@/app/context/session";
import type { IProfileStats } from "@/entities/profile";
import { useAchievements } from "@/hooks/use-achievements";
import { useRegistrationsCount } from "@/hooks/use-registrations-count";
import { Award, Trophy } from "lucide-react";

export function useProfileStats(): {
  stats: IProfileStats[];
  isLoading: boolean;
} {
  const { user, isSupabaseSessionReady } = useSession();
  const { count: registrationsCount, isLoading: registrationsLoading } =
    useRegistrationsCount(user?.id);
  const { achievements, isLoading: achievementsLoading } = useAchievements(isSupabaseSessionReady);

  const achievementsUnlockedCount = achievements.filter((a) => a.unlocked).length;

  const isLoading = registrationsLoading || achievementsLoading;

  const stats: IProfileStats[] = [
    {
      icon: Trophy,
      label: "Посещено событий",
      value: String(registrationsCount),
      textColor: "var(--accent-gold)",
      bgColor: "bg-surface-card",
      description:
        registrationsCount === 0
          ? "Вы ещё не посещали событий"
          : `Вы посетили ${registrationsCount} ${registrationsCount === 1 ? "событие" : registrationsCount < 5 ? "события" : "событий"}`,
      path: "/events",
    },
    {
      icon: Award,
      label: "Награды",
      value: String(achievementsUnlockedCount),
      textColor: "var(--accent-pink)",
      bgColor: "bg-surface-card",
      description:
        achievementsUnlockedCount === 0
          ? "Раздел наград и достижений"
          : `Получено наград: ${achievementsUnlockedCount}`,
      path: "/achievements",
    },
  ];

  return { stats, isLoading };
}
