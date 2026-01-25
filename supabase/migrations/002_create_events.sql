-- Создание таблицы events для хранения мероприятий
CREATE TABLE IF NOT EXISTS public.events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  event_date TIMESTAMPTZ NOT NULL,
  location TEXT,
  price INTEGER DEFAULT 0 NOT NULL, -- цена в монетах
  max_participants INTEGER,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Индексы для быстрого поиска
CREATE INDEX IF NOT EXISTS idx_events_event_date ON public.events(event_date);
CREATE INDEX IF NOT EXISTS idx_events_created_at ON public.events(created_at);

-- Триггер для автоматического обновления updated_at
CREATE TRIGGER update_events_updated_at
  BEFORE UPDATE ON public.events
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- RLS политики
ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;

-- Политика: все могут читать мероприятия
CREATE POLICY "Events are viewable by everyone"
  ON public.events
  FOR SELECT
  USING (true);
