import { CoinAnimation } from '@/components/coin_animation';
import { createContext, useCallback, useContext, useState, type ReactNode } from 'react';

interface CoinAnimationContextType {
  showCoinAnimation: (count: number, duration?: number) => void;
}

const CoinAnimationContext = createContext<CoinAnimationContextType | undefined>(undefined);

export function CoinAnimationProvider({ children }: { children: ReactNode; }) {
  const [isVisible, setIsVisible] = useState(false);
  const [coins, setCoins] = useState(0);
  const [duration, setDuration] = useState(2500);

  const showCoinAnimation = useCallback((count: number, customDuration?: number) => {
    setCoins(count);
    setDuration(customDuration || 2500);
    setIsVisible(true);
  }, []);

  const handleComplete = useCallback(() => {
    setIsVisible(false);
  }, []);

  return (
    <CoinAnimationContext.Provider value={{ showCoinAnimation }}>
      {children}
      {isVisible && (
        <CoinAnimation
          coins={coins}
          duration={duration}
          onComplete={handleComplete}
        />
      )}
    </CoinAnimationContext.Provider>
  );
}

export function useCoinAnimation() {
  const context = useContext(CoinAnimationContext);
  if (!context) {
    throw new Error('useCoinAnimation must be used within CoinAnimationProvider');
  }
  return context;
}
