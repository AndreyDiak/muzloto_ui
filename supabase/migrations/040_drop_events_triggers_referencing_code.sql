-- Удаляем триггеры на events, которые могут ссылаться на поле code (оно уже удалено в 039).
-- Оставляем только update_events_updated_at (он трогает только updated_at).
DO $$
DECLARE
  r RECORD;
BEGIN
  FOR r IN
    SELECT t.tgname
    FROM pg_trigger t
    JOIN pg_class c ON t.tgrelid = c.oid
    JOIN pg_namespace n ON c.relnamespace = n.oid
    WHERE n.nspname = 'public'
      AND c.relname = 'events'
      AND NOT t.tgisinternal
      AND t.tgname <> 'update_events_updated_at'
  LOOP
    EXECUTE format('DROP TRIGGER IF EXISTS %I ON public.events', r.tgname);
  END LOOP;
END $$;
