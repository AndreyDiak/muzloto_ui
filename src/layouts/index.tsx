import { useSession } from '@/app/context/session';
import { cn } from '@/lib/utils';
import { Calendar, Coins, QrCode, ShoppingBag, User } from 'lucide-react';
import { memo } from 'react';
import { Link, Outlet, useLocation } from 'react-router';
import { Skeleton } from '../components/ui/skeleton';
import { ClickableTooltip, TooltipContent, TooltipTrigger } from '../components/ui/tooltip';

export const BasicLayout = () => {
  const { profile, isProfilePending } = useSession();
  const coins = profile?.balance ?? 0;

  return (
    <div className="min-h-screen bg-[#0a0a0f] flex flex-col max-w-md mx-auto">
      <header className="sticky top-0 z-50 bg-[#16161d]/80 backdrop-blur-md border-b border-[#00f0ff]/20 px-4 py-3">
        <div className="flex justify-between items-center">
          <h1 className="text-transparent bg-clip-text bg-linear-to-r from-[#00f0ff] to-[#b829ff]">
            Караоке Лото
          </h1>
          {isProfilePending ? <BalanceSkeleton /> : <Balance coins={coins} />}
        </div>
      </header>

      <main className="flex-1 overflow-y-auto pb-20">
        <Outlet />
      </main>
      <Navigation />
    </div>
  );
};

const Navigation = () => {
  const location = useLocation();
  const { isRoot } = useSession();
  const navItems = [
    { path: '/', icon: User, label: 'Профиль' },
    { path: '/events', icon: Calendar, label: 'Афиша' },
    { path: '/catalog', icon: ShoppingBag, label: 'Каталог' },
    ...(isRoot ? [{ path: '/scanner', icon: QrCode, label: 'Сканер' }] : []),
  ];
  return (
    <nav className="fixed bottom-0 left-0 right-0 max-w-md mx-auto bg-[#16161d]/95 backdrop-blur-md border-t border-[#00f0ff]/20">
      <div className="flex justify-around items-center py-2">
        {navItems.map(({ path, icon: Icon, label }) => {
          const isActive = location.pathname === path;
          return (
            <Link
              key={path}
              to={path}
              className={
                cn(`flex flex-col items-center gap-1 px-6 py-2 rounded-lg transition-all`,
                  isActive ? 'text-[#00f0ff]' : 'text-gray-400 hover:text-gray-200'
                )}
            >
              <Icon
                className={cn(`w-6 h-6`, isActive ? 'drop-shadow-[0_0_8px_rgba(0,240,255,0.6)]' : '')}
              />
              <span className="text-xs">{label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
};

const BalanceSkeleton = memo(() => (
  <div className="flex items-center gap-2 bg-[#0a0a0f] px-3 py-2 rounded-full border border-[#00f0ff]/15">
    <Skeleton className="h-5 w-5 shrink-0 rounded" />
    <Skeleton className="h-5 w-12 rounded" />
  </div>
));

const Balance = memo(({ coins }: { coins: number; }) => {
  return (
    <ClickableTooltip>
      <TooltipTrigger
        className="flex items-center gap-2 bg-[#0a0a0f] px-3 py-2 rounded-full border border-[#00f0ff]/30 neon-glow"
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