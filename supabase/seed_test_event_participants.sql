-- Тестовые участники мероприятия: 48 профилей + регистрации на событие.
-- Запускать в Supabase SQL Editor (нужны права на INSERT/DELETE в обход RLS или от имени service role).
-- ID мероприятия:
-- 29663a2f-6e1a-47f1-afb5-78078a043950

-- Диапазон telegram_id для тестовых аккаунтов (легко удалить одной командой):
-- 900000001 .. 900000048

-- =============================================================================
-- 1) НАПОЛНЕНИЕ: создать 48 профилей и зарегистрировать на мероприятие
-- =============================================================================
-- Выполнить этот блок один раз для генерации участников.

INSERT INTO public.profiles (telegram_id, username, first_name, balance, created_at, updated_at)
SELECT
  n,
  'test_user_' || n,
  'Тест ' || n,
  0,
  NOW(),
  NOW()
FROM generate_series(900000001, 900000048) AS n
ON CONFLICT (telegram_id) DO NOTHING;

INSERT INTO public.registrations (event_id, telegram_id, registered_at, status)
SELECT
  '29663a2f-6e1a-47f1-afb5-78078a043950'::uuid,
  n,
  NOW(),
  'confirmed'
FROM generate_series(900000001, 900000048) AS n
ON CONFLICT (event_id, telegram_id) DO NOTHING;

-- Проверка: сколько участников у мероприятия
-- SELECT COUNT(*) FROM public.registrations WHERE event_id = '29663a2f-6e1a-47f1-afb5-78078a043950';


-- =============================================================================
-- 1b) ДОБАВИТЬ ЕЩЁ 13 пользователей (если уже есть 35, выполнить только этот блок)
-- =============================================================================
-- Профили 900000036 .. 900000048 + регистрации на мероприятие.

-- INSERT INTO public.profiles (telegram_id, username, first_name, balance, created_at, updated_at)
-- SELECT
--   n,
--   'test_user_' || n,
--   'Тест ' || n,
--   0,
--   NOW(),
--   NOW()
-- FROM generate_series(900000036, 900000048) AS n
-- ON CONFLICT (telegram_id) DO NOTHING;

-- INSERT INTO public.registrations (event_id, telegram_id, registered_at, status)
-- SELECT
--   '29663a2f-6e1a-47f1-afb5-78078a043950'::uuid,
--   n,
--   NOW(),
--   'confirmed'
-- FROM generate_series(900000036, 900000048) AS n
-- ON CONFLICT (event_id, telegram_id) DO NOTHING;


-- =============================================================================
-- 2) ОЧИСТКА: удалить все тестовые аккаунты (48 профилей и их регистрации)
-- =============================================================================
-- Выполнить этот блок, когда нужно убрать тестовых участников.
-- CASCADE удалит связанные registrations, user_stats, user_achievements, root_user_tags.

-- DELETE FROM public.profiles
-- WHERE telegram_id BETWEEN 900000001 AND 900000048;
