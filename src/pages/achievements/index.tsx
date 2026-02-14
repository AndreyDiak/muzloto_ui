import { claimVisitReward } from "@/actions/claim-visit-reward";
import { claimPurchaseReward } from "@/actions/claim-purchase-rewards";
import { useCoinAnimation } from "@/app/context/coin_animation";
import { useSession } from "@/app/context/session";
import { useToast } from "@/app/context/toast";
import { Skeleton } from "@/components/ui/skeleton";
import { useAchievements } from "@/hooks/use-achievements";
import { queryKeys } from "@/lib/query-client";
import { useQueryClient } from "@tanstack/react-query";
import { Gift } from "lucide-react";
import { useState } from "react";
import { PurchasesAchievementsSection } from "./_purchases-achievements-section";
import { VisitsRewardSection } from "./_visits-reward-section";

export default function Achievements() {
  const { isSupabaseSessionReady, refetchProfile } = useSession();
  const { achievements, isLoading, visitRewardPending, refetch } = useAchievements(isSupabaseSessionReady);
  const { showCoinAnimation } = useCoinAnimation();
  const { showToast } = useToast();
  const queryClient = useQueryClient();
  const [isClaiming, setIsClaiming] = useState(false);

  const hasUnclaimedVisit = visitRewardPending;
  const firstUnclaimedPurchase = achievements.find(
    (a) => a.stat_key === "tickets_purchased" && a.unlocked && a.coin_reward != null && !a.reward_claimed_at
  );
  const hasUnclaimedReward = hasUnclaimedVisit || !!firstUnclaimedPurchase;

  const handleClaimReward = async () => {
    if (isClaiming || !hasUnclaimedReward) return;
    setIsClaiming(true);
    try {
      if (hasUnclaimedVisit) {
        const result = await claimVisitReward();
        showCoinAnimation(result.coinsAdded);
        await refetch();
        void refetchProfile({ silent: true });
        showToast(`Награда: +${result.coinsAdded} монет`, "success");
      } else if (firstUnclaimedPurchase) {
        const result = await claimPurchaseReward(firstUnclaimedPurchase.threshold);
        showCoinAnimation(result.coinsAdded);
        await queryClient.refetchQueries({ queryKey: queryKeys.achievements });
        void refetchProfile({ silent: true });
        showToast(`Награда: +${result.coinsAdded} монет`, "success");
      }
    } catch (e) {
      showToast(e instanceof Error ? e.message : "Не удалось забрать награду", "error");
    } finally {
      setIsClaiming(false);
    }
  };

  if (isLoading || !isSupabaseSessionReady) {
    return (
      <div className="p-3 space-y-3">
        <Skeleton className="h-8 w-48 rounded-lg" />
        <Skeleton className="rounded-xl p-3 border border-white/10 bg-surface-card h-48" />
      </div>
    );
  }

  return (
    <div className="p-3 space-y-3">
      <h2 className="text-xl font-bold text-white">Награды</h2>

      {hasUnclaimedReward && (
        <section className="rounded-xl p-3 border-2 border-neon-gold/50 bg-neon-gold/10">
          <div className="flex items-center gap-2 mb-2">
            <Gift className="w-5 h-5 text-neon-gold" />
            <span className="text-sm font-semibold text-white">У вас есть незабранная награда</span>
          </div>
          <button
            type="button"
            onClick={handleClaimReward}
            disabled={isClaiming}
            className="w-full py-2.5 rounded-xl bg-neon-gold/20 text-neon-gold font-semibold border border-neon-gold/50 hover:bg-neon-gold/30 transition-colors disabled:opacity-50"
          >
            {isClaiming ? "Загрузка…" : "Забрать награду"}
          </button>
        </section>
      )}

      <VisitsRewardSection />
      <PurchasesAchievementsSection achievements={achievements} />
    </div>
  );
}
