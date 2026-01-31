-- Переименование счётчика: contest_wons → bingo_collected
ALTER TABLE public.user_stats
  RENAME COLUMN contest_wons TO bingo_collected;

-- Обновление функции инкремента
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
  INSERT INTO public.user_stats (telegram_id, games_visited, tickets_purchased, bingo_collected)
  VALUES (p_telegram_id, 0, 0, 0)
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
