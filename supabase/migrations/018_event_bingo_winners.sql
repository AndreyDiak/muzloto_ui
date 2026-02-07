-- Победители бинго по мероприятиям (сохраняются ведущим, переживают перезагрузку)
CREATE TABLE IF NOT EXISTS public.event_bingo_winners (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id UUID NOT NULL REFERENCES public.events(id) ON DELETE CASCADE,
  slot_type TEXT NOT NULL CHECK (slot_type IN ('personal', 'team')),
  slot_index SMALLINT NOT NULL CHECK (slot_index >= 0),
  telegram_id BIGINT NULL,
  team_name TEXT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  UNIQUE(event_id, slot_type, slot_index)
);

CREATE INDEX IF NOT EXISTS idx_event_bingo_winners_event_id ON public.event_bingo_winners(event_id);

ALTER TABLE public.event_bingo_winners ENABLE ROW LEVEL SECURITY;

-- Доступ только через сервер (service role); для чтения с клиента можно разрешить по RLS
CREATE POLICY "No direct user access to event_bingo_winners"
  ON public.event_bingo_winners
  FOR ALL
  USING (false)
  WITH CHECK (false);
