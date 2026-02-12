import type { LucideIcon } from "lucide-react";

export interface SProfile {
  telegram_id: number;
  username: string | null;
  first_name: string | null;
  avatar_url: string | null;
  balance: number;
  created_at: string;
  updated_at: string;
}

/** Элемент блока «Моя статистика» на странице профиля */
export interface IProfileStats {
  icon: LucideIcon;
  label: string;
  value: string;
  textColor: string;
  bgColor: string;
  description: string;
  /** Класс для подписи (label), напр. text-neon-gold */
  labelClassName?: string;
  /** При наличии — блок ведёт на этот раздел */
  path?: string;
  /** Прогресс до награды за посещения: текущее значение (0 … every-1) */
  visitRewardProgress?: number;
  /** Шаг награды за посещения (напр. каждые 5 игр) */
  visitRewardEvery?: number;
  /** Награда готова к получению */
  visitRewardPending?: boolean;
}
