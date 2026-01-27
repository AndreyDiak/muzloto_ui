-- Подписка на изменения билетов в реальном времени (ведущий отсканировал — участник видит обновление)
ALTER PUBLICATION supabase_realtime ADD TABLE public.tickets;
