export interface STicket {
  id: string;
  code: string;
  created_at: string;
}

/** Билет с данными позиции каталога (для списка в профиле) */
export interface STicketWithItem {
  id: string;
  code: string;
  created_at: string;
  used_at: string | null;
  catalog: {
    id: string;
    name: string;
    description: string | null;
    price: number;
    photo: string | null;
  } | null;
}

import type { NewlyUnlockedAchievement } from '@/entities/achievement';

export interface PurchaseSuccessPayload {
  ticket: STicket;
  item: {
    id: string;
    name: string;
    description: string | null;
    price: number;
    photo: string | null;
  };
  newBalance: number;
  newlyUnlockedAchievements?: NewlyUnlockedAchievement[];
}
