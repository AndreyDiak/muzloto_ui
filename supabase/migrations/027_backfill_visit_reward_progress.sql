-- Синхронизация visit_reward_progress для пользователей, у которых уже были посещения
-- до появления колонки (progress = количество посещений в текущем цикле 0–4)
UPDATE public.user_stats
SET visit_reward_progress = (games_visited % 5)
WHERE games_visited > 0;
