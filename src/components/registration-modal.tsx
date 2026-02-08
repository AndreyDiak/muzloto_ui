import { useSession } from "@/app/context/session";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { ApiEventTeam } from "@/types/api";
import { Coins, Loader2 } from "lucide-react";
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
      <DialogContent className="bg-surface-card border-neon-cyan/30 max-w-sm">
        <DialogHeader>
          <DialogTitle className="text-white text-center">
            Регистрация на мероприятие
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-5">
          {/* Event title */}
          <p className="text-center text-sm text-gray-400">{eventTitle}</p>

          {/* User info */}
          <div className="flex items-center gap-3 p-3 rounded-xl bg-surface-dark border border-neon-cyan/15">
            <Avatar className="w-12 h-12">
              <AvatarImage src={photoUrl} />
              <AvatarFallback className="bg-neon-cyan/10 text-neon-cyan">
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
              <Select
                value={selectedTeamId || undefined}
                onValueChange={setSelectedTeamId}
              >
                <SelectTrigger
                  className="w-full h-12 px-4 rounded-xl bg-surface-dark border-neon-cyan/30 text-white focus:border-neon-cyan focus:ring-1 focus:ring-neon-cyan/30 [&_svg]:text-gray-500"
                >
                  <SelectValue placeholder="Команда..." />
                </SelectTrigger>
                <SelectContent
                  className="bg-surface-card border-neon-cyan/30 max-h-60"
                >
                  {teams.map((t) => (
                    <SelectItem
                      key={t.id}
                      value={t.id}
                      className="text-white focus:bg-neon-cyan/10 focus:text-white data-highlighted:bg-neon-cyan/10"
                    >
                      {t.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {/* Coins reward hint */}
          <div className="flex items-center justify-center gap-2 py-2 px-3 rounded-lg bg-neon-gold/5 border border-neon-gold/15">
            <Coins className="w-4 h-4 text-neon-gold shrink-0" />
            <span className="text-sm text-neon-gold">
              За регистрацию вы получите{" "}
              <span className="font-semibold">{coinsReward}</span> монет
            </span>
          </div>

          {/* Confirm button */}
          <button
            type="button"
            disabled={!canConfirm || isRegistering}
            onClick={() => onConfirm(hasTeams ? selectedTeamId : undefined)}
            className="w-full py-3 rounded-xl bg-linear-to-r from-neon-cyan to-neon-purple text-white font-semibold hover:shadow-lg hover:shadow-neon-cyan/30 transition-all active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
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
