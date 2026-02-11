-- Счётчик посещений до награды (0–4). На 5-м посещении награда и обнуление.
ALTER TABLE public.user_stats
  ADD COLUMN IF NOT EXISTS visit_reward_progress INTEGER DEFAULT 0 NOT NULL;

ALTER TABLE public.user_stats
  DROP CONSTRAINT IF EXISTS visit_reward_progress_range;

ALTER TABLE public.user_stats
  ADD CONSTRAINT visit_reward_progress_range
  CHECK (visit_reward_progress >= 0 AND visit_reward_progress <= 4);

-- Вставка новой строки при первом вызове increment_user_stat должна включать visit_reward_progress
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
  INSERT INTO public.user_stats (telegram_id, games_visited, tickets_purchased, bingo_collected, visit_reward_progress)
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

