import { useSession } from "@/app/context/session";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import type { ApiEventTeam } from "@/types/api";
import { ChevronDown, Coins, Loader2 } from "lucide-react";
import { useEffect, useState } from "react";

interface RegistrationModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  eventTitle: string;
  teams: ApiEventTeam[];
  coinsReward: number;
  isRegistering: boolean;
  onConfirm: (teamId: string | undefined) => void;
}

export function RegistrationModal({
  open,
  onOpenChange,
  eventTitle,
  teams,
  coinsReward,
  isRegistering,
  onConfirm,
}: RegistrationModalProps) {
  const { user, profile } = useSession();
  const [selectedTeamId, setSelectedTeamId] = useState<string>("");
  const hasTeams = teams.length > 0;

  const photoUrl = user?.photo_url || profile?.avatar_url || undefined;
  const firstName = user?.first_name || profile?.first_name || "";
  const lastName = user?.last_name || "";
  const displayName = [firstName, lastName].filter(Boolean).join(" ") || "—";

  // Сбрасываем выбор при открытии
  useEffect(() => {
    if (open) setSelectedTeamId("");
  }, [open]);

  const canConfirm = !hasTeams || !!selectedTeamId;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-[#16161d] border-[#00f0ff]/30 max-w-sm">
        <DialogHeader>
          <DialogTitle className="text-white text-center">
            Регистрация на мероприятие
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-5">
          {/* Event title */}
          <p className="text-center text-sm text-gray-400">{eventTitle}</p>

          {/* User info */}
          <div className="flex items-center gap-3 p-3 rounded-xl bg-[#0a0a0f] border border-[#00f0ff]/15">
            <Avatar className="w-12 h-12">
              <AvatarImage src={photoUrl} />
              <AvatarFallback className="bg-[#00f0ff]/10 text-[#00f0ff]">
                {firstName.charAt(0) || "?"}
              </AvatarFallback>
            </Avatar>
            <div className="min-w-0 flex-1">
              <p className="text-white font-medium truncate">{displayName}</p>
              {user?.username && (
                <p className="text-xs text-gray-400 truncate">@{user.username}</p>
              )}
            </div>
          </div>

          {/* Team select */}
          {hasTeams && (
            <div>
              <label className="text-xs text-gray-400 block mb-1.5">
                Выберите команду
              </label>
              <div className="relative">
                <select
                  value={selectedTeamId}
                  onChange={(e) => setSelectedTeamId(e.target.value)}
                  className="w-full appearance-none px-4 py-3 pr-10 rounded-xl bg-[#0a0a0f] border border-[#00f0ff]/30 text-white focus:border-[#00f0ff] focus:outline-none focus:ring-1 focus:ring-[#00f0ff]/30 transition-colors"
                >
                  <option value="" disabled>
                    Команда...
                  </option>
                  {teams.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.name}
                    </option>
                  ))}
                </select>
                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 pointer-events-none" />
              </div>
            </div>
          )}

          {/* Coins reward hint */}
          <div className="flex items-center justify-center gap-2 py-2 px-3 rounded-lg bg-[#ffd700]/5 border border-[#ffd700]/15">
            <Coins className="w-4 h-4 text-[#ffd700] shrink-0" />
            <span className="text-sm text-[#ffd700]">
              За регистрацию вы получите{" "}
              <span className="font-semibold">{coinsReward}</span> монет
            </span>
          </div>

          {/* Confirm button */}
          <button
            type="button"
            disabled={!canConfirm || isRegistering}
            onClick={() => onConfirm(hasTeams ? selectedTeamId : undefined)}
            className="w-full py-3 rounded-xl bg-linear-to-r from-[#00f0ff] to-[#b829ff] text-white font-semibold hover:shadow-lg hover:shadow-[#00f0ff]/30 transition-all active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isRegistering ? (
              <Loader2 className="w-5 h-5 animate-spin mx-auto" />
            ) : (
              "Зарегистрироваться"
            )}
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
