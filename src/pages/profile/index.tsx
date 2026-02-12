import { ProfileEventRegistration } from "./_event-registration";
import { ProfileInfo } from "./_info";
import { ProfileStatsSection } from "./_profile-stats";
import { ProfileSqan } from "./_sqan";

export default function Profile() {
  return (
    <div className="p-3 space-y-3">
      <ProfileInfo />
      <ProfileEventRegistration />
      <ProfileSqan />
      <ProfileStatsSection />
    </div>
  );
}
