import { useSession } from "@/app/context/session";
import { useAchievements } from "@/hooks/use-achievements";
import { useRegistrationsCount } from "@/hooks/use-registrations-count";
import { useTickets } from "@/hooks/use-tickets";
import type { IProfileStats } from "@/entities/profile";
import { Award, Target, TrendingUp, Trophy } from "lucide-react";

export function useProfileStats(): {
  stats: IProfileStats[];
  isLoading: boolean;
} {
  const { user, isSupabaseSessionReady } = useSession();
  const { count: registrationsCount, isLoading: registrationsLoading } =
    useRegistrationsCount(user?.id);
  const { tickets, isLoading: ticketsLoading } = useTickets(user?.id);
  const { achievements, isLoading: achievementsLoading } = useAchievements(isSupabaseSessionReady);

  const activeTicketsCount = tickets.filter((t) => !t.used_at).length;
  const achievementsUnlockedCount = achievements.filter((a) => a.unlocked).length;
  const level = 1;

  const isLoading = registrationsLoading || ticketsLoading || achievementsLoading;

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
      icon: Target,
      label: "Активных билетов",
      value: String(activeTicketsCount),
      textColor: "var(--accent-cyan)",
      bgColor: "var(--accent-cyan-darker)",
      description:
        activeTicketsCount === 0
          ? "У вас нет активных билетов"
          : `У вас ${activeTicketsCount} ${activeTicketsCount === 1 ? "активный билет" : activeTicketsCount < 5 ? "активных билета" : "активных билетов"}`,
      path: "/tickets",
    },
    {
      icon: TrendingUp,
      label: "Уровень",
      value: String(level),
      textColor: "var(--accent-purple)",
      bgColor: "var(--accent-purple-darker)",
      description: "Вы находитесь на 1 уровне",
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
