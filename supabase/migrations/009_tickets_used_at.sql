-- Когда билет отсканирован (выдан предмет), помечаем его неактивным
ALTER TABLE public.tickets
  ADD COLUMN IF NOT EXISTS used_at TIMESTAMPTZ DEFAULT NULL;

CREATE INDEX IF NOT EXISTS idx_tickets_used_at ON public.tickets(used_at) WHERE used_at IS NOT NULL;
