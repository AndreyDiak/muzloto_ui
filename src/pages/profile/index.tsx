import { Award, Target, TrendingUp, Trophy, User } from 'lucide-react';
import { useUser } from '../../app/context/user';

export function Profile() {
  const { user } = useUser(); 
  const stats = [
    { icon: Trophy, label: 'Посещено событий', value: '24', color: '#ffd700' },
    { icon: Target, label: 'Активных билетов', value: '3', color: '#00f0ff' },
    { icon: TrendingUp, label: 'Уровень', value: '12', color: '#b829ff' },
    { icon: Award, label: 'Достижения', value: '8', color: '#ff2e97' },
  ];

  const achievements = [
    { name: 'Первое событие', unlocked: true },
    { name: 'Ценитель искусства', unlocked: false },
    { name: 'Коллекционер', unlocked: false },
    { name: 'VIP персона', unlocked: false },
  ];

  return (
    <div className="p-4 space-y-6">
      {/* Profile Header */}
      <div className="bg-[#16161d] rounded-2xl p-6 border border-[#00f0ff]/20 neon-glow">
        <div className="flex items-center gap-4">
          <div className="w-20 h-20 rounded-full bg-gradient-to-br from-[#00f0ff] to-[#b829ff] flex items-center justify-center">
            <User className="w-10 h-10 text-white" />
          </div>
          <div>
            <h2 className="text-2xl text-white mb-1">{user?.first_name} {user?.last_name}</h2>
            <p className="text-gray-400">@{user?.username}</p>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 gap-3">
        {stats.map((stat) => (
          <div
            key={stat.label}
            className="bg-[#16161d] rounded-xl p-4 border border-[#00f0ff]/10"
          >
            <stat.icon
              className="w-6 h-6 mb-2"
              style={{ color: stat.color }}
            />
            <p className="text-2xl mb-1" style={{ color: stat.color }}>
              {stat.value}
            </p>
            <p className="text-xs text-gray-400">{stat.label}</p>
          </div>
        ))}
      </div>

      {/* Achievements */}
      <div className="bg-[#16161d] rounded-2xl p-5 border border-[#b829ff]/20">
        <h3 className="text-lg mb-4 text-transparent bg-clip-text bg-gradient-to-r from-[#00f0ff] to-[#b829ff]">
          Достижения
        </h3>
        <div className="space-y-3">
          {achievements.map((achievement) => (
            <div
              key={achievement.name}
              className={`flex items-center gap-3 p-3 rounded-lg ${
                achievement.unlocked
                  ? 'bg-[#00f0ff]/10 border border-[#00f0ff]/20'
                  : 'bg-[#0a0a0f]/50 border border-gray-800'
              }`}
            >
              <Award
                className={`w-5 h-5 ${
                  achievement.unlocked ? 'text-[#ffd700]' : 'text-gray-600'
                }`}
              />
              <span
                className={
                  achievement.unlocked ? 'text-white' : 'text-gray-600'
                }
              >
                {achievement.name}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
