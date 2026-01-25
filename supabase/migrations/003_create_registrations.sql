-- Создание таблицы registrations для хранения регистраций на мероприятия
CREATE TABLE IF NOT EXISTS public.registrations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id UUID NOT NULL REFERENCES public.events(id) ON DELETE CASCADE,
  telegram_id BIGINT NOT NULL REFERENCES public.profiles(telegram_id) ON DELETE CASCADE,
  registered_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  status TEXT DEFAULT 'confirmed' NOT NULL, -- confirmed, cancelled, attended
  UNIQUE(event_id, telegram_id) -- один пользователь может зарегистрироваться на событие только один раз
);

-- Индексы для быстрого поиска
CREATE INDEX IF NOT EXISTS idx_registrations_event_id ON public.registrations(event_id);
CREATE INDEX IF NOT EXISTS idx_registrations_telegram_id ON public.registrations(telegram_id);
CREATE INDEX IF NOT EXISTS idx_registrations_status ON public.registrations(status);

-- RLS политики
ALTER TABLE public.registrations ENABLE ROW LEVEL SECURITY;

-- Политика: пользователи могут читать свои регистрации
CREATE POLICY "Users can view own registrations"
  ON public.registrations
  FOR SELECT
  USING (
    (auth.jwt() -> 'user_metadata' ->> 'telegram_id')::bigint = telegram_id
  );

-- Политика: пользователи могут создавать свои регистрации
CREATE POLICY "Users can create own registrations"
  ON public.registrations
  FOR INSERT
  WITH CHECK (
    (auth.jwt() -> 'user_metadata' ->> 'telegram_id')::bigint = telegram_id
  );

-- Политика: пользователи могут обновлять свои регистрации
CREATE POLICY "Users can update own registrations"
  ON public.registrations
  FOR UPDATE
  USING (
    (auth.jwt() -> 'user_metadata' ->> 'telegram_id')::bigint = telegram_id
  );
