import { useSession } from '@/app/context/session';
import { useTelegramBack } from '@/hooks/use-telegram-back';
import { cn, prettifyCoins } from '@/lib/utils';
import { Calendar, Coins, Shield, ShoppingBag, User } from 'lucide-react';
import { memo, Suspense } from 'react';
import { Link, Outlet, useLocation } from 'react-router';
import { Skeleton } from '../components/ui/skeleton';
import { ClickableTooltip, TooltipContent, TooltipTrigger } from '../components/ui/tooltip';
import { LazyLoadingFallback } from './fallback';

export const BasicLayout = () => {
  useTelegramBack();
  const { profile, isRoot } = useSession();
  const coins = profile?.balance ?? 0;
  const showBalanceSkeleton = profile === undefined;

  return (
    <div className="min-h-screen bg-surface-dark flex flex-col w-full max-w-xl mx-auto">
      <header className="sticky top-0 z-50 bg-surface-card/90 backdrop-blur-md border-b border-white/[0.06] px-4 py-3">
        <div className="flex justify-between items-center gap-2">
          <div className="flex items-center gap-2 min-w-0 flex-1">
            <span
              className="text-xl font-bold tracking-tight text-transparent bg-clip-text bg-linear-to-r from-neon-purple via-neon-cyan to-neon-pink"
              aria-label="Караоке Лото"
            >
              КараокеЛото
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
      <Navigation isRoot={isRoot} />
    </div>
  );
};

const Navigation = ({ isRoot = false }: { isRoot?: boolean }) => {
  const location = useLocation();
  const navItems = [
    { path: '/', icon: User, label: 'Профиль' },
    { path: '/catalog', icon: ShoppingBag, label: 'Лавка удачи' },
    { path: '/events', icon: Calendar, label: 'Афиша' },
    ...(isRoot ? [{ path: '/admin', icon: Shield, label: 'Админка' }] : []),
  ];
  return (
    <nav className="fixed bottom-0 left-0 right-0 max-w-xl mx-auto bg-surface-card/95 backdrop-blur-md border-t border-white/[0.06]">
      <div className="flex items-center py-2">
        {navItems.map(({ path, icon: Icon, label }) => {
          const isActive = location.pathname === path;
          return (
            <Link
              key={path}
              to={path}
              className={cn(
                'flex flex-1 min-w-0 flex-col items-center gap-0.5 px-1 py-2 rounded-lg transition-all relative',
                isActive ? 'text-neon-cyan' : 'text-gray-400 hover:text-gray-200',
              )}
              aria-label={label}
            >
              <Icon className="w-5 h-5 shrink-0" />
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
