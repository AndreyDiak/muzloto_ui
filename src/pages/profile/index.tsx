import { Award, Target, TrendingUp, Trophy } from 'lucide-react';
import { ProfileAchievements } from './_achievements';
import { ProfileEnterCode } from './_enter_code';
import { ProfileInfo } from './_info';
import { ProfileStats } from './_stats';

const stats = [
  {
    icon: Trophy, label: 'Посещено событий', value: '14', textColor: 'var(--accent-gold)', bgColor: "var(--accent-gold-darker)", description: 'Вы посетили 14 событий'
  },
  { icon: Target, label: 'Активных билетов', value: '0', textColor: 'var(--accent-cyan)', bgColor: "var(--accent-cyan-darker)", description: 'У вас нет активных билетов' },
  { icon: TrendingUp, label: 'Уровень', value: '1', textColor: 'var(--accent-purple)', bgColor: "var(--accent-purple-darker)", description: 'Вы находитесь на 1 уровне' },
  { icon: Award, label: 'Достижения', value: '1', textColor: 'var(--accent-pink)', bgColor: "var(--accent-pink-darker)", description: 'У вас 1 достижение' },
];

const achievements = [
  { name: 'Первое событие', unlocked: true, description: 'Побывать на своей первой игре' },
  { name: 'Ценитель искусства', unlocked: false, description: 'Прослушать 100 песен' },
  { name: 'Коллекционер', unlocked: false, description: 'Собрать 100 карточек' },
  { name: 'VIP персона', unlocked: false, description: 'Получить VIP статус' },
];

export function Profile() {
  return (
    <div className="p-4 space-y-6">
      <ProfileInfo />

      <ProfileEnterCode />

      <ProfileStats stats={stats} />

      <ProfileAchievements achievements={achievements} />
    </div>
  );
}
