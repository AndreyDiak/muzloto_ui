import { useSession } from "@/app/context/session";
import { useAchievements } from "@/hooks/use-achievements";
import { useRegistrationsCount } from "@/hooks/use-registrations-count";
import type { IProfileStats } from "@/entities/profile";
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
      bgColor: "var(--accent-gold-darker)",
      description:
        registrationsCount === 0
          ? "Вы ещё не посещали событий"
          : `Вы посетили ${registrationsCount} ${registrationsCount === 1 ? "событие" : registrationsCount < 5 ? "события" : "событий"}`,
      path: "/events",
    },
    {
      icon: Award,
      label: "Достижения",
      value: String(achievementsUnlockedCount),
      textColor: "var(--accent-pink)",
      bgColor: "var(--accent-pink-darker)",
      description:
        achievementsUnlockedCount === 0
          ? "У вас пока нет достижений"
          : `У вас ${achievementsUnlockedCount} ${achievementsUnlockedCount === 1 ? "достижение" : achievementsUnlockedCount < 5 ? "достижения" : "достижений"}`,
      path: "/achievements",
    },
  ];

  return { stats, isLoading };
}
