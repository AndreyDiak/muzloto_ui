import { Award, Target, TrendingUp, Trophy } from 'lucide-react';
import { useUser } from '../../app/context/user';
import { Avatar, AvatarFallback, AvatarImage } from '../../components/ui/avatar';
import { ProfileAchievements } from './_achievements';
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
  const { user } = useUser();

  return (
    <div className="p-4 space-y-6">
      {/* Profile Header */}
      <div className="bg-[#16161d] rounded-2xl p-6 border border-[#00f0ff]/20 neon-glow">
        <div className="flex items-center gap-4">
          <Avatar size="lg" className='w-14! h-14!'>
            <AvatarImage src={user?.photo_url} />
            <AvatarFallback>{user?.first_name?.charAt(0)}</AvatarFallback>
          </Avatar>
          <div>
            <h2 className="text-2xl text-white mb-1">{user?.first_name} {user?.last_name}</h2>
            <p className="text-gray-400">@{user?.username}</p>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <ProfileStats stats={stats} />

      {/* Achievements */}
      <ProfileAchievements achievements={achievements} />
    </div>
  );
}
