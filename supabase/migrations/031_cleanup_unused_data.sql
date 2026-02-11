-- Очистка неиспользуемых данных: разблокировки достижений больше не отображаются
-- (конфиг достижений пуст, награда только за 5 посещений в user_stats).
-- Доп. опциональные запросы — в supabase/scripts/cleanup_unused_data_manual.sql
DELETE FROM public.user_achievements;
