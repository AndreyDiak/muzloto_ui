-- Упрощение логики наград за посещения:
-- Убираем visit_reward_progress и visit_reward_pending
-- Добавляем visit_rewards_claimed - сколько раз пользователь забрал награду за 5 посещений
-- Прогресс вычисляется: games_visited - (visit_rewards_claimed * 5)

-- Добавляем новое поле
ALTER TABLE public.user_stats
  ADD COLUMN IF NOT EXISTS visit_rewards_claimed INTEGER DEFAULT 0 NOT NULL;

-- Вычисляем начальное значение: сколько раз пользователь уже забрал награду
-- (если у него было 5+ посещений, считаем что он забрал награду за каждые 5)
UPDATE public.user_stats
SET visit_rewards_claimed = FLOOR(games_visited / 5)
WHERE games_visited > 0;

-- Удаляем старые поля (если они существуют)
ALTER TABLE public.user_stats
  DROP COLUMN IF EXISTS visit_reward_progress,
  DROP COLUMN IF EXISTS visit_reward_pending;

-- Удаляем старые ограничения
ALTER TABLE public.user_stats
  DROP CONSTRAINT IF EXISTS visit_reward_progress_range;

-- Обновляем функцию increment_user_stat - убираем visit_reward_progress
CREATE OR REPLACE FUNCTION public.increment_user_stat(
  p_telegram_id BIGINT,
  p_stat TEXT
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.user_stats (telegram_id, games_visited, tickets_purchased, bingo_collected, visit_rewards_claimed)
  VALUES (p_telegram_id, 0, 0, 0, 0)
  ON CONFLICT (telegram_id) DO NOTHING;

  UPDATE public.user_stats
  SET
    games_visited     = CASE WHEN p_stat = 'games_visited'     THEN games_visited + 1     ELSE games_visited     END,
    tickets_purchased = CASE WHEN p_stat = 'tickets_purchased' THEN tickets_purchased + 1 ELSE tickets_purchased END,
    bingo_collected   = CASE WHEN p_stat = 'bingo_collected'   THEN bingo_collected + 1   ELSE bingo_collected   END,
    updated_at = NOW()
  WHERE telegram_id = p_telegram_id;
END;
$$;
