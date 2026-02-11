import { useSession } from '@/app/context/session';
import { useAchievements } from '@/hooks/use-achievements';
import { useTelegramBack } from '@/hooks/use-telegram-back';
import { cn, prettifyCoins } from '@/lib/utils';
import { Award, Calendar, Coins, Shield, ShoppingBag, User } from 'lucide-react';
import { memo, Suspense, useMemo } from 'react';
import { Link, Outlet, useLocation } from 'react-router';
import { Skeleton } from '../components/ui/skeleton';
import { ClickableTooltip, TooltipContent, TooltipTrigger } from '../components/ui/tooltip';
import { LazyLoadingFallback } from './fallback';

export const BasicLayout = () => {
  useTelegramBack();
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
      <header className="sticky top-0 z-50 bg-surface-card/90 backdrop-blur-md border-b border-white/[0.06] px-4 py-3">
        <div className="flex justify-between items-center gap-2">
          <div className="flex items-center gap-2 min-w-0 flex-1">
            <span
              className="text-lg font-bold text-neon-gold tracking-tight drop-shadow-[0_0_8px_var(--color-neon-gold)]"
              aria-label="Караоке Лото"
            >
              Караоке Лото
            </span>
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
      <Navigation hasUnclaimedAchievementRewards={hasUnclaimedAchievementRewards} isRoot={isRoot} />
    </div>
  );
};

const Navigation = ({ hasUnclaimedAchievementRewards = false, isRoot = false }: { hasUnclaimedAchievementRewards?: boolean; isRoot?: boolean }) => {
  const location = useLocation();
  const navItems = [
    { path: '/', icon: User, label: 'Профиль' },
    { path: '/events', icon: Calendar, label: 'Афиша' },
    { path: '/catalog', icon: ShoppingBag, label: 'Каталог' },
    { path: '/achievements', icon: Award, label: 'Достижения', hasUnclaimed: hasUnclaimedAchievementRewards },
    ...(isRoot ? [{ path: '/admin', icon: Shield, label: 'Админка' }] : []),
  ];
  return (
    <nav className="fixed bottom-0 left-0 right-0 max-w-md mx-auto bg-surface-card/95 backdrop-blur-md border-t border-white/[0.06]">
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
                    isActive ? '' : '',
                    highlight && !isActive && '',
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
  <div className="flex h-9 items-center bg-surface-dark/80 px-3 rounded-full border border-white/[0.06]">
    <Skeleton className="h-5 w-14 rounded-full" />
  </div>
));

const Balance = memo(({ coins }: { coins: number; }) => {
  return (
    <ClickableTooltip>
      <TooltipTrigger
        className="flex h-9 items-center gap-2 px-3 rounded-full border border-white/[0.06]"
      >
        <Coins className="w-5 h-5 text-neon-gold" />
        <span className="font-semibold text-neon-gold">{prettifyCoins(coins)}</span>
      </TooltipTrigger>
      <TooltipContent side="bottom" style={{
        // @ts-ignore
        "--foreground": "var(--accent-gold-darker)",
      }}>
        <p className="text-sm text-white">Ваш баланс <b>{prettifyCoins(coins)}</b> монет</p>
      </TooltipContent>
    </ClickableTooltip>
  );
});
