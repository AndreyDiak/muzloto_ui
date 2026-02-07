-- Подписка на изменения профиля в реальном времени (баланс и др. обновляются у пользователя без перезагрузки)
ALTER PUBLICATION supabase_realtime ADD TABLE public.profiles;
