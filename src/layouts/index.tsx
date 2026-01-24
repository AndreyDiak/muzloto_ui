import { Calendar, Coins, ShoppingBag, User } from 'lucide-react';
import { memo, useState } from 'react';
import { Link, Outlet } from 'react-router';
import { Tooltip, TooltipContent, TooltipTrigger } from '../components/ui/tooltip';

export const BasicLayout = () => {
  // const location = useLocation();
  const [coins, setCoins] = useState(0);

  return (
    <div className="min-h-screen bg-[#0a0a0f] flex flex-col max-w-md mx-auto">
      {/* Header with coins */}
      <header className="sticky top-0 z-50 bg-[#16161d]/80 backdrop-blur-md border-b border-[#00f0ff]/20 px-4 py-3">
        <div className="flex justify-between items-center">
          <h1 className="text-transparent bg-clip-text bg-gradient-to-r from-[#00f0ff] to-[#b829ff]">
            Караоке Лото
          </h1>
          <Balance coins={coins} />
        </div>
      </header>

      {/* Main content */}
      <main className="flex-1 overflow-y-auto pb-20">\
        {/* FIXME: Вынести coins и setCoins в контекст */}
        <Outlet context={{ coins, setCoins }} />
      </main>
      {/* Bottom navigation */}
      <Navigation />
    </div>
  );
};

const Navigation = () => {
  const navItems = [
    { path: '/', icon: User, label: 'Профиль' },
    { path: '/events', icon: Calendar, label: 'Афиша' },
    { path: '/shop', icon: ShoppingBag, label: 'Магазин' },
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
              className={`flex flex-col items-center gap-1 px-6 py-2 rounded-lg transition-all ${isActive
                ? 'text-[#00f0ff]'
                : 'text-gray-400 hover:text-gray-200'
                }`}
            >
              <Icon
                className={`w-6 h-6 ${isActive ? 'drop-shadow-[0_0_8px_rgba(0,240,255,0.6)]' : ''
                  }`}
              />
              <span className="text-xs">{label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
};

const Balance = memo(({ coins }: { coins: number; }) => {
  const [open, setOpen] = useState(false);
  return (
    <Tooltip open={open} onOpenChange={setOpen}>
      <TooltipTrigger onClick={() => setOpen(true)} className="flex items-center gap-2 bg-[#0a0a0f] px-3 py-2 rounded-full border border-[#00f0ff]/30 neon-glow">
        <Coins className="w-5 h-5 text-[#ffd700]" />
        <span className="font-semibold text-[#ffd700]">{coins}</span>
      </TooltipTrigger>
      <TooltipContent side="bottom" style={{
        // @ts-ignore
        "--foreground": "var(--accent-gold-darker)",
      }}>
        <p className="text-sm text-white">Ваш баланс <b>{coins}</b> монет</p>
      </TooltipContent>
    </Tooltip>
  );
});