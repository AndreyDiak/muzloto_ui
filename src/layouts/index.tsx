import { useSession } from '@/app/context/session';
import { useAchievements } from '@/hooks/use-achievements';
import { useTelegramBack } from '@/hooks/use-telegram-back';
import { APP_HEADER_TITLE } from '@/lib/constants';
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
  const { visitRewardPending, achievements } = useAchievements(isSupabaseSessionReady);

  const hasUnclaimedReward = useMemo(
    () =>
      visitRewardPending ||
      achievements.some((a) => a.unlocked && a.coin_reward != null && !a.reward_claimed_at),
    [visitRewardPending, achievements]
  );
  const coins = profile?.balance ?? 0;
  const showBalanceSkeleton = profile === undefined;

  return (
    <div className="min-h-screen bg-surface-dark flex flex-col w-full max-w-xl mx-auto">
      <header className="sticky top-0 z-50 bg-surface-card/90 backdrop-blur-md border-b border-white/[0.06] px-3 py-2">
        <div className="flex justify-between items-center gap-2">
          <div className="flex items-center gap-2 min-w-0 flex-1">
          <h1 className="text-transparent text-xl bg-clip-text bg-linear-to-r from-neon-cyan to-neon-purple truncate min-w-0">
              {APP_HEADER_TITLE}
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
      <Navigation isRoot={isRoot} hasUnclaimedReward={hasUnclaimedReward} />
    </div>
  );
};

const Navigation = ({
  isRoot = false,
  hasUnclaimedReward = false,
}: {
  isRoot?: boolean;
  hasUnclaimedReward?: boolean;
}) => {
  const location = useLocation();
  const navItems = [
    { path: '/', icon: User, label: 'Профиль' },
    { path: '/catalog', icon: ShoppingBag, label: 'Лавка удачи' },
    { path: '/events', icon: Calendar, label: 'Афиша' },
    { path: '/achievements', icon: Award, label: 'Награды' },
    ...(isRoot ? [{ path: '/admin', icon: Shield, label: 'Админка' }] : []),
  ];
  return (
    <nav className="fixed bottom-0 left-0 right-0 max-w-xl mx-auto bg-surface-card/95 backdrop-blur-md border-t border-white/[0.06]">
      <div className="flex items-center py-2">
        {navItems.map(({ path, icon: Icon, label }) => {
          const isActive = location.pathname === path;
          const showRewardBadge = path === '/achievements' && hasUnclaimedReward;
          return (
            <Link
              key={path}
              to={path}
              className={cn(
                'flex flex-1 min-w-0 flex-col items-center gap-0.5 px-1 py-2 rounded-lg transition-all relative',
                isActive ? 'text-neon-cyan' : 'text-gray-400 hover:text-gray-200',
                showRewardBadge && !isActive && 'text-neon-gold',
              )}
              aria-label={label}
            >
              <span className="relative inline-flex shrink-0">
                <Icon className="w-5 h-5" />
                {showRewardBadge && (
                  <span
                    className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full bg-neon-gold ring-2 ring-surface-card"
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
