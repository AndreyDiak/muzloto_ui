-- При достижении 5 посещений награда не начисляется автоматически:
-- выставляется флаг visit_reward_pending; пользователь забирает приз кнопкой, затем счётчик обнуляется.
ALTER TABLE public.user_stats
  ADD COLUMN IF NOT EXISTS visit_reward_pending BOOLEAN DEFAULT false NOT NULL;
