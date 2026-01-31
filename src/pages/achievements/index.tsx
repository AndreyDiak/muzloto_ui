import { useSession } from "@/app/context/session";
import type { Achievement, AchievementItem, AchievementStatKey } from "@/entities/achievement";
import { useAchievements } from "@/hooks/use-achievements";
import { ProfileAchievements } from "@/pages/profile/_achievements";

function mapToAchievement(a: AchievementItem): Achievement {
  return {
    slug: a.slug,
    name: a.name,
    unlocked: a.unlocked,
    description: a.description,
    badge: a.badge,
    label: a.label,
    threshold: a.threshold,
    current_value: a.current_value,
    coin_reward: a.coin_reward,
  };
}

const VISIT_GROUP: AchievementStatKey = "games_visited";
const TICKETS_GROUP: AchievementStatKey = "tickets_purchased";
const BINGO_GROUP: AchievementStatKey = "bingo_collected";

export function Achievements() {
  const { isSupabaseSessionReady } = useSession();
  const { achievements: list, isLoading, error } = useAchievements(isSupabaseSessionReady);

  const visitAchievements = list
    .filter((a) => a.stat_key === VISIT_GROUP)
    .map(mapToAchievement);
  const ticketAchievements = list
    .filter((a) => a.stat_key === TICKETS_GROUP)
    .map(mapToAchievement);
  const bingoAchievements = list
    .filter((a) => a.stat_key === BINGO_GROUP)
    .map(mapToAchievement);

  return (
    <div className="p-4 space-y-6">
      {error && (
        <p className="text-sm text-red-400/90">{error.message}</p>
      )}
      <ProfileAchievements
        sectionTitle="Посещения"
        achievements={visitAchievements}
        isLoading={isLoading}
      />
      <ProfileAchievements
        sectionTitle="Билеты"
        achievements={ticketAchievements}
        isLoading={isLoading}
      />
      <ProfileAchievements
        sectionTitle="Бинго"
        achievements={bingoAchievements}
        isLoading={isLoading}
      />
    </div>
  );
}
