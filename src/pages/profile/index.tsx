import { ProfileEventRegistration } from "./_event-registration";
import { ProfileInfo } from "./_info";
import { ProfileSqan } from "./_sqan";
import { ProfileVisitsCard } from "./_visits-card";

export default function Profile() {
  return (
    <div className="p-4 space-y-4">
      <ProfileInfo />
      <ProfileEventRegistration />
      <ProfileSqan />
      <ProfileVisitsCard />
    </div>
  );
}
