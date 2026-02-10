import { useBingoConfig } from "@/hooks/use-bingo-config";
import { Skeleton } from "@/components/ui/skeleton";
import type { ApiPersonalWinnerSlot, ApiTeamWinnerSlot } from "@/types/api";
import type { LucideIcon } from "lucide-react";
import { Award, LayoutGrid, MoveHorizontal, MoveUpRight, MoveVertical, Users } from "lucide-react";
import { BingoSlotCard } from "../_bingo-slot-card";

const SLOT_ICONS: Record<string, LucideIcon> = {
  MoveHorizontal,
  MoveVertical,
  MoveUpRight,
  LayoutGrid,
};

interface BingoWinnersSectionProps {
  personalWinners: ApiPersonalWinnerSlot[];
  teamWinners: ApiTeamWinnerSlot[];
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
  const { personalSlots, teamSlots } = useBingoConfig();

  if (loading) {
    return (
      <>
        <div className="bg-card-neutral rounded-2xl p-5 border border-white/[0.06]">
          <Skeleton className="h-5 w-44 rounded-lg mb-3" />
          <div className="space-y-2">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-[64px] rounded-xl" />
            ))}
          </div>
        </div>
        <div className="bg-card-neutral rounded-2xl p-5 border border-white/[0.06]">
          <Skeleton className="h-5 w-40 rounded-lg mb-3" />
          <div className="space-y-2">
            {Array.from({ length: 3 }).map((_, i) => (
              <Skeleton key={i} className="h-[64px] rounded-xl" />
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
      <div className="bg-card-neutral rounded-2xl p-5 border border-white/[0.06]">
        <h2 className="text-lg text-white mb-3 flex items-center gap-2">
          <Award className="w-5 h-5 text-neon-gold" />
          Персональное бинго
        </h2>
        <div className="space-y-2">
          {personalSlots.map((slot, i) => {
            const winner = personalWinners[i];
            const Icon = SLOT_ICONS[slot.icon];
            const isFullCard = i === 3;
            const locked = isFullCard && !firstThreeFilled && !winner;
            return (
              <BingoSlotCard
                key={slot.slug}
                icon={Icon}
                label={slot.label}
                coins={slot.coins}
                slot={winner}
                locked={locked}
                highlighted={isFullCard}
                variant="personal"
                mode="manage"
                onClick={() => !winner && !locked && onSelectPersonal(i)}
                onShowQR={onShowPrizeQR}
                emptyButtonLabel="Выбрать"
              />
            );
          })}
        </div>
      </div>

      <div className="bg-card-neutral rounded-2xl p-5 border border-white/[0.06]">
        <h2 className="text-lg text-white mb-3 flex items-center gap-2">
          <Users className="w-5 h-5 text-neon-purple" />
          Командное бинго
        </h2>
        <div className="space-y-2">
          {teamSlots.map((slotDef, i) => {
            const slot = teamWinners[i];
            const Icon = SLOT_ICONS[slotDef.icon];
            const isFullCard = slotDef.slug === "full_card";
            const firstTwoFilled = teamWinners[0] != null && teamWinners[1] != null;
            const locked = isFullCard && !firstTwoFilled && !slot;
            return (
              <BingoSlotCard
                key={slotDef.slug}
                icon={Icon}
                label={slotDef.label}
                coins={slotDef.coins}
                slot={slot}
                locked={locked}
                highlighted={isFullCard}
                variant="team"
                mode="manage"
                onClick={() => !slot && !locked && onSelectTeam(i)}
                onShowQR={onShowPrizeQR}
                emptyButtonLabel="Выбрать команду"
              />
            );
          })}
        </div>
      </div>
    </>
  );
}
