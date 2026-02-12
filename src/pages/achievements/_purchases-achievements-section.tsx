import { claimPurchaseRewards } from "@/actions/claim-purchase-rewards";
import { useCoinAnimation } from "@/app/context/coin_animation";
import { useSession } from "@/app/context/session";
import { useToast } from "@/app/context/toast";
import type { AchievementItem } from "@/entities/achievement";
import { queryKeys } from "@/lib/query-client";
import { useQueryClient } from "@tanstack/react-query";
import { ShoppingBag } from "lucide-react";
import { useState } from "react";

interface PurchasesAchievementsSectionProps {
  achievements: AchievementItem[];
}

export function PurchasesAchievementsSection({ achievements }: PurchasesAchievementsSectionProps) {
  const { refetchProfile } = useSession();
  const { showCoinAnimation } = useCoinAnimation();
  const { showToast } = useToast();
  const queryClient = useQueryClient();
  const [isClaiming, setIsClaiming] = useState(false);

  const purchaseAchievements = achievements.filter(
    (a) => a.stat_key === "tickets_purchased"
  );

  const hasUnclaimedReward = purchaseAchievements.some(
    (a) => a.unlocked && a.coin_reward != null && !a.reward_claimed_at
  );

  const handleClaimRewards = async () => {
    if (!hasUnclaimedReward || isClaiming) return;
    setIsClaiming(true);
    try {
      const result = await claimPurchaseRewards();
      showCoinAnimation(result.coinsAdded);
      void queryClient.invalidateQueries({ queryKey: queryKeys.achievements });
      void refetchProfile({ silent: true });
      showToast(`Награда за покупки: +${result.coinsAdded} монет`, "success");
    } catch (e) {
      showToast(e instanceof Error ? e.message : "Не удалось забрать награду", "error");
    } finally {
      setIsClaiming(false);
    }
  };

  if (purchaseAchievements.length === 0) {
    return null;
  }

  return (
    <section className="rounded-xl p-3 border border-white/10 bg-surface-card">
      <h3 className="text-base font-semibold text-white flex items-center gap-2 mb-2">
        <ShoppingBag className="w-5 h-5 text-neon-cyan" />
        Достижения за покупки
      </h3>
      <div className="space-y-2">
        {purchaseAchievements.map((ach) => {
          const progress = Math.min(ach.current_value, ach.threshold);
          const isUnlocked = ach.unlocked;
          const canClaimThis = isUnlocked && ach.coin_reward != null && !ach.reward_claimed_at;
          return (
            <div
              key={ach.slug}
              className={`rounded-lg p-3 border ${
                isUnlocked
                  ? "border-neon-gold/40 bg-neon-gold/5"
                  : "border-white/10 bg-white/5"
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <span className="text-xl">{ach.badge}</span>
                  <span className="text-sm font-medium text-white">{ach.name}</span>
                </div>
                <span className="text-xs text-gray-400">
                  {progress}/{ach.threshold}
                </span>
              </div>
              <p className="text-xs text-gray-400 mb-2">{ach.description}</p>
              {ach.coin_reward != null && (
                <p className="text-xs text-neon-gold/90 mb-2">
                  {ach.reward_claimed_at ? (
                    <>✓ Награда получена: {ach.coin_reward} монет</>
                  ) : (
                    <>Награда: {ach.coin_reward} монет</>
                  )}
                </p>
              )}
              {canClaimThis && (
                <button
                  type="button"
                  onClick={handleClaimRewards}
                  disabled={isClaiming}
                  className="mb-2 w-full py-2 rounded-lg bg-neon-gold/15 text-neon-gold text-sm font-semibold border border-neon-gold/40 hover:bg-neon-gold/25 transition-colors disabled:opacity-50"
                >
                  {isClaiming ? "Загрузка…" : "Забрать награду"}
                </button>
              )}
              <div className="w-full h-1.5 rounded-full bg-white/10 overflow-hidden">
                <div
                  className={`h-full transition-all ${
                    isUnlocked ? "bg-neon-gold" : "bg-neon-cyan"
                  }`}
                  style={{ width: `${(progress / ach.threshold) * 100}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
