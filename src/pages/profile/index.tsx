import { useProfileStats } from "@/hooks/use-profile-stats";
import { ProfileEventRegistration } from "./_event-registration";
import { ProfileInfo } from "./_info";
import { ProfileSqan } from "./_sqan";
import { ProfileStats } from "./_stats";

export default function Profile() {
  const { stats, isLoading } = useProfileStats();

  return (
    <div className="p-4 space-y-4">
      <ProfileInfo />
      <ProfileEventRegistration />
      <ProfileSqan />
      <ProfileStats stats={stats} isLoading={isLoading} />
    </div>
  );
}
