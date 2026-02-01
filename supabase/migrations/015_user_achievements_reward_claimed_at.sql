-- Награда за достижение забирается пользователем вручную (кнопка в аккордеоне)
ALTER TABLE public.user_achievements
  ADD COLUMN IF NOT EXISTS reward_claimed_at TIMESTAMPTZ NULL;

-- Существующие разблокировки считаем награду уже полученной (монеты начислялись автоматически)
UPDATE public.user_achievements
SET reward_claimed_at = unlocked_at
WHERE reward_claimed_at IS NULL;
