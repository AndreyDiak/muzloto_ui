-- Единая таблица кодов: код ведёт либо в регистрацию (event_id), либо в покупку (catalog_item_id).
CREATE TABLE IF NOT EXISTS public.codes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code TEXT NOT NULL UNIQUE,
  type TEXT NOT NULL CHECK (type IN ('registration', 'purchase')),
  event_id UUID REFERENCES public.events(id) ON DELETE CASCADE,
  catalog_item_id UUID REFERENCES public.catalog(id) ON DELETE CASCADE,
  owner_telegram_id BIGINT REFERENCES public.profiles(telegram_id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  used_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  CONSTRAINT codes_ref_check CHECK (event_id IS NOT NULL OR catalog_item_id IS NOT NULL)
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_codes_code ON public.codes(code);
CREATE INDEX IF NOT EXISTS idx_codes_type ON public.codes(type);
CREATE INDEX IF NOT EXISTS idx_codes_owner ON public.codes(owner_telegram_id);
CREATE INDEX IF NOT EXISTS idx_codes_catalog_item ON public.codes(catalog_item_id);
CREATE INDEX IF NOT EXISTS idx_codes_used_at ON public.codes(used_at) WHERE used_at IS NULL;

COMMENT ON TABLE public.codes IS 'Коды: registration = мероприятие (event_id), purchase = покупка каталога (catalog_item_id)';

DROP TRIGGER IF EXISTS update_codes_updated_at ON public.codes;
CREATE TRIGGER update_codes_updated_at
  BEFORE UPDATE ON public.codes
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Миграция: старые билеты и коды покупки -> type=purchase
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'tickets') THEN
    INSERT INTO public.codes (id, code, type, catalog_item_id, owner_telegram_id, created_at, used_at, updated_at)
    SELECT id, TRIM(code), 'purchase', catalog_item_id, telegram_id, created_at, used_at, updated_at
    FROM public.tickets
    ON CONFLICT (code) DO NOTHING;
  END IF;
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'catalog_purchase_codes') THEN
    INSERT INTO public.codes (id, code, type, catalog_item_id, owner_telegram_id, created_at, used_at, updated_at)
    SELECT id, code, 'purchase', catalog_item_id, used_by_telegram_id, created_at, used_at, COALESCE(used_at, created_at)
    FROM public.catalog_purchase_codes
    ON CONFLICT (code) DO NOTHING;
  END IF;
  -- Коды регистрации: по одному на мероприятие
  INSERT INTO public.codes (id, code, type, event_id, created_at, updated_at)
  SELECT gen_random_uuid(), TRIM(e.code), 'registration', e.id, e.created_at, e.updated_at
  FROM public.events e
  WHERE e.code IS NOT NULL AND TRIM(e.code) <> ''
  ON CONFLICT (code) DO NOTHING;
END $$;

-- Для purchase без event_id/catalog_item_id CHECK не выполнится — у нас catalog_item_id всегда есть.
-- Добавляем event_id только для будущего; пока везде catalog_item_id.

-- RLS: пользователь видит только свои коды покупки (для профиля «мои билеты»)
ALTER TABLE public.codes ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own tickets" ON public.codes;
CREATE POLICY "Users can view own tickets"
  ON public.codes FOR SELECT
  USING (type = 'purchase' AND owner_telegram_id = (auth.jwt() -> 'user_metadata' ->> 'telegram_id')::bigint);

-- Удаляем старые таблицы только если они есть (сначала отвязываем realtime)
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_tables WHERE schemaname = 'public' AND tablename = 'tickets') THEN
    ALTER PUBLICATION supabase_realtime DROP TABLE public.tickets;
  END IF;
END $$;
DROP TABLE IF EXISTS public.tickets CASCADE;
DROP TABLE IF EXISTS public.catalog_purchase_codes CASCADE;

-- Realtime
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_publication_tables WHERE pubname = 'supabase_realtime' AND tablename = 'codes') THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.codes;
  END IF;
END $$;
