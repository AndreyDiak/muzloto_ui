/** Ключ счётчика в user_stats (бэкенд) */
export type AchievementStatKey =
  | "games_visited"
  | "tickets_purchased"
  | "bingo_collected";

/** Элемент из GET /api/achievements */
export interface AchievementItem {
  slug: string;
  badge: string;
  name: string;
  description: string;
  label: string;
  stat_key: AchievementStatKey;
  threshold: number;
  current_value: number;
  coin_reward: number | null;
  reward_claimed_at: string | null;
  unlocked: boolean;
  unlocked_at: string | null;
}

/** Модель для отображения в списке достижений (карточка + тултип) */
export interface Achievement {
  slug?: string;
  name: string;
  unlocked: boolean;
  description: string;
  badge?: string;
  label?: string;
  threshold: number;
  current_value: number;
  coin_reward: number | null;
  reward_claimed_at?: string;
}

/** Элемент из ответа при регистрации/покупке/бинго (ново разблокированная ачивка) */
export interface NewlyUnlockedAchievement {
  slug: string;
  badge: string;
  name: string;
  description: string;
  label: string;
  coinReward?: number;
}
