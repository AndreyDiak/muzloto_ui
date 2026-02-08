-- Профили команд: статистика для таблицы лидеров и учёта наград
CREATE TABLE IF NOT EXISTS public.event_team_stats (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id UUID NOT NULL REFERENCES public.events(id) ON DELETE CASCADE,
  team_id UUID NOT NULL REFERENCES public.event_teams(id) ON DELETE CASCADE,
  total_coins_earned INTEGER NOT NULL DEFAULT 0,
  bingo_wins_count INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  UNIQUE(event_id, team_id)
);

CREATE INDEX IF NOT EXISTS idx_event_team_stats_event_id ON public.event_team_stats(event_id);
CREATE INDEX IF NOT EXISTS idx_event_team_stats_team_id ON public.event_team_stats(team_id);

ALTER TABLE public.event_team_stats ENABLE ROW LEVEL SECURITY;

-- Доступ только через сервер (service role)
CREATE POLICY "No direct user access to event_team_stats"
  ON public.event_team_stats
  FOR ALL
  USING (false)
  WITH CHECK (false);
