-- Билеты: результат обмена монет на предмет из каталога
CREATE TABLE IF NOT EXISTS public.tickets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  telegram_id BIGINT NOT NULL REFERENCES public.profiles(telegram_id) ON DELETE CASCADE,
  catalog_item_id UUID NOT NULL REFERENCES public.catalog(id) ON DELETE CASCADE,
  code CHAR(5) NOT NULL UNIQUE,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_tickets_telegram_id ON public.tickets(telegram_id);
CREATE INDEX IF NOT EXISTS idx_tickets_catalog_item_id ON public.tickets(catalog_item_id);
CREATE UNIQUE INDEX IF NOT EXISTS idx_tickets_code ON public.tickets(code);

CREATE TRIGGER update_tickets_updated_at
  BEFORE UPDATE ON public.tickets
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

ALTER TABLE public.tickets ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own tickets" ON public.tickets;
CREATE POLICY "Users can view own tickets"
  ON public.tickets FOR SELECT
  USING ((auth.jwt() -> 'user_metadata' ->> 'telegram_id')::bigint = telegram_id);
