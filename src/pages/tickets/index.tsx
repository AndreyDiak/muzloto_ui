import { ProfileTickets } from "@/pages/profile/_tickets";

export function Tickets() {
  return (
    <div className="p-4 space-y-6">
      <ProfileTickets defaultExpanded groupByUsed />
    </div>
  );
}
