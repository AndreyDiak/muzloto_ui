import type { ApiRegistrationsResponse } from "@/types/api";
import { Skeleton } from "@/components/ui/skeleton";
import { ChevronLeft, ChevronRight, User } from "lucide-react";

const PAGE_SIZE = 5;

interface ParticipantsSectionProps {
  registrations: ApiRegistrationsResponse["registrations"];
  loading: boolean;
  page: number;
  onPageChange: (page: number) => void;
}

export function ParticipantsSection({
  registrations,
  loading,
  page,
  onPageChange,
}: ParticipantsSectionProps) {
  const totalPages = Math.ceil(registrations.length / PAGE_SIZE);
  const slice = registrations.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  if (loading) {
    return (
      <div className="space-y-2">
        {Array.from({ length: 3 }).map((_, i) => (
          <div
            key={i}
            className="flex items-center gap-3 p-3 rounded-xl bg-[#0a0a0f] border border-[#00f0ff]/10"
          >
            <Skeleton className="w-10 h-10 rounded-full" />
            <div className="flex-1 space-y-1.5">
              <Skeleton className="h-4 w-28 rounded" />
              <Skeleton className="h-3 w-20 rounded" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (registrations.length === 0) {
    return <p className="text-gray-400 text-sm">Пока нет зарегистрированных</p>;
  }

  return (
    <>
      <ul className="space-y-2">
        {slice.map((r) => (
          <li
            key={r.telegram_id}
            className="flex items-center gap-3 p-3 rounded-xl bg-[#0a0a0f] border border-[#00f0ff]/10"
          >
            <div className="w-10 h-10 rounded-full bg-[#00f0ff]/10 flex items-center justify-center shrink-0 overflow-hidden">
              {r.avatar_url ? (
                <img
                  src={r.avatar_url}
                  alt=""
                  className="w-full h-full object-cover"
                />
              ) : (
                <User className="w-5 h-5 text-[#00f0ff]" />
              )}
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-white font-medium truncate">
                {r.first_name || "—"}
              </p>
              {r.username && (
                <p className="text-xs text-gray-400 truncate">
                  @{r.username}
                </p>
              )}
            </div>
            {r.team?.name && (
              <span className="text-xs text-[#b829ff] shrink-0 truncate max-w-[100px]">
                {r.team.name}
              </span>
            )}
          </li>
        ))}
      </ul>
      {totalPages > 1 && (
        <div className="flex items-center justify-between gap-2 mt-4 pt-3 border-t border-[#00f0ff]/10">
          <button
            type="button"
            disabled={page <= 1}
            onClick={() => onPageChange(page - 1)}
            className="flex items-center gap-1 px-3 py-2 rounded-lg text-sm text-[#00f0ff] border border-[#00f0ff]/30 bg-[#0a0a0f] disabled:opacity-40 disabled:pointer-events-none"
          >
            <ChevronLeft className="w-4 h-4" /> Назад
          </button>
          <span className="text-sm text-gray-400">
            {page} из {totalPages}
          </span>
          <button
            type="button"
            disabled={page >= totalPages}
            onClick={() => onPageChange(page + 1)}
            className="flex items-center gap-1 px-3 py-2 rounded-lg text-sm text-[#00f0ff] border border-[#00f0ff]/30 bg-[#0a0a0f] disabled:opacity-40 disabled:pointer-events-none"
          >
            Далее <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      )}
    </>
  );
}
