-- created_by_telegram_id: кто создал код (ведущий). Нужен для RLS: ведущий может подписаться на Realtime по своему коду.
ALTER TABLE public.codes
  ADD COLUMN IF NOT EXISTS created_by_telegram_id BIGINT REFERENCES public.profiles(telegram_id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS idx_codes_created_by ON public.codes(created_by_telegram_id);

-- RLS: пользователь видит коды покупки, где он владелец ИЛИ создатель (чтобы ведущий получал Realtime при погашении)
DROP POLICY IF EXISTS "Users can view own tickets" ON public.codes;
CREATE POLICY "Users can view own tickets"
  ON public.codes FOR SELECT
  USING (
    type = 'purchase'
    AND (
      owner_telegram_id = (auth.jwt() -> 'user_metadata' ->> 'telegram_id')::bigint
      OR created_by_telegram_id = (auth.jwt() -> 'user_metadata' ->> 'telegram_id')::bigint
    )
  );

COMMENT ON COLUMN public.codes.created_by_telegram_id IS 'Ведущий, создавший код покупки; для Realtime-подписки при погашении';
