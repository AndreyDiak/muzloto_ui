-- Коды призов за бинго по мероприятиям (генерирует ведущий, погашает игрок)
CREATE TABLE IF NOT EXISTS public.event_prize_codes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id UUID NOT NULL REFERENCES public.events(id) ON DELETE CASCADE,
  code CHAR(5) NOT NULL UNIQUE,
  telegram_id BIGINT NULL,
  coins_amount INTEGER NOT NULL DEFAULT 100,
  used_at TIMESTAMPTZ NULL,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  created_by_telegram_id BIGINT NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_event_prize_codes_event_id ON public.event_prize_codes(event_id);
CREATE INDEX IF NOT EXISTS idx_event_prize_codes_code ON public.event_prize_codes(code);
CREATE INDEX IF NOT EXISTS idx_event_prize_codes_used_at ON public.event_prize_codes(used_at);

ALTER TABLE public.event_prize_codes ENABLE ROW LEVEL SECURITY;

-- Только сервер (service role) управляет кодами призов; пользователи не видят таблицу через RLS
CREATE POLICY "No direct user access to event_prize_codes"
  ON public.event_prize_codes
  FOR ALL
  USING (false)
  WITH CHECK (false);
