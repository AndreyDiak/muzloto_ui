-- Один победитель розыгрыша на мероприятие (определяется на бэкенде, хранится в БД)
CREATE TABLE IF NOT EXISTS public.event_raffle_winners (
  event_id UUID PRIMARY KEY REFERENCES public.events(id) ON DELETE CASCADE,
  winner_telegram_id BIGINT NOT NULL,
  drawn_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_event_raffle_winners_winner_telegram_id ON public.event_raffle_winners(winner_telegram_id);

ALTER TABLE public.event_raffle_winners ENABLE ROW LEVEL SECURITY;

-- Только сервер (service role) управляет таблицей; пользователи не видят через RLS
CREATE POLICY "No direct user access to event_raffle_winners"
  ON public.event_raffle_winners
  FOR ALL
  USING (false)
  WITH CHECK (false);
