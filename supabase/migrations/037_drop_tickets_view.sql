-- Удаляем представление tickets: «мои билеты» читаются напрямую из codes (type=purchase, owner_telegram_id).
DROP VIEW IF EXISTS public.tickets;
