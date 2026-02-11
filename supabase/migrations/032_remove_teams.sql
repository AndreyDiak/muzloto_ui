-- Удаление всего, что связано с командами: event_teams, event_team_stats, team_id в registrations и event_bingo_winners.

-- 1. Таблица статистики команд (зависит от event_teams)
DROP TABLE IF EXISTS public.event_team_stats;

-- 2. Убираем ссылку на команду из регистраций
ALTER TABLE public.registrations
  DROP COLUMN IF EXISTS team_id;

-- 3. Убираем ссылку на команду из победителей бинго (если таблица есть)
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'event_bingo_winners') THEN
    ALTER TABLE public.event_bingo_winners DROP COLUMN IF EXISTS team_id;
  END IF;
END $$;

-- 4. Таблица команд мероприятий
DROP TABLE IF EXISTS public.event_teams;
