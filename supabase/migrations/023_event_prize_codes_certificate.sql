-- Сертификатные коды (без привязки к мероприятию): event_id может быть NULL
ALTER TABLE public.event_prize_codes
  ALTER COLUMN event_id DROP NOT NULL;
