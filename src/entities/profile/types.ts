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
  /** При наличии — блок ведёт на этот раздел */
  path?: string;
}
