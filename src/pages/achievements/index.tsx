import { claimVisitReward } from "@/actions/claim-visit-reward";
import { useCoinAnimation } from "@/app/context/coin_animation";
import { useSession } from "@/app/context/session";
import { useAchievements } from "@/hooks/use-achievements";
import { prettifyCoins } from "@/lib/utils";
import { Music2 } from "lucide-react";
import { useState } from "react";
import { Link } from "react-router";

const VISIT_REWARD_EVERY = 5;

export default function Achievements() {
  const { isSupabaseSessionReady, refetchProfile } = useSession();
  const { showCoinAnimation } = useCoinAnimation();
  const { visitRewardProgress, visitRewardPending, visitRewardCoins, error, refetch } =
    useAchievements(isSupabaseSessionReady);
  const [isClaimingVisit, setIsClaimingVisit] = useState(false);

  const displayProgress = visitRewardPending ? VISIT_REWARD_EVERY : visitRewardProgress;

  const handleClaimVisitReward = async (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    e.stopPropagation();
    if (visitRewardPending && !isClaimingVisit) {
      setIsClaimingVisit(true);
      try {
        const result = await claimVisitReward();
        showCoinAnimation(result.coinsAdded);
        await refetch();
        void refetchProfile({ silent: true });
      } finally {
        setIsClaimingVisit(false);
      }
    }
  };

  return (
    <div className="p-4 space-y-6">
      {error && (
        <p className="text-sm text-red-400/90">{error.message}</p>
      )}

      {/* Блок прогресса посещений: каждое 5-е — награда */}
      <section className="space-y-2">
        <div
          className={`block rounded-xl p-4 border transition-colors ${
            visitRewardPending
              ? "border-neon-gold/40 bg-neon-gold/5"
              : "border-white/6 bg-surface-card hover:bg-white/6"
          }`}
        >
          <div className="flex w-full gap-1.5 sm:gap-2 mb-2">
            {Array.from({ length: VISIT_REWARD_EVERY }).map((_, i) => (
              <div
                key={i}
                className={`flex-1 min-w-0 aspect-square rounded-full border-2 flex items-center justify-center ${
                  i < displayProgress
                    ? "border-neon-cyan/40 text-white bg-linear-to-br from-neon-cyan to-neon-purple"
                    : "border-white/20 bg-white/5 text-white/40"
                }`}
                aria-hidden
              >
                <Music2 className="w-4 h-4" />
              </div>
            ))}
          </div>
          <p className="text-xs text-gray-400 text-center">
            До награды: {displayProgress} из {VISIT_REWARD_EVERY}
          </p>
          <p className="text-sm text-white mt-0.5 text-center">
            Забирай приз за каждое {VISIT_REWARD_EVERY}-е посещение
          </p>
          {visitRewardPending ? (
            <div className="mt-3 flex flex-col items-center gap-2">
              <button
                type="button"
                onClick={handleClaimVisitReward}
                disabled={isClaimingVisit}
                className="w-full py-2.5 rounded-xl bg-neon-gold/20 text-neon-gold font-medium hover:bg-neon-gold/30 disabled:opacity-50 transition-colors"
              >
                {isClaimingVisit ? "Загрузка…" : `Забрать приз (+${prettifyCoins(visitRewardCoins)} монет)`}
              </button>
              <Link to="/events" className="text-xs text-transparent bg-clip-text bg-linear-to-r from-neon-cyan to-neon-purple hover:opacity-90">
                К мероприятиям
              </Link>
            </div>
          ) : (
            <Link to="/events" className="mt-3 block text-center text-sm text-transparent bg-clip-text bg-linear-to-r from-neon-cyan to-neon-purple hover:opacity-90">
              К мероприятиям
            </Link>
          )}
        </div>
      </section>

    </div>
  );
}
