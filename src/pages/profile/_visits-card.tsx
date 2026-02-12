import { claimVisitReward } from "@/actions/claim-visit-reward";
import { useCoinAnimation } from "@/app/context/coin_animation";
import { useSession } from "@/app/context/session";
import { Skeleton } from "@/components/ui/skeleton";
import { useAchievements } from "@/hooks/use-achievements";
import { Music2 } from "lucide-react";
import { memo, useState } from "react";
import { Link } from "react-router";

const VISIT_REWARD_EVERY = 5;

export const ProfileVisitsCard = memo(() => {
  const { isSupabaseSessionReady, refetchProfile } = useSession();
  const { showCoinAnimation } = useCoinAnimation();
  const {
    gamesVisited,
    visitRewardProgress,
    visitRewardPending,
    isLoading,
    refetch,
  } = useAchievements(isSupabaseSessionReady);
  const [isClaimingVisit, setIsClaimingVisit] = useState(false);

  if (isLoading || !isSupabaseSessionReady) {
    return (
      <section className="rounded-xl p-3 border border-white/10 bg-surface-card">
        <div className="flex items-center justify-between mb-3">
          <Skeleton className="h-6 w-32 rounded-lg" />
        </div>
        <div className="flex w-full gap-1.5 mb-2">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="flex-1 aspect-square rounded-full" />
          ))}
        </div>
        <Skeleton className="h-4 w-40 rounded mx-auto" />
      </section>
    );
  }

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

  const totalLabel =
    gamesVisited === 0
      ? "Ждём на первом мероприятии"
      : gamesVisited === 1
        ? "Вы посетили уже 1 мероприятие"
        : gamesVisited >= 2 && gamesVisited <= 4
          ? `Вы посетили уже ${gamesVisited} мероприятия`
          : `Вы посетили уже ${gamesVisited} мероприятий`;

  return (
    <section className="space-y-2">
      <div
        className={`block rounded-xl p-3 border transition-colors ${
          visitRewardPending
            ? "border-neon-gold/40 bg-neon-gold/5"
            : "border-white/10 bg-surface-card"
        }`}
      >
        <p className="text-sm text-gray-400 mb-3">{totalLabel}</p>
        <div className="flex w-full gap-1.5 sm:gap-2 mb-2">
          {Array.from({ length: VISIT_REWARD_EVERY }).map((_, i) => (
            <div
              key={i}
              className={`flex-1 min-w-0 aspect-square rounded-full border-2 flex items-center justify-center ${
                i < displayProgress
                  ? "border-neon-gold/50 text-white bg-linear-to-br from-neon-gold to-amber-500"
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
        {visitRewardPending ? (
          <div className="mt-3 flex flex-col items-center gap-2">
            <button
              type="button"
              onClick={handleClaimVisitReward}
              disabled={isClaimingVisit}
              className="w-full py-2.5 rounded-xl bg-linear-to-r from-neon-cyan to-neon-purple text-white font-semibold hover:opacity-95 transition-opacity active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isClaimingVisit ? "Загрузка…" : "Забрать награду"}
            </button>
            <Link
              to="/events"
              className="text-xs text-transparent bg-clip-text bg-linear-to-r from-neon-cyan to-neon-purple hover:opacity-90"
            >
              К мероприятиям
            </Link>
          </div>
        ) : (
          <Link
            to="/events"
            className="mt-3 block text-center text-sm text-transparent bg-clip-text bg-linear-to-r from-neon-cyan to-neon-purple hover:opacity-90"
          >
            К мероприятиям
          </Link>
        )}
      </div>
    </section>
  );
});
