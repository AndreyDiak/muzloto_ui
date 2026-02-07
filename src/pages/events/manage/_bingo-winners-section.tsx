import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import type { ApiPersonalWinnerSlot } from "@/types/api";
import { PERSONAL_BINGO_SLOTS } from "@/types/api";
import type { LucideIcon } from "lucide-react";
import {
  Award,
  Coins,
  LayoutGrid,
  MoveHorizontal,
  MoveUpRight,
  MoveVertical,
  Plus,
  QrCode,
  User,
  Users,
} from "lucide-react";


const SLOT_ICONS: Record<string, LucideIcon> = {
  MoveHorizontal,
  MoveVertical,
  MoveUpRight,
  LayoutGrid,
};

interface BingoWinnersSectionProps {
  personalWinners: ApiPersonalWinnerSlot[];
  teamWinners: (string | null)[];
  loading?: boolean;
  onSelectPersonal: (index: number) => void;
  onSelectTeam: (index: number) => void;
  onShowPrizeQR?: (code: string) => void;
}

export function BingoWinnersSection({
  personalWinners,
  teamWinners,
  loading,
  onSelectPersonal,
  onSelectTeam,
  onShowPrizeQR,
}: BingoWinnersSectionProps) {
  if (loading) {
    return (
      <>
        {/* Personal bingo skeleton */}
        <div className="bg-[#16161d] rounded-2xl p-5 border border-[#00f0ff]/20">
          <Skeleton className="h-5 w-44 rounded-lg mb-3" />
          <div className="space-y-2">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-[64px] rounded-xl" />
            ))}
          </div>
        </div>
        {/* Team bingo skeleton */}
        <div className="bg-[#16161d] rounded-2xl p-5 border border-[#b829ff]/20">
          <Skeleton className="h-5 w-40 rounded-lg mb-3" />
          <div className="space-y-2">
            {Array.from({ length: 3 }).map((_, i) => (
              <Skeleton key={i} className="h-[56px] rounded-xl" />
            ))}
          </div>
        </div>
      </>
    );
  }

  const firstThreeFilled =
    personalWinners[0] != null &&
    personalWinners[1] != null &&
    personalWinners[2] != null;

  return (
    <>
      {/* ——— Personal bingo card ——— */}
      <div className="bg-[#16161d] rounded-2xl p-5 border border-[#00f0ff]/20">
        <h2 className="text-lg text-white mb-3 flex items-center gap-2">
          <Award className="w-5 h-5 text-[#ffd700]" />
          Персональное бинго
        </h2>
        <div className="space-y-2">
          {PERSONAL_BINGO_SLOTS.map((slot, i) => {
            const winner = personalWinners[i];
            const Icon = SLOT_ICONS[slot.icon];
            const isFullCard = i === 3;
            const locked = isFullCard && !firstThreeFilled && !winner;
            return (
              <PersonalSlotCard
                key={slot.slug}
                icon={Icon}
                label={slot.label}
                coins={slot.coins}
                winner={winner}
                disabled={!!winner}
                locked={locked}
                highlighted={isFullCard}
                onClick={() => !winner && !locked && onSelectPersonal(i)}
                onShowQR={onShowPrizeQR}
              />
            );
          })}
        </div>
      </div>

      {/* ——— Team bingo card ——— */}
      <div className="bg-[#16161d] rounded-2xl p-5 border border-[#b829ff]/20">
        <h2 className="text-lg text-white mb-3 flex items-center gap-2">
          <Users className="w-5 h-5 text-[#b829ff]" />
          Командное бинго
        </h2>
        <div className="space-y-2">
          {teamWinners.map((name, i) => (
            <button
              key={i}
              type="button"
              disabled={!!name}
              onClick={() => !name && onSelectTeam(i)}
              className={cn(
                "w-full p-3 rounded-xl bg-[#0a0a0f] border border-[#b829ff]/20 text-left transition-colors min-h-[56px]",
                !name && "hover:border-[#b829ff]/40 cursor-pointer",
                name && "cursor-default opacity-90"
              )}
            >
              <span className="text-xs text-gray-500 block">
                Команда {i + 1}
              </span>
              {name ? (
                <p className="text-sm text-white mt-1 truncate">{name}</p>
              ) : (
                <div className="flex items-center gap-1.5 text-gray-500 mt-1">
                  <Plus className="w-4 h-4 shrink-0" />
                  <span className="text-sm">Ввести название</span>
                </div>
              )}
            </button>
          ))}
        </div>
      </div>
    </>
  );
}

