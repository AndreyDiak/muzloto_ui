import { CoinAnimation } from '@/components/coin_animation';
import { createContext, useCallback, useContext, useRef, useState, type ReactNode } from 'react';

interface CoinAnimationContextType {
  /** Показывает анимацию монет. После завершения анимации вызывается onComplete (например, для обновления баланса). */
  showCoinAnimation: (count: number, duration?: number, onComplete?: () => void) => void;
}

const CoinAnimationContext = createContext<CoinAnimationContextType | undefined>(undefined);

export function CoinAnimationProvider({ children }: { children: ReactNode; }) {
  const [isVisible, setIsVisible] = useState(false);
  const [coins, setCoins] = useState(0);
  const [duration, setDuration] = useState(2500);
  const onCompleteRef = useRef<(() => void) | undefined>(undefined);

  const showCoinAnimation = useCallback((count: number, customDuration?: number, onComplete?: () => void) => {
    onCompleteRef.current = onComplete;
    setCoins(count);
    setDuration(customDuration || 2500);
    setIsVisible(true);
  }, []);

  const handleComplete = useCallback(() => {
    onCompleteRef.current?.();
    onCompleteRef.current = undefined;
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
