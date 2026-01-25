# Исправление RLS политик

## Проблема
Ошибка `permission denied for table users` возникает из-за того, что RLS политики пытаются обратиться к таблице `auth.users` напрямую, что не разрешено.

## Решение
Используем `auth.jwt()` для получения `telegram_id` из `user_metadata` JWT токена вместо прямого обращения к таблице `users`.

## Как применить исправление

1. Откройте Supabase Dashboard → SQL Editor
2. Выполните SQL для обновления политик:

```sql
-- Удаляем старые политики
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can view own registrations" ON public.registrations;
DROP POLICY IF EXISTS "Users can create own registrations" ON public.registrations;
DROP POLICY IF EXISTS "Users can update own registrations" ON public.registrations;

-- Создаем новые политики с использованием auth.jwt()
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
```

3. Проверьте, что Edge Function правильно устанавливает `telegram_id` в `user_metadata` при создании пользователя.

## Альтернативное решение (если auth.jwt() не работает)

Если `auth.jwt()` не доступен в RLS политиках, можно использовать функцию:

```sql
CREATE OR REPLACE FUNCTION get_user_telegram_id()
RETURNS BIGINT AS $$
  SELECT (auth.jwt() -> 'user_metadata' ->> 'telegram_id')::bigint;
$$ LANGUAGE sql STABLE;

-- Затем использовать в политиках:
CREATE POLICY "Users can view own profile"
  ON public.profiles
  FOR SELECT
  USING (get_user_telegram_id() = telegram_id);
```
