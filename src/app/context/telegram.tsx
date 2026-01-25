import { getTgWebApp } from '@/lib/get_tg_init_webapp';
import { createContext, type ReactNode, useContext, useEffect, useState } from 'react';
import type { TWebApp } from 'telegram';

interface TelegramContextType {
  tg: TWebApp | undefined;
  isLoading: boolean;
}

const TelegramContext = createContext<TelegramContextType | undefined>(undefined);

interface TelegramProviderProps {
  children: ReactNode;
}

export function TelegramProvider({ children }: TelegramProviderProps) {
  const [tg, setTg] = useState<TWebApp | undefined>(undefined);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const webApp = getTgWebApp();

    if (webApp) {
      webApp.ready();
      setTg(webApp);
    }

    setIsLoading(false);
  }, []);

  const value: TelegramContextType = {
    tg,
    isLoading,
  };

  return <TelegramContext.Provider value={value}>{children}</TelegramContext.Provider>;
}

export function useTelegram() {
  const context = useContext(TelegramContext);
  if (context === undefined) {
    throw new Error('useTelegram must be used within a TelegramProvider');
  }
  return context;
}
