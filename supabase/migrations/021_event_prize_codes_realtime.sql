-- Включаем realtime для event_prize_codes (обновление статуса погашения кодов)
ALTER PUBLICATION supabase_realtime ADD TABLE public.event_prize_codes;

-- Удаляем старую политику, которая блокировала всё
DROP POLICY IF EXISTS "No direct user access to event_prize_codes" ON public.event_prize_codes;

-- Разрешаем SELECT для аутентифицированных пользователей (нужен для Realtime подписки)
CREATE POLICY "Event prize codes are viewable by authenticated users"
  ON public.event_prize_codes
  FOR SELECT
  USING (auth.role() = 'authenticated');

-- INSERT/UPDATE/DELETE остаются заблокированными для пользователей (только service role)
CREATE POLICY "No direct user writes to event_prize_codes"
  ON public.event_prize_codes
  FOR INSERT
  WITH CHECK (false);

CREATE POLICY "No direct user updates to event_prize_codes"
  ON public.event_prize_codes
  FOR UPDATE
  USING (false)
  WITH CHECK (false);

CREATE POLICY "No direct user deletes to event_prize_codes"
  ON public.event_prize_codes
  FOR DELETE
  USING (false);
