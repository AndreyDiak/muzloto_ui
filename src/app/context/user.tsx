import { createContext, type ReactNode, useContext, useEffect, useState } from 'react';
import type { TSession } from '../../entities/session/types';
import type { TUser } from '../../entities/user/types';

interface UserContextType {
  user?: TUser;
  initData: string;
  initDataUnsafe: TSession | undefined;
  parsedData: Record<string, string>;
  isLoading: boolean;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

interface UserProviderProps {
  children: ReactNode;
}

export function UserProvider({ children }: UserProviderProps) {
  const [user, setUser] = useState<TUser | undefined>(undefined);
  const [initData, setInitData] = useState<string>('');
  const [initDataUnsafe, setInitDataUnsafe] = useState<TSession | undefined>(undefined);
  const [parsedData, setParsedData] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const tg = window.Telegram?.WebApp;

    if (tg) {
      tg.ready();

      const data = tg.initData;
      setInitData(data);

      const unsafeData = tg.initDataUnsafe;
      setInitDataUnsafe(unsafeData ?? undefined);

      if (unsafeData?.user) {
        setUser(unsafeData.user);
      }
      
      if (data) {
        const params = new URLSearchParams(data);
        const parsed: Record<string, string> = {};
        params.forEach((value, key) => {
          parsed[key] = value;
        });
        setParsedData(parsed);
      }
    }

    setIsLoading(false);
  }, []);

  const value: UserContextType = {
    user,
    initData,
    initDataUnsafe,
    parsedData,
    isLoading,
  };

  return <UserContext.Provider value={value}>{children}</UserContext.Provider>;
}

export function useUser() {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
}
