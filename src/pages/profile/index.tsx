import { useProfileStats } from "@/hooks/use-profile-stats";
import { ProfileInfo } from "./_info";
import { ProfileSqan } from "./_sqan";
import { ProfileStats } from "./_stats";

export function Profile() {
  const { stats, isLoading } = useProfileStats();

  return (
    <div className="p-4 space-y-6">
      <ProfileInfo />
      <ProfileSqan />
      <ProfileStats stats={stats} isLoading={isLoading} />
    </div>
  );
}
