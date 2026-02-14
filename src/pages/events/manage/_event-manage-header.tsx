import { ChevronLeft } from "lucide-react";
import { Link } from "react-router";

interface EventManageHeaderProps {
  title: string;
}

export function EventManageHeader({ title }: EventManageHeaderProps) {
  return (
    <div className="flex items-center gap-3">
      <Link
        to="/events"
        className="flex items-center justify-center w-10 h-10 rounded-xl bg-neon-cyan/15 text-neon-cyan border border-neon-cyan/30 hover:bg-neon-cyan/25 transition-colors shrink-0"
      >
        <ChevronLeft className="w-5 h-5" />
      </Link>
      <h1 className="text-xl font-bold text-white truncate flex-1">
        {title}
      </h1>
    </div>
  );
}
