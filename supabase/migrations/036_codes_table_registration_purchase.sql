-- Единая таблица codes: код ведёт либо в регистрацию (event_id), либо в покупку (catalog_item_id).
-- Переименовываем redemption_codes -> codes, kind -> type ('registration' | 'purchase').
-- Представление "tickets" = коды покупки с владельцем (для профиля «мои билеты»).

-- 1) Переименование таблицы (если есть redemption_codes после 035)
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'redemption_codes') THEN
    ALTER TABLE public.redemption_codes RENAME TO codes;
  END IF;
END $$;

-- 2) Если таблица уже называется codes — ничего не делаем. Если только что переименовали — меняем колонку и ограничения.
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'codes' AND column_name = 'kind') THEN
    ALTER TABLE public.codes RENAME COLUMN kind TO type;
    UPDATE public.codes SET type = 'purchase' WHERE type = 'ticket';
    ALTER TABLE public.codes DROP CONSTRAINT IF EXISTS redemption_codes_kind_check;
    ALTER TABLE public.codes DROP CONSTRAINT IF EXISTS codes_kind_check;
    ALTER TABLE public.codes ADD CONSTRAINT codes_type_check CHECK (type IN ('registration', 'purchase'));
  END IF;
END $$;

-- 3) Индексы и триггер под новое имя (идемпотентно)
DROP INDEX IF EXISTS public.idx_redemption_codes_code;
DROP INDEX IF EXISTS public.idx_redemption_codes_kind;
DROP INDEX IF EXISTS public.idx_redemption_codes_owner;
DROP INDEX IF EXISTS public.idx_redemption_codes_catalog_item;
DROP INDEX IF EXISTS public.idx_redemption_codes_used_at;
CREATE UNIQUE INDEX IF NOT EXISTS idx_codes_code ON public.codes(code);
CREATE INDEX IF NOT EXISTS idx_codes_type ON public.codes(type);
CREATE INDEX IF NOT EXISTS idx_codes_owner ON public.codes(owner_telegram_id);
CREATE INDEX IF NOT EXISTS idx_codes_catalog_item ON public.codes(catalog_item_id);
CREATE INDEX IF NOT EXISTS idx_codes_used_at ON public.codes(used_at) WHERE used_at IS NULL;

DROP TRIGGER IF EXISTS update_redemption_codes_updated_at ON public.codes;
DROP TRIGGER IF EXISTS update_codes_updated_at ON public.codes;
CREATE TRIGGER update_codes_updated_at
  BEFORE UPDATE ON public.codes
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- 4) Коды регистрации: по одному коду на мероприятие (из events)
INSERT INTO public.codes (id, code, type, event_id, created_at, updated_at)
SELECT gen_random_uuid(), TRIM(events.code), 'registration', events.id, events.created_at, events.updated_at
FROM public.events
WHERE events.code IS NOT NULL AND TRIM(events.code) <> ''
ON CONFLICT (code) DO NOTHING;

-- 5) RLS
DROP POLICY IF EXISTS "Users can view own tickets" ON public.codes;
CREATE POLICY "Users can view own tickets"
  ON public.codes FOR SELECT
  USING (type = 'purchase' AND owner_telegram_id = (auth.jwt() -> 'user_metadata' ->> 'telegram_id')::bigint);

-- 6) Realtime: переключаем на codes
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_publication_tables WHERE pubname = 'supabase_realtime' AND tablename = 'redemption_codes') THEN
    ALTER PUBLICATION supabase_realtime DROP TABLE public.redemption_codes;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_publication_tables WHERE pubname = 'supabase_realtime' AND tablename = 'codes') THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.codes;
  END IF;
END $$;

COMMENT ON TABLE public.codes IS 'Единая таблица кодов: registration = код мероприятия (event_id), purchase = код покупки каталога (catalog_item_id)';
