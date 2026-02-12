-- Награды за достижения по покупкам (1, 3, 5) — фиксируем момент выдачи
ALTER TABLE public.user_stats
  ADD COLUMN IF NOT EXISTS purchase_reward_1_claimed_at TIMESTAMPTZ DEFAULT NULL;
ALTER TABLE public.user_stats
  ADD COLUMN IF NOT EXISTS purchase_reward_3_claimed_at TIMESTAMPTZ DEFAULT NULL;
ALTER TABLE public.user_stats
  ADD COLUMN IF NOT EXISTS purchase_reward_5_claimed_at TIMESTAMPTZ DEFAULT NULL;
