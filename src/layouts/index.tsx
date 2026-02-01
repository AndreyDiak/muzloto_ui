import { useSession } from '@/app/context/session';
import { useAchievements } from '@/hooks/use-achievements';
import { cn } from '@/lib/utils';
import { Award, Calendar, Coins, QrCode, ShoppingBag, TicketIcon, User } from 'lucide-react';
import { memo, Suspense, useMemo } from 'react';
import { Link, Outlet, useLocation } from 'react-router';
import { Skeleton } from '../components/ui/skeleton';
import { ClickableTooltip, TooltipContent, TooltipTrigger } from '../components/ui/tooltip';
import { LazyLoadingFallback } from './fallback';

export const BasicLayout = () => {
  const { profile, isRoot, isSupabaseSessionReady } = useSession();
  const { achievements } = useAchievements(isSupabaseSessionReady);
  const coins = profile?.balance ?? 0;
  const showBalanceSkeleton = profile === undefined;
  const hasUnclaimedAchievementRewards = useMemo(
    () =>
      achievements.some(
        (a) => a.unlocked && (a.coin_reward ?? 0) > 0 && !a.reward_claimed_at
      ),
    [achievements]
  );

  return (
    <div className="min-h-screen bg-[#0a0a0f] flex flex-col max-w-md mx-auto">
      <header className="sticky top-0 z-50 bg-[#16161d]/80 backdrop-blur-md border-b border-[#00f0ff]/20 px-4 py-3">
        <div className="flex justify-between items-center gap-2">
          <div className="flex items-center gap-2 min-w-0 flex-1">
            {isRoot && (
              <Link
                to="/scanner"
                className="flex shrink-0 items-center justify-center w-10 h-10 rounded-lg border border-[#00f0ff]/30 bg-[#0a0a0f] text-white hover:bg-[#00f0ff]/10 hover:border-[#00f0ff]/50 transition-colors"
                aria-label="Сканер"
              >
                <QrCode className="w-6 h-6" />
              </Link>
            )}
            <h1 className="text-transparent text-xl bg-clip-text bg-linear-to-r from-[#00f0ff] to-[#b829ff] truncate min-w-0">
              Караоке Лото
            </h1>
          </div>
          <div className="flex h-9 min-w-22 shrink-0 items-center justify-end">
            {showBalanceSkeleton ? <BalanceSkeleton /> : <Balance coins={coins} />}
          </div>
        </div>
      </header>

      <main className="flex min-h-0 flex-1 flex-col overflow-y-auto pb-20">
        <Suspense fallback={<LazyLoadingFallback />}>
          <Outlet />
        </Suspense>
      </main>
      <Navigation hasUnclaimedAchievementRewards={hasUnclaimedAchievementRewards} />
    </div>
  );
};

const Navigation = ({ hasUnclaimedAchievementRewards = false }: { hasUnclaimedAchievementRewards?: boolean }) => {
  const location = useLocation();
  const navItems = [
    { path: '/', icon: User, label: 'Профиль' },
    { path: '/events', icon: Calendar, label: 'Афиша' },
    { path: '/catalog', icon: ShoppingBag, label: 'Каталог' },
    { path: '/achievements', icon: Award, label: 'Достижения', hasUnclaimed: hasUnclaimedAchievementRewards },
    { path: '/tickets', icon: TicketIcon, label: 'Билеты' },
  ];
  return (
    <nav className="fixed bottom-0 left-0 right-0 max-w-md mx-auto bg-[#16161d]/95 backdrop-blur-md border-t border-[#00f0ff]/20">
      <div className="flex items-center py-2">
        {navItems.map(({ path, icon: Icon, label, hasUnclaimed }) => {
          const isActive = location.pathname === path;
          const highlight = hasUnclaimed && !isActive;
          return (
            <Link
              key={path}
              to={path}
              className={
                cn(
                  'flex flex-1 min-w-0 flex-col items-center gap-0.5 px-1 py-2 rounded-lg transition-all relative',
                  isActive ? 'text-[#00f0ff]' : highlight ? 'text-[#ffd700] hover:text-[#ffd700]/90' : 'text-gray-400 hover:text-gray-200',
                )
              }
              aria-label={hasUnclaimed ? `${label} — есть неполученные награды` : label}
            >
              <span className="relative inline-flex">
                <Icon
                  className={cn(
                    'w-5 h-5 shrink-0',
                    isActive ? 'drop-shadow-[0_0_8px_rgba(0,240,255,0.6)]' : '',
                    highlight && !isActive && 'drop-shadow-[0_0_6px_rgba(255,215,0,0.5)]',
                  )}
                />
                {hasUnclaimed && (
                  <span
                    className="absolute -top-0.5 -right-1 w-2 h-2 rounded-full bg-[#ffd700] ring-2 ring-[#16161d]"
                    aria-hidden
                  />
                )}
              </span>
              <span className="text-[10px] leading-tight truncate w-full text-center">{label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
};

const BalanceSkeleton = memo(() => (
  <div className="flex h-9 items-center gap-2 bg-[#0a0a0f] px-3 rounded-full border border-[#00f0ff]/15">
    <Skeleton className="h-5 w-5 shrink-0 rounded" />
    <Skeleton className="h-5 w-12 shrink-0 rounded" />
  </div>
));

const Balance = memo(({ coins }: { coins: number; }) => {
  return (
    <ClickableTooltip>
      <TooltipTrigger
        className="flex h-9 items-center gap-2 bg-[#0a0a0f] px-3 rounded-full border border-[#00f0ff]/30 neon-glow"
      >
        <Coins className="w-5 h-5 text-[#ffd700]" />
        <span className="font-semibold text-[#ffd700]">{coins}</span>
      </TooltipTrigger>
      <TooltipContent side="bottom" style={{
        // @ts-ignore
        "--foreground": "var(--accent-gold-darker)",
      }}>
        <p className="text-sm text-white">Ваш баланс <b>{coins}</b> монет</p>
      </TooltipContent>
    </ClickableTooltip>
  );
});
