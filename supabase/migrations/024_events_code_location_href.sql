-- Код мероприятия (5 символов для регистрации) и ссылка на обложку
ALTER TABLE public.events
  ADD COLUMN IF NOT EXISTS code CHAR(5) UNIQUE;
ALTER TABLE public.events
  ADD COLUMN IF NOT EXISTS location_href TEXT;
