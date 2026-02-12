import { useSession } from "@/app/context/session";
import { Skeleton } from "@/components/ui/skeleton";
import { useAchievements } from "@/hooks/use-achievements";
import { PurchasesAchievementsSection } from "./_purchases-achievements-section";
import { VisitsRewardSection } from "./_visits-reward-section";

export default function Achievements() {
  const { isSupabaseSessionReady } = useSession();
  const { achievements, isLoading } = useAchievements(isSupabaseSessionReady);

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
      <VisitsRewardSection />
      <PurchasesAchievementsSection achievements={achievements} />
    </div>
  );
}
