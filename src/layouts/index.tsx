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
    <div className="min-h-screen bg-surface-dark flex flex-col max-w-md mx-auto">
      <header className="sticky top-0 z-50 bg-surface-card/80 backdrop-blur-md border-b border-neon-cyan/20 px-4 py-3">
        <div className="flex justify-between items-center gap-2">
          <div className="flex items-center gap-2 min-w-0 flex-1">
            {isRoot && (
              <Link
                to="/scanner"
                className="flex shrink-0 items-center justify-center w-10 h-10 rounded-lg border border-neon-cyan/30 bg-surface-dark text-white hover:bg-neon-cyan/10 hover:border-neon-cyan/50 transition-colors"
                aria-label="Сканер"
              >
                <QrCode className="w-6 h-6" />
              </Link>
            )}
            <h1 className="text-transparent text-xl bg-clip-text bg-linear-to-r from-neon-cyan to-neon-purple truncate min-w-0">
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
    { path: '/tickets', icon: TicketIcon, label: 'Билеты' },
    { path: '/achievements', icon: Award, label: 'Достижения', hasUnclaimed: hasUnclaimedAchievementRewards },
  ];
  return (
    <nav className="fixed bottom-0 left-0 right-0 max-w-md mx-auto bg-surface-card/95 backdrop-blur-md border-t border-neon-cyan/20">
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
                  isActive ? 'text-neon-cyan' : highlight ? 'text-neon-gold hover:text-neon-gold/90' : 'text-gray-400 hover:text-gray-200',
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
                    className="absolute -top-0.5 -right-1 w-2 h-2 rounded-full bg-neon-gold ring-2 ring-surface-card"
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
  <div className="flex h-9 items-center bg-surface-dark px-3 rounded-full border border-neon-cyan/15">
    <Skeleton className="h-5 w-14 rounded-full" />
  </div>
));

const Balance = memo(({ coins }: { coins: number; }) => {
  return (
    <ClickableTooltip>
      <TooltipTrigger
        className="flex h-9 items-center gap-2 bg-surface-dark px-3 rounded-full border border-neon-gold/30 gold-glow"
      >
        <Coins className="w-5 h-5 text-neon-gold" />
        <span className="font-semibold text-neon-gold">{coins}</span>
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