/* ——— Personal slot card ——— */

interface PersonalSlotCardProps {
  icon: LucideIcon;
  label: string;
  coins: number;
  winner: ApiPersonalWinnerSlot;
  disabled: boolean;
  locked?: boolean;
  highlighted?: boolean;
  onClick: () => void;
  onShowQR?: (code: string) => void;
}

function PersonalSlotCard({
  icon: Icon,
  label,
  coins,
  winner,
  // disabled,
  locked,
  highlighted,
  onClick,
  onShowQR,
}: PersonalSlotCardProps) {
  const hasCode = winner != null && "code" in winner;
  const hasUser = winner != null && !hasCode;

  return (
    <div
      className={cn(
        "flex items-center gap-3 p-3 rounded-xl bg-[#0a0a0f] border transition-colors min-h-[64px]",
        highlighted ? "border-[#ffd700]/30" : "border-[#00f0ff]/20",
        locked && "opacity-50"
      )}
    >
      {/* Left: icon */}
      <div
        className={cn(
          "w-9 h-9 rounded-lg flex items-center justify-center shrink-0",
          highlighted ? "bg-[#ffd700]/10" : "bg-[#00f0ff]/10"
        )}
      >
        <Icon
          className={cn(
            "w-4 h-4",
            highlighted ? "text-[#ffd700]" : "text-[#00f0ff]"
          )}
        />
      </div>

      {/* Middle: label + winner info */}
      <div className="flex-1 min-w-0">
        <span
          className={cn(
            "text-xs block",
            highlighted ? "text-[#ffd700]/80" : "text-gray-500"
          )}
        >
          {label}
        </span>

        {hasUser ? (
          <div className="flex items-center gap-2 mt-0.5">
            <div className="w-6 h-6 rounded-full bg-[#00f0ff]/10 flex items-center justify-center shrink-0 overflow-hidden">
              {winner.avatar_url ? (
                <img
                  src={winner.avatar_url}
                  alt=""
                  className="w-full h-full object-cover"
                />
              ) : (
                <User className="w-3 h-3 text-[#00f0ff]" />
              )}
            </div>
            <p className="text-sm text-white truncate">
              {winner.first_name || `@${winner.username}` || "—"}
            </p>
          </div>
        ) : hasCode ? (
          <p className="text-sm font-mono font-bold text-[#b829ff] tracking-wider mt-0.5 truncate">
            {winner.code}
          </p>
        ) : locked ? (
          <span className="text-xs text-gray-600 mt-0.5 block">
            Заполните предыдущие слоты
          </span>
        ) : (
          <button
            type="button"
            onClick={onClick}
            className="flex items-center gap-1.5 text-gray-500 mt-0.5 hover:text-gray-300 transition-colors"
          >
            <Plus className="w-3.5 h-3.5 shrink-0" />
            <span className="text-sm">Выбрать</span>
          </button>
        )}
      </div>

      {/* Right: coins badge or QR action */}
      <div className="shrink-0 flex items-center gap-1.5">
        {hasCode && onShowQR ? (
          <button
            type="button"
            onClick={() => onShowQR(winner.code)}
            className="w-8 h-8 rounded-lg bg-[#b829ff]/10 flex items-center justify-center hover:bg-[#b829ff]/20 transition-colors"
            title="Показать QR"
          >
            <QrCode className="w-4 h-4 text-[#b829ff]" />
          </button>
        ) : null}
        {(hasUser || hasCode) && (
          <div className="flex items-center gap-1 px-2 py-1 rounded-lg bg-[#ffd700]/10">
            <Coins className="w-3.5 h-3.5 text-[#ffd700]" />
            <span className="text-xs font-medium text-[#ffd700]">{coins}</span>
          </div>
        )}
        {!winner && !locked && (
          <div className="flex items-center gap-1 px-2 py-1 rounded-lg bg-white/5">
            <Coins className="w-3.5 h-3.5 text-gray-500" />
            <span className="text-xs text-gray-500">{coins}</span>
          </div>
        )}
      </div>
    </div>
  );
}
