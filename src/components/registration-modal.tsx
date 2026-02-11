import { useSession } from "@/app/context/session";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { prettifyCoins } from "@/lib/utils";
import { Coins, Loader2 } from "lucide-react";

interface RegistrationModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  eventTitle: string;
  coinsReward: number;
  isRegistering: boolean;
  onConfirm: () => void;
}

export function RegistrationModal({
  open,
  onOpenChange,
  eventTitle,
  coinsReward,
  isRegistering,
  onConfirm,
}: RegistrationModalProps) {
  const { user, profile } = useSession();

  const photoUrl = user?.photo_url || profile?.avatar_url || undefined;
  const firstName = user?.first_name || profile?.first_name || "";
  const lastName = user?.last_name || "";
  const displayName = [firstName, lastName].filter(Boolean).join(" ") || "—";

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-surface-card border border-white/[0.08] max-w-sm">
        <DialogHeader>
          <DialogTitle className="text-white text-center">
            Регистрация на мероприятие
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-5">
          <p className="text-center text-sm text-gray-400">{eventTitle}</p>

          <div className="flex items-center gap-3 p-3 rounded-xl bg-neon-cyan/[0.06] border border-white/[0.06]">
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

          <div className="flex items-center justify-center gap-2 py-2 px-3 rounded-lg bg-neon-gold/15">
            <Coins className="w-4 h-4 text-neon-gold shrink-0" />
            <span className="text-sm text-neon-gold">
              За регистрацию вы получите{" "}
              <span className="font-semibold">{prettifyCoins(coinsReward)}</span> монет
            </span>
          </div>

          <button
            type="button"
            disabled={isRegistering}
            onClick={onConfirm}
            className="w-full py-3 rounded-xl bg-linear-to-r from-neon-cyan to-neon-purple text-white font-semibold hover:opacity-95 transition-opacity active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isRegistering ? (
              <Loader2 className="w-5 h-5 animate-spin mx-auto" />
            ) : (
              "Подтвердить регистрацию"
            )}
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
