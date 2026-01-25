import { Coins } from 'lucide-react';
import { useEffect, useState } from 'react';

interface CoinAnimationProps {
  coins: number;
  onComplete?: () => void;
}

export function CoinAnimation({ coins, onComplete }: CoinAnimationProps) {
  const [isVisible, setIsVisible] = useState(true);
  const [scale, setScale] = useState(0);
  const [opacity, setOpacity] = useState(1);
  const [coinsVisible, setCoinsVisible] = useState(false);

  useEffect(() => {
    const showTimer = setTimeout(() => {
      setScale(1);
      setCoinsVisible(true);
    }, 50);

    const hideTimer = setTimeout(() => {
      setOpacity(0);
      setScale(0.8);
    }, 2000);

    const completeTimer = setTimeout(() => {
      setIsVisible(false);
      onComplete?.();
    }, 2500);

    return () => {
      clearTimeout(showTimer);
      clearTimeout(hideTimer);
      clearTimeout(completeTimer);
    };
  }, [onComplete]);

  if (!isVisible) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center pointer-events-none"
      style={{
        opacity,
        transition: 'opacity 0.3s ease-out',
      }}
    >
      <div
        className="flex flex-col items-center justify-center"
        style={{
          transform: `scale(${scale})`,
          transition: 'transform 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)',
        }}
      >
        <div
          className="relative"
          style={{
            animation: coinsVisible ? 'coinBounce 0.6s ease-out' : 'none',
          }}
        >
          <div className="w-24 h-24 rounded-full bg-linear-to-br from-[#ffd700] to-[#ffed4e] flex items-center justify-center shadow-2xl shadow-[#ffd700]/50">
            <Coins className="w-12 h-12 text-[#8b6914]" fill="currentColor" />
          </div>
          <div
            className="absolute inset-0 rounded-full bg-[#ffd700] opacity-30 blur-xl"
            style={{
              animation: coinsVisible ? 'pulse 1s ease-in-out infinite' : 'none',
            }}
          />
        </div>

        {coinsVisible && (
          <div
            className="mt-6 text-center"
            style={{
              animation: 'fadeInUp 0.5s ease-out 0.3s both',
            }}
          >
            <div className="text-4xl font-bold text-transparent bg-clip-text bg-linear-to-r from-[#ffd700] to-[#ffed4e] mb-2">
              +{coins}
            </div>
            <div className="text-lg text-white/90 font-semibold">
              Монет получено!
            </div>
          </div>
        )}
      </div>

      <style>{`
        @keyframes coinBounce {
          0% {
            transform: scale(0) rotate(0deg);
          }
          50% {
            transform: scale(1.2) rotate(180deg);
          }
          100% {
            transform: scale(1) rotate(360deg);
          }
        }

        @keyframes pulse {
          0%, 100% {
            opacity: 0.3;
            transform: scale(1);
          }
          50% {
            opacity: 0.5;
            transform: scale(1.1);
          }
        }

        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  );
}
