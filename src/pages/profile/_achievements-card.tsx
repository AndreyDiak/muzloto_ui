import { useSession } from "@/app/context/session";
import { Skeleton } from "@/components/ui/skeleton";
import { useAchievements } from "@/hooks/use-achievements";
import { Award } from "lucide-react";
import { memo } from "react";
import { Link } from "react-router";

export const ProfileAchievementsCard = memo(() => {
  const { isSupabaseSessionReady } = useSession();
  const { achievements, isLoading } = useAchievements(isSupabaseSessionReady);

  if (isLoading || !isSupabaseSessionReady) {
    return (
      <section className="rounded-xl p-3 border border-white/10 bg-surface-card">
        <div className="flex items-center justify-between">
          <Skeleton className="h-6 w-32 rounded-lg" />
          <Skeleton className="h-6 w-12 rounded-lg" />
        </div>
      </section>
    );
  }

  const unlockedCount = achievements.filter((a) => a.unlocked).length;
  const totalCount = achievements.length;

  return (
    <section className="rounded-xl p-3 border border-white/10 bg-surface-card">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Award className="w-5 h-5 text-neon-cyan" />
          <span className="text-sm text-gray-400">Достижения</span>
        </div>
        <Link
          to="/achievements"
          className="text-lg font-bold text-white hover:text-neon-cyan transition-colors"
        >
          {unlockedCount}
          {totalCount > 0 && (
            <span className="text-sm text-gray-400 font-normal">/{totalCount}</span>
          )}
        </Link>
      </div>
    </section>
  );
});
