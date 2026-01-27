-- Мастер-аккаунты: telegram_id пользователей с доступом к разделу "Сканер"
CREATE TABLE IF NOT EXISTS public.root_user_tags (
  telegram_id BIGINT PRIMARY KEY REFERENCES public.profiles(telegram_id) ON DELETE CASCADE
);

ALTER TABLE public.root_user_tags ENABLE ROW LEVEL SECURITY;

-- Пользователь может проверить, есть ли его telegram_id в списке (для отображения раздела "Сканер")
CREATE POLICY "Users can check own root status"
  ON public.root_user_tags FOR SELECT
  USING ((auth.jwt() -> 'user_metadata' ->> 'telegram_id')::bigint = telegram_id);
