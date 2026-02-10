import { cn, prettifyCoins } from "@/lib/utils";
import type {
  ApiEventTeam,
  ApiPersonalWinner,
  ApiPersonalWinnerSlot,
  ApiTeamWinnerSlot,
} from "@/types/api";
import type { LucideIcon } from "lucide-react";
import {
  Check,
  Coins,
  Gift,
  Plus,
  QrCode,
  User,
  Users,
} from "lucide-react";

export interface BingoSlotCardProps {
  icon: LucideIcon;
  label: string;
  coins: number;
  slot: ApiPersonalWinnerSlot | ApiTeamWinnerSlot;
  locked?: boolean;
  highlighted?: boolean;
  variant: "personal" | "team";
  mode: "overview" | "manage";
  onClick?: () => void;
  onShowQR?: (code: string) => void;
  emptyButtonLabel?: string;
}

export function BingoSlotCard({
  icon: Icon,
  label,
  coins,
  slot,
  locked,
  highlighted,
  variant,
  mode,
  onClick,
  onShowQR,
  emptyButtonLabel = "Выбрать",
}: BingoSlotCardProps) {
  const hasCode = slot != null && "code" in slot;
  const hasWinner = slot != null && !hasCode;
  const codeOnly = hasCode && slot && "code" in slot && !slot.redeemed;
  const isCyan = variant === "personal";
  const isManage = mode === "manage";

  const borderColor = highlighted ? "border-neon-gold/30" : isCyan ? "border-neon-cyan/20" : "border-neon-purple/20";
  const iconBg = highlighted ? "bg-neon-gold/10" : isCyan ? "bg-neon-cyan/10" : "bg-neon-purple/10";
  const iconColor = highlighted ? "text-neon-gold" : isCyan ? "text-neon-cyan" : "text-neon-purple";

  return (
    <div
      className={cn(
        "flex flex-col gap-2 p-3 rounded-xl bg-surface-dark border transition-colors min-h-[52px]",
        borderColor,
        locked && "opacity-50",
      )}
    >
      <span className={cn("text-xs", highlighted ? "text-neon-gold/80" : "text-gray-500")}>
        {label}
      </span>
      <div className="flex items-center gap-3">
        <div className={cn("w-9 h-9 rounded-lg flex items-center justify-center shrink-0", iconBg)}>
          <Icon className={cn("w-4 h-4", iconColor)} />
        </div>
        <div className="flex-1 min-w-0">
          {hasWinner ? (
            <div className="flex items-center gap-2">
              {variant === "personal" && slot && !("code" in slot) ? (
                (() => {
                  const winner = slot as ApiPersonalWinner;
                  return (
                    <>
                      <div
                        className={cn(
                          "w-6 h-6 rounded-full flex items-center justify-center shrink-0 overflow-hidden",
                          highlighted ? "bg-neon-gold/10" : "bg-neon-cyan/10",
                        )}
                      >
                        {winner.avatar_url ? (
                          <img
                            src={winner.avatar_url}
                            alt=""
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <User
                            className={cn(
                              "w-3 h-3",
                              highlighted ? "text-neon-gold" : "text-neon-cyan",
                            )}
                          />
                        )}
                      </div>
                      <p className="text-sm text-white truncate">
                        {winner.first_name || (winner.username ? `@${winner.username}` : null) || "—"}
                      </p>
                    </>
                  );
                })()
              ) : variant === "team" && slot && !("code" in slot) ? (
                (() => {
                  const team = slot as ApiEventTeam;
                  return (
                    <>
                      <div className="w-6 h-6 rounded-full bg-neon-purple/10 flex items-center justify-center shrink-0">
                        <Users className="w-3 h-3 text-neon-purple" />
                      </div>
                      <p className="text-sm text-white truncate">{team.name}</p>
                    </>
                  );
                })()
              ) : (
                <span className="text-sm text-gray-400">Победитель</span>
              )}
            </div>
          ) : hasCode && codeOnly ? (
            isManage ? (
              <p className="text-sm font-mono font-bold text-neon-purple tracking-wider truncate">
                {slot.code}
              </p>
            ) : (
              <div
                className={cn(
                  "inline-flex items-center gap-2 px-3 py-1.5 rounded-lg border",
                  isCyan ? "bg-neon-cyan/5 border-neon-cyan/20" : "bg-neon-purple/5 border-neon-purple/20",
                )}
              >
                <Gift
                  className={cn("w-4 h-4 shrink-0", isCyan ? "text-neon-cyan/70" : "text-neon-purple/70")}
                />
                <span
                  className={cn(
                    "text-sm",
                    isCyan ? "text-neon-cyan/90" : "text-neon-purple/90",
                  )}
                >
                  Разыгран
                </span>
              </div>
            )
          ) : hasCode && slot && "redeemed" in slot && slot.redeemed ? (
            <div className="space-y-1">
              <span className="inline-flex items-center gap-0.5 text-[10px] font-medium text-green-400">
                <Check className="w-2.5 h-2.5" />
                Активирован
              </span>
              {slot.redeemed_by && (
                <div className="flex items-center gap-1.5">
                  <div className="w-5 h-5 rounded-full bg-green-500/10 flex items-center justify-center shrink-0 overflow-hidden">
                    {slot.redeemed_by.avatar_url ? (
                      <img
                        src={slot.redeemed_by.avatar_url}
                        alt=""
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <User className="w-2.5 h-2.5 text-green-400" />
                    )}
                  </div>
                  <p className="text-xs text-gray-400 truncate">
                    {slot.redeemed_by.first_name || (slot.redeemed_by.username ? `@${slot.redeemed_by.username}` : "—")}
                  </p>
                </div>
              )}
            </div>
          ) : locked ? (
            <span className="text-xs text-gray-600">
              {isManage ? "Заполните предыдущие слоты" : "В игре"}
            </span>
          ) : isManage && onClick ? (
            <button
              type="button"
              onClick={onClick}
              className="flex items-center gap-1.5 text-gray-500 hover:text-gray-300 transition-colors"
            >
              <Plus className="w-3.5 h-3.5 shrink-0" />
              <span className="text-sm">{emptyButtonLabel}</span>
            </button>
          ) : (
            <span className="text-xs text-gray-500">{isManage ? "—" : "В игре"}</span>
          )}
        </div>
        <div className="shrink-0 flex items-center gap-1.5">
          {isManage && hasCode && !slot.redeemed && onShowQR && (
            <button
              type="button"
              onClick={() => onShowQR(slot.code)}
              className="w-8 h-8 rounded-lg bg-neon-purple/10 flex items-center justify-center hover:bg-neon-purple/20 transition-colors"
              title="Показать QR"
            >
              <QrCode className="w-4 h-4 text-neon-purple" />
            </button>
          )}
          <div
            className={cn(
              "flex items-center gap-1 px-2 py-1 rounded-lg",
              slot && !locked ? "bg-neon-gold/10" : "bg-white/5",
            )}
          >
            <Coins
              className={cn(
                "w-3.5 h-3.5",
                slot && !locked ? "text-neon-gold" : "text-gray-500",
              )}
            />
            <span
              className={cn(
                "text-xs font-medium",
                slot && !locked ? "text-neon-gold" : "text-gray-500",
              )}
            >
              {prettifyCoins(coins)}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
