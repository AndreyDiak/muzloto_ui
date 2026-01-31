-- Счётчики пользователя для достижений
CREATE TABLE IF NOT EXISTS public.user_stats (
  telegram_id BIGINT PRIMARY KEY REFERENCES public.profiles(telegram_id) ON DELETE CASCADE,
  games_visited INTEGER DEFAULT 0 NOT NULL,
  tickets_purchased INTEGER DEFAULT 0 NOT NULL,
  contest_wons INTEGER DEFAULT 0 NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE TRIGGER update_user_stats_updated_at
  BEFORE UPDATE ON public.user_stats
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

ALTER TABLE public.user_stats ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own stats"
  ON public.user_stats
  FOR SELECT
  USING (
    (auth.jwt() -> 'user_metadata' ->> 'telegram_id')::bigint = telegram_id
  );

-- Инкремент одного из счётчиков (создаёт строку при первом вызове)
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
  INSERT INTO public.user_stats (telegram_id, games_visited, tickets_purchased, contest_wons)
  VALUES (p_telegram_id, 0, 0, 0)
  ON CONFLICT (telegram_id) DO NOTHING;

  UPDATE public.user_stats
  SET
    games_visited    = CASE WHEN p_stat = 'games_visited'    THEN games_visited + 1    ELSE games_visited    END,
    tickets_purchased = CASE WHEN p_stat = 'tickets_purchased' THEN tickets_purchased + 1 ELSE tickets_purchased END,
    contest_wons     = CASE WHEN p_stat = 'contest_wons'     THEN contest_wons + 1     ELSE contest_wons     END,
    updated_at = NOW()
  WHERE telegram_id = p_telegram_id;
END;
$$;
