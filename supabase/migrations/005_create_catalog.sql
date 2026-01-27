-- Таблица catalog: предметы, которые можно обменять на монеты
CREATE TABLE IF NOT EXISTS public.catalog (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  price INTEGER NOT NULL CHECK (price >= 0),
  photo TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_catalog_price ON public.catalog(price);
CREATE INDEX IF NOT EXISTS idx_catalog_created_at ON public.catalog(created_at);

CREATE TRIGGER update_catalog_updated_at
  BEFORE UPDATE ON public.catalog
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

ALTER TABLE public.catalog ENABLE ROW LEVEL SECURITY;

-- Все могут просматривать каталог
CREATE POLICY "Catalog is viewable by everyone"
  ON public.catalog
  FOR SELECT
  USING (true);
