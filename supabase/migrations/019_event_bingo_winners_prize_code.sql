-- Поле prize_code для персонального слота: победитель не зарегистрирован, получает код
ALTER TABLE public.event_bingo_winners
  ADD COLUMN IF NOT EXISTS prize_code CHAR(5) NULL;
