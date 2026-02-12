import { claimVisitReward } from "@/actions/claim-visit-reward";
import { useCoinAnimation } from "@/app/context/coin_animation";
import { useSession } from "@/app/context/session";
import { useAchievements } from "@/hooks/use-achievements";
import { Music2 } from "lucide-react";
import { useState } from "react";

const VISIT_REWARD_EVERY = 5;

export function VisitsRewardSection() {
  const { isSupabaseSessionReady, refetchProfile } = useSession();
  const { showCoinAnimation } = useCoinAnimation();
  const { visitRewardProgress, visitRewardPending, isLoading, refetch } =
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

  if (isLoading || !isSupabaseSessionReady) {
    return (
      <section className="rounded-xl p-3 border border-white/10 bg-surface-card">
        <div className="h-6 w-48 rounded-lg bg-white/10 animate-pulse mb-3" />
        <div className="flex w-full gap-2 mb-2">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="flex-1 aspect-square rounded-full bg-white/10 animate-pulse" />
          ))}
        </div>
        <div className="h-4 w-32 rounded mx-auto bg-white/10 animate-pulse" />
      </section>
    );
  }

  return (
    <section className="rounded-xl p-3 border border-white/10 bg-surface-card">
      <h3 className="text-base font-semibold text-white flex items-center gap-2">
        <Music2 className="w-5 h-5 text-neon-cyan" />
        Каждое {VISIT_REWARD_EVERY}-е посещение - награда!
      </h3>
      <div className="flex w-full gap-1.5 sm:gap-2 mt-2 mb-1.5">
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
        {visitRewardPending
          ? "Награда готова!"
          : (() => {
              const left = VISIT_REWARD_EVERY - displayProgress;
              const word = left === 1 ? "посещение" : left >= 2 && left <= 4 ? "посещения" : "посещений";
              return `До награды осталось ${left} ${word}`;
            })()}
      </p>
      {visitRewardPending && (
        <div className="mt-2 flex flex-col items-center gap-2">
          <button
            type="button"
            onClick={handleClaimVisitReward}
            disabled={isClaimingVisit}
            className="w-full py-2.5 rounded-xl bg-linear-to-r from-neon-cyan to-neon-purple text-white font-semibold hover:opacity-95 transition-opacity active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isClaimingVisit ? "Загрузка…" : "Забрать награду"}
          </button>
        </div>
      )}
    </section>
  );
}
