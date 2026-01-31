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
  unlocked: boolean;
  unlocked_at: string | null;
  threshold: number;
  current_value: number;
  coin_reward: number | null;
}

/** Модель для отображения в списке достижений (аккордеон) */
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
}

/** Элемент из ответа при регистрации/покупке/бинго (ново разблокированная ачивка) */
export interface NewlyUnlockedAchievement {
  slug: string;
  badge: string;
  name: string;
  description: string;
  label: string;
  /** Награда монетами за эту ачивку (если есть) */
  coinReward?: number;
}
