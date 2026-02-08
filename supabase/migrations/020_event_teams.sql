-- Команды по мероприятиям (заносятся вручную в БД на первом этапе)
CREATE TABLE IF NOT EXISTS public.event_teams (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id UUID NOT NULL REFERENCES public.events(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  UNIQUE(event_id, name)
);

CREATE INDEX IF NOT EXISTS idx_event_teams_event_id ON public.event_teams(event_id);

ALTER TABLE public.event_teams ENABLE ROW LEVEL SECURITY;

-- Аутентифицированные пользователи могут видеть команды (для выбора при регистрации)
CREATE POLICY "Event teams are viewable by authenticated users"
  ON public.event_teams
  FOR SELECT
  USING (auth.role() = 'authenticated');

-- Добавляем ссылку на команду в регистрации
ALTER TABLE public.registrations
  ADD COLUMN IF NOT EXISTS team_id UUID NULL REFERENCES public.event_teams(id);

-- Добавляем ссылку на команду в победителях бинго (замена текстового team_name)
ALTER TABLE public.event_bingo_winners
  ADD COLUMN IF NOT EXISTS team_id UUID NULL REFERENCES public.event_teams(id);
