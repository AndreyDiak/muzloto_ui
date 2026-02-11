-- Коды покупки каталога: мастер генерирует код, пользователь вводит/сканирует в профиле — списание баланса и выдача билета
CREATE TABLE IF NOT EXISTS public.catalog_purchase_codes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code TEXT NOT NULL UNIQUE,
  catalog_item_id UUID NOT NULL REFERENCES public.catalog(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  used_at TIMESTAMPTZ,
  used_by_telegram_id BIGINT REFERENCES public.profiles(telegram_id) ON DELETE SET NULL
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_catalog_purchase_codes_code ON public.catalog_purchase_codes(code);
CREATE INDEX IF NOT EXISTS idx_catalog_purchase_codes_catalog_item ON public.catalog_purchase_codes(catalog_item_id);
CREATE INDEX IF NOT EXISTS idx_catalog_purchase_codes_used_at ON public.catalog_purchase_codes(used_at) WHERE used_at IS NULL;

ALTER TABLE public.catalog_purchase_codes ENABLE ROW LEVEL SECURITY;

-- Чтение только через сервер (service role); пользователи не видят таблицу через RLS
CREATE POLICY "No direct user access to catalog_purchase_codes"
  ON public.catalog_purchase_codes FOR ALL
  USING (false);
