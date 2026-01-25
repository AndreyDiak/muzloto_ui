import { createContext, type ReactNode, useContext, useEffect, useState } from 'react';
import { useTelegram } from './telegram';
import type { TTheme } from '../../entities/theme/types';

interface ThemeContextType {
  theme: TTheme | undefined;
  isLoading: boolean;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

interface ThemeProviderProps {
  children: ReactNode;
}

export function ThemeProvider({ children }: ThemeProviderProps) {
  const { tg } = useTelegram();
  const [theme, setTheme] = useState<TTheme | undefined>(undefined);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!tg) {
      setIsLoading(false);
      return;
    }

    const themeData: TTheme = {
      colorScheme: tg.colorScheme,
      themeParams: tg.themeParams,
      backgroundColor: tg.backgroundColor,
      headerColor: tg.headerColor,
    };

    setTheme(themeData);

    const handleThemeChange = () => {
      const updatedTheme: TTheme = {
        colorScheme: tg.colorScheme,
        themeParams: tg.themeParams,
        backgroundColor: tg.backgroundColor,
        headerColor: tg.headerColor,
      };
      setTheme(updatedTheme);
    };

    tg.onEvent('themeChanged', handleThemeChange);

    setIsLoading(false);

    return () => {
      tg.offEvent('themeChanged', handleThemeChange);
    };
  }, [tg]);

  const value: ThemeContextType = {
    theme,
    isLoading,
  };

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}
