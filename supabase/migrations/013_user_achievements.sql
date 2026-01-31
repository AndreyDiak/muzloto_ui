-- Разблокированные достижения пользователя
CREATE TABLE IF NOT EXISTS public.user_achievements (
  telegram_id BIGINT NOT NULL REFERENCES public.profiles(telegram_id) ON DELETE CASCADE,
  achievement_slug TEXT NOT NULL,
  unlocked_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  PRIMARY KEY (telegram_id, achievement_slug)
);

CREATE INDEX IF NOT EXISTS idx_user_achievements_telegram_id ON public.user_achievements(telegram_id);

ALTER TABLE public.user_achievements ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own achievements"
  ON public.user_achievements
  FOR SELECT
  USING (
    (auth.jwt() -> 'user_metadata' ->> 'telegram_id')::bigint = telegram_id
  );
