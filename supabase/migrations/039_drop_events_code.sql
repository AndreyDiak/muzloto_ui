-- Код мероприятия хранится только в таблице codes; колонка events.code не используется
ALTER TABLE public.events
  DROP COLUMN IF EXISTS code;
