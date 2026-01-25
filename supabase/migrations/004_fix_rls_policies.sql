-- Исправление RLS политик для работы с auth.jwt() вместо прямого обращения к auth.users

-- Удаляем старые политики profiles
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;

-- Создаем новые политики profiles с использованием auth.jwt()
CREATE POLICY "Users can view own profile"
  ON public.profiles
  FOR SELECT
  USING (
    (auth.jwt() -> 'user_metadata' ->> 'telegram_id')::bigint = telegram_id
  );

CREATE POLICY "Users can update own profile"
  ON public.profiles
  FOR UPDATE
  USING (
    (auth.jwt() -> 'user_metadata' ->> 'telegram_id')::bigint = telegram_id
  );

-- Удаляем старые политики registrations (если таблица существует)
DROP POLICY IF EXISTS "Users can view own registrations" ON public.registrations;
DROP POLICY IF EXISTS "Users can create own registrations" ON public.registrations;
DROP POLICY IF EXISTS "Users can update own registrations" ON public.registrations;

-- Создаем новые политики registrations с использованием auth.jwt()
CREATE POLICY "Users can view own registrations"
  ON public.registrations
  FOR SELECT
  USING (
    (auth.jwt() -> 'user_metadata' ->> 'telegram_id')::bigint = telegram_id
  );

CREATE POLICY "Users can create own registrations"
  ON public.registrations
  FOR INSERT
  WITH CHECK (
    (auth.jwt() -> 'user_metadata' ->> 'telegram_id')::bigint = telegram_id
  );

CREATE POLICY "Users can update own registrations"
  ON public.registrations
  FOR UPDATE
  USING (
    (auth.jwt() -> 'user_metadata' ->> 'telegram_id')::bigint = telegram_id
  );
