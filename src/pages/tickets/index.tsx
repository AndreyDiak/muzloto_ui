import { ProfileTickets } from "@/pages/profile/_tickets";

export default function Tickets() {
  return (
    <div className="p-3 space-y-4">
      <ProfileTickets defaultExpanded groupByUsed />
    </div>
  );
}
